/**
 * M2 Empirical Stress-Test & Challenge Suite
 *
 * Empirical challenger harness for Milestone M2 (Database & Data Layer):
 * 1. Drizzle ORM schema types, column constraints, default values, and foreign keys.
 * 2. Event creation with edge-case inputs (null end_at, donation, multiple audiences, Russian unicode, extreme timestamps).
 * 3. Query filters (category, resident, price_type, is_online, status, date ranges) in SQL & runtime.
 * 4. In-memory mock fallback behavior when DATABASE_URL is unset (SSR zero-crash guarantee).
 * 5. Deduplication foreign key relations (merged_into_id).
 */

import assert from 'node:assert';
import { drizzle } from 'drizzle-orm/node-postgres';
import {
  eq,
  and,
  or,
  gte,
  lte,
  desc,
  asc,
  isNull,
  isNotNull,
  ilike,
  getTableColumns,
} from 'drizzle-orm';
import {
  db,
  isMockDb,
  getDb,
  resetMockDb,
  getMockDbState,
  events,
  parsingSeeds,
  newsArticles,
  applicationSubmissions,
  moderatorAuditLogs,
  eventsRelations,
  moderatorAuditLogsRelations,
  initialEvents,
  initialSeeds,
  initialNews,
} from '../src/shared/db';
import type {
  EventItem,
  EventCategory,
  PriceType,
  EventStatus,
} from '../src/shared/types';

// Dummy Drizzle client configured for PostgreSQL SQL generation without a live connection
const dummyDrizzle = drizzle({} as any, {
  schema: {
    events,
    parsingSeeds,
    newsArticles,
    applicationSubmissions,
    moderatorAuditLogs,
  },
});

interface ChallengeReport {
  suite: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'VULNERABILITY_FOUND';
  details: string;
}

const reports: ChallengeReport[] = [];

function record(
  suite: string,
  test: string,
  status: 'PASS' | 'FAIL' | 'VULNERABILITY_FOUND',
  details: string
) {
  reports.push({ suite, test, status, details });
  const icon =
    status === 'PASS' ? '✅' : status === 'VULNERABILITY_FOUND' ? '⚠️' : '❌';
  console.log(`  ${icon} [${status}] ${test}: ${details}`);
}

