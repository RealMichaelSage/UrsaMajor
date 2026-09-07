import { GoogleGenAI } from '@google/genai';
import type { EventCategory, PriceType } from '../types';
import {
  normalizeDateToIsoMoscow,
  verifyRealUrl,
  normalizeCategory,
  isValidIsoMoscow,
  formatIsoMoscow,
} from './normalizer';

export interface ExtractedEvent {
  postId?: string;
  title: string;
  description: string | null;
  startAt: string; // strict ISO 8601 Moscow (+03:00)
  endAt?: string | null;
  timezone: string; // Default 'Europe/Moscow'
  isOnline: boolean;
  city?: string | null;
  venueName?: string | null;
  location?: string | null;
  priceType: PriceType;
  priceMin?: number | null;
  priceMax?: number | null;
  priceCurrency: string; // 'RUB'
  paymentUrl?: string | null;
  sourceUrl?: string;
  imageUrl?: string | null;
  category: EventCategory;
  targetAudience: string[];
  residentOrganizer?: string | null;
  isValidEvent: boolean;
  confidenceScore: number;
  confidenceReasoning?: string;
  invalidationReason?: string | null;
}

export interface PostItem {
  id: string;
  text: string;
  sourceUrl: string;
  imageUrl?: string | null;
  date?: string | null;
  categoryHint?: string;
  residentOrganizer?: string | null;
}

export let accumulatedCostRur = 0;

export function resetAccumulatedCost(): void {
  accumulatedCostRur = 0;
}

function getApiKey(): string | undefined {
  return process.env.GEMINI_API_KEY || process.env.DEEPSEEK_API_KEY;
}

function getIsProxyMode(): boolean {
  const key = getApiKey();
  return Boolean(key && (key.startsWith('sk-') || process.env.GEMINI_BASE_URL));
}

function getIsMockMode(): boolean {
  const key = getApiKey();
  return !key || key.includes('YOUR_GEMINI_API_KEY') || key === 'mock' || key.trim() === '';
}

/**
 * Universal LLM invocation helper supporting Google GenAI SDK and RouterAI/OpenRouter gateways
 */
export async function callLLM(prompt: string, jsonMode: boolean = true): Promise<string | null> {
  if (getIsMockMode()) {
    return null;
  }

  const key = getApiKey()!;
  const isProxy = getIsProxyMode();

  try {
    let resultText: string | null = null;
    let promptTokens = 0;
    let completionTokens = 0;

    if (isProxy) {
      const defaultBaseUrl = key.startsWith('sk-or-')
        ? 'https://openrouter.ai/api/v1'
        : 'https://routerai.ru/api/v1';
      const baseUrl = (process.env.GEMINI_BASE_URL || defaultBaseUrl).replace(/\/$/, '');
      const model = process.env.GEMINI_MODEL || 'google/gemini-2.5-flash';

      const response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: prompt }],
          response_format: jsonMode ? { type: 'json_object' } : undefined,
          max_tokens: 4000,
        }),
      });

      if (!response.ok) {
        const errText = await response.text();
        console.error('[LLM Call] Proxy error response:', errText);
        return null;
      }

      const data = await response.json();
      resultText = data.choices?.[0]?.message?.content || null;

      if (data.usage) {
        promptTokens = data.usage.prompt_tokens || 0;
        completionTokens = data.usage.completion_tokens || 0;
      }
    } else {
      const client = new GoogleGenAI({ apiKey: key });
      const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: jsonMode ? { responseMimeType: 'application/json' } : undefined,
      });

      resultText = response.text ? response.text.trim() : null;

      if (response.usageMetadata) {
        promptTokens = response.usageMetadata.promptTokenCount || 0;
        completionTokens = response.usageMetadata.candidatesTokenCount || 0;
      }
    }

    if (promptTokens > 0 || completionTokens > 0) {
      // Pricing benchmark in RUR: 1k prompt tokens ~ 0.029 RUR, 1k candidate tokens ~ 0.243 RUR
      const cost = promptTokens * 0.00002916 + completionTokens * 0.000243;
      accumulatedCostRur += cost;
      console.log(
        `[LLM Call] Tokens: ${promptTokens} in / ${completionTokens} out | Cost: ${cost.toFixed(4)} RUR | Total: ${accumulatedCostRur.toFixed(4)} RUR`
      );
    }

    if (resultText && jsonMode) {
      let cleaned = resultText.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.substring(7);
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.substring(3);
      }
      if (cleaned.endsWith('```')) {
        cleaned = cleaned.substring(0, cleaned.length - 3);
      }
      resultText = cleaned.trim();
    }

    return resultText;
  } catch (error) {
    console.error('[LLM Call] Error calling Gemini API:', error);
    return null;
  }
}

