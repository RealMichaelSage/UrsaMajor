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
    title: "Инвестиционный питч-день стартапов ранних стадий",
    description:
      "Презентация 8 перспективных технологических проектов перед бизнес-ангелами клуба СОБА. Оценка инвестиционной привлекательности и структурирование сделок.",
    startAt: "2026-10-15T18:00:00+03:00",
    endAt: "2026-10-15T21:00:00+03:00",
    isOnline: false,
    location: "Санкт-Петербург, ул. Римского-Корсакова, 5-7",
    venueName: "Отель Амбассадор, зал Премьер",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://soba.spb.ru/pitch-day",
    sourceUrl: "https://t.me/s/soba_invest/412",
    category: "pitch" as const,
    residentOrganizer: "СОБА",
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000002",
    title: "Онлайн-вебинар: Структурирование синдицированных венчурных сделок",
    description:
      "Практический разбор договоров конвертируемого займа и опционов в российском праве. Спикеры: ведущие юристы ASB Consulting Group.",
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
    sourceUrl: "https://t.me/s/asb_consulting/198",
    category: "webinar" as const,
    residentOrganizer: "ASB Consulting Group",
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000003",
    title: "Демо-день акселератора Finmuster Pre-IPO Tech",
    description:
      "Выпускной поток технологических компаний с выручкой от 100 млн руб. Встреча с институциональными фондами и закрытыми клубами инвесторов.",
    startAt: "2026-10-24T14:00:00+03:00",
    endAt: "2026-10-24T19:00:00+03:00",
    isOnline: false,
    location: "Москва, Пресненская наб., 12",
    venueName: "Башня Федерация Восток, 45 этаж",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://finmuster.ru/demo-day-2026",
    sourceUrl: "https://finmuster.ru/events",
    category: "demo_day" as const,
    residentOrganizer: "Finmuster",
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000004",
    title: "Инвестиционный завтрак Клуба инвесторов Сибири и Дальнего Востока",
    description:
      "Закрытая неформальная встреча для обсуждения совместных синдикатов в реальный сектор и DeepTech стартапы Сибирского региона.",
    startAt: "2026-10-22T10:00:00+03:00",
    endAt: "2026-10-22T12:00:00+03:00",
    isOnline: false,
    location: "Новосибирск, ул. Ленина, 21",
    venueName: "Ресторан СибирьСибирь",
    priceType: "paid" as const,
    priceMin: 7000,
    priceCurrency: "RUB",
    paymentUrl: "https://siberian-angels.ru/breakfast",
    sourceUrl: "https://t.me/s/siberian_angels/88",
    category: "networking" as const,
    residentOrganizer: "Клуб инвесторов Сибири, Урала и Дальнего Востока",
    status: "approved" as const,
    isTop: false,
  },
  {
    id: "e1000000-0000-4000-8000-000000000005",
    title: "Выездной семинар «От неопределённости к прорыву» в Таиланде",
    description:
      "Ежегодная выездная встреча владельцев бизнеса и венчурных инвесторов «Дозаправка в воздухе» в Юго-Восточной Азии. Семинар по управлению бизнесом в условиях неопределенности, стратегический нетворкинг и обмен синдикационным опытом.",
    startAt: "2026-02-07T09:00:00+07:00",
    endAt: "2026-02-14T20:00:00+07:00",
    isOnline: false,
    location: "Таиланд, Пхукет",
    venueName: "Курортный комплекс Laguna Phuket",
    priceType: "paid" as const,
    priceMin: 180000,
    priceMax: 350000,
    priceCurrency: "RUB",
    paymentUrl: "https://ursa-major.ru/#events",
    sourceUrl: "https://ursa-major.ru",
    category: "networking" as const,
    residentOrganizer: 'Проект "Лидер года" (партнер ПАО "НБД-Банк")',
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000006",
    title: "Pre-IPO и внебиржевой рынок акций 2026: Аналитическая конференция",
    description:
      "Обзор доступных инструментов ликвидности для частных инвесторов и эмитентов от инвестиционной платформы Finmuster.",
    startAt: "2026-10-25T14:00:00+03:00",
    endAt: "2026-10-25T18:00:00+03:00",
    isOnline: true,
    location: "Online / YouTube Live",
    venueName: "Online / YouTube Live",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://finmuster.ru/conf2026",
    sourceUrl: "https://t.me/s/finmuster_channel/52",
    category: "analytics" as const,
    residentOrganizer: "Finmuster",
    status: "approved" as const,
    isTop: true,
  },
  {
    id: "e1000000-0000-4000-8000-000000000007",
    title: "ARGENT CLUB: Закрытый инвестиционный ужин и нетворкинг",
    description:
      "Презентация сделок поздних стадий (Late-stage) и pre-IPO возможностей для аккредитованных инвесторов сообщества ARGENT.",
    startAt: "2026-10-29T19:00:00+03:00",
    endAt: "2026-10-29T22:30:00+03:00",
    isOnline: false,
    location: "Москва, ул. Моховая, 15/1",
    venueName: "Отель Националь, зал Пьяцца",
    priceType: "paid" as const,
    priceMin: 15000,
    priceCurrency: "RUB",
    paymentUrl: "https://argentclub.ru/dinner-october",
    sourceUrl: "https://t.me/s/argent_club/312",
    category: "networking" as const,
    residentOrganizer: "ARGENT CLUB",
    status: "approved" as const,
    isTop: false,
  },
  {
    id: "e1000000-0000-4000-8000-000000000008",
    title: "Венчурный саммит стартап-студий UNCRN 2026",
    description:
      "Крупнейший смотр технологических команд стартап-студии UNCRN. Презентация B2B SaaS и AI-платформ ранних раундов.",
    startAt: "2026-11-12T11:00:00+03:00",
    endAt: "2026-11-12T18:00:00+03:00",
    isOnline: false,
    location: "Москва, Инновационный центр Сколково",
    venueName: "Технопарк Сколково, зал Капсула",
    priceType: "free" as const,
    priceMin: 0,
    priceCurrency: "RUB",
    paymentUrl: "https://uncrn.ru/summit2026",
    sourceUrl: "https://uncrn.ru/events",
    category: "pitch" as const,
    residentOrganizer: "UNCRN.ru",
    status: "approved" as const,
    isTop: true,
  },
];
