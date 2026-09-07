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
    name: 'СОБА Новости & Питчи (Союз Организаций Бизнес Ангелов)',
    type: 'telegram',
    url: 'https://t.me/s/soba_invest',
    residentOrganizer: 'СОБА',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
    createdAt: new Date('2026-08-15T10:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000002',
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
    createdAt: new Date('2026-08-20T11:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000003',
    name: 'Клуб инвесторов Сибири, Урала и Дальнего Востока',
    type: 'telegram',
    url: 'https://t.me/s/siberian_angels',
    residentOrganizer: 'Клуб инвесторов Сибири, Урала и Дальнего Востока',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
    createdAt: new Date('2026-08-22T08:00:00Z'),
  },
  {
    id: 's1000000-0000-4000-8000-000000000004',
    name: 'ARGENT CLUB — Сообщество частных инвесторов',
    type: 'telegram',
    url: 'https://t.me/s/argent_club',
    residentOrganizer: 'ARGENT CLUB',
    isActive: true,
    scrapeStatus: 'idle',
    rules: {},
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
    title: 'Инвестиционный питч-день стартапов ранних стадий',
    description:
      'Презентация 8 перспективных технологических проектов перед бизнес-ангелами клуба СОБА. Оценка инвестиционной привлекательности и структурирование сделок.',
    rawText:
      'Питч-день СОБА состоится 15 октября в 18:00 МСК в отеле Амбассадор и онлайн. Регистрация: https://soba.spb.ru/pitch-day',
    startAt: new Date('2026-10-15T18:00:00+03:00'),
    endAt: new Date('2026-10-15T21:00:00+03:00'),
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
    createdAt: new Date('2026-09-01T10:00:00Z'),
    updatedAt: new Date('2026-09-01T10:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000002',
    title: 'Онлайн-вебинар: Структурирование синдицированных венчурных сделок',
    description:
      'Практический разбор договоров конвертируемого займа и опционов в российском праве. Спикеры: ведущие юристы ASB Consulting Group.',
    rawText:
      'Вебинар ASB Consulting по структурированию синдицированных инвестиций пройдет онлайн 18 октября в 19:00. Подробности: https://asb-group.ru/events/webinar-syndication',
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
    sourceUrl: 'https://t.me/s/asb_consulting/198',
    imageUrl: '/assets/events/webinar-legal.jpg',
    category: 'education',
    targetAudience: ['business_angels', 'lawyers', 'founders'],
    residentOrganizer: 'ASB Consulting Group',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-09-02T11:00:00Z'),
    updatedAt: new Date('2026-09-02T11:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000003',
    title: 'Инвестиционный завтрак Клуба инвесторов Сибири и Дальнего Востока',
    description:
      'Закрытая неформальная встреча для обсуждения совместных синдикатов в реальный сектор и DeepTech стартапы Сибирского региона.',
    rawText:
      'Завтрак инвесторов Сибири и Дальнего Востока состоится в Новосибирске 22 октября. Билеты: https://siberian-angels.ru/breakfast',
    startAt: new Date('2026-10-22T10:00:00+03:00'),
    endAt: new Date('2026-10-22T12:00:00+03:00'),
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
    createdAt: new Date('2026-09-03T12:00:00Z'),
    updatedAt: new Date('2026-09-03T12:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000004',
    title: 'Pre-IPO и внебиржевой рынок акций 2026: Аналитическая конференция',
    description:
      'Обзор доступных инструментов ликвидности для частных инвесторов и эмитентов от инвестиционной платформы Finmuster.',
    rawText:
      'Онлайн-конференция Finmuster по внебиржевому рынку и Pre-IPO пройдет 25 октября с 14:00. Ссылка: https://finmuster.ru/conf2026',
    startAt: new Date('2026-10-25T14:00:00+03:00'),
    endAt: new Date('2026-10-25T18:00:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: true,
    location: 'Online / YouTube Live',
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
    createdAt: new Date('2026-09-04T09:00:00Z'),
    updatedAt: new Date('2026-09-04T09:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000005',
    title:
      'Выездной семинар «От неопределённости к прорыву» в рамках встречи «Дозаправка в воздухе»',
    description:
      'Ежегодная выездная встреча владельцев бизнеса и венчурных инвесторов «Дозаправка в воздухе» в Юго-Восточной Азии. В программе: семинар по управлению бизнесом в условиях высокой неопределенности, стратегический нетворкинг, обмен синдикационным опытом и активная страноведческая программа.',
    rawText:
      'В начале февраля 2026 г. в Юго-Восточной Азии (Таиланд) состоится ежегодная выездная встреча владельцев бизнеса «Дозаправка в воздухе». Партнер: Проект "Лидер года" (ПАО "НБД-Банк"). Подробности на ursa-major.ru',
    startAt: new Date('2026-02-07T09:00:00+07:00'),
    endAt: new Date('2026-02-14T20:00:00+07:00'),
    timezone: 'Asia/Bangkok',
    isOnline: false,
    location: 'Таиланд, Пхукет',
    venueName: 'Курортный комплекс Laguna Phuket',
    priceType: 'paid',
    priceMin: 180000,
    priceMax: 350000,
    priceCurrency: 'RUB',
    paymentUrl: 'https://ursa-major.ru/#events',
    sourceUrl: 'https://ursa-major.ru',
    imageUrl: '/assets/events/thailand-retreat.jpg',
    category: 'networking',
    targetAudience: ['business_angels', 'family_offices', 'founders'],
    residentOrganizer: 'Проект "Лидер года" (партнер ПАО "НБД-Банк")',
    status: 'approved',
    isTop: true,
    createdAt: new Date('2026-01-10T10:00:00Z'),
    updatedAt: new Date('2026-01-10T10:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000006',
    title: 'Demo Day акселератора Pitchleaks & Argent Club: B2B и DeepTech проекты',
    description:
      'Выпускной питч-день 10 отобранных стартапов с подтвержденной выручкой. Презентации перед пулом из 40+ частных инвесторов и фондов ранних стадий.',
    rawText:
      'Demo Day Pitchleaks & Argent Club пройдет 29 октября в Москве в технопарке Сколково. Регистрация: https://pitchleaks.com/demoday2026',
    startAt: new Date('2026-10-29T16:00:00+03:00'),
    endAt: new Date('2026-10-29T20:00:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: false,
    location: 'Москва, Инновационный центр Сколково, Большой бульвар, 42с1',
    venueName: 'Технопарк Сколково, зал Капсула',
    priceType: 'free',
    priceMin: 0,
    priceCurrency: 'RUB',
    paymentUrl: 'https://pitchleaks.com/demoday2026',
    sourceUrl: 'https://t.me/s/pitchleaks/245',
    imageUrl: '/assets/events/demoday-skolkovo.jpg',
    category: 'pitch',
    targetAudience: ['business_angels', 'funds', 'seed_startups'],
    residentOrganizer: 'ARGENT CLUB',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-09-04T12:00:00Z'),
    updatedAt: new Date('2026-09-04T12:00:00Z'),
  },
  {
    id: 'e1000000-0000-4000-8000-000000000007',
    title: 'Синдикация сделок ранних стадий: Практикум для бизнес-ангелов',
    description:
      'Практический интенсив венчурного клуба «Синдикат» по оценке рисков, проверке Due Diligence и соинвестированию в перспективные технологические компании.',
    rawText:
      'Практикум Синдиката по совместным инвестициям: 12 ноября, Москва и онлайн. Регистрация: https://syndicate-vc.ru/workshop',
    startAt: new Date('2026-11-12T18:30:00+03:00'),
    endAt: new Date('2026-11-12T21:30:00+03:00'),
    timezone: 'Europe/Moscow',
    isOnline: true,
    location: 'Москва / Online',
    venueName: 'Коворкинг Meeting Point / Zoom',
    priceType: 'paid',
    priceMin: 15000,
    priceCurrency: 'RUB',
    paymentUrl: 'https://syndicate-vc.ru/workshop',
    sourceUrl: 'https://t.me/s/syndicate_vc/112',
    imageUrl: '/assets/events/syndicate-workshop.jpg',
    category: 'education',
    targetAudience: ['business_angels', 'family_offices'],
    residentOrganizer: 'Синдикат',
    status: 'approved',
    isTop: false,
    createdAt: new Date('2026-09-05T09:00:00Z'),
    updatedAt: new Date('2026-09-05T09:00:00Z'),
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
