import type { EventCategory } from '../types';

/**
 * Normalizer utilities for Ursa Major Ingestion & AI Engine:
 * 1. Russian relative/absolute date parsing to strict ISO 8601 Europe/Moscow (UTC+3)
 * 2. Anti-hallucination URL verification (verbatim occurrence in source text)
 * 3. Venture taxonomy category normalization
 */

// Month mappings in Russian
const RU_MONTHS: Record<string, number> = {
  января: 0,
  январь: 0,
  февраля: 1,
  февраль: 1,
  марта: 2,
  март: 2,
  апреля: 3,
  апрель: 3,
  мая: 4,
  май: 4,
  июня: 5,
  июнь: 5,
  июля: 6,
  июль: 6,
  августа: 7,
  август: 7,
  сентября: 8,
  сентябрь: 8,
  октября: 9,
  октябрь: 9,
  ноября: 10,
  ноябрь: 10,
  декабря: 11,
  декабрь: 11,
};

const RU_DAYS_OF_WEEK: Record<string, number> = {
  воскресенье: 0,
  воскресенья: 0,
  понедельник: 1,
  понедельника: 1,
  вторник: 2,
  вторника: 2,
  среду: 3,
  среда: 3,
  среды: 3,
  четверг: 4,
  четверга: 4,
  пятницу: 5,
  пятница: 5,
  пятницы: 5,
  субботу: 6,
  суббота: 6,
  субботы: 6,
};

/**
 * Formats a given Date instance into a strict ISO 8601 Europe/Moscow string with '+03:00'
 */
export function formatIsoMoscow(date: Date): string {
  // Moscow is UTC+3 all year round
  const moscowOffsetMs = 3 * 60 * 60 * 1000;
  const moscowTime = new Date(date.getTime() + moscowOffsetMs);

  const y = moscowTime.getUTCFullYear();
  const m = String(moscowTime.getUTCMonth() + 1).padStart(2, '0');
  const d = String(moscowTime.getUTCDate()).padStart(2, '0');
  const h = String(moscowTime.getUTCHours()).padStart(2, '0');
  const min = String(moscowTime.getUTCMinutes()).padStart(2, '0');
  const s = String(moscowTime.getUTCSeconds()).padStart(2, '0');

  return `${y}-${m}-${d}T${h}:${min}:${s}+03:00`;
}

/**
 * Validates whether the given string is a valid ISO 8601 date, preferably with Moscow offset
 */
export function isValidIsoMoscow(dateString: string): boolean {
  if (!dateString || typeof dateString !== 'string') return false;
  const d = new Date(dateString);
  return !isNaN(d.getTime());
}

export interface ParsedDatesResult {
  startAt: string;
  endAt?: string | null;
  isValid: boolean;
  reason?: string;
}

/**
 * Parses Russian relative or absolute dates and returns strict ISO 8601 strings in Moscow timezone (+03:00).
 * Handles expressions like:
 * - "завтра в 19:00"
 * - "в эту пятницу в 18:30"
 * - "15 октября в 19:00"
 * - "28 октября 2026 с 18:00 до 21:00"
 * - "15.10.2026 18:00"
 * - Standard ISO strings (ensuring Europe/Moscow representation)
 */
