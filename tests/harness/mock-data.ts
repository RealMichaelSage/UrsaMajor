/**
 * Authoritative Mock Datasets for Ursa Major Platform Test Suites.
 * Aligned 1:1 with contracts in PROJECT.md and src/shared/types/index.ts.
 */

export interface EventItem {
  id: string;
  title: string;
  description: string;
  rawText?: string;
  startAt: string; // ISO-8601
  endAt?: string;   // ISO-8601
  timezone: string; // Default Europe/Moscow
  isOnline: boolean;
  location?: string;
  venueName?: string;
  priceType: 'free' | 'paid' | 'donation';
  priceMin?: number;
  priceMax?: number;
  priceCurrency?: string; // Default RUB
  paymentUrl?: string;
  sourceUrl: string;
  imageUrl?: string;
  category: 'pitch' | 'networking' | 'conference' | 'education' | 'analytics' | 'other';
  targetAudience: string[]; // e.g. ['business_angels', 'seed_startups', 'funds']
  residentOrganizer?: string; // e.g. 'СОБА', 'Синдикат'
  status: 'pending' | 'approved' | 'rejected';
  isTop: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParsingSeed {
  id: string;
  name: string;
  type: 'telegram' | 'website';
  url: string;
  residentOrganizer?: string;
  isActive: boolean;
  lastScrapedAt?: string;
  scrapeStatus?: 'idle' | 'running' | 'success' | 'failed';
  scrapeError?: string;
  rules?: Record<string, string>;
  createdAt: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  slug: string;
  summary: string;
  content: string;
  authorOrSource: string;
  publishedAt: string;
  imageUrl?: string;
  sourceUrl?: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  createdAt: string;
}

export const mockEvents: EventItem[] = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    title: 'Инвестиционный питч-день стартапов ранних стадий',
    description: 'Презентация 8 перспективных технологических проектов перед бизнес-ангелами клуба СОБА. Оценка инвестиционной привлекательности и структурирование сделок.',
    rawText: 'Питч-день СОБА состоится 15 октября в 18:00 МСК в отеле Амбассадор и онлайн. Регистрация: https://soba.spb.ru/pitch-day',
    startAt: '2026-10-15T18:00:00+03:00',
    endAt: '2026-10-15T21:00:00+03:00',
    timezone: 'Europe/Moscow',
    isOnline: false,
    location: 'Санкт-Петербург, ул. Римского-Корсакова, 5-7',
    venueName: 'Отель Амбассадор, зал Премьер',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://soba.spb.ru/pitch-day',
    sourceUrl: 'https://t.me/s/soba_invest/412',
    imageUrl: '/assets/events/pitch-soba.jpg',
    category: 'pitch',
    targetAudience: ['business_angels', 'seed_startups', 'funds'],
    residentOrganizer: 'СОБА',
    status: 'approved',
    isTop: true,
    createdAt: '2026-09-01T10:00:00Z',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'e1000000-0000-4000-8000-000000000002',
    title: 'Онлайн-вебинар: Структурирование синдицированных венчурных сделок',
    description: 'Практический разбор договоров конвертируемого займа и опционов в российском праве. Спикеры: ведущие юристы ASB Consulting Group.',
    startAt: '2026-10-18T19:00:00+03:00',
    endAt: '2026-10-18T20:30:00+03:00',
    timezone: 'Europe/Moscow',
    isOnline: true,
    location: 'Zoom Webinar',
    venueName: 'Online',
    priceType: 'paid',
    priceMin: 3500,
    priceMax: 5000,
    priceCurrency: 'RUB',
    paymentUrl: 'https://asb-group.ru/events/webinar-syndication',
    sourceUrl: 'https://t.me/s/asb_consulting/198',
    imageUrl: '/assets/events/webinar-legal.jpg',
    category: 'education',
    targetAudience: ['business_angels', 'lawyers'],
    residentOrganizer: 'ASB Consulting Group',
    status: 'approved',
    isTop: false,
    createdAt: '2026-09-02T11:00:00Z',
    updatedAt: '2026-09-02T11:00:00Z',
  },
  {
    id: 'e1000000-0000-4000-8000-000000000003',
    title: 'Инвестиционный завтрак Клуба инвесторов Сибири и Дальнего Востока',
    description: 'Закрытая неформальная встреча для обсуждения совместных синдикатов в реальный сектор и DeepTech стартапы Сибирского региона.',
    startAt: '2026-10-22T10:00:00+03:00',
    endAt: '2026-10-22T12:00:00+03:00',
    timezone: 'Asia/Novosibirsk',
    isOnline: false,
    location: 'Новосибирск, ул. Ленина, 21',
    venueName: 'Ресторан СибирьСибирь',
    priceType: 'paid',
    priceMin: 7000,
    priceCurrency: 'RUB',
    paymentUrl: 'https://siberian-angels.ru/breakfast',
    sourceUrl: 'https://t.me/s/siberian_angels/88',
    imageUrl: '/assets/events/breakfast-nsk.jpg',
    category: 'networking',
    targetAudience: ['business_angels', 'family_offices'],
    residentOrganizer: 'Клуб инвесторов Сибири, Урала и Дальнего Востока',
    status: 'approved',
    isTop: false,
    createdAt: '2026-09-03T12:00:00Z',
    updatedAt: '2026-09-03T12:00:00Z',
  },
  {
    id: 'e1000000-0000-4000-8000-000000000004',
    title: 'Pre-IPO и внебиржевой рынок акций 2026: Аналитическая конференция',
    description: 'Обзор доступных инструментов ликвидности для частных инвесторов и эмитентов от инвестиционной платформы Finmuster.',
    startAt: '2026-10-25T14:00:00+03:00',
    endAt: '2026-10-25T18:00:00+03:00',
    timezone: 'Europe/Moscow',
    isOnline: true,
    venueName: 'Online / YouTube Live',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://finmuster.ru/conf2026',
    sourceUrl: 'https://t.me/s/finmuster_channel/52',
    imageUrl: '/assets/events/finmuster-conf.jpg',
    category: 'analytics',
    targetAudience: ['business_angels', 'funds', 'seed_startups'],
    residentOrganizer: 'Finmuster',
    status: 'approved',
    isTop: true,
    createdAt: '2026-09-04T09:00:00Z',
    updatedAt: '2026-09-04T09:00:00Z',
  },
  {
    id: 'e1000000-0000-4000-8000-000000000005',
    title: 'Pending Ingestion Candidate: AI Demo Day Pitchleaks',
    description: 'Презентация 5 B2B AI-стартапов перед венчурными инвесторами.',
    startAt: '2026-11-05T17:00:00+03:00',
    timezone: 'Europe/Moscow',
    isOnline: true,
    priceType: 'free',
    sourceUrl: 'https://t.me/s/pitchleaks/301',
    category: 'pitch',
    targetAudience: ['business_angels', 'funds'],
    residentOrganizer: 'Pitchleaks',
    status: 'pending',
    isTop: false,
    createdAt: '2026-09-05T14:00:00Z',
    updatedAt: '2026-09-05T14:00:00Z',
  },
];

