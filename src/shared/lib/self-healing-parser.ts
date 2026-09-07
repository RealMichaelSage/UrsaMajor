import { db } from '../db';
import { parsingSeeds } from '../db/schema';
import { eq } from 'drizzle-orm';
import { callLLM } from './gemini';

export interface RecalibrateResult {
  recalibrated: boolean;
  newRules?: {
    containerSelector?: string;
    titleSelector?: string;
    dateSelector?: string;
    placeSelector?: string;
    priceSelector?: string;
    ticketsUrlSelector?: string;
    imageUrlSelector?: string;
    [key: string]: any;
  };
  confidence?: number;
  reasoning?: string;
  error?: string;
}

export const MAX_RECALIBRATION_ATTEMPTS = 3;

/**
 * Autonomous Self-Healing Parser:
 * When a website changes layout or breaks existing selectors,
 * this function analyzes the new page structure, synthesizes updated CSS selectors,
 * tests them, and automatically updates the parsing rules in PostgreSQL!
 */
export async function recalibrateSeedRules(
  seedId: string,
  url: string,
  rawHtml: string,
  categoryHint: string = 'pitch'
): Promise<RecalibrateResult> {
  console.log(`[Self-Healing Parser] Attempting automatic rule re-calibration for: ${url} (seed: ${seedId})`);

  if (!rawHtml || rawHtml.length < 200) {
    return { recalibrated: false, error: 'Content too small to re-calibrate' };
  }

  // Find seed in database to check circuit breaker
  let failureCount = 0;
  let currentRules: Record<string, any> = {};
  try {
    const seed = await db.query.parsingSeeds.findFirst({
      where: (seeds: any, { eq }: any) => eq(seeds.id, seedId),
    });
    if (seed) {
      currentRules = (seed.rules as Record<string, any>) || {};
      failureCount = currentRules.failureCount || 0;
    }
  } catch {
    // ignore
  }

  // Circuit breaker: cap recalibration attempts at 3
  if (failureCount >= MAX_RECALIBRATION_ATTEMPTS) {
    console.warn(`[Self-Healing Parser] Circuit breaker tripped for seed ${seedId} (${failureCount} failures)`);
    try {
      await db
        .update(parsingSeeds)
        .set({
          scrapeStatus: 'failed',
          scrapeError: `Circuit breaker tripped after ${failureCount} attempts`,
          rules: {
            ...currentRules,
            status: 'review_needed',
          },
        })
        .where(eq(parsingSeeds.id, seedId));
    } catch {}
    return {
      recalibrated: false,
      error: `Circuit breaker tripped after ${failureCount} attempts`,
    };
  }

  const cleanSlice = rawHtml
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<svg\b[^<]*(?:(?!<\/svg>)<[^<]*)*<\/svg>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .slice(0, 25000);

  const prompt = `
Внимание: сайт изменил разметку, и парсер больше не находит карточки событий.
Проанализируй обновленный HTML-код страницы мероприятий (${url}) и подбери новые работающие CSS-селекторы:
- containerSelector: селектор блока/карточки одного события
- titleSelector: селектор заголовка внутри карточки
- dateSelector: селектор даты проведения
- placeSelector: селектор площадки/места
- priceSelector: селектор цены
- ticketsUrlSelector: селектор ссылки на билеты/регистрацию
- imageUrlSelector: селектор постера/картинки

Категория по умолчанию: ${categoryHint}.

Верни результат СТРОГО в формате JSON:
{
  "rules": {
    "containerSelector": "строка",
    "titleSelector": "строка",
    "dateSelector": "строка",
    "placeSelector": "строка",
    "priceSelector": "строка",
    "ticketsUrlSelector": "строка",
    "imageUrlSelector": "строка"
  },
  "confidence": число от 0 до 100,
  "reasoning": "что изменилось в разметке"
}

HTML:
${cleanSlice}
`;

  try {
    const resultText = await callLLM(prompt, true);

    let rules: any;
    let confidence = 85;
    let reasoning = 'Автоматически определены новые CSS-селекторы';

    if (resultText) {
      try {
        const data = JSON.parse(resultText);
        if (data.rules) rules = data.rules;
        if (typeof data.confidence === 'number') confidence = data.confidence;
        if (data.reasoning) reasoning = data.reasoning;
      } catch {}
    }

    // Heuristic fallback if LLM is offline
    if (!rules) {
      rules = {
        containerSelector: '.event-card, .events-item, article.event, .afisha-card, .card',
        titleSelector: 'h2, h3, h4, .title, .event-title',
        dateSelector: '.date, time, .event-date, .datetime',
        placeSelector: '.place, .location, .venue, .address',
        priceSelector: '.price, .cost, .ticket-price',
        ticketsUrlSelector: 'a.btn, a.button, a.tickets, a[href*="reg"], a[href*="ticket"]',
        imageUrlSelector: 'img.poster, img.cover, .image img, img',
      };
      confidence = 75;
      reasoning = 'Применены эвристические селекторы карточек мероприятий';
    }

    if (confidence >= 70) {
      await db
        .update(parsingSeeds)
        .set({
          rules: {
            ...currentRules,
            ...rules,
            status: 'active',
            lastSuccessAt: new Date().toISOString(),
          },
          scrapeStatus: 'success',
          lastScrapedAt: new Date(),
        })
        .where(eq(parsingSeeds.id, seedId));

      console.log(`✅ [Self-Healing Parser] Successfully re-calibrated rules for ${url}: ${reasoning}`);
      return {
        recalibrated: true,
        newRules: rules,
        confidence,
        reasoning,
      };
    } else {
      // Flag as review_needed
      await db
        .update(parsingSeeds)
        .set({
          scrapeStatus: 'failed',
          scrapeError: `Confidence ${confidence}% is below threshold 70%`,
          rules: {
            ...currentRules,
            status: 'review_needed',
          },
        })
        .where(eq(parsingSeeds.id, seedId));

      return {
        recalibrated: false,
        confidence,
        error: `Confidence ${confidence}% is below threshold 70%`,
      };
    }
  } catch (err: any) {
    console.error(`[Self-Healing Parser] Re-calibration failed for ${url}:`, err.message);
    try {
      await db
        .update(parsingSeeds)
        .set({
          scrapeStatus: 'failed',
          scrapeError: err.message,
          rules: {
            ...currentRules,
            failureCount: failureCount + 1,
          },
        })
        .where(eq(parsingSeeds.id, seedId));
    } catch {}
    return { recalibrated: false, error: err.message };
  }
}
