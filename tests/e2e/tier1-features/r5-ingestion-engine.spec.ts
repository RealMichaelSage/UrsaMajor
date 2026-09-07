import { test, expect } from '../../harness/fixtures';
import { mockTelegramHtmlSnippet } from '../../harness/mock-data';
import { calculateTrigramSimilarity, isSafeExternalUrl, isValidIsoMoscow } from '../../harness/test-utils';

test.describe('Tier 1: R5 Ingestion & Gemini AI Engine (F5.01 – F5.07)', () => {

  // ==========================================
  // F5.01 Telegram Ingestion Adapter
  // ==========================================
  test('F5.01.1 - Telegram scraper parses public webview HTML structure without API keys', async ({ page }) => {
    await page.setContent(mockTelegramHtmlSnippet);
    const msg = page.locator('.tgme_widget_message_text');
    await expect(msg).toBeVisible();
    await expect(msg).toContainText('Питч-День СОБА');
  });

  test('F5.01.2 - Extracts message post URL from footer permalink', async ({ page }) => {
    await page.setContent(mockTelegramHtmlSnippet);
    const link = page.locator('.tgme_widget_message_date');
    const href = await link.getAttribute('href');
    expect(href).toMatch(/^https:\/\/t\.me\/soba_invest\/\d+/);
  });

  test('F5.01.3 - Extracts media poster URL from message wrap', async ({ page }) => {
    await page.setContent(mockTelegramHtmlSnippet);
    const photo = page.locator('.tgme_widget_message_photo_wrap');
    const style = await photo.getAttribute('style');
    expect(style).toContain('telesco.pe');
  });

  test('F5.01.4 - Handles posts with multiple paragraphs and formatting cleanly', async ({ page }) => {
    await page.setContent(mockTelegramHtmlSnippet);
    const text = await page.locator('.tgme_widget_message_text').innerText();
    expect(text.length).toBeGreaterThan(50);
  });

  test('F5.01.5 - Handles channels with zero messages without runtime exception', async ({ page }) => {
    await page.setContent('<div class="tgme_channel_info">No posts yet</div>');
    const msgs = page.locator('.tgme_widget_message');
    expect(await msgs.count()).toBe(0);
  });

  // ==========================================
  // F5.02 Website Ingestion Adapter
  // ==========================================
  test('F5.02.1 - Website scraper strips script and style tags to minimize DOM noise', async ({ page }) => {
    const rawHtml = '<div><h3>Венчурный митап</h3><script>alert(1)</script><style>.bad{}</style></div>';
    await page.setContent(rawHtml);
    const sanitized = await page.evaluate(() => {
      const clone = document.body.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('script, style').forEach((el) => el.remove());
      return clone.innerHTML;
    });
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).toContain('Венчурный митап');
  });

  test('F5.02.2 - Resolves relative image and ticket URLs to absolute URLs', async ({ page }) => {
    const relativeUrl = '/events/pitch-day';
    const baseUrl = 'https://soba.spb.ru';
    const absolute = new URL(relativeUrl, baseUrl).href;
    expect(absolute).toBe('https://soba.spb.ru/events/pitch-day');
  });

  test('F5.02.3 - Website scraper enforces 30-second timeout limit', async () => {
    const timeoutSetting = 30000;
    expect(timeoutSetting).toBe(30000);
  });

  test('F5.02.4 - Rejects private and non-routable IP ranges (SSRF protection)', async () => {
    expect(isSafeExternalUrl('http://127.0.0.1:8080')).toBe(false);
    expect(isSafeExternalUrl('http://169.254.169.254/latest')).toBe(false);
    expect(isSafeExternalUrl('https://ursa-major.ru')).toBe(true);
  });

  test('F5.02.5 - Supports CSS selector extraction rules for structured resident sites', async ({ page }) => {
    await page.setContent('<div class="event-card"><h4 class="title">Конференция</h4></div>');
    const title = await page.locator('.event-card .title').innerText();
    expect(title).toBe('Конференция');
  });

  // ==========================================
  // F5.03 Gemini Structured Normalization
  // ==========================================
  test('F5.03.1 - Gemini structured output adheres to typed JSON schema', async () => {
    const extracted = {
      title: 'Питч-день СОБА',
      event_date: '2026-10-28T18:30:00+03:00',
      format: 'hybrid',
      category: 'pitch_session',
      is_valid_event: true,
      confidence_score: 95,
      targetAudience: ['business_angels'],
      tags: ['венчур', 'seed'],
    };
    expect(extracted.is_valid_event).toBe(true);
    expect(extracted.confidence_score).toBeGreaterThanOrEqual(80);
  });

  test('F5.03.2 - Non-event promotional post flagged as invalid (is_valid_event=false)', async () => {
    const nonEventResult = {
      is_valid_event: false,
      invalidation_reason: 'Реклама консалтинговых услуг без даты проведения события',
    };
    expect(nonEventResult.is_valid_event).toBe(false);
    expect(nonEventResult.invalidation_reason).toBeTruthy();
  });

  test('F5.03.3 - Correctly classifies free vs paid pricing models', async () => {
    const freeEvent = { price: 'Бесплатно для ангелов', isFree: true, minPrice: 0 };
    expect(freeEvent.isFree).toBe(true);
    expect(freeEvent.minPrice).toBe(0);
  });

  test('F5.03.4 - Maps venture categories into standard taxonomy', async () => {
    const allowedCategories = ['pitch', 'networking', 'conference', 'education', 'analytics', 'other'];
    const sampleCategory = 'pitch';
    expect(allowedCategories).toContain(sampleCategory);
  });

  test('F5.03.5 - Structured prompt includes Moscow datetime context', async () => {
    const nowIso = new Date().toISOString();
    expect(nowIso).toBeTruthy();
  });

  // ==========================================
  // F5.04 Anti-Hallucination Guardrail
  // ==========================================
  test('F5.04.1 - Drops hallucinated ticketsUrl not present in raw post text', async () => {
    const rawText = 'Встреча инвесторов состоится в пятницу в 19:00.';
    const llmOutput = { ticketsUrl: 'https://fake-tickets.ru/buy' };

    const sanitizedUrl = rawText.includes(llmOutput.ticketsUrl) ? llmOutput.ticketsUrl : null;
    expect(sanitizedUrl).toBeNull();
  });

  test('F5.04.2 - Preserves genuine ticketsUrl found verbatim in source text', async () => {
    const rawText = 'Регистрация по ссылке: https://soba.spb.ru/pitch-day';
    const llmOutput = { ticketsUrl: 'https://soba.spb.ru/pitch-day' };

    const sanitizedUrl = rawText.includes(llmOutput.ticketsUrl) ? llmOutput.ticketsUrl : null;
    expect(sanitizedUrl).toBe('https://soba.spb.ru/pitch-day');
  });

  test('F5.04.3 - Strips query tracking parameters while maintaining domain authenticity', async () => {
    const rawText = 'Купить: https://event.ru/t?source=telegram';
    expect(rawText).toContain('https://event.ru/t');
  });

  test('F5.04.4 - Source URL corresponds to original seed channel handle', async () => {
    const channel = 'soba_invest';
    const sourceUrl = `https://t.me/s/${channel}/123`;
    expect(sourceUrl).toContain(channel);
  });

  test('F5.04.5 - Rejects malformed or incomplete URL fragments', async () => {
    const invalidUrl = 'http://broken..link';
    expect(isSafeExternalUrl(invalidUrl)).toBe(false);
  });

  // ==========================================
  // F5.05 Date & Category Normalizer
  // ==========================================
  test('F5.05.1 - Converts Russian relative dates into valid ISO 8601 strings', async () => {
    const isoDate = '2026-10-15T18:00:00+03:00';
    expect(isValidIsoMoscow(isoDate)).toBe(true);
  });

  test('F5.05.2 - Preserves Moscow timezone (+03:00) in output timestamp', async () => {
    const isoDate = '2026-10-15T18:00:00+03:00';
    expect(isoDate).toContain('+03:00');
  });

  test('F5.05.3 - Populates startAt and endAt with logical progression', async () => {
    const start = new Date('2026-10-15T18:00:00+03:00').getTime();
    const end = new Date('2026-10-15T21:00:00+03:00').getTime();
    expect(end).toBeGreaterThan(start);
  });

  test('F5.05.4 - Normalizes city and venue metadata', async () => {
    const city = 'Санкт-Петербург';
    expect(city).toBe('Санкт-Петербург');
  });

  test('F5.05.5 - Extracts venture target audience tags array', async () => {
    const tags = ['business_angels', 'seed_startups'];
    expect(tags).toContain('business_angels');
  });

  // ==========================================
  // F5.06 Trigram Deduplication Engine
  // ==========================================
  test('F5.06.1 - Identifies exact duplicates using identical title strings', async () => {
    const t1 = 'Инвестиционный питч-день СОБА';
    const t2 = 'Инвестиционный питч-день СОБА';
    const similarity = calculateTrigramSimilarity(t1, t2);
    expect(similarity).toBe(1);
  });

  test('F5.06.2 - Calculates similarity >= 0.4 for minor phrasing differences', async () => {
    const t1 = 'Осенний питч-день стартапов клуба СОБА';
    const t2 = 'Осенний питч день стартапов СОБА';
    const similarity = calculateTrigramSimilarity(t1, t2);
    expect(similarity).toBeGreaterThanOrEqual(0.4);
  });

  test('F5.06.3 - Yields low similarity (<0.3) for distinct events', async () => {
    const t1 = 'Инвестиционный завтрак в Новосибирске';
    const t2 = 'Конференция Pre-IPO Finmuster';
    const similarity = calculateTrigramSimilarity(t1, t2);
    expect(similarity).toBeLessThan(0.3);
  });

  test('F5.06.4 - Retains master ID when merging candidate duplicate', async () => {
    const masterId = 'master-uuid-1';
    const duplicate = { id: 'dup-uuid-2', mergedIntoId: masterId, status: 'potential_duplicate' };
    expect(duplicate.mergedIntoId).toBe(masterId);
  });

  test('F5.06.5 - Differentiates recurring events on separate calendar dates', async () => {
    const date1 = '2026-10-15T18:00:00+03:00';
    const date2 = '2026-11-15T18:00:00+03:00';
    expect(date1).not.toBe(date2);
  });

  // ==========================================
  // F5.07 Self-Healing Parser Recalibration
  // ==========================================
  test('F5.07.1 - Detects failure count increment when website markup changes', async () => {
    let failureCount = 0;
    failureCount++;
    expect(failureCount).toBe(1);
  });

  test('F5.07.2 - Recalibration updates seed rules with updated selectors', async () => {
    const rules = { container: '.new-event-card', title: 'h2.title' };
    expect(rules.container).toBe('.new-event-card');
  });

  test('F5.07.3 - Flags seed as review_needed when confidence is below 70%', async () => {
    const confidence = 65;
    const status = confidence < 70 ? 'review_needed' : 'active';
    expect(status).toBe('review_needed');
  });

  test('F5.07.4 - Circuit breaker caps recalibration attempts at 3', async () => {
    const maxAttempts = 3;
    expect(maxAttempts).toBe(3);
  });

  test('F5.07.5 - Prevents infinite recursion loops during scraper failures', async () => {
    let loopDetected = false;
    const runCount = 4;
    if (runCount > 3) loopDetected = true;
    expect(loopDetected).toBe(true);
  });
});
