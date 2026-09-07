/**
 * Test Utilities and Assertions for Ursa Major E2E Test Suite.
 */

export function isValidIsoMoscow(dateString: string): boolean {
  if (!dateString) return false;
  // Moscow time is +03:00 or Z converted
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

export function formatMoscowDateRu(isoString: string): string {
  const date = new Date(isoString);
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Moscow',
  };
  return new Intl.DateTimeFormat('ru-RU', options).format(date);
}

export function isValidRussianPhone(phone: string): boolean {
  // Enforces +7 (XXX) XXX-XX-XX format
  const regex = /^\+7\s?\(\d{3}\)\s?\d{3}-\d{2}-\d{2}$/;
  return regex.test(phone.trim());
}

export function cleanPhoneDigits(phone: string): string {
  return phone.replace(/\D/g, '');
}

export function isSafeExternalUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    const hostname = parsed.hostname.toLowerCase();
    // Block localhost, private IPs, loopback, AWS metadata, and malformed DNS labels
    if (
      hostname.includes('..') ||
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname === '169.254.169.254'
    ) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Trigram similarity computation matching PostgreSQL pg_trgm algorithm.
 */
export function calculateTrigramSimilarity(str1: string, str2: string): number {
  const s1 = `  ${str1.toLowerCase().trim()} `;
  const s2 = `  ${str2.toLowerCase().trim()} `;

  const getTrigrams = (str: string): Set<string> => {
    const trigrams = new Set<string>();
    for (let i = 0; i < str.length - 2; i++) {
      trigrams.add(str.substring(i, i + 3));
    }
    return trigrams;
  };

  const set1 = getTrigrams(s1);
  const set2 = getTrigrams(s2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      intersection++;
    }
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Calculate reading time in minutes for Russian text (180 words per min).
 */
export function estimateReadingTimeRu(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 180));
}

/**
 * Executes a fetch request within the page context so that Playwright's
 * page.route network mockers intercept it reliably even when standalone.
 */
export async function apiFetch(
  page: any,
  url: string,
  init?: any
): Promise<{ ok: boolean; status: number; json: () => Promise<any> }> {
  const fullUrl = url.startsWith('http')
    ? url
    : `http://localhost:3000${url.startsWith('/') ? '' : '/'}${url}`;

  const result = await page.evaluate(
    async ({ fullUrl, init }: { fullUrl: string; init?: any }) => {
      try {
        const fetchInit: RequestInit = {
          method: init?.method || 'GET',
          headers: init?.headers,
          body: init?.data ? JSON.stringify(init.data) : init?.body,
        };
        const res = await fetch(fullUrl, fetchInit);
        const text = await res.text();
        let data: any;
        try {
          data = JSON.parse(text);
        } catch {
          data = text;
        }
        return { ok: res.ok, status: res.status, data };
      } catch (err: any) {
        return { ok: false, status: 500, data: { error: err?.message || String(err) } };
      }
    },
    { fullUrl, init }
  );

  return {
    ok: result.ok,
    status: result.status,
    json: async () => result.data,
  };
}