export function normalizeDateToIsoMoscow(
  input: string | Date | null | undefined,
  referenceDate: Date = new Date()
): ParsedDatesResult {
  if (!input) {
    return { startAt: '', isValid: false, reason: 'Empty date input' };
  }

  if (input instanceof Date) {
    if (isNaN(input.getTime())) {
      return { startAt: '', isValid: false, reason: 'Invalid Date object' };
    }
    return {
      startAt: formatIsoMoscow(input),
      isValid: true,
    };
  }

  const trimmed = input.trim();
  if (!trimmed) {
    return { startAt: '', isValid: false, reason: 'Blank date string' };
  }

  // If already a strict ISO string with time
  if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(trimmed)) {
    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      // If already contains +03:00, preserve it or normalize to Moscow
      return {
        startAt: formatIsoMoscow(parsed),
        isValid: true,
      };
    }
  }

  // Work with lowercase copy for Russian parsing
  const lower = trimmed.toLowerCase();

  // Get current Moscow time components from referenceDate
  const moscowOffsetMs = 3 * 60 * 60 * 1000;
  const refMoscow = new Date(referenceDate.getTime() + moscowOffsetMs);
  let targetYear = refMoscow.getUTCFullYear();
  let targetMonth = refMoscow.getUTCMonth();
  let targetDay = refMoscow.getUTCDate();
  let startHour = 19;
  let startMinute = 0;
  let endHour: number | null = null;
  let endMinute: number | null = null;

  // 1. Extract time of day (e.g. "в 18:30", "с 18:00 до 21:00", "19:00", "18-00")
  const rangeMatch = lower.match(/(?:с|от)\s*(\d{1,2})[:.-](\d{2})\s*(?:до|по|-)\s*(\d{1,2})[:.-](\d{2})/i);
  if (rangeMatch) {
    startHour = parseInt(rangeMatch[1], 10);
    startMinute = parseInt(rangeMatch[2], 10);
    endHour = parseInt(rangeMatch[3], 10);
    endMinute = parseInt(rangeMatch[4], 10);
  } else {
    const timeMatch = lower.match(/(?:в|с|в\s*)?(\d{1,2})[:.-](\d{2})(?:\s*мск)?/i);
    if (timeMatch) {
      startHour = parseInt(timeMatch[1], 10);
      startMinute = parseInt(timeMatch[2], 10);
    }
  }

  let dateFound = false;

  // 2. Relative dates: "сегодня", "завтра", "послезавтра"
  if (lower.includes('сегодня')) {
    dateFound = true;
  } else if (lower.includes('послезавтра')) {
    targetDay += 2;
    dateFound = true;
  } else if (lower.includes('завтра')) {
    targetDay += 1;
    dateFound = true;
  }

  // 3. Days of week: "в эту пятницу", "в следующий вторник", "в среду"
  if (!dateFound) {
    for (const [dayName, targetDayOfWeek] of Object.entries(RU_DAYS_OF_WEEK)) {
      if (lower.includes(dayName)) {
        const currentDayOfWeek = refMoscow.getUTCDay();
        let diff = targetDayOfWeek - currentDayOfWeek;
        if (diff <= 0) {
          diff += 7; // Next occurrence
        }
        if (lower.includes('следующ')) {
          diff += 7;
        }
        targetDay += diff;
        dateFound = true;
        break;
      }
    }
  }

  // 4. Word-based date: "15 октября", "28 октября 2026", "24-25 октября"
  if (!dateFound) {
    const monthNamesPattern = Object.keys(RU_MONTHS).join('|');
    const wordDateRegex = new RegExp(`(\\d{1,2})(?:\\s*-\\s*\\d{1,2})?\\s+(${monthNamesPattern})(?:\\s+(\\d{4}))?`, 'i');
    const wordMatch = lower.match(wordDateRegex);

    if (wordMatch) {
      targetDay = parseInt(wordMatch[1], 10);
      targetMonth = RU_MONTHS[wordMatch[2].toLowerCase()];
      if (wordMatch[3]) {
        targetYear = parseInt(wordMatch[3], 10);
      } else {
        // If the parsed month/day is already passed in current year, could be next year
        if (targetMonth < refMoscow.getUTCMonth() || (targetMonth === refMoscow.getUTCMonth() && targetDay < refMoscow.getUTCDate() - 2)) {
          targetYear += 1;
        }
      }
      dateFound = true;
    }
  }

  // 5. Numeric dates: DD.MM.YYYY or DD.MM or YYYY-MM-DD
  if (!dateFound) {
    const numDateMatch = lower.match(/(\d{1,2})[./-](\d{1,2})(?:[./-](\d{2,4}))?/);
    if (numDateMatch) {
      const p1 = parseInt(numDateMatch[1], 10);
      const p2 = parseInt(numDateMatch[2], 10);
      const p3 = numDateMatch[3] ? parseInt(numDateMatch[3], 10) : undefined;

      if (p1 > 1900) {
        // YYYY-MM-DD
        targetYear = p1;
        targetMonth = p2 - 1;
        targetDay = p3 || 1;
      } else {
        // DD.MM.YYYY
        targetDay = p1;
        targetMonth = p2 - 1;
        if (p3) {
          targetYear = p3 < 100 ? 2000 + p3 : p3;
        }
      }
      dateFound = true;
    }
  }

  if (!dateFound) {
    // Attempt standard Date constructor as fallback
    const fallbackDate = new Date(trimmed);
    if (!isNaN(fallbackDate.getTime())) {
      return {
        startAt: formatIsoMoscow(fallbackDate),
        isValid: true,
      };
    }
    return {
      startAt: '',
      isValid: false,
      reason: `Could not parse date from: "${trimmed}"`,
    };
  }

  // Construct startAt UTC timestamp from Moscow target components
  // In Moscow, standard time is UTC+3. So UTC hour = targetHour - 3.
  const startUtcMs = Date.UTC(targetYear, targetMonth, targetDay, startHour - 3, startMinute, 0);
  const startDate = new Date(startUtcMs);
  const startAt = formatIsoMoscow(startDate);

  let endAt: string | null = null;
  if (endHour !== null) {
    const endUtcMs = Date.UTC(targetYear, targetMonth, targetDay, endHour - 3, endMinute || 0, 0);
    const endDate = new Date(endUtcMs);
    endAt = formatIsoMoscow(endDate);
  }

  return {
    startAt,
    endAt,
    isValid: true,
  };
}

