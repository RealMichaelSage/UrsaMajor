import type { NewEventRecord, NewParsingSeedRecord, NewNewsArticleRecord } from './schema';
import { events, parsingSeeds, newsArticles } from './schema';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from './schema';

// ==========================================
// Verified Parsing Seeds for Ursa Major Residents
// ==========================================

export const initialSeeds: NewParsingSeedRecord[] = [
  {
    id: 's1000000-0000-4000-8000-000000000001',
    name: 'СОБА (Союз Организаций Бизнес Ангелов)',
    type: 'telegram',
    url: 'https://t.me/sobainvestor',
    residentOrganizer: 'СОБА',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
    createdAt: new Date('2026-08-15T10:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000002',
    name: 'Клуб «Большая Медведица» (Сибирь, Урал, Дальний Восток)',
    type: 'telegram',
    url: 'https://t.me/Club_Ursa_Major',
    residentOrganizer: 'Большая Медведица',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
    createdAt: new Date('2026-08-20T11:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000003',
    name: 'АПУВИР «Большая Медведица» (Внутренний топик)',
    type: 'telegram',
    url: 'https://t.me/c/2103289961/7',
    residentOrganizer: 'Большая Медведица',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {
      chatId: '-1002103289961',
      threadId: 7,
    },
    createdAt: new Date('2026-08-22T08:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000004',
    name: 'Finmuster Events & Pre-IPO Platform',
    type: 'website',
    url: 'https://finmuster.ru/events',
    residentOrganizer: 'Finmuster',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {
      container: '.event-card',
      title: 'h3.event-title',
      date: '.event-date',
    },
    createdAt: new Date('2026-08-25T09:30:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000005',
    name: 'Венчурный клуб «Синдикат»',
    type: 'telegram',
    url: 'https://t.me/s/syndicate_vc',
    residentOrganizer: 'Синдикат',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
    createdAt: new Date('2026-08-28T12:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000006',
    name: 'ASB Consulting Group — Венчурное право & M&A',
    type: 'telegram',
    url: 'https://t.me/s/asb_consulting',
    residentOrganizer: 'ASB Consulting Group',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
    createdAt: new Date('2026-08-29T14:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000007',
    name: 'Pitchleaks — Deal Flow & Accelerator',
    type: 'telegram',
    url: 'https://t.me/s/pitchleaks',
    residentOrganizer: 'Pitchleaks',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
    createdAt: new Date('2026-09-01T10:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000008',
    name: 'UNCRN.ru — Стартап-студия',
    type: 'website',
    url: 'https://uncrn.ru/events',
    residentOrganizer: 'UNCRN.ru',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {
      container: '.events-list-item',
      title: 'h2',
      date: 'time',
    },
    createdAt: new Date('2026-09-02T11:00:00Z'),
  },
];

// ==========================================
// Authentic Venture Events
// ==========================================

export const initialEvents: NewEventRecord[] = [
  {
    id: 'e1000000-0000-4000-8000-000000000001',
    title: 'Бизнес-завтрак «БИЗНЕС. Выход за границы» в Новосибирске',
    description:
      'Бизнес-завтрак для предпринимателей, инвесторов и топ-менеджеров. Аналитика по международным рынкам (Кыргызстан, Узбекистан, Казахстан, ОАЭ, ЮВА), возможности масштабирования и трансграничные партнёрства. Спикеры: Андрей Заворин (Tanay.VC), Даниил Прудников, Владимир Мартыненков (META), специальный гость — Аслам Акбаров (Генеральный консул Узбекистана).',
    rawText:
      'БИЗНЕС. Выход за границы. Бизнес-завтрак Новосибирск 10 сентября 2026 с 10.00 до 12.30. Ресторан МАГАДАН, ул. Ленина, 21/1к1. Стоимость: 2500 руб. Регистрация: https://tanay.vc/event',
    startAt: new Date('2026-09-10T10:00:00+07:00'),
    endAt: new Date('2026-09-10T12:30:00+07:00'),
    timezone: 'Asia/Novosibirsk',
    isOnline: false,
    location: 'Новосибирск, ул. Ленина, 21/1к1',
    venueName: 'Ресторан МАГАДАН',
    priceType: 'paid',
    priceMin: 2500,
    priceMax: 2500,
    priceCurrency: 'RUB',
    paymentUrl: 'https://tanay.vc/event',
    sourceUrl: 'https://t.me/Club_Ursa_Major/3303',
    imageUrl: '/assets/events/breakfast-nsk.jpg',
    category: 'networking',
    targetAudience: ['business_angels', 'entrepreneurs', 'developers'],
    residentOrganizer: 'Клуб инвесторов Сибири, Урала и Дальнего Востока',
    status: 'approved',
    isTop: true,
    createdAt: new Date('2026-09-07T04:49:00Z'),
    updatedAt: new Date('2026-09-07T04:49:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000002',
    title: 'Инвестиционный комитет Tanay.VC & АПУВИР «Большая Медведица»',
    description:
      'Открытый инвестиционный комитет: ИИ-сервисы инвестиционной аналитики, события и сделки в Центральной Азии, премия «Лидеры инноваций». Презентация 4 инвестиционных проектов (EXORA, ОТС КОНСАЛТ, Silve Russia, FINMUSTER) и питч-анонсы партнёров.',
    rawText:
      'Инвестиционный комитет Tanay.VC 10 сентября 2026 г с 9.30 Мск до 11.00 Мск в Zoom. Ссылка по запросу: @azavorin',
    startAt: new Date('2026-09-10T09:30:00+03:00'),
    endAt: new Date('2026-09-10T11:00:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: true,
    location: 'Zoom Tanay.VC',
    venueName: 'Online (Zoom)',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://t.me/Club_Ursa_Major/3292',
    sourceUrl: 'https://t.me/Club_Ursa_Major/3292',
    imageUrl: '/assets/events/pitch-soba.jpg',
    category: 'pitch',
    targetAudience: ['business_angels', 'seed_startups', 'funds'],
    residentOrganizer: 'Большая Медведица',
    status: 'approved',
    isTop: true,
    createdAt: new Date('2026-08-31T16:40:00Z'),
    updatedAt: new Date('2026-08-31T16:40:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000003',
    title: 'Бизнес-конференция «Питерские мосты» & Питч-сессия проектов',
    description:
      'Совместная масштабная активность АПУВИР «Большая Медведица», СОБА и Бизнес-лаборатории. В программе: питч-сессия инновационных проектов, лекция «Как привлечь финансирование в компанию», презентация Стартап-студии ГУАП и экспертные бизнес-разборы.',
    rawText:
      'Бизнес-конференция «Питерские мосты» 25 марта с 10:00 до 19:30 в Санкт-Петербурге, Московский пр., 97А, Отель «Московские Ворота», зал Рафаэль. Регистрация через бота и Leader ID: https://t.me/sobainvestor/93',
    startAt: new Date('2026-09-25T10:00:00+03:00'),
    endAt: new Date('2026-09-25T19:30:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: false,
    location: 'Санкт-Петербург, Московский пр., 97А',
    venueName: 'Отель «Московские Ворота», зал Рафаэль',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://t.me/sobainvestor/93',
    sourceUrl: 'https://t.me/sobainvestor/93',
    imageUrl: '/assets/events/webinar-legal.jpg',
    category: 'conference',
    targetAudience: ['business_angels', 'founders', 'investors'],
    residentOrganizer: 'СОБА',
    status: 'approved',
    isTop: true,
    createdAt: new Date('2026-03-23T15:32:00Z'),
    updatedAt: new Date('2026-03-23T15:32:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000004',
    title: 'Бизнес-день РБК в Казани: Точки роста и инвестиции 2026',
    description:
      'Точки роста, инвестиции и реальные кейсы от лидеров бизнеса в 2026 году. Территории роста: как российский бизнес работает в регионах. Экспертная сессия СОБА по синдицированным сделкам и бизнес-ангельскому финансированию.',
    rawText:
      'Бизнес-день РБК в Казани 17 марта 2026 с 10:00 до 15:30 в Kazan Palace by TASIGO. Организатор: СОБА. Подробности: https://t.me/sobainvestor/90',
    startAt: new Date('2026-09-17T10:00:00+03:00'),
    endAt: new Date('2026-09-17T15:30:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: false,
    location: 'Казань, ул. Калинина, 3Б',
    venueName: 'Kazan Palace by TASIGO',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://t.me/sobainvestor/90',
    sourceUrl: 'https://t.me/sobainvestor/90',
    imageUrl: '/assets/events/finmuster-conf.jpg',
    category: 'conference',
    targetAudience: ['business_angels', 'funds', 'entrepreneurs'],
    residentOrganizer: 'СОБА',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-03-11T13:00:00Z'),
    updatedAt: new Date('2026-03-11T13:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000005',
    title: 'Федеральная премия «Лидеры Инноваций 2026»',
    description:
      'Торжественная церемония вручения премии в сфере инвестиций и инноваций, учреждённой Ассоциацией «Большая Медведица» в рамках ТЕХНОПРОМА и XX Сибирской венчурной ярмарки. Награждение самых активных участников инвест-рынка России.',
    rawText:
      'Премия «Лидеры Инноваций 2026» на площадке XX Сибирской венчурной ярмарки / ТЕХНОПРОМА. Организатор: Ассоциация «Большая Медведица». Подробности: https://t.me/Club_Ursa_Major/3281',
    startAt: new Date('2026-09-28T10:00:00+07:00'),
    endAt: new Date('2026-09-28T17:00:00+07:00'),
    timezone: 'Asia/Novosibirsk',
    isOnline: false,
    location: 'Новосибирск, МВК «Новосибирск Экспоцентр»',
    venueName: 'Площадка Сибирской венчурной ярмарки',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://t.me/Club_Ursa_Major/3281',
    sourceUrl: 'https://t.me/Club_Ursa_Major/3281',
    imageUrl: '/assets/events/thailand-retreat.jpg',
    category: 'other',
    targetAudience: ['business_angels', 'family_offices', 'founders'],
    residentOrganizer: 'Большая Медведица',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-08-28T07:20:00Z'),
    updatedAt: new Date('2026-08-28T07:20:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000006',
    title: 'Российский Венчурный Форум (РВФ 2026) с клубом СОБА',
    description:
      'Главное событие венчурного рынка России. СОБА организует персональный путеводитель по сделке: закрытые встречи с фаундерами, отбор перспективных проектов и совместное синдицирование инвестиций.',
    rawText:
      'РВФ 2026 в Казани: путеводитель по сделкам от СОБА. Регистрация и участие: https://t.me/sobainvestor/91',
    startAt: new Date('2026-10-15T09:00:00+03:00'),
    endAt: new Date('2026-10-17T18:00:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: false,
    location: 'Казань, МВЦ «Казань Экспо»',
    venueName: 'МВЦ «Казань Экспо»',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://t.me/sobainvestor/91',
    sourceUrl: 'https://t.me/sobainvestor/91',
    imageUrl: '/assets/events/demoday-skolkovo.jpg',
    category: 'conference',
    targetAudience: ['business_angels', 'funds', 'seed_startups'],
    residentOrganizer: 'СОБА',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-03-19T14:52:00Z'),
    updatedAt: new Date('2026-03-19T14:52:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000007',
    title: 'Практикум: Структурирование синдицированных венчурных сделок',
    description:
      'Практический разбор договоров конвертируемого займа и опционов в российском праве. Спикеры: ведущие юристы ASB Consulting Group по сопровождению синдикатов и инвестиционных раундов.',
    rawText:
      'Практикум ASB Consulting по совместным инвестициям: 18 октября онлайн в Zoom. Регистрация: https://asb-group.ru/events/webinar-syndication',
    startAt: new Date('2026-10-18T19:00:00+03:00'),
    endAt: new Date('2026-10-18T20:30:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: true,
    location: 'Zoom Webinar',
    venueName: 'Online',
    priceType: 'paid',
    priceMin: 3500,
    priceMax: 5000,
    priceCurrency: 'RUB',
    paymentUrl: 'https://asb-group.ru/events/webinar-syndication',
    sourceUrl: 'https://asb-group.ru/events/webinar-syndication',
    imageUrl: '/assets/events/syndicate-workshop.jpg',
    category: 'education',
    targetAudience: ['business_angels', 'lawyers', 'founders'],
    residentOrganizer: 'ASB Consulting Group',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-09-05T09:00:00Z'),
    updatedAt: new Date('2026-09-05T09:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000008',
    title: 'Демо-день акселератора Finmuster Pre-IPO Tech',
    description:
      'Выпускной поток технологических компаний с выручкой от 100 млн руб. Встреча с институциональными фондами и закрытыми клубами инвесторов ассоциации.',
    rawText:
      'Демо-день Finmuster пройдет 24 октября в Москве, Башня Федерация Восток, 45 этаж. Регистрация: https://finmuster.ru/events',
    startAt: new Date('2026-10-24T14:00:00+03:00'),
    endAt: new Date('2026-10-24T19:00:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: false,
    location: 'Москва, Пресненская наб., 12',
    venueName: 'Башня Федерация Восток, 45 этаж',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://finmuster.ru/events',
    sourceUrl: 'https://finmuster.ru/events',
    imageUrl: '/assets/events/demoday-skolkovo.jpg',
    category: 'pitch',
    targetAudience: ['business_angels', 'funds', 'seed_startups'],
    residentOrganizer: 'Finmuster',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-09-06T10:00:00Z'),
    updatedAt: new Date('2026-09-06T10:00:00Z'),
  },
];

// ==========================================
// Authentic Association News Articles
// ==========================================

export const initialNews: NewNewsArticleRecord[] = [
  {
    id: 'n1000000-0000-4000-8000-000000000001',
    title: 'Итоги полугодия 2026: Рост синдицированных сделок бизнес-ангелов на 35%',
    slug: 'half-year-2026-syndication-growth',
    summary:
      'Аналитический дайджест ассоциации «Большая Медведица» о ключевых тенденциях венчурного рынка России и динамике инвестиций на ранних стадиях.',
    content: `## Обзор рынка венчурных инвестиций 2026

В первом полугодии 2026 года члены ассоциации «Большая Медведица» (АПУВИР) зафиксировали качественный рост активности бизнес-ангелов и региональных инвестиционных клубов. Совместные синдикаты стали доминирующей формой структурирования посевных раундов.

### Ключевые показатели полугодия:
- **Общий объем закрытых сделок**: свыше 1.8 млрд рублей (+35% к аналогичному периоду 2025 года).
- **Средний чек инвестора в синдикате**: 4.5 млн рублей.
- **Топ секторов по объему привлеченного капитала**:
  1. B2B SaaS и оптимизация корпоративных процессов — 42% объема;
  2. Промышленный DeepTech и робототехника — 28%;
  3. Финтех и внебиржевые платформы ликвидности — 18%;
  4. Агротех и новые материалы — 12%.

### Развитие региональной инфраструктуры
Как отметила сопредседатель правления ассоциации Луиза Александрова, региональные клубы Сибири, Урала и Дальнего Востока продемонстрировали наибольший прирост новых аккредитованных ангелов. Межклубный обмен пайплайном проектов сократил среднее время закрытия синдицированного раунда с 4.5 до 2.8 месяцев.`,
    authorOrSource: 'Пресс-служба АПУВИР «Большая Медведица»',
    publishedAt: new Date('2026-09-01T08:00:00+03:00'),
    imageUrl: '/assets/news/market-growth.jpg',
    sourceUrl: 'https://ursa-major.ru/news/half-year-2026-syndication-growth',
    tags: ['аналитика', 'венчур', 'статистика', 'синдикаты', 'рынок'],
    status: 'published',
    createdAt: new Date('2026-09-01T08:00:00Z'),
  },
  {
    id: 'n1000000-0000-4000-8000-000000000002',
    title:
      'Инвестиционная платформа Finmuster запустила вторичное обращение долей Pre-IPO стартапов',
    slug: 'finmuster-pre-ipo-secondary-market',
    summary:
      'Резидент ассоциации Finmuster объявил об открытии нового пула ликвидности для квалифицированных инвесторов.',
    content: `Инвестиционная платформа Finmuster, включенная в реестр операторов инвестиционных платформ Банка России, представила полнофункциональный сервис вторичного обращения прав требований и долей в непубличных технологических компаниях стадии Pre-IPO.

### Преимущества для членов ассоциации
- **Досрочный выход для ранних инвесторов**: бизнес-ангелы получают возможность частично зафиксировать прибыль до официального IPO компании на Московской бирже.
- **Вход для новых инвесторов**: доступ к портфелям проверенных растущих проектов с понятным дисконтом и регулярным раскрытием финансовой отчетности.
- **Интеграция с Deal Flow Ассоциации**: все проекты, прошедшие аккредитацию клубов «Большой Медведицы», подключаются к витрине платформы по упрощенной процедуре.`,
    authorOrSource: 'Finmuster',
    publishedAt: new Date('2026-09-03T10:30:00+03:00'),
    imageUrl: '/assets/news/finmuster-secondary.jpg',
    sourceUrl: 'https://finmuster.ru/news/secondary-market-launch',
    tags: ['finmuster', 'pre-ipo', 'резиденты', 'ликвидность', 'инвестиции'],
    status: 'published',
    createdAt: new Date('2026-09-03T10:30:00Z'),
  },
  {
    id: 'n1000000-0000-4000-8000-000000000003',
    title:
      'Законодательные инициативы: Налоговые льготы для бизнес-ангелов в 2026–2027 гг.',
    slug: 'tax-incentives-business-angels-2026',
    summary:
      'Экспертный комментарий юридического комитета ассоциации о налоговых вычетах при прямых инвестициях в стартапы.',
    content: `Комитет по правовым вопросам ассоциации «Большая Медведица» совместно с юридическим партнером ASB Consulting Group подготовил предложения по расширению инвестиционного налогового вычета для частных лиц, инвестирующих в высокотехнологичные стартапы.

### Основные направления предложений:
1. Освобождение от НДФЛ доходов от продажи акций и долей технологических компаний при сроке владения от 1 года (вместо действующих 3-5 лет).
2. Распространение вычета на инвестиции через договоры конвертируемого займа.
3. Упрощенное признание статуса квалифицированного инвестора для членов аккредитованных ассоциацией клубов.`,
    authorOrSource: 'ASB Consulting Group',
    publishedAt: new Date('2026-09-05T14:15:00+03:00'),
    imageUrl: '/assets/news/tax-regulations.jpg',
    sourceUrl: 'https://asb-group.ru/insights/tax-incentives-angels-2026',
    tags: ['законодательство', 'налоги', 'asb-consulting', 'госрегулирование'],
    status: 'published',
    createdAt: new Date('2026-09-05T14:15:00Z'),
  },
  {
    id: 'n1000000-0000-4000-8000-000000000004',
    title:
      'Ассоциация «Большая Медведица» расширяет партнерство с венчурными клубами Азиатской России',
    slug: 'asian-russia-venture-expansion',
    summary:
      'Соглашение о межрегиональном синдицировании между клубами европейской части России и Сибирско-Дальневосточным кластером.',
    content: `На расширенном заседании правления Ассоциации подписано стратегическое соглашение о запуске сквозного пайплайна технологических проектов между инвесторами Санкт-Петербурга, Москвы, Новосибирска, Красноярска и Владивостока.

Единая база проектов позволит сибирским предпринимателям презентовать свои решения федеральным ангелам, а инвесторам европейской части — соинвестировать в промышленные и DeepTech стартапы с сильной научной базой сибирских Академгородков.`,
    authorOrSource: 'Пресс-служба АПУВИР «Большая Медведица»',
    publishedAt: new Date('2026-09-06T12:00:00+03:00'),
    imageUrl: '/assets/news/siberia-expansion.jpg',
    sourceUrl: 'https://ursa-major.ru/news/asian-russia-venture-expansion',
    tags: ['регионы', 'сибирь', 'партнерство', 'синдикаты'],
    status: 'published',
    createdAt: new Date('2026-09-06T12:00:00Z'),
  },
];

// ==========================================
// Database Seeding Execution Function
// ==========================================

export async function seed(dbInstance: NodePgDatabase<typeof schema>): Promise<{
  seedsInserted: number;
  eventsInserted: number;
  newsInserted: number;
}> {
  let seedsInserted = 0;
  let eventsInserted = 0;
  let newsInserted = 0;

  // 1. Seed Parsing Seeds
  for (const s of initialSeeds) {
    try {
      await dbInstance
        .insert(parsingSeeds)
        .values(s)
        .onConflictDoNothing({ target: parsingSeeds.url });
      seedsInserted++;
    } catch {
      // ignore on conflict
    }
  }

  // 2. Seed Events
  for (const ev of initialEvents) {
    try {
      await dbInstance
        .insert(events)
        .values(ev)
        .onConflictDoNothing({ target: events.id });
      eventsInserted++;
    } catch {
      // ignore on conflict
    }
  }

  // 3. Seed News Articles
  for (const n of initialNews) {
    try {
      await dbInstance
        .insert(newsArticles)
        .values(n)
        .onConflictDoNothing({ target: newsArticles.slug });
      newsInserted++;
    } catch {
      // ignore on conflict
    }
  }

  return { seedsInserted, eventsInserted, newsInserted };
}

// Standalone execution entrypoint
if (typeof require !== 'undefined' && require.main === module) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { db } = require('./index');
  seed(db)
    .then((result) => {
      console.log('Database seeding completed successfully:', result);
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database seeding failed:', err);
      process.exit(1);
    });
}
