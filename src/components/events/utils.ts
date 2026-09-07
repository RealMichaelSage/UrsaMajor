export const DEFAULT_POSTER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a2e35"/>
      <stop offset="100%" stop-color="#0f1a1e"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <rect x="30" y="30" width="740" height="440" fill="none" stroke="rgba(255,255,255,0.12)" stroke-width="1.5" rx="8"/>
  <line x1="80" y1="250" x2="220" y2="250" stroke="#f8173f" stroke-width="3"/>
  <text x="50%" y="225" text-anchor="middle" fill="#ffffff" font-family="system-ui, -apple-system, sans-serif" font-size="28" font-weight="700" letter-spacing="4">БОЛЬШАЯ МЕДВЕДИЦА</text>
  <text x="50%" y="280" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="500" letter-spacing="2">АССОЦИАЦИЯ ИНВЕСТИЦИОННОГО РЫНКА</text>
</svg>
`);

export function formatEventDateTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const months = [
      "янв", "фев", "мар", "апр", "май", "июн",
      "июл", "авг", "сен", "окт", "ноя", "дек"
    ];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hours = String(d.getHours()).padStart(2, "0");
    const minutes = String(d.getMinutes()).padStart(2, "0");

    return `${day} ${month} ${year}, ${hours}:${minutes}`;
  } catch {
    return dateStr;
  }
}

export function sanitizeUrl(rawUrl?: string | null): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (
    trimmed.toLowerCase().startsWith("javascript:") ||
    trimmed.toLowerCase().startsWith("data:") ||
    trimmed.toLowerCase().startsWith("vbscript:")
  ) {
    return null;
  }
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return `https://${trimmed}`;
  }
  return trimmed;
}

export function buildTicketUrl(paymentUrl?: string | null, sourceUrl?: string): string | null {
  const target = sanitizeUrl(paymentUrl) || sanitizeUrl(sourceUrl);
  if (!target) return null;
  try {
    const urlObj = new URL(target);
    if (!urlObj.searchParams.has("utm_source")) {
      urlObj.searchParams.set("utm_source", "ursa-major");
    }
    return urlObj.toString();
  } catch {
    return target;
  }
}