/**
 * Anti-Hallucination Guardrail:
 * Checks whether an LLM-extracted URL (paymentUrl, ticketUrl) actually appeared verbatim in the source text.
 * Drops hallucinated or fabricated links by returning null.
 */
export function verifyRealUrl(
  url: string | null | undefined,
  rawText: string | null | undefined
): string | null {
  if (!url || !url.trim()) return null;
  const cleanUrl = url.trim();

  // Validate protocol
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return null;
  }

  if (!rawText) return null;

  // 1. Direct substring match
  if (rawText.includes(cleanUrl)) {
    return cleanUrl;
  }

  // 2. Check if the URL with stripped query params exists in the text
  try {
    const parsed = new URL(cleanUrl);
    const baseWithoutQuery = `${parsed.protocol}//${parsed.host}${parsed.pathname}`;
    if (rawText.includes(baseWithoutQuery)) {
      return cleanUrl;
    }

    // 3. Check if host + pathname fragment (> 6 chars) is in text
    if (parsed.pathname && parsed.pathname.length > 5) {
      if (rawText.includes(parsed.pathname) || rawText.includes(parsed.host + parsed.pathname)) {
        return cleanUrl;
      }
    }

    // 4. Check if bare host is present (e.g. t.me/soba_invest in post text)
    const bareHostPath = `${parsed.host}${parsed.pathname}`.replace(/\/$/, '');
    if (rawText.includes(bareHostPath)) {
      return cleanUrl;
    }
  } catch {
    return null;
  }

  // URL not found anywhere in raw source -> Hallucination!
  return null;
}

/**
 * Venture category taxonomy normalizer:
 * Classifies events into standard venture categories based on title, description, and tags.
 */
export function normalizeCategory(
  categoryInput?: string | null,
  title?: string | null,
  description?: string | null
): EventCategory {
  const combined = `${categoryInput || ''} ${title || ''} ${description || ''}`.toLowerCase();

  if (
    combined.includes('питч') ||
    combined.includes('pitch') ||
    combined.includes('demo day') ||
    combined.includes('демо день') ||
    combined.includes('стартап-сесси') ||
    combined.includes('презентаци стартап') ||
    combined.includes('презентаци проект') ||
    combined.includes('питчинг')
  ) {
    return 'pitch';
  }

  if (
    combined.includes('нетворк') ||
    combined.includes('network') ||
    combined.includes('завтрак') ||
    combined.includes('закрытый ужин') ||
    combined.includes('клубный день') ||
    combined.includes('встреча инвестор') ||
    combined.includes('митап') ||
    combined.includes('meetup') ||
    combined.includes('бранч')
  ) {
    return 'networking';
  }

  if (
    combined.includes('конференц') ||
    combined.includes('conference') ||
    combined.includes('форум') ||
    combined.includes('forum') ||
    combined.includes('саммит') ||
    combined.includes('summit') ||
    combined.includes('конгресс') ||
    combined.includes('съезд') ||
    combined.includes('пленарн')
  ) {
    return 'conference';
  }

  if (
    combined.includes('академи') ||
    combined.includes('academy') ||
    combined.includes('мастер-класс') ||
    combined.includes('workshop') ||
    combined.includes('воркшоп') ||
    combined.includes('семинар') ||
    combined.includes('лекци') ||
    combined.includes('вебинар') ||
    combined.includes('webinar') ||
    combined.includes('обучени') ||
    combined.includes('due diligence') ||
    combined.includes('практикум')
  ) {
    return 'education';
  }

  if (
    combined.includes('аналитик') ||
    combined.includes('отчет') ||
    combined.includes('исследован') ||
    combined.includes('обзор рынка') ||
    combined.includes('макрообзор') ||
    combined.includes('vc report') ||
    combined.includes('тренды')
  ) {
    return 'analytics';
  }

  // Check direct match with categoryInput
  if (categoryInput) {
    const cat = categoryInput.toLowerCase().trim();
    if (['pitch', 'networking', 'conference', 'education', 'analytics', 'other'].includes(cat)) {
      return cat as EventCategory;
    }
  }

  return 'other';
}
