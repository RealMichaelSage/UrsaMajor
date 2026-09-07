import { chromium } from 'playwright';

export interface ScrapedPost {
  id: string;
  text: string;
  sourceUrl: string;
  imageUrl: string | null;
  date?: string | null;
}

export interface WebsiteScrapeOptions {
  timeout?: number;
  rules?: {
    containerSelector?: string;
    titleSelector?: string;
    dateSelector?: string;
    placeSelector?: string;
    priceSelector?: string;
    ticketsUrlSelector?: string;
    imageUrlSelector?: string;
    [key: string]: any;
  };
}

export interface WebsiteScrapedResult {
  url: string;
  rawText: string;
  posts: ScrapedPost[];
  ogImage: string | null;
}

/**
 * SSRF Protection Validator:
 * Rejects non-routable, private, loopback, AWS metadata, and malformed URLs.
 */
export function isSafeExternalUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    // Check for malformed hostnames (e.g. double dots in domain)
    if (hostname.includes('..') || hostname.startsWith('.') || hostname.endsWith('.')) {
      return false;
    }

    // Localhost & loopback
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('127.') ||
      hostname === '0.0.0.0' ||
      hostname === '::1' ||
      hostname === '[::1]'
    ) {
      return false;
    }

    // AWS / Cloud metadata service
    if (hostname === '169.254.169.254') {
      return false;
    }

    // Private IPv4 ranges:
    // 10.0.0.0 - 10.255.255.255
    if (hostname.startsWith('10.')) {
      return false;
    }

    // 192.168.0.0 - 192.168.255.255
    if (hostname.startsWith('192.168.')) {
      return false;
    }

    // 172.16.0.0 - 172.31.255.255
    const match172 = hostname.match(/^172\.(\d+)\./);
    if (match172) {
      const octet = parseInt(match172[1], 10);
      if (octet >= 16 && octet <= 31) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Decodes basic HTML entities commonly found in Telegram/Web text
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export interface NormalizedTelegramSource {
  channel: string;
  webviewUrl: string;
  isPrivate?: boolean;
  chatId?: string;
  messageId?: string;
}

/**
 * Normalizes Telegram channel identifier into public webview URL or detects private chat
 */
export function normalizeTelegramWebviewUrl(input: string): NormalizedTelegramSource {
  let cleaned = input.trim();

  // Check for private chat link: t.me/c/2103289961/7
  const privateMatch = cleaned.match(/(?:https?:\/\/)?t\.me\/c\/(\d+)(?:\/(\d+))?/i);
  if (privateMatch) {
    const rawChatId = privateMatch[1];
    const messageId = privateMatch[2];
    const fullChatId = `-100${rawChatId}`;
    return {
      channel: `c/${rawChatId}`,
      webviewUrl: `https://t.me/c/${rawChatId}${messageId ? `/${messageId}` : ''}`,
      isPrivate: true,
      chatId: fullChatId,
      messageId,
    };
  }

  // Strip protocol and domain if present
  cleaned = cleaned.replace(/^https?:\/\//i, '');
  cleaned = cleaned.replace(/^t\.me\/(?:s\/)?/i, '');
  cleaned = cleaned.replace(/^@/, '');
  // Strip trailing slashes or query params
  cleaned = cleaned.split('/')[0].split('?')[0];

  return {
    channel: cleaned,
    webviewUrl: `https://t.me/s/${cleaned}`,
    isPrivate: false,
  };
}

/**
 * Parses public Telegram channel webview HTML directly without any Telegram Bot API keys.
 * Extracts post texts, photo URLs, timestamps, and message permalinks.
 */
export function parseTelegramWebviewHtml(html: string, defaultChannel: string = ''): ScrapedPost[] {
  if (!html || html.length === 0) return [];

  const posts: ScrapedPost[] = [];
  // Split on message container
  const messageBlocks = html.split('<div class="tgme_widget_message ');

  for (let i = 1; i < messageBlocks.length; i++) {
    const block = messageBlocks[i];

    // 1. Extract Post ID / Link
    let postLink = '';
    let postId = '';

    const dataPostMatch = block.match(/data-post="([^"]+)"/);
    if (dataPostMatch) {
      postId = dataPostMatch[1];
      postLink = `https://t.me/${postId}`;
    }

    const dateLinkMatch = block.match(/<a[^>]*class="[^"]*tgme_widget_message_date[^"]*"[^>]*href="([^"]+)"/);
    if (dateLinkMatch) {
      postLink = dateLinkMatch[1];
      if (!postId) {
        const idMatch = postLink.match(/t\.me\/(?:s\/)?([^?#]+)/);
        if (idMatch) postId = idMatch[1];
      }
    }

    if (!postId && defaultChannel) {
      postId = `${defaultChannel}/${i}`;
      postLink = `https://t.me/s/${postId}`;
    }

    // 2. Extract Message Text
    const textMatch = block.match(/<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/);
    let postText = '';
    if (textMatch) {
      postText = textMatch[1]
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .trim();
      postText = decodeHtmlEntities(postText);
    }

    // 3. Extract Image URL (priority: photo wrap > grouped layer > link preview image)
    let imageUrl: string | null = null;
    const photoMatch =
      block.match(/class="[^"]*tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:\s*url\('?([^'"]+)'?\)/i) ||
      block.match(/class="[^"]*grouped_layer[^"]*"[^>]*style="[^"]*background-image:\s*url\('?([^'"]+)'?\)/i) ||
      block.match(/class="[^"]*link_preview_image[^"]*"[^>]*style="[^"]*background-image:\s*url\('?([^'"]+)'?\)/i);

    if (photoMatch && photoMatch[1]) {
      const img = photoMatch[1];
      if (!img.includes('user_photo') && !img.endsWith('.svg')) {
        imageUrl = img;
      }
    }

    // 4. Extract Timestamp
    let timestamp: string | null = null;
    const timeMatch = block.match(/<time[^>]*datetime="([^"]+)"/);
    if (timeMatch) {
      timestamp = timeMatch[1];
    }

    // Only include if text exists or photo exists
    if (postText.length > 5 || imageUrl) {
      posts.push({
        id: postId || String(i),
        text: postText,
        sourceUrl: postLink || `https://t.me/s/${defaultChannel}/${i}`,
        imageUrl,
        date: timestamp,
      });
    }
  }

  return posts;
}

/**
 * Scrapes public Telegram channel using native HTTP fetch (Zero Bot API required)
 */
export async function scrapeTelegramWebview(channelUrlOrHandle: string): Promise<ScrapedPost[]> {
  const normalized = normalizeTelegramWebviewUrl(channelUrlOrHandle);

  if (!normalized.channel) {
    throw new Error(`Invalid Telegram channel handle or URL: "${channelUrlOrHandle}"`);
  }

  if (normalized.isPrivate) {
    console.log(`[Scraper] Source is private Telegram chat ${normalized.chatId}. Bot access required for real-time ingestion.`);
    return [];
  }

  if (!isSafeExternalUrl(normalized.webviewUrl)) {
    throw new Error(`Unsafe Telegram webview URL: ${normalized.webviewUrl}`);
  }

  try {
    const res = await fetch(normalized.webviewUrl, {
      signal: AbortSignal.timeout(15000),
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Referer: 'https://t.me/',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    if (!res.ok) {
      throw new Error(`Telegram webview HTTP ${res.status} for ${normalized.webviewUrl}`);
    }

    const html = await res.text();
    return parseTelegramWebviewHtml(html, normalized.channel);
  } catch (error) {
    console.error(`[Scraper] Failed to fetch Telegram channel "${normalized.channel}":`, error);
    return [];
  }
}

/**
 * Scrapes website using Playwright headless browser with strict DOM noise cleaning
 * (strips scripts, styles, navs, footers, headers, iframes, svgs)
 * and optional custom CSS extraction rules.
 */
export async function scrapeWebsite(
  url: string,
  options?: WebsiteScrapeOptions
): Promise<WebsiteScrapedResult> {
  if (!isSafeExternalUrl(url)) {
    throw new Error(`[SSRF Guard] Blocked unsafe target URL: ${url}`);
  }

  const timeout = options?.timeout ?? 30000;
  const rules = options?.rules;

  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1280, height: 800 },
    });

    const page = await context.newPage();
    page.setDefaultTimeout(timeout);

    await page.goto(url, { waitUntil: 'domcontentloaded', timeout });
    // Wait briefly for client-side JavaScript hydration
    await page.waitForTimeout(2000);

    // Extract OpenGraph / Twitter hero image
    const ogImage = await page.evaluate(() => {
      const meta =
        document.querySelector('meta[property="og:image"]')?.getAttribute('content') ||
        document.querySelector('meta[name="og:image"]')?.getAttribute('content') ||
        document.querySelector('meta[name="twitter:image"]')?.getAttribute('content');
      if (meta && !meta.startsWith('data:')) {
        try {
          return new URL(meta, window.location.href).href;
        } catch {
          return meta;
        }
      }
      return null;
    });

    // Check if structured selector rules exist
    let posts: ScrapedPost[] = [];
    if (rules?.containerSelector) {
      posts = await page.evaluate(
        ({ rules, pageUrl }: { rules: any; pageUrl: string }) => {
          const containers = document.querySelectorAll(rules.containerSelector);
          const results: any[] = [];

          containers.forEach((card, idx) => {
            const titleEl = rules.titleSelector ? card.querySelector(rules.titleSelector) : null;
            const title = (titleEl as HTMLElement)?.innerText?.trim() || '';

            const dateEl = rules.dateSelector ? card.querySelector(rules.dateSelector) : null;
            const dateStr = (dateEl as HTMLElement)?.innerText?.trim() || '';

            const placeEl = rules.placeSelector ? card.querySelector(rules.placeSelector) : null;
            const placeStr = (placeEl as HTMLElement)?.innerText?.trim() || '';

            const priceEl = rules.priceSelector ? card.querySelector(rules.priceSelector) : null;
            const priceStr = (priceEl as HTMLElement)?.innerText?.trim() || '';

            let ticketUrl: string | null = null;
            if (rules.ticketsUrlSelector) {
              const ticketEl = card.querySelector(rules.ticketsUrlSelector);
              const href = ticketEl?.getAttribute('href');
              if (href) {
                try {
                  ticketUrl = new URL(href, pageUrl).href;
                } catch {
                  ticketUrl = href;
                }
              }
            }

            let imageUrl: string | null = null;
            if (rules.imageUrlSelector) {
              const imgEl = card.querySelector(rules.imageUrlSelector);
              const src = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src');
              if (src && !src.startsWith('data:')) {
                try {
                  imageUrl = new URL(src, pageUrl).href;
                } catch {
                  imageUrl = src;
                }
              }
            }

            const fullCardText = (card as HTMLElement)?.innerText?.trim() || '';
            const combinedText = `${title}\n${dateStr}\n${placeStr}\n${priceStr}\n${fullCardText}`.trim();

            if (title || fullCardText.length > 20) {
              results.push({
                id: `${pageUrl}#card-${idx + 1}`,
                text: combinedText,
                sourceUrl: ticketUrl || pageUrl,
                imageUrl,
                date: dateStr || null,
              });
            }
          });

          return results;
        },
        { rules, pageUrl: url }
      );
    }

    // Clean DOM noise and extract cleaned body text
    const rawText = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;

      // Strip noise tags
      const noiseSelectors = 'script, style, nav, footer, header, iframe, svg, noscript, link, aside';
      clone.querySelectorAll(noiseSelectors).forEach((el) => el.remove());

      // Resolve relative links to absolute
      clone.querySelectorAll('a').forEach((a) => {
        const href = a.getAttribute('href');
        if (href && !href.startsWith('javascript:') && !href.startsWith('#')) {
          try {
            a.setAttribute('href', new URL(href, window.location.href).href);
          } catch {}
        }
      });

      clone.querySelectorAll('img').forEach((img) => {
        const src = img.getAttribute('src');
        if (src && !src.startsWith('data:')) {
          try {
            img.setAttribute('src', new URL(src, window.location.href).href);
          } catch {}
        }
      });

      const text = clone.innerText?.trim() || '';
      return text.slice(0, 35000);
    });

    // If no structured posts found via rules, treat whole cleaned page as single post
    if (posts.length === 0 && rawText.length > 20) {
      posts.push({
        id: url,
        text: rawText,
        sourceUrl: url,
        imageUrl: ogImage,
      });
    }

    return {
      url,
      rawText,
      posts,
      ogImage,
    };
  } finally {
    await browser.close();
  }
}

/**
 * Universal Scraper Entrypoint:
 * Routes automatically to Telegram webview fetcher or Playwright website parser based on URL or type.
 */
export async function scrapeUrl(
  url: string,
  sourceType: 'telegram' | 'website' = 'website',
  options?: WebsiteScrapeOptions
): Promise<ScrapedPost[]> {
  const isTelegram =
    sourceType === 'telegram' ||
    url.includes('t.me/') ||
    url.startsWith('@') ||
    (!url.startsWith('http') && !url.includes('.'));

  if (isTelegram) {
    return scrapeTelegramWebview(url);
  }

  const siteResult = await scrapeWebsite(url, options);
  return siteResult.posts;
}