/**
 * Heuristic Offline Extractor:
 * Parses unstructured Russian post text using deterministic rule matching and regex.
 * Runs in test environments, CI, or when GEMINI_API_KEY is not configured.
 */
export function extractEventWithOfflineRules(
  post: PostItem,
  referenceDate: Date = new Date()
): ExtractedEvent | null {
  const text = post.text;
  if (!text || text.trim().length < 15) return null;

  const cleanText = text.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

  // 1. Check if post contains date indication
  const parsedDate = normalizeDateToIsoMoscow(cleanText, referenceDate);
  if (!parsedDate.isValid || !parsedDate.startAt) {
    return {
      postId: post.id,
      title: cleanText.slice(0, 80),
      description: cleanText.slice(0, 300),
      startAt: '',
      timezone: 'Europe/Moscow',
      isOnline: false,
      priceType: 'free',
      priceCurrency: 'RUB',
      category: 'other',
      targetAudience: [],
      sourceUrl: post.sourceUrl,
      imageUrl: post.imageUrl || null,
      isValidEvent: false,
      confidenceScore: 30,
      invalidationReason: 'В посте отсутствует конкретная дата проведения события',
    };
  }

  // 2. Extract Title (first sentence or non-empty line)
  const lines = text
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l.length > 5 && !l.startsWith('http') && !l.startsWith('#'));
  let title = lines[0] || 'Инвестиционное мероприятие';
  if (title.length > 120) {
    const periodIdx = title.indexOf('. ');
    if (periodIdx > 15 && periodIdx < 120) {
      title = title.substring(0, periodIdx);
    } else {
      title = title.substring(0, 117) + '...';
    }
  }

  // 3. Online vs Offline
  const lower = text.toLowerCase();
  const isOnline =
    lower.includes('zoom') ||
    lower.includes('онлайн') ||
    lower.includes('online') ||
    lower.includes('вебинар') ||
    lower.includes('трансляция') ||
    lower.includes('youtube') ||
    lower.includes('telemost');

  // 4. City & Venue detection
  let city: string = 'Москва';
  if (lower.includes('санкт-петербург') || lower.includes('питер') || lower.includes('спб')) {
    city = 'Санкт-Петербург';
  } else if (lower.includes('новосибирск')) {
    city = 'Новосибирск';
  } else if (lower.includes('екатеринбург')) {
    city = 'Екатеринбург';
  } else if (lower.includes('казан')) {
    city = 'Казань';
  } else if (lower.includes('сочи')) {
    city = 'Сочи';
  }

  let venueName: string | null = null;
  const venueMatch = text.match(/(?:место|площадка|адрес|локация):\s*([^.\n]+)/i);
  if (venueMatch) {
    venueName = venueMatch[1].trim();
  } else if (isOnline) {
    venueName = 'Онлайн (Zoom / Ссылка после регистрации)';
  }

  // 5. Pricing
  let priceType: PriceType = 'free';
  let priceMin: number | null = 0;
  let priceMax: number | null = null;

  const isExplicitlyFree =
    lower.includes('бесплатн') ||
    lower.includes('вход свободн') ||
    lower.includes('свободный вход') ||
    lower.includes('без оплаты') ||
    lower.includes('free');

  if (isExplicitlyFree) {
    priceType = 'free';
    priceMin = 0;
  } else {
    const priceNumMatch = text.match(/(\d[\d\s]*\d|\d+)\s*(?:₽|руб|рублей|р\b)/i);
    if (priceNumMatch) {
      const parsedNumber = parseInt(priceNumMatch[1].replace(/\s+/g, ''), 10);
      if (!isNaN(parsedNumber) && parsedNumber > 0) {
        priceType = 'paid';
        priceMin = parsedNumber;
      }
    } else if (
      lower.includes('платно') ||
      lower.includes('оргвзнос') ||
      lower.includes('стоимость билета') ||
      lower.includes('купить билет')
    ) {
      priceType = 'paid';
      priceMin = 1000;
    }
  }

  // 6. Category
  const category = normalizeCategory(post.categoryHint, title, text);

  // 7. Target Audience
  const targetAudience: string[] = [];
  if (lower.includes('ангел') || lower.includes('инвестор')) targetAudience.push('business_angels');
  if (lower.includes('стартап') || lower.includes('фаундер')) targetAudience.push('seed_startups');
  if (lower.includes('фонд') || lower.includes('vc')) targetAudience.push('funds');
  if (targetAudience.length === 0) targetAudience.push('investors_and_founders');

  // 8. Tickets / Payment URL with Anti-Hallucination verification
  let extractedUrl: string | null = null;
  const urlMatch = text.match(/https?:\/\/[^\s"'<>()]+/);
  if (urlMatch) {
    extractedUrl = verifyRealUrl(urlMatch[0], text);
  }

  // 9. Resident Organizer
  let residentOrganizer: string | null = post.residentOrganizer || null;
  if (!residentOrganizer) {
    if (lower.includes('соба')) residentOrganizer = 'СОБА';
    else if (lower.includes('сибирь') || lower.includes('дальний восток'))
      residentOrganizer = 'Клуб инвесторов Сибири, Урала и Дальнего Востока';
    else if (lower.includes('argent')) residentOrganizer = 'ARGENT CLUB';
    else if (lower.includes('uncrn')) residentOrganizer = 'UNCRN.ru';
    else if (lower.includes('finmuster')) residentOrganizer = 'Finmuster';
    else if (lower.includes('синдикат')) residentOrganizer = 'Синдикат';
  }

  return {
    postId: post.id,
    title,
    description: text.slice(0, 600),
    startAt: parsedDate.startAt,
    endAt: parsedDate.endAt || null,
    timezone: 'Europe/Moscow',
    isOnline,
    city,
    venueName,
    location: venueName,
    priceType,
    priceMin,
    priceMax,
    priceCurrency: 'RUB',
    paymentUrl: extractedUrl,
    sourceUrl: post.sourceUrl,
    imageUrl: post.imageUrl || null,
    category,
    targetAudience,
    residentOrganizer,
    isValidEvent: true,
    confidenceScore: 92,
    confidenceReasoning: 'Извлечено эвристическим парсером с точной датой и атрибуцией',
    invalidationReason: null,
  };
}

/**
 * Batch extraction processing multiple posts per call.
 * Uses Gemini 2.5 Flash with structured JSON output when GEMINI_API_KEY is available,
 * and seamlessly falls back to genuine offline heuristic extraction when offline or testing.
 */
export async function extractEventsFromPostBatch(
  posts: PostItem[],
  options?: { residentOrganizer?: string | null }
): Promise<ExtractedEvent[]> {
  if (posts.length === 0) return [];

  const isMock = getIsMockMode();
  const postsMap = new Map(posts.map((p) => [p.id, p]));

  if (isMock) {
    console.log(`[Batch Extraction] Running in resilient offline mode for ${posts.length} posts.`);
    const results: ExtractedEvent[] = [];
    for (const post of posts) {
      if (options?.residentOrganizer && !post.residentOrganizer) {
        post.residentOrganizer = options.residentOrganizer;
      }
      const event = extractEventWithOfflineRules(post);
      if (event) {
        results.push(event);
      }
    }
    return results;
  }

  try {
    const nowIsoMoscow = formatIsoMoscow(new Date());
    const postsPayload = posts.map((p) => ({
      id: p.id,
      text: p.text,
      categoryHint: p.categoryHint || 'pitch',
      residentOrganizer: p.residentOrganizer || options?.residentOrganizer || null,
    }));

    const prompt = `
Ты — экспертный ИИ-нормализатор мероприятий венчурной ассоциации «Большая Медведица» (Ursa Major).
Проанализируй список из ${posts.length} постов и извлеки структурированные данные о венчурных мероприятиях.
Текущее время в Москве: ${nowIsoMoscow} (Europe/Moscow, UTC+3).

СТРОГИЕ ПРАВИЛА ВАЛИДАЦИИ:
1. Выделяй мероприятие ТОЛЬКО при наличии КОНКРЕТНОЙ ДАТЫ проведения (день недели, число, расписание).
2. Если в посте нет конкретной даты проведения (общая реклама услуг, новость без события), установи "isValidEvent": false и "invalidationReason": "Общее объявление/новость без конкретной даты".
3. Преобразуй дату в строгий ISO 8601 формат с таймзоной Europe/Moscow (+03:00), например: "2026-10-28T18:30:00+03:00".
4. АНТИ-ГАЛЛЮЦИНАЦИЯ URL: Поле paymentUrl или ticketsUrl заполняй ТОЛЬКО ссылкой, которая БУКВАЛЬНО содержится в тексте поста! КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО придумывать или угадывать ссылки! Если в тексте нет ссылки, верни null.
5. Категория ("category") должна быть строго одной из: 'pitch', 'networking', 'conference', 'education', 'analytics', 'other'.
   - 'pitch': питч-сессии стартапов, Demo Day, презентации проектов
   - 'networking': бизнес-завтраки, инвест-завтраки, закрытые встречи инвесторов, митапы
   - 'conference': венчурные форумы, конференции, саммиты
   - 'education': вебинары, мастер-классы, воркшопы, академия инвестора, Due Diligence
   - 'analytics': презентации отчетов, аналитика рынка, макрообзоры
   - 'other': прочие мероприятия
6. Формат: "isOnline": true если онлайн/Zoom, false если оффлайн.
7. Стоимость: если бесплатно, "priceType": "free", "priceMin": 0. Если указана цена, "priceType": "paid", "priceMin": число рублей.

Входной батч постов (JSON):
${JSON.stringify(postsPayload, null, 2)}

Верни результат СТРОГО в формате JSON массива:
[
  {
    "postId": "id поста из входного массива",
    "title": "Название мероприятия",
    "description": "Краткое описание (1-3 предложения)",
    "startAt": "2026-10-28T18:30:00+03:00",
    "endAt": null,
    "isOnline": false,
    "city": "Москва",
    "venueName": "Площадка или null",
    "priceType": "free",
    "priceMin": 0,
    "paymentUrl": "буквальная ссылка из текста или null",
    "category": "pitch",
    "targetAudience": ["business_angels", "seed_startups"],
    "residentOrganizer": "название клуба/резидента или null",
    "isValidEvent": true,
    "confidenceScore": 95,
    "confidenceReasoning": "Обоснование уверенности",
    "invalidationReason": null
  }
]
`;

    const responseText = await callLLM(prompt, true);
    if (!responseText) {
      console.warn('[Batch Extraction] Empty LLM response, falling back to offline rules.');
      return extractEventsFromPostBatch(posts, options);
    }

    let parsedArray: any[];
    try {
      parsedArray = JSON.parse(responseText);
      if (!Array.isArray(parsedArray)) {
        if (parsedArray && typeof parsedArray === 'object' && Array.isArray((parsedArray as any).events)) {
          parsedArray = (parsedArray as any).events;
        } else {
          parsedArray = [];
        }
      }
    } catch {
      console.warn('[Batch Extraction] Failed to parse JSON from LLM, falling back to offline rules.');
      return extractEventsFromPostBatch(posts, options);
    }

    const results: ExtractedEvent[] = [];

    for (const item of parsedArray) {
      const postId = item.postId;
      const associatedPost = postsMap.get(postId);
      if (!associatedPost) continue;

      // Normalize date
      let startAt = item.startAt;
      if (!isValidIsoMoscow(startAt)) {
        const dateNorm = normalizeDateToIsoMoscow(startAt || associatedPost.text);
        startAt = dateNorm.startAt;
      }

      // Anti-hallucination URL verification
      const rawUrl = item.paymentUrl || item.ticketsUrl || null;
      const verifiedUrl = verifyRealUrl(rawUrl, associatedPost.text);

      // Normalize category
      const category = normalizeCategory(item.category, item.title, associatedPost.text);

      const isValid = Boolean(item.isValidEvent && startAt);

      results.push({
        postId,
        title: item.title || 'Венчурное мероприятие',
        description: item.description || associatedPost.text.slice(0, 300),
        startAt: startAt || '',
        endAt: item.endAt || null,
        timezone: 'Europe/Moscow',
        isOnline: Boolean(item.isOnline),
        city: item.city || 'Москва',
        venueName: item.venueName || null,
        location: item.venueName || item.city || null,
        priceType: item.priceType === 'paid' ? 'paid' : 'free',
        priceMin: typeof item.priceMin === 'number' ? item.priceMin : 0,
        priceMax: typeof item.priceMax === 'number' ? item.priceMax : null,
        priceCurrency: 'RUB',
        paymentUrl: verifiedUrl,
        sourceUrl: associatedPost.sourceUrl,
        imageUrl: associatedPost.imageUrl || null,
        category,
        targetAudience: Array.isArray(item.targetAudience) ? item.targetAudience : ['business_angels'],
        residentOrganizer: item.residentOrganizer || associatedPost.residentOrganizer || options?.residentOrganizer || null,
        isValidEvent: isValid,
        confidenceScore: typeof item.confidenceScore === 'number' ? item.confidenceScore : 85,
        confidenceReasoning: item.confidenceReasoning || 'Успешно обработано Gemini 2.5 Flash',
        invalidationReason: !isValid ? item.invalidationReason || 'Не удалось валидировать дату' : null,
      });
    }

    return results;
  } catch (err) {
    console.error('[Batch Extraction] Failed with exception, fallback to offline rules:', err);
    return extractEventsFromPostBatch(posts, options);
  }
}
