export const DEFAULT_POSTER =
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500">
  <defs>
    <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1a2e35"/>
      <stop offset="60%" stop-color="#0f1a1e"/>
      <stop offset="100%" stop-color="#1a2e35"/>
    </linearGradient>
  </defs>
  <rect width="800" height="500" fill="url(#g)"/>
  <!-- Handle -->
  <line x1="160" y1="340" x2="250" y2="270" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="250" y1="270" x2="350" y2="230" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="350" y1="230" x2="470" y2="245" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <!-- Bowl -->
  <line x1="470" y1="245" x2="640" y2="225" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="640" y1="225" x2="590" y2="340" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="590" y1="340" x2="430" y2="360" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <line x1="430" y1="360" x2="470" y2="245" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <!-- Ray to Polaris -->
  <line x1="590" y1="340" x2="710" y2="80" stroke="#f8173f" stroke-width="1.8" stroke-dasharray="4,4" stroke-opacity="0.8"/>
  <!-- Stars -->
  <circle cx="160" cy="340" r="5" fill="#ffffff" />
  <circle cx="250" cy="270" r="5" fill="#ffffff" />
  <circle cx="350" cy="230" r="6" fill="#ffffff" />
  <circle cx="470" cy="245" r="4.5" fill="#ffffff" />
  <circle cx="430" cy="360" r="5" fill="#ffffff" />
  <circle cx="590" cy="340" r="6" fill="#ffffff" />
  <circle cx="640" cy="225" r="6" fill="#ffffff" />
  <circle cx="710" cy="80" r="7" fill="#f8173f" />
  <text x="50%" y="90%" text-anchor="middle" fill="#ffffff" font-family="sans-serif" font-size="22" font-weight="700" letter-spacing="3">БОЛЬШАЯ МЕДВЕДИЦА</text>
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
];