async function runEmpiricalChallenge() {
  console.log('=================================================================');
  console.log('🚀 URSA MAJOR M2 DATABASE & DATA LAYER EMPIRICAL CHALLENGE SUITE');
  console.log('=================================================================\n');

  // ---------------------------------------------------------------------------
  // SUITE 1: Drizzle ORM Schema Architecture, Constraints & SQL Compilation
  // ---------------------------------------------------------------------------
  console.log('📦 SUITE 1: Schema Architecture, Constraints & SQL Generation');

  // 1.1 Column verification on events table
  const eventCols = getTableColumns(events);
  assert.ok(eventCols.id, 'events.id must exist');
  assert.ok(eventCols.title, 'events.title must exist');
  assert.ok(eventCols.startAt, 'events.startAt must exist');
  assert.ok(eventCols.endAt, 'events.endAt must exist');
  assert.ok(eventCols.category, 'events.category must exist');
  assert.ok(eventCols.priceType, 'events.priceType must exist');
  assert.ok(eventCols.targetAudience, 'events.targetAudience must exist');
  assert.ok(eventCols.mergedIntoId, 'events.mergedIntoId must exist');
  record(
    'Suite 1',
    'Event Columns Presence',
    'PASS',
    'All required domain columns exist on events table'
  );

  // 1.2 Unique constraints on seeds and news
  const seedCols = getTableColumns(parsingSeeds);
  assert.strictEqual(seedCols.url.isUnique, true, 'parsingSeeds.url must be unique');
  const newsCols = getTableColumns(newsArticles);
  assert.strictEqual(newsCols.slug.isUnique, true, 'newsArticles.slug must be unique');
  record(
    'Suite 1',
    'Unique Constraints',
    'PASS',
    'parsingSeeds.url and newsArticles.slug enforce uniqueness at schema level'
  );

  // 1.3 Check foreign key reference on events.mergedIntoId vs moderatorAuditLogs.eventId
  const fkSym = Symbol.for('drizzle:PgInlineForeignKeys');
  const auditLogFks = (moderatorAuditLogs as any)[fkSym] || [];
  assert.ok(
    auditLogFks.length > 0,
    'moderatorAuditLogs must have at least one inline foreign key'
  );
  assert.strictEqual(auditLogFks[0].onDelete, 'set null');
  record(
    'Suite 1',
    'Database FK on moderator_audit_logs.event_id',
    'PASS',
    'moderatorAuditLogs.eventId enforces DB foreign key with onDelete: "set null"'
  );

  const eventFks = (events as any)[fkSym] || [];
  if (eventFks.length === 0) {
    record(
      'Suite 1',
      'Database FK Constraint on merged_into_id',
      'VULNERABILITY_FOUND',
      'events.mergedIntoId lacks database-level .references(() => events.id). Although application-level relation exists in eventsRelations, referential integrity and ON DELETE policy is omitted in PostgreSQL migration!'
    );
  } else {
    record('Suite 1', 'Database FK Constraint on merged_into_id', 'PASS', 'Database FK present');
  }

  // 1.4 Drizzle PostgreSQL SQL Compilation: Complex Multi-Predicate Query
  const sampleQuery = dummyDrizzle
    .select()
    .from(events)
    .where(
      and(
        eq(events.category, 'pitch'),
        eq(events.residentOrganizer, 'СОБА'),
        eq(events.priceType, 'free'),
        eq(events.isOnline, true),
        eq(events.status, 'approved'),
        gte(events.startAt, new Date('2026-09-01T00:00:00Z')),
        lte(events.startAt, new Date('2026-10-01T00:00:00Z')),
        isNull(events.mergedIntoId)
      )
    )
    .orderBy(desc(events.startAt))
    .limit(10);

  const compiledSql = sampleQuery.toSQL();
  assert.ok(compiledSql.sql.includes('select "id", "title"'), 'SQL should select fields');
  assert.ok(
    compiledSql.sql.includes('from "events" where'),
    'SQL should query from events with WHERE'
  );
  assert.strictEqual(compiledSql.params.length, 8, 'Query should bind 8 parameters');
  record(
    'Suite 1',
    'Drizzle Multi-Filter SQL Generation',
    'PASS',
    `Compiled PostgreSQL SQL with 8 parameter bindings correctly: ${compiledSql.sql.substring(0, 80)}...`
  );

  // ---------------------------------------------------------------------------
  // SUITE 2: Event Creation with Adversarial & Edge-Case Inputs
  // ---------------------------------------------------------------------------
  console.log('\n🔥 SUITE 2: Event Creation with Adversarial & Edge-Case Inputs');
  resetMockDb();

  // 2.1 Edge-case: null endAt, donation pricing, multiple target audiences, Russian unicode
  const unicodeRussianTitle =
    '«Инвестиционный саммит АПУВИР 2028»: Венчурный мост Россия 🇷🇺 — СНГ 🚀 (DeepTech, AI & EdTech)';
  const unicodeRussianDesc = `Стратегическая сессия Союза Организаций Бизнес-Ангелов (СОБА) и синдиката «Северная Звезда».
Тематика:
— Инвестиции в технологический суверенитет;
— Правовое регулирование конвертируемых займов (152-ФЗ, 259-ФЗ);
— Оценка pre-seed и seed фаундеров: практические кейсы.
Координатор: Александра Александрова (СОБА).`;

  const edgeCaseEvent = {
    title: unicodeRussianTitle,
    description: unicodeRussianDesc,
    rawText: 'Сырой дамп Telegram-поста с спецсимволами: \t\n\r \\ " \' & < > 😊🔥',
    startAt: new Date('2028-02-29T15:00:00.000Z'), // Leap year Feb 29
    endAt: null, // Null endAt
    timezone: 'Europe/Moscow',
    isOnline: false,
    location: 'г. Санкт-Петербург, ул. Большая Конюшенная, д. 8, Резиденция "СОБА"',
    venueName: 'Конференц-зал "Большая Медведица"',
    priceType: 'donation' as const, // Donation pricing
    priceMin: 0,
    priceMax: null,
    priceCurrency: 'RUB',
    paymentUrl: 'https://pay.ursa-major.ru/donate/summit-2028',
    sourceUrl: 'https://t.me/soba_invest/777',
    imageUrl: 'https://ursa-major.ru/assets/events/summit-2028.jpg',
    category: 'pitch' as const,
    targetAudience: [
      'business_angels',
      'seed_startups',
      'funds',
      'corporates',
      'accelerators',
      'private_investors',
      'syndicate_members',
    ],
    residentOrganizer: 'СОБА',
    status: 'approved' as const,
    isTop: true,
    mergedIntoId: null,
  };

  const [insertedEdgeEvent] = await db
    .insert(events)
    .values(edgeCaseEvent)
    .returning();

  assert.ok(insertedEdgeEvent.id, 'Inserted event must receive UUID');
  assert.strictEqual(insertedEdgeEvent.title, unicodeRussianTitle);
  assert.strictEqual(insertedEdgeEvent.description, unicodeRussianDesc);
  assert.strictEqual(insertedEdgeEvent.endAt, null, 'endAt must remain null');
  assert.strictEqual(insertedEdgeEvent.priceType, 'donation');
  assert.strictEqual(insertedEdgeEvent.priceMin, 0);
  assert.strictEqual(insertedEdgeEvent.priceMax, null);
  assert.strictEqual(insertedEdgeEvent.targetAudience.length, 7);
  assert.strictEqual(insertedEdgeEvent.startAt.getUTCFullYear(), 2028);
  assert.strictEqual(insertedEdgeEvent.startAt.getUTCMonth(), 1); // February (0-indexed)
  assert.strictEqual(insertedEdgeEvent.startAt.getUTCDate(), 29); // Leap day 29
  record(
    'Suite 2',
    'Russian Unicode & Leap Year Event Creation',
    'PASS',
    'Full Cyrillic text, emojis, null endAt, donation pricing, and leap day (2028-02-29) preserved perfectly'
  );

  // 2.2 Extreme Timestamps: Unix Epoch (1970) & Far Future (2099)
  const farFutureDate = new Date('2099-12-31T23:59:59.999Z');
  const epochDate = new Date('1970-01-01T00:00:00.000Z');

  const [insertedFuture] = await db
    .insert(events)
    .values({
      title: 'Венчурный саммит будущего (2099)',
      startAt: farFutureDate,
      sourceUrl: 'https://ursa-major.ru/future',
      status: 'pending',
    } as any)
    .returning();

  const [insertedPast] = await db
    .insert(events)
    .values({
      title: 'Исторический архив учредительного собрания (1970)',
      startAt: epochDate,
      sourceUrl: 'https://ursa-major.ru/archive',
      status: 'approved',
    } as any)
    .returning();

  assert.strictEqual(insertedFuture.startAt.getTime(), farFutureDate.getTime());
  assert.strictEqual(insertedPast.startAt.getTime(), epochDate.getTime());
  record(
    'Suite 2',
    'Extreme Timestamps (1970 & 2099)',
    'PASS',
    'Timestamps spanning from Unix Epoch (1970) to far future (2099) maintain millisecond precision'
  );

  // 2.3 Minimal Insertion Default Values Challenge
  const [insertedMinimal] = await db
    .insert(events)
    .values({
      title: 'Минимальное событие без необязательных полей',
      startAt: new Date('2026-11-01T10:00:00Z'),
      sourceUrl: 'https://t.me/minimal/1',
    } as any)
    .returning();

  // Test whether schema defaults were filled in by the mock builder
  const hasMockDefaultOmission =
    insertedMinimal.isOnline === undefined ||
    insertedMinimal.priceType === undefined ||
    insertedMinimal.status === undefined ||
    insertedMinimal.category === undefined;

  if (hasMockDefaultOmission) {
    record(
      'Suite 2',
      'Mock Insert Default Value Population',
      'VULNERABILITY_FOUND',
      `buildMockInsertBuilder omits schema default values when fields are unsupplied! (isOnline: ${insertedMinimal.isOnline}, priceType: ${insertedMinimal.priceType}, status: ${insertedMinimal.status}, targetAudience: ${insertedMinimal.targetAudience})`
    );
  } else {
    record(
      'Suite 2',
      'Mock Insert Default Value Population',
      'PASS',
      'Schema defaults populated correctly'
    );
  }

  // ---------------------------------------------------------------------------
  // SUITE 3: Multi-Criteria Query Filtering & Ordering
  // ---------------------------------------------------------------------------
  console.log('\n🔍 SUITE 3: Multi-Criteria Query Filtering & Ordering');

  // Reset to authentic seed data
  resetMockDb();

  // 3.1 Category Filter
  const pitchEvents = (await db.query.events.findMany()).filter(
    (e) => e.category === 'pitch'
  );
  assert.ok(pitchEvents.length >= 2, 'Should find at least 2 pitch events in seed');
  record(
    'Suite 3',
    'Category Filter',
    'PASS',
    `Found ${pitchEvents.length} events categorized as "pitch"`
  );

  // 3.2 Resident Filter
  const sobaEvents = (await db.query.events.findMany()).filter(
    (e) => e.residentOrganizer === 'СОБА'
  );
  assert.ok(sobaEvents.length >= 1, 'Should find at least 1 SOBA event in seed');
  const finmusterEvents = (await db.query.events.findMany()).filter(
    (e) => e.residentOrganizer === 'Finmuster'
  );
  assert.ok(finmusterEvents.length >= 1, 'Should find at least 1 Finmuster event in seed');
  record(
    'Suite 3',
    'Resident Filter',
    'PASS',
    `Resident organizer filters successfully isolated SOБА (${sobaEvents.length}) and Finmuster (${finmusterEvents.length})`
  );

  // 3.3 Price Type Filter
  const freeEvents = (await db.query.events.findMany()).filter(
    (e) => e.priceType === 'free'
  );
  const paidEvents = (await db.query.events.findMany()).filter(
    (e) => e.priceType === 'paid'
  );
  assert.ok(freeEvents.length >= 1, 'Should find free events in seed');
  assert.ok(paidEvents.length >= 1, 'Should find paid events in seed');
  record(
    'Suite 3',
    'Price Type Filter',
    'PASS',
    `Separated free events (${freeEvents.length}) and paid events (${paidEvents.length})`
  );

  // 3.4 Format Filter (Online vs Offline)
  const onlineEvents = (await db.query.events.findMany()).filter((e) => e.isOnline);
  const offlineEvents = (await db.query.events.findMany()).filter((e) => !e.isOnline);
  assert.ok(onlineEvents.length >= 1, 'Should find online events');
  assert.ok(offlineEvents.length >= 1, 'Should find offline events');
  record(
    'Suite 3',
    'Format Filter',
    'PASS',
    `Separated online events (${onlineEvents.length}) and offline events (${offlineEvents.length})`
  );

  // 3.5 Date Range Filtering (October 2026 Window)
  const octStart = new Date('2026-10-01T00:00:00Z');
  const octEnd = new Date('2026-10-31T23:59:59Z');
  const octoberEvents = (await db.query.events.findMany()).filter(
    (e) => e.startAt >= octStart && e.startAt <= octEnd
  );
  assert.ok(octoberEvents.length >= 1, 'Should find events scheduled in October 2026');
  record(
    'Suite 3',
    'Date Range Filter',
    'PASS',
    `Found ${octoberEvents.length} events scheduled in October 2026 window`
  );

  // 3.6 Challenge Mock Query Builder with Drizzle SQL chunk
  const mockDrizzleFilterResult = await db
    .select()
    .from(events)
    .where(eq(events.category, 'pitch'));
  if (mockDrizzleFilterResult.length === initialEvents.length) {
    record(
      'Suite 3',
      'Mock Query Builder Drizzle SQL Expression Handling',
      'VULNERABILITY_FOUND',
      `buildMockQueryBuilder.where() ignores Drizzle SQL expressions (eq/and/gte) because typeof clause === 'object' rather than 'function'. Result returned all ${mockDrizzleFilterResult.length} events unfiltered!`
    );
  } else {
    record(
      'Suite 3',
      'Mock Query Builder Drizzle SQL Expression Handling',
      'PASS',
      'Drizzle SQL expression correctly evaluated'
    );
  }

  // 3.7 Challenge Mock Relational Query where clause signature
  let findManyDestructureThrew = false;
  try {
    const res = await db.query.events.findMany({
      where: (events: any, { eq }: any) => eq(events.category, 'pitch'),
    } as any);
    if (res.length === initialEvents.length) {
      findManyDestructureThrew = true; // Error was swallowed and returned all
    }
  } catch (err) {
    findManyDestructureThrew = true;
  }
  if (findManyDestructureThrew) {
    record(
      'Suite 3',
      'Mock Relational Query Where Signature Handling',
      'VULNERABILITY_FOUND',
      `db.query.events.findMany({ where: (e, { eq }) => eq(...) }) fails in mock mode: Array.prototype.filter passes (item, index), causing TypeError destructuring { eq } from index 0, which is silently swallowed by catch {}, returning unfiltered rows!`
    );
  } else {
    record(
      'Suite 3',
      'Mock Relational Query Where Signature Handling',
      'PASS',
      'Relational where handled properly'
    );
  }

  // ---------------------------------------------------------------------------
  // SUITE 4: In-Memory Mock Fallback & SSR Zero-Crash Verification
  // ---------------------------------------------------------------------------
  console.log('\n🛡️ SUITE 4: In-Memory Mock Fallback & SSR Zero-Crash Verification');

  // 4.1 Check isMockDb flag
  assert.strictEqual(
    isMockDb,
    true,
    'isMockDb must evaluate to true when DATABASE_URL is unset'
  );
  record(
    'Suite 4',
    'isMockDb Detection',
    'PASS',
    'isMockDb correctly identifies absence of DATABASE_URL'
  );

  // 4.2 getDb() invocation
  const activeDb = getDb();
  assert.ok(activeDb, 'getDb() must return valid Drizzle instance');
  assert.strictEqual(
    (activeDb as any)._isMock,
    true,
    'getDb() returned mock Drizzle instance'
  );
  record(
    'Suite 4',
    'getDb() Instance Return',
    'PASS',
    'getDb() returns initialized in-memory database instance without errors'
  );

  // 4.3 Query all 5 tables through mock query API
  const allEvents = await db.query.events.findMany();
  const allNews = await db.query.newsArticles.findMany();
  const allSeeds = await db.query.parsingSeeds.findMany();
  const allApps = await db.query.applicationSubmissions.findMany();
  const allAudits = await db.query.moderatorAuditLogs.findMany();

  assert.ok(allEvents.length >= 7, 'Events should have 7 initial records');
  assert.ok(allNews.length >= 4, 'News should have 4 initial records');
  assert.ok(allSeeds.length >= 8, 'Seeds should have 8 initial records');
  assert.strictEqual(allApps.length, 0, 'Apps should start empty');
  assert.strictEqual(allAudits.length, 0, 'Audits should start empty');
  record(
    'Suite 4',
    'Table Collections In-Memory Initialization',
    'PASS',
    `Verified 5 collections: ${allEvents.length} events, ${allNews.length} news, ${allSeeds.length} seeds, ${allApps.length} apps, ${allAudits.length} audits`
  );

  // 4.4 Pagination: limit and offset
  const page1 = await db.select().from(events).limit(3).offset(0);
  const page2 = await db.select().from(events).limit(3).offset(3);
  assert.strictEqual(page1.length, 3, 'Page 1 should have 3 items');
  assert.strictEqual(page2.length, 3, 'Page 2 should have 3 items');
  assert.notStrictEqual(page1[0].id, page2[0].id, 'Page 1 and Page 2 must not overlap');
  record(
    'Suite 4',
    'Pagination limit & offset',
    'PASS',
    'limit(3).offset(0) and limit(3).offset(3) sliced distinct rows successfully'
  );

  // 4.5 Reset idempotency
  resetMockDb();
  const refreshedEvents = await db.query.events.findMany();
  assert.strictEqual(
    refreshedEvents.length,
    initialEvents.length,
    'resetMockDb should restore exact initial state'
  );
  record(
    'Suite 4',
    'resetMockDb() Idempotency',
    'PASS',
    'resetMockDb() cleanly wiped transient mutations and restored authentic seed state'
  );

  // ---------------------------------------------------------------------------
  // SUITE 5: Deduplication Foreign Key Relations (merged_into_id)
  // ---------------------------------------------------------------------------
  console.log('\n🔗 SUITE 5: Deduplication Foreign Key Relations (merged_into_id)');
  resetMockDb();

  // 5.1 Insert canonical event and duplicate
  const [canonicalEvent] = await db
    .insert(events)
    .values({
      title: 'Саммит бизнес-ангелов АПУВИР (Канонический)',
      startAt: new Date('2026-11-15T18:00:00Z'),
      sourceUrl: 'https://ursa-major.ru/events/canonical-summit',
      residentOrganizer: 'СОБА',
      status: 'approved',
      isTop: true,
      category: 'conference',
      targetAudience: ['business_angels', 'funds'],
    } as any)
    .returning();

  const [duplicateEvent] = await db
    .insert(events)
    .values({
      title: 'Саммит бизнес ангелов (Репост из канала)',
      startAt: new Date('2026-11-15T18:00:00Z'),
      sourceUrl: 'https://t.me/venture_feed/456',
      residentOrganizer: 'СОБА',
      status: 'rejected',
      isTop: false,
      category: 'conference',
      mergedIntoId: canonicalEvent.id, // Self-referencing link to canonical
    } as any)
    .returning();

  assert.strictEqual(
    duplicateEvent.mergedIntoId,
    canonicalEvent.id,
    'duplicate mergedIntoId must match canonical ID'
  );
  record(
    'Suite 5',
    'Deduplication Self-Reference Storage',
    'PASS',
    `Duplicate event (${duplicateEvent.id}) successfully stores mergedIntoId referencing Canonical event (${canonicalEvent.id})`
  );

  // 5.2 Public Showcase Query: filter out merged duplicates
  const publicEvents = (await db.query.events.findMany()).filter(
    (e) => !e.mergedIntoId && e.status === 'approved'
  );
  const publicContainsDuplicate = publicEvents.some(
    (e) => e.id === duplicateEvent.id
  );
  assert.strictEqual(
    publicContainsDuplicate,
    false,
    'Public query must exclude merged duplicates'
  );
  record(
    'Suite 5',
    'Public Catalog Deduplication Isolation',
    'PASS',
    'Public approved catalog query cleanly excludes records where mergedIntoId is set'
  );

  // 5.3 Challenge Relational "with" support in Mock query builder
  const sampleWithQuery = await db.query.events.findMany({
    with: {
      duplicates: true,
      mergedInto: true,
    } as any,
  });
  const hasDuplicatesProperty = sampleWithQuery.some(
    (e: any) => 'duplicates' in e || 'mergedInto' in e
  );
  if (!hasDuplicatesProperty) {
    record(
      'Suite 5',
      'Mock Relational Query "with" Option Support',
      'VULNERABILITY_FOUND',
      'createMockRelationalQuery ignores opts.with. Calling db.query.events.findMany({ with: { duplicates: true } }) returns bare events without nested duplicate relations!'
    );
  } else {
    record(
      'Suite 5',
      'Mock Relational Query "with" Option Support',
      'PASS',
      'Nested relation joins supported'
    );
  }

  // 5.4 Self-referencing JOIN SQL Generation with Drizzle
  const aliasEvents = events;
  const joinQuery = dummyDrizzle
    .select({
      duplicateId: events.id,
      duplicateTitle: events.title,
      canonicalId: aliasEvents.id,
      canonicalTitle: aliasEvents.title,
    })
    .from(events)
    .innerJoin(aliasEvents, eq(events.mergedIntoId, aliasEvents.id));

  const joinSql = joinQuery.toSQL();
  assert.ok(
    joinSql.sql.includes('inner join') && joinSql.sql.includes('merged_into_id'),
    'SQL should generate self-join on merged_into_id'
  );
  record(
    'Suite 5',
    'Drizzle Self-Referencing Join SQL Generation',
    'PASS',
    `Drizzle successfully compiled self-referencing SQL join: ${joinSql.sql.substring(0, 100)}...`
  );

  // ---------------------------------------------------------------------------
  // SUMMARY REPORT
  // ---------------------------------------------------------------------------
  console.log('\n=================================================================');
  console.log('📊 EMPIRICAL CHALLENGE EXECUTION SUMMARY');
  console.log('=================================================================');
  const passes = reports.filter((r) => r.status === 'PASS').length;
  const vulns = reports.filter((r) => r.status === 'VULNERABILITY_FOUND').length;
  const fails = reports.filter((r) => r.status === 'FAIL').length;

  console.log(`Total Scenarios Tested: ${reports.length}`);
  console.log(`  ✅ Passed: ${passes}`);
  console.log(`  ⚠️ Vulnerabilities / Discrepancies Discovered: ${vulns}`);
  console.log(`  ❌ Failed Assertions: ${fails}`);
  console.log('=================================================================\n');

  if (fails > 0) {
    process.exit(1);
  }
}

runEmpiricalChallenge().catch((err) => {
  console.error('Fatal crash during empirical challenge execution:', err);
  process.exit(1);
});