export const mockNews: NewsArticle[] = [
  {
    id: 'n1000000-0000-4000-8000-000000000001',
    title: 'Итоги полугодия 2026: Рост синдицированных сделок бизнес-ангелов на 35%',
    slug: 'half-year-2026-syndication-growth',
    summary: 'Аналитический дайджест ассоциации «Большая Медведица» о ключевых тенденциях венчурного рынка России и динамике инвестиций на ранних стадиях.',
    content: '## Обзор рынка венчурных инвестиций 2026\n\nВ первом полугодии 2026 года члены ассоциации «Большая Медведица» зафиксировали качественный рост активности бизнес-ангелов...\n\n### Ключевые цифры\n- Объем инвестиций превысил 1.8 млрд рублей\n- Средний чек в синдикате составил 4.5 млн рублей\n- Основные направления: B2B SaaS, DeepTech, робототехника.',
    authorOrSource: 'Пресс-служба АПУВИР «Большая Медведица»',
    publishedAt: '2026-09-01T08:00:00+03:00',
    imageUrl: '/assets/news/market-growth.jpg',
    sourceUrl: 'https://ursa-major.ru/news/half-year-2026-syndication-growth',
    tags: ['аналитика', 'венчур', 'статистика', 'синдикаты'],
    status: 'published',
    createdAt: '2026-09-01T08:00:00Z',
  },
  {
    id: 'n1000000-0000-4000-8000-000000000002',
    title: 'Инвестиционная платформа Finmuster запустила вторичное обращение долей Pre-IPO стартапов',
    slug: 'finmuster-pre-ipo-secondary-market',
    summary: 'Резидент ассоциации Finmuster объявил об открытии нового пула ликвидности для квалифицированных инвесторов.',
    content: 'Инвестиционная платформа Finmuster, включенная в реестр Банка России, представила функционал вторичного рынка акций непубличных компаний...',
    authorOrSource: 'Finmuster',
    publishedAt: '2026-09-03T10:30:00+03:00',
    imageUrl: '/assets/news/finmuster-secondary.jpg',
    tags: ['finmuster', 'pre-ipo', 'резиденты', 'ликвидность'],
    status: 'published',
    createdAt: '2026-09-03T10:30:00Z',
  },
  {
    id: 'n1000000-0000-4000-8000-000000000003',
    title: 'Законодательные инициативы: Налоговые льготы для бизнес-ангелов в 2026–2027 гг.',
    slug: 'tax-incentives-business-angels-2026',
    summary: 'Экспертный комментарий юридического комитета ассоциации о налоговых вычетах при прямых инвестициях в стартапы.',
    content: 'Комитет по правовым вопросам ассоциации совместно с ASB Consulting Group подготовил предложения по расширению инвестиционного налогового вычета...',
    authorOrSource: 'ASB Consulting Group',
    publishedAt: '2026-09-05T14:15:00+03:00',
    imageUrl: '/assets/news/tax-regulations.jpg',
    tags: ['законодательство', 'налоги', 'asb-consulting'],
    status: 'published',
    createdAt: '2026-09-05T14:15:00Z',
  },
];

