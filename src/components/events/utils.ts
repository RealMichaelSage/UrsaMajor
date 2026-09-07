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
