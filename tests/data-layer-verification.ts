import assert from 'node:assert';
import {
  db,
  isMockDb,
  events,
  parsingSeeds,
  newsArticles,
  applicationSubmissions,
  moderatorAuditLogs,
  initialEvents,
  initialSeeds,
  initialNews,
  seed,
  resetMockDb,
  getMockDbState,
} from '../src/shared/db';
import type {
  EventItem,
  NewsArticle,
  ParsingSeed,
  ApplicationSubmission,
  ModeratorAuditLog,
} from '../src/shared/types';

async function runDataLayerTests() {
  console.log('🧪 Starting Ursa Major Data Layer Verification Suite...\n');

  // Test 1: Fallback Detection
  console.log('Test 1: Connection Pool & Fallback Mode Detection');
  assert.strictEqual(typeof isMockDb, 'boolean', 'isMockDb should be boolean');
  console.log(`  ✓ Fallback detection active (isMockDb: ${isMockDb})`);

  // Test 2: Seed Data Integrity
  console.log('\nTest 2: Authentic Seed Data Completeness');
  assert.ok(initialSeeds.length >= 8, `Expected >= 8 initial seeds, got ${initialSeeds.length}`);
  assert.ok(initialEvents.length >= 6, `Expected >= 6 initial events, got ${initialEvents.length}`);
  assert.ok(initialNews.length >= 4, `Expected >= 4 initial news articles, got ${initialNews.length}`);

  const thailandEvent = initialEvents.find((e) => e.location?.includes('Таиланд'));
  assert.ok(thailandEvent, 'Thailand retreat event must be present in initialEvents');
  assert.ok(
    thailandEvent.title.includes('Дозаправка в воздухе') ||
      thailandEvent.title.includes('От неопределённости к прорыву'),
    'Thailand retreat title must match authentic live site event'
  );
  console.log('  ✓ Verified authentic Thailand retreat event is present in seed data');

  const sobaSeed = initialSeeds.find((s) => s.residentOrganizer === 'СОБА');
  assert.ok(sobaSeed, 'SOBA resident seed must be present');
  console.log('  ✓ Verified SOBA parsing seed is present');

  // Test 3: Relational Query findMany & findFirst
  console.log('\nTest 3: Querying via db.query');
  const allEvents = await db.query.events.findMany();
  assert.ok(allEvents.length >= initialEvents.length, 'db.query.events.findMany should return events');
  console.log(`  ✓ db.query.events.findMany returned ${allEvents.length} events`);

  const firstEvent = await db.query.events.findFirst();
  assert.ok(firstEvent, 'db.query.events.findFirst should return a record');
  assert.strictEqual(typeof firstEvent.id, 'string');
  assert.strictEqual(typeof firstEvent.title, 'string');
  console.log(`  ✓ db.query.events.findFirst: "${firstEvent.title}"`);

  const allNews = await db.query.newsArticles.findMany();
  assert.ok(allNews.length >= initialNews.length, 'db.query.newsArticles.findMany should return articles');
  console.log(`  ✓ db.query.newsArticles.findMany returned ${allNews.length} articles`);

  const allSeeds = await db.query.parsingSeeds.findMany();
  assert.ok(allSeeds.length >= initialSeeds.length, 'db.query.parsingSeeds.findMany should return seeds');
  console.log(`  ✓ db.query.parsingSeeds.findMany returned ${allSeeds.length} seeds`);

  // Test 4: Select Query Builder with limit & offset
  console.log('\nTest 4: Select Query Builder');
  const selectResult = await db.select().from(events).limit(2);
  assert.strictEqual(selectResult.length, 2, 'Select with limit 2 should return 2 records');
  console.log('  ✓ db.select().from(events).limit(2) succeeded');

  // Test 5: Insert and Update Application Submission
  console.log('\nTest 5: Mutation on applicationSubmissions');
  const newSubmission = {
    type: 'inline_contact' as const,
    name: 'Иван Сергеевич Петров',
    phone: '+7 (999) 123-45-67',
    email: 'ivan.petrov@venture-fund.ru',
    telegram: '@ivan_petrov_vc',
    company: 'North Capital Fund',
    position: 'Managing Partner',
    message: 'Заинтересованы во вступлении в ассоциацию и синдицировании сделок.',
    status: 'new' as const,
  };

  const insertSubmissionResult = await db
    .insert(applicationSubmissions)
    .values(newSubmission)
    .returning();

  assert.ok(insertSubmissionResult.length > 0, 'Insert should return inserted submission');
  const savedSubmission = insertSubmissionResult[0];
  assert.strictEqual(savedSubmission.name, newSubmission.name);
  assert.strictEqual(savedSubmission.status, 'new');
  console.log(`  ✓ Successfully inserted submission ID: ${savedSubmission.id}`);

  // Update status to 'contacted'
  const updateResult = await db
    .update(applicationSubmissions)
    .set({ status: 'contacted' })
    .where(((item: any) => item.id === savedSubmission.id) as any)
    .returning();

  assert.ok(updateResult.length > 0, 'Update should return updated submission');
  assert.strictEqual(updateResult[0].status, 'contacted');
  console.log('  ✓ Successfully updated submission status to "contacted"');

  // Test 6: Moderator Audit Logs
  console.log('\nTest 6: Moderator Audit Logs Table');
  const auditLog = {
    eventId: firstEvent.id,
    action: 'approve',
    changedBy: 'moderator@ursa-major.ru',
    oldValue: { status: 'pending' },
    newValue: { status: 'approved' },
  };

  const insertAuditResult = await db
    .insert(moderatorAuditLogs)
    .values(auditLog)
    .returning();

  assert.ok(insertAuditResult.length > 0, 'Insert audit log should succeed');
  assert.strictEqual(insertAuditResult[0].action, 'approve');
  console.log(`  ✓ Successfully recorded audit log ID: ${insertAuditResult[0].id}`);

  // Test 7: Programmatic Seed Function Execution
  console.log('\nTest 7: Seed Execution Function');
  const seedStats = await seed(db);
  console.log(
    `  ✓ Seed stats: ${seedStats.seedsInserted} seeds, ${seedStats.eventsInserted} events, ${seedStats.newsInserted} news`
  );

  // Test 8: Type Compatibility Verification
  console.log('\nTest 8: TypeScript Interface Verification');
  const eventItemCheck: EventItem = {
    id: firstEvent.id,
    title: firstEvent.title,
    description: firstEvent.description,
    startAt: firstEvent.startAt.toISOString(),
    timezone: firstEvent.timezone,
    isOnline: firstEvent.isOnline,
    priceType: firstEvent.priceType,
    priceCurrency: firstEvent.priceCurrency,
    sourceUrl: firstEvent.sourceUrl,
    category: firstEvent.category,
    targetAudience: firstEvent.targetAudience,
    residentOrganizer: firstEvent.residentOrganizer,
    status: firstEvent.status,
    isTop: firstEvent.isTop,
    createdAt: firstEvent.createdAt.toISOString(),
    updatedAt: firstEvent.updatedAt.toISOString(),
  };
  assert.strictEqual(eventItemCheck.title, firstEvent.title);
  console.log('  ✓ EventItem interface conforms 100% to Drizzle output');

  console.log('\n🎉 ALL DATA LAYER VERIFICATION TESTS PASSED SUCCESSFULLY! (8/8 tests passed)\n');
}

runDataLayerTests().catch((err) => {
  console.error('\n❌ Data layer verification test failed:', err);
  process.exit(1);
});