export const DEFAULT_EVENTS = [
  {
    id: "e1000000-0000-4000-8000-000000000001",
    title: "Бизнес-завтрак «БИЗНЕС. Выход за границы» в Новосибирске",
    description:
      "Бизнес-завтрак для предпринимателей, инвесторов и топ-менеджеров. Аналитика по международным рынкам (Кыргызстан, Узбекистан, Казахстан, ОАЭ, ЮВА), возможности масштабирования и трансграничные партнёрства. Спикеры: Андрей Заворин (Tanay.VC), Даниил Прудников, Владимир Мартыненков (META), специальный гость — Аслам Акбаров (Генеральный консул Узбекистана).",
    startAt: "2026-09-10T10:00:00+07:00",
    endAt: "2026-09-10T12:30:00+07:00",
    isOnline: false,
    location: "Новосибирск, ул. Ленина, 21/1к1",
    venueName: "Ресторан МАГАДАН",
    priceType: "paid" as const,
    priceMin: 2500,
    priceMax: 2500,
    priceCurrency: "RUB",
    paymentUrl: "https://tanay.vc/event",
    sourceUrl: "https://t.me/Club_Ursa_Major/3303",
    category: "networking" as const,
    residentOrganizer: "Клуб инвесторов Сибири, Урала и Дальнего Востока",
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000002",
    title: "Инвестиционный комитет Tanay.VC & АПУВИР «Большая Медведица»",
    description:
      "Открытый инвестиционный комитет: ИИ-сервисы инвестиционной аналитики, события и сделки в Центральной Азии, премия «Лидеры инноваций». Презентация 4 инвестиционных проектов (EXORA, ОТС КОНСАЛТ, Silve Russia, FINMUSTER) и питч-анонсы партнёров.",
    startAt: "2026-09-10T09:30:00+03:00",
    endAt: "2026-09-10T11:00:00+03:00",
    isOnline: true,
    location: "Zoom Tanay.VC",
    venueName: "Online (Zoom)",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://t.me/Club_Ursa_Major/3292",
    sourceUrl: "https://t.me/Club_Ursa_Major/3292",
    category: "pitch" as const,
    residentOrganizer: "Большая Медведица",
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000003",
    title: "Бизнес-конференция «Питерские мосты» & Питч-сессия проектов",
    description:
      "Совместная масштабная активность АПУВИР «Большая Медведица», СОБА и Бизнес-лаборатории. В программе: питч-сессия инновационных проектов, лекция «Как привлечь финансирование в компанию», презентация Стартап-студии ГУАП и экспертные бизнес-разборы.",
    startAt: "2026-09-25T10:00:00+03:00",
    endAt: "2026-09-25T19:30:00+03:00",
    isOnline: false,
    location: "Санкт-Петербург, Московский пр., 97А",
    venueName: "Отель «Московские Ворота», зал Рафаэль",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://t.me/sobainvestor/93",
    sourceUrl: "https://t.me/sobainvestor/93",
    category: "conference" as const,
    residentOrganizer: "СОБА",
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000004",
    title: "Бизнес-день РБК в Казани: Точки роста и инвестиции 2026",
    description:
      "Точки роста, инвестиции и реальные кейсы от лидеров бизнеса в 2026 году. Территории роста: как российский бизнес работает в регионах. Экспертная сессия СОБА по синдицированным сделкам и бизнес-ангельскому финансированию.",
    startAt: "2026-09-17T10:00:00+03:00",
    endAt: "2026-09-17T15:30:00+03:00",
    isOnline: false,
    location: "Казань, ул. Калинина, 3Б",
    venueName: "Kazan Palace by TASIGO",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://t.me/sobainvestor/90",
    sourceUrl: "https://t.me/sobainvestor/90",
    category: "conference" as const,
    residentOrganizer: "СОБА",
    status: "approved" as const,
    isTop: false,
  },
  {
    id: "e1000000-0000-4000-8000-000000000005",
    title: "Федеральная премия «Лидеры Инноваций 2026»",
    description:
      "Торжественная церемония вручения премии в сфере инвестиций и инноваций, учреждённой Ассоциацией «Большая Медведица» в рамках ТЕХНОПРОМА и XX Сибирской венчурной ярмарки. Награждение самых активных участников инвест-рынка России.",
    startAt: "2026-09-28T10:00:00+07:00",
    endAt: "2026-09-28T17:00:00+07:00",
    isOnline: false,
    location: "Новосибирск, МВК «Новосибирск Экспоцентр»",
    venueName: "Площадка Сибирской венчурной ярмарки",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://t.me/Club_Ursa_Major/3281",
    sourceUrl: "https://t.me/Club_Ursa_Major/3281",
    category: "other" as const,
    residentOrganizer: "Большая Медведица",
    status: "approved" as const,
    isTop: false,
  },
  {
    id: "e1000000-0000-4000-8000-000000000006",
    title: "Российский Венчурный Форум (РВФ 2026) с клубом СОБА",
    description:
      "Главное событие венчурного рынка России. СОБА организует персональный путеводитель по сделке: закрытые встречи с фаундерами, отбор перспективных проектов и совместное синдицирование инвестиций.",
    startAt: "2026-10-15T09:00:00+03:00",
    endAt: "2026-10-17T18:00:00+03:00",
    isOnline: false,
    location: "Казань, МВЦ «Казань Экспо»",
    venueName: "МВЦ «Казань Экспо»",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://t.me/sobainvestor/91",
    sourceUrl: "https://t.me/sobainvestor/91",
    category: "conference" as const,
    residentOrganizer: "СОБА",
    status: "approved" as const,
    isTop: false,
  },
  {
    id: "e1000000-0000-4000-8000-000000000007",
    title: "Практикум: Структурирование синдицированных венчурных сделок",
    description:
      "Практический разбор договоров конвертируемого займа и опционов в российском праве. Спикеры: ведущие юристы ASB Consulting Group по сопровождению синдикатов и инвестиционных раундов.",
    startAt: "2026-10-18T19:00:00+03:00",
    endAt: "2026-10-18T20:30:00+03:00",
    isOnline: true,
    location: "Zoom Webinar",
    venueName: "Online",
    priceType: "paid" as const,
    priceMin: 3500,
    priceMax: 5000,
    priceCurrency: "RUB",
    paymentUrl: "https://asb-group.ru/events/webinar-syndication",
    sourceUrl: "https://asb-group.ru/events/webinar-syndication",
    category: "education" as const,
    residentOrganizer: "ASB Consulting Group",
    status: "approved" as const,
    isTop: false,
  },
  {
    id: "e1000000-0000-4000-8000-000000000008",
    title: "Демо-день акселератора Finmuster Pre-IPO Tech",
    description:
      "Выпускной поток технологических компаний с выручкой от 100 млн руб. Встреча с институциональными фондами и закрытыми клубами инвесторов ассоциации.",
    startAt: "2026-10-24T14:00:00+03:00",
    endAt: "2026-10-24T19:00:00+03:00",
    isOnline: false,
    location: "Москва, Пресненская наб., 12",
    venueName: "Башня Федерация Восток, 45 этаж",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://finmuster.ru/events",
    sourceUrl: "https://finmuster.ru/events",
    category: "pitch" as const,
    residentOrganizer: "Finmuster",
    status: "approved" as const,
    isTop: false,
  },
];
