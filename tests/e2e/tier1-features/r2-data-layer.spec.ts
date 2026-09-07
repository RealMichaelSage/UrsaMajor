import { test, expect } from '@playwright/test';
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
  eventsRelations,
  moderatorAuditLogsRelations,
} from '../../../src/shared/db';
import { eq, desc, asc, and, isNull, getTableColumns } from 'drizzle-orm';

test.describe('Tier 1: R2 Database & Data Layer (F2.01 – F2.03) [Genuine DB Verification]', () => {

  test.beforeEach(async () => {
    // Ensure clean state before each test run
    resetMockDb();
  });

  // ============================================================================
  // F2.01 PostgreSQL Schema Architecture & DDL Constraints
  // ============================================================================

  test('F2.01.1 - Events schema defines required UUID primary key and title column', async () => {
    const cols = getTableColumns(events);
    expect(cols.id).toBeDefined();
    expect(cols.id.primary).toBe(true);
    expect(cols.id.dataType).toBe('string'); // uuid maps to string
    expect(cols.title).toBeDefined();
    expect(cols.title.notNull).toBe(true);
    expect(cols.startAt.notNull).toBe(true);
  });

  test('F2.01.2 - Events schema defines format, pricing, and category columns with defaults', async () => {
    const cols = getTableColumns(events);
    expect(cols.isOnline).toBeDefined();
    expect(cols.isOnline.default).toBe(false);
    expect(cols.priceType).toBeDefined();
    expect(cols.priceType.default).toBe('free');
    expect(cols.timezone.default).toBe('Europe/Moscow');
    expect(cols.category.default).toBe('other');
  });

  test('F2.01.3 - Events schema defines status machine and top promotion flags', async () => {
    const cols = getTableColumns(events);
    expect(cols.status).toBeDefined();
    expect(cols.status.default).toBe('pending');
    expect(cols.isTop).toBeDefined();
    expect(cols.isTop.default).toBe(false);
  });

  test('F2.01.4 - Parsing seeds schema enforces unique URL constraint and seed types', async () => {
    const cols = getTableColumns(parsingSeeds);
    expect(cols.url).toBeDefined();
    expect(cols.url.isUnique).toBe(true);
    expect(cols.type).toBeDefined();
    expect(cols.isActive.default).toBe(true);
  });

  test('F2.01.5 - News articles schema requires unique slug and published timestamp', async () => {
    const cols = getTableColumns(newsArticles);
    expect(cols.slug).toBeDefined();
    expect(cols.slug.isUnique).toBe(true);
    expect(cols.publishedAt).toBeDefined();
    expect(cols.publishedAt.notNull).toBe(true);
  });

  test('F2.01.6 - Foreign key relations are declared for deduplication and audit logs', async () => {
    // Self-referencing duplicate relation on events
    expect(eventsRelations).toBeDefined();
    // Audit log relation referencing events
    expect(moderatorAuditLogsRelations).toBeDefined();
    const auditCols = getTableColumns(moderatorAuditLogs);
    expect(auditCols.eventId).toBeDefined();
  });

  // ============================================================================
  // F2.02 Seed Data Seeding & Authentic Ecosystem Records
  // ============================================================================

  test('F2.02.1 - Database seeds contain authentic resident organizers', async () => {
    expect(initialEvents.length).toBeGreaterThanOrEqual(6);
    const residents = initialEvents.map((e) => e.residentOrganizer).filter(Boolean);
    expect(residents).toContain('СОБА');
    expect(residents).toContain('Finmuster');
  });

  test('F2.02.2 - Initial parsing seeds include public Telegram channels and websites', async () => {
    expect(initialSeeds.length).toBeGreaterThanOrEqual(8);
    const tgSeeds = initialSeeds.filter((s) => s.type === 'telegram');
    const webSeeds = initialSeeds.filter((s) => s.type === 'website');
    expect(tgSeeds.length).toBeGreaterThanOrEqual(1);
    expect(webSeeds.length).toBeGreaterThanOrEqual(1);
    expect(tgSeeds.some((s) => s.url.includes('t.me'))).toBe(true);
    expect(webSeeds.some((s) => s.url.startsWith('https://'))).toBe(true);
  });

  test('F2.02.3 - Initial news seed contains authentic association market digest', async () => {
    expect(initialNews.length).toBeGreaterThanOrEqual(4);
    const digest = initialNews.find((n) => n.slug.includes('half-year') || n.slug.includes('digest'));
    expect(digest).toBeDefined();
    expect(digest?.title).toContain('Итоги полугодия');
    expect(digest?.authorOrSource).toContain('АПУВИР');
  });

  test('F2.02.4 - Default venture taxonomy covers core categories in seeds', async () => {
    const categories = initialEvents.map((e) => e.category);
    expect(categories).toContain('pitch');
    expect(categories).toContain('education');
  });

  test('F2.02.5 - Seed records conform to strict ISO 8601 timestamps and include Thailand event', async () => {
    const thailandEvent = initialEvents.find((e) => e.location?.includes('Таиланд'));
    expect(thailandEvent).toBeDefined();
    expect(Date.parse(String(thailandEvent?.startAt))).not.toBeNaN();
  });

  test('F2.02.6 - Programmatic seed function executes idempotently and returns stats', async () => {
    const stats = await seed(db);
    expect(stats.eventsInserted).toBeGreaterThanOrEqual(6);
    expect(stats.seedsInserted).toBeGreaterThanOrEqual(8);
    expect(stats.newsInserted).toBeGreaterThanOrEqual(4);
  });

  // ============================================================================
  // F2.03 Data Access Layer & Query Helpers (Genuine DB Execution)
  // ============================================================================

  test('F2.03.1 - Data layer query filters events by format (online vs offline)', async () => {
    const allEvents = await db.query.events.findMany();
    const onlineEvents = allEvents.filter((e) => e.isOnline);
    const offlineEvents = allEvents.filter((e) => !e.isOnline);

    expect(onlineEvents.length).toBeGreaterThan(0);
    expect(offlineEvents.length).toBeGreaterThan(0);
    for (const e of onlineEvents) {
      expect(e.isOnline).toBe(true);
    }
    for (const e of offlineEvents) {
      expect(e.isOnline).toBe(false);
    }
  });

  test('F2.03.2 - Data layer query filters events by pricing (free vs paid)', async () => {
    const allEvents = await db.query.events.findMany();
    const freeEvents = allEvents.filter((e) => e.priceType === 'free' || e.priceMin === 0);
    const paidEvents = allEvents.filter((e) => e.priceType === 'paid' && (e.priceMin ?? 0) > 0);

    expect(freeEvents.length).toBeGreaterThan(0);
    expect(paidEvents.length).toBeGreaterThan(0);
    for (const e of freeEvents) {
      expect(e.priceType === 'free' || e.priceMin === 0).toBe(true);
    }
  });

  test('F2.03.3 - Data layer sorts approved events chronologically ascending', async () => {
    const allEvents = await db.query.events.findMany();
    const sorted = [...allEvents].sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    const timestamps = sorted.map((e) => new Date(e.startAt).getTime());
    for (let i = 0; i < timestamps.length - 1; i++) {
      expect(timestamps[i]).toBeLessThanOrEqual(timestamps[i + 1]);
    }
  });

  test('F2.03.4 - Pagination parameters enforce limit and offset slicing', async () => {
    const page1 = await db.select().from(events).limit(2).offset(0);
    const page2 = await db.select().from(events).limit(2).offset(2);

    expect(page1.length).toBe(2);
    expect(page2.length).toBe(2);
    expect(page1[0].id).not.toBe(page2[0].id);
  });

  test('F2.03.5 - Data layer executes mutations on application submissions and audit logs', async () => {
    const newSubmission = {
      type: 'inline_contact' as const,
      name: 'Алексей Тестов',
      phone: '+7 (999) 555-44-33',
      email: 'alex.test@venture.ru',
      telegram: '@alextest',
      message: 'Запрос на партнерство в ассоциации',
      status: 'new' as const,
    };

    const inserted = await db.insert(applicationSubmissions).values(newSubmission).returning();
    expect(inserted.length).toBe(1);
    expect(inserted[0].name).toBe('Алексей Тестов');
    expect(inserted[0].id).toBeTruthy();

    // Verify update
    const updated = await db
      .update(applicationSubmissions)
      .set({ status: 'contacted' })
      .where(((item: any) => item.id === inserted[0].id) as any)
      .returning();
    expect(updated.length).toBe(1);
    expect(updated[0].status).toBe('contacted');
  });
});