export const mockSeeds: ParsingSeed[] = [
  {
    id: 's1000000-0000-4000-8000-000000000001',
    name: 'СОБА Новости & Питчи',
    type: 'telegram',
    url: 'https://t.me/s/soba_invest',
    residentOrganizer: 'СОБА',
    isActive: true,
    lastScrapedAt: '2026-09-07T09:00:00Z',
    scrapeStatus: 'success',
    createdAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 's1000000-0000-4000-8000-000000000002',
    name: 'Finmuster Events',
    type: 'website',
    url: 'https://finmuster.ru/events',
    residentOrganizer: 'Finmuster',
    isActive: true,
    lastScrapedAt: '2026-09-07T08:30:00Z',
    scrapeStatus: 'success',
    rules: {
      container: '.event-card',
      title: 'h3.event-title',
      date: '.event-date',
    },
    createdAt: '2026-08-20T11:00:00Z',
  },
  {
    id: 's1000000-0000-4000-8000-000000000003',
    name: 'Siberian Angels Channel',
    type: 'telegram',
    url: 'https://t.me/s/siberian_angels',
    residentOrganizer: 'Клуб инвесторов Сибири, Урала и Дальнего Востока',
    isActive: false,
    lastScrapedAt: '2026-09-01T15:00:00Z',
    scrapeStatus: 'idle',
    createdAt: '2026-08-25T14:00:00Z',
  },
];

export const mockLeadSubmissionPayload = {
  fullName: 'Александр Романов',
  phone: '+7 (921) 987-65-43',
  email: 'a.romanov@angel-invest.ru',
  telegram: '@aromanov_vc',
  company: 'Северный Венчур',
  role: 'Управляющий партнер',
  message: 'Интересуют условия коллективного членства нашего синдиката в ассоциации «Большая Медведица».',
  consentAgreed: true,
};

export const mockResidentEventSubmission = {
  title: 'Инвестиционный Meetup в Сколково: DeepTech 2026',
  description: 'Презентация 6 портфельных проектов стартап-студии UNCRN перед аккредитованными ангелами.',
  startAt: '2026-11-12T17:00:00+03:00',
  isOnline: false,
  location: 'Москва, Инновационный центр Сколково',
  venueName: 'Технопарк Сколково, капсула 3',
  priceType: 'free' as const,
  residentOrganizer: 'UNCRN.ru',
  contactName: 'Константин Разетдинов',
  contactEmail: 'razetdinov@uncrn.ru',
  contactTelegram: '@razetdinov',
  ticketsUrl: 'https://uncrn.ru/meetup-skolkovo',
};

export const mockTelegramHtmlSnippet = `
<div class="tgme_widget_message_wrap">
  <div class="tgme_widget_message" data-post="soba_invest/415">
    <div class="tgme_widget_message_photo_wrap" style="background-image:url('https://cdn4.telesco.pe/file/soba_banner.jpg')"></div>
    <div class="tgme_widget_message_text">
      🔥 Коллеги, 28 октября в 18:30 МСК состоится очередной Осенний Питч-День СОБА!<br><br>
      8 стартапов стадии Seed презентуют решения в области AI и FinTech.<br>
      Формат: гибридный (Санкт-Петербург + Zoom).<br>
      Участие для аккредитованных инвесторов бесплатное.<br>
      Регистрация обязательна: https://soba.spb.ru/events/autumn-pitch-2026
    </div>
    <div class="tgme_widget_message_footer">
      <a class="tgme_widget_message_date" href="https://t.me/soba_invest/415">28 Sep 2026</a>
    </div>
  </div>
</div>
`;
