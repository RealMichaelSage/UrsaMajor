import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  integer,
  jsonb,
  index,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import type {
  EventCategory,
  PriceType,
  EventStatus,
  SeedType,
  ScrapeStatus,
  NewsStatus,
  SubmissionType,
  SubmissionStatus,
} from '../types';

// ==========================================
// 1. Events Table
// ==========================================

export const events = pgTable(
  'events',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    rawText: text('raw_text'),
    startAt: timestamp('start_at', { withTimezone: true }).notNull(),
    endAt: timestamp('end_at', { withTimezone: true }),
    timezone: varchar('timezone', { length: 50 }).notNull().default('Europe/Moscow'),
    isOnline: boolean('is_online').notNull().default(false),
    location: varchar('location', { length: 255 }),
    venueName: varchar('venue_name', { length: 255 }),
    priceType: varchar('price_type', { length: 20 })
      .$type<PriceType>()
      .notNull()
      .default('free'),
    priceMin: integer('price_min').default(0),
    priceMax: integer('price_max'),
    priceCurrency: varchar('price_currency', { length: 10 })
      .notNull()
      .default('RUB'),
    paymentUrl: text('payment_url'),
    sourceUrl: text('source_url').notNull(),
    imageUrl: text('image_url'),
    category: varchar('category', { length: 50 })
      .$type<EventCategory>()
      .notNull()
      .default('other'),
    targetAudience: jsonb('target_audience')
      .$type<string[]>()
      .notNull()
      .default([]),
    residentOrganizer: varchar('resident_organizer', { length: 255 }),
    status: varchar('status', { length: 20 })
      .$type<EventStatus>()
      .notNull()
      .default('pending'),
    isTop: boolean('is_top').notNull().default(false),
    mergedIntoId: uuid('merged_into_id').references((): any => events.id, {
      onDelete: 'set null',
    }),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    startAtIdx: index('events_start_at_idx').on(table.startAt),
    statusIdx: index('events_status_idx').on(table.status),
    isTopIdx: index('events_is_top_idx').on(table.isTop),
    categoryIdx: index('events_category_idx').on(table.category),
    residentIdx: index('events_resident_idx').on(table.residentOrganizer),
    isOnlineIdx: index('events_is_online_idx').on(table.isOnline),
    priceTypeIdx: index('events_price_type_idx').on(table.priceType),
    mergedIntoIdIdx: index('events_merged_into_id_idx').on(table.mergedIntoId),
  })
);

// ==========================================
// 2. Parsing Seeds Table
// ==========================================

export const parsingSeeds = pgTable(
  'parsing_seeds',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    type: varchar('type', { length: 50 }).$type<SeedType>().notNull(),
    url: text('url').notNull().unique(),
    residentOrganizer: varchar('resident_organizer', { length: 255 }),
    isActive: boolean('is_active').notNull().default(true),
    lastScrapedAt: timestamp('last_scraped_at', { withTimezone: true }),
    scrapeStatus: varchar('scrape_status', { length: 30 })
      .$type<ScrapeStatus>()
      .default('idle'),
    scrapeError: text('scrape_error'),
    rules: jsonb('rules').$type<Record<string, unknown>>().default({}),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    isActiveIdx: index('parsing_seeds_is_active_idx').on(table.isActive),
    typeIdx: index('parsing_seeds_type_idx').on(table.type),
  })
);

// ==========================================
// 3. News Articles Table
// ==========================================

export const newsArticles = pgTable(
  'news_articles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull().unique(),
    summary: text('summary').notNull(),
    content: text('content').notNull(),
    authorOrSource: varchar('author_or_source', { length: 255 })
      .notNull()
      .default('Пресс-служба АПУВИР'),
    publishedAt: timestamp('published_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
    imageUrl: text('image_url'),
    sourceUrl: text('source_url'),
    tags: jsonb('tags').$type<string[]>().notNull().default([]),
    status: varchar('status', { length: 20 })
      .$type<NewsStatus>()
      .notNull()
      .default('published'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    publishedAtIdx: index('news_articles_published_at_idx').on(table.publishedAt),
    statusIdx: index('news_articles_status_idx').on(table.status),
    slugIdx: index('news_articles_slug_idx').on(table.slug),
  })
);

// ==========================================
// 4. Application Submissions Table
// ==========================================

export const applicationSubmissions = pgTable(
  'application_submissions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    type: varchar('type', { length: 50 })
      .$type<SubmissionType>()
      .notNull()
      .default('inline_contact'),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 50 }).notNull(),
    email: varchar('email', { length: 255 }).notNull(),
    telegram: varchar('telegram', { length: 100 }),
    company: varchar('company', { length: 255 }),
    position: varchar('position', { length: 255 }),
    website: text('website'),
    recommendation: text('recommendation'),
    message: text('message'),
    status: varchar('status', { length: 30 })
      .$type<SubmissionStatus>()
      .notNull()
      .default('new'),
    createdAt: timestamp('created_at', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    statusIdx: index('app_submissions_status_idx').on(table.status),
    typeIdx: index('app_submissions_type_idx').on(table.type),
    createdAtIdx: index('app_submissions_created_at_idx').on(table.createdAt),
  })
);

// ==========================================
// 5. Moderator Audit Logs Table
// ==========================================

export const moderatorAuditLogs = pgTable(
  'moderator_audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').references(() => events.id, {
      onDelete: 'set null',
    }),
    action: varchar('action', { length: 50 }).notNull(),
    changedBy: varchar('changed_by', { length: 255 }).notNull(),
    oldValue: jsonb('old_value').$type<Record<string, unknown>>(),
    newValue: jsonb('new_value').$type<Record<string, unknown>>(),
    timestamp: timestamp('timestamp', { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    eventIdIdx: index('audit_logs_event_id_idx').on(table.eventId),
    timestampIdx: index('audit_logs_timestamp_idx').on(table.timestamp),
  })
);

// ==========================================
// Relations
// ==========================================

export const eventsRelations = relations(events, ({ one, many }) => ({
  mergedInto: one(events, {
    fields: [events.mergedIntoId],
    references: [events.id],
    relationName: 'eventDuplicates',
  }),
  duplicates: many(events, {
    relationName: 'eventDuplicates',
  }),
  auditLogs: many(moderatorAuditLogs),
}));

export const moderatorAuditLogsRelations = relations(
  moderatorAuditLogs,
  ({ one }) => ({
    event: one(events, {
      fields: [moderatorAuditLogs.eventId],
      references: [events.id],
    }),
  })
);

// ==========================================
// Inferred TypeScript Types
// ==========================================

export type EventRecord = typeof events.$inferSelect;
export type NewEventRecord = typeof events.$inferInsert;

export type ParsingSeedRecord = typeof parsingSeeds.$inferSelect;
export type NewParsingSeedRecord = typeof parsingSeeds.$inferInsert;

export type NewsArticleRecord = typeof newsArticles.$inferSelect;
export type NewNewsArticleRecord = typeof newsArticles.$inferInsert;

export type ApplicationSubmissionRecord =
  typeof applicationSubmissions.$inferSelect;
export type NewApplicationSubmissionRecord =
  typeof applicationSubmissions.$inferInsert;

export type ModeratorAuditLogRecord = typeof moderatorAuditLogs.$inferSelect;
export type NewModeratorAuditLogRecord = typeof moderatorAuditLogs.$inferInsert;
