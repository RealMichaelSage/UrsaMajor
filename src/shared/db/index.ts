import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';
import { initialEvents, initialSeeds, initialNews } from './seed';
import type {
  EventRecord,
  ParsingSeedRecord,
  NewsArticleRecord,
  ApplicationSubmissionRecord,
  ModeratorAuditLogRecord,
} from './schema';

// Re-export all schema tables, relations, and types
export * from './schema';
export * from './seed';

const connectionString = process.env.DATABASE_URL;

// ============================================================================
// In-Memory Mock Database Store (Resilient Fallback for Build, CI & Local Dev)
// ============================================================================

export interface MockDbState {
  events: EventRecord[];
  parsingSeeds: ParsingSeedRecord[];
  newsArticles: NewsArticleRecord[];
  applicationSubmissions: ApplicationSubmissionRecord[];
  moderatorAuditLogs: ModeratorAuditLogRecord[];
}

function createInitialMockState(): MockDbState {
  return {
    events: initialEvents.map((e) => ({
      id: e.id || crypto.randomUUID(),
      title: e.title,
      description: e.description ?? null,
      rawText: e.rawText ?? null,
      startAt: e.startAt instanceof Date ? e.startAt : new Date(e.startAt),
      endAt: e.endAt ? (e.endAt instanceof Date ? e.endAt : new Date(e.endAt)) : null,
      timezone: e.timezone ?? 'Europe/Moscow',
      isOnline: e.isOnline ?? false,
      location: e.location ?? null,
      venueName: e.venueName ?? null,
      priceType: e.priceType ?? 'free',
      priceMin: e.priceMin ?? 0,
      priceMax: e.priceMax ?? null,
      priceCurrency: e.priceCurrency ?? 'RUB',
      paymentUrl: e.paymentUrl ?? null,
      sourceUrl: e.sourceUrl,
      imageUrl: e.imageUrl ?? null,
      category: e.category ?? 'other',
      targetAudience: e.targetAudience ?? [],
      residentOrganizer: e.residentOrganizer ?? null,
      status: e.status ?? 'approved',
      isTop: e.isTop ?? false,
      mergedIntoId: e.mergedIntoId ?? null,
      createdAt: e.createdAt instanceof Date ? e.createdAt : new Date(),
      updatedAt: e.updatedAt instanceof Date ? e.updatedAt : new Date(),
    })),
    parsingSeeds: initialSeeds.map((s) => ({
      id: s.id || crypto.randomUUID(),
      name: s.name,
      type: s.type,
      url: s.url,
      residentOrganizer: s.residentOrganizer ?? null,
      isActive: s.isActive ?? true,
      lastScrapedAt: s.lastScrapedAt ? new Date(s.lastScrapedAt) : null,
      scrapeStatus: s.scrapeStatus ?? 'idle',
      scrapeError: s.scrapeError ?? null,
      rules: s.rules ?? {},
      createdAt: s.createdAt instanceof Date ? s.createdAt : new Date(),
    })),
    newsArticles: initialNews.map((n) => ({
      id: n.id || crypto.randomUUID(),
      title: n.title,
      slug: n.slug,
      summary: n.summary,
      content: n.content,
      authorOrSource: n.authorOrSource ?? 'Пресс-служба АПУВИР',
      publishedAt: n.publishedAt
        ? n.publishedAt instanceof Date
          ? n.publishedAt
          : new Date(n.publishedAt)
        : new Date(),
      imageUrl: n.imageUrl ?? null,
      sourceUrl: n.sourceUrl ?? null,
      tags: n.tags ?? [],
      status: n.status ?? 'published',
      createdAt: n.createdAt instanceof Date ? n.createdAt : new Date(),
    })),
    applicationSubmissions: [],
    moderatorAuditLogs: [],
  };
}

let mockStore: MockDbState = createInitialMockState();

export function resetMockDb(): void {
  mockStore = createInitialMockState();
}

export function getMockDbState(): MockDbState {
  return mockStore;
}

// Helper to determine which collection a table corresponds to
function getStoreForTable(table: unknown): any[] {
  if (table === schema.events || (table as any)?._?.name === 'events') {
    return mockStore.events;
  }
  if (table === schema.parsingSeeds || (table as any)?._?.name === 'parsing_seeds') {
    return mockStore.parsingSeeds;
  }
  if (table === schema.newsArticles || (table as any)?._?.name === 'news_articles') {
    return mockStore.newsArticles;
  }
  if (
    table === schema.applicationSubmissions ||
    (table as any)?._?.name === 'application_submissions'
  ) {
    return mockStore.applicationSubmissions;
  }
  if (
    table === schema.moderatorAuditLogs ||
    (table as any)?._?.name === 'moderator_audit_logs'
  ) {
    return mockStore.moderatorAuditLogs;
  }
  return mockStore.events;
}

function evaluateDrizzleSql(sqlObj: any, item: any): boolean {
  if (!sqlObj) return true;
  if (typeof sqlObj === 'function') {
    try {
      return Boolean(sqlObj(item));
    } catch {
      return true;
    }
  }
  if (!sqlObj.queryChunks || !Array.isArray(sqlObj.queryChunks)) {
    return true;
  }

  const chunks = sqlObj.queryChunks;
  const subSqls: any[] = [];
  let hasOr = false;

  for (const chunk of chunks) {
    if (chunk && chunk.queryChunks) {
      subSqls.push(chunk);
    } else if (chunk && chunk.value && Array.isArray(chunk.value)) {
      const text = chunk.value.join('').toLowerCase();
      if (text.includes(' or ')) hasOr = true;
    }
  }

  if (subSqls.length > 0) {
    if (hasOr) {
      return subSqls.some((s) => evaluateDrizzleSql(s, item));
    }
    return subSqls.every((s) => evaluateDrizzleSql(s, item));
  }

  let colName: string | null = null;
  let op = '=';
  let targetVal: any = undefined;
  let hasTargetVal = false;

  for (const chunk of chunks) {
    if (
      chunk &&
      (chunk.dataType || chunk.columnType || chunk.name) &&
      typeof chunk.name === 'string'
    ) {
      colName = chunk.name;
    } else if (chunk && chunk.value && Array.isArray(chunk.value)) {
      const text = chunk.value.join('').trim().toLowerCase();
      if (text.includes('>=')) op = '>=';
      else if (text.includes('<=')) op = '<=';
      else if (text.includes('!=')) op = '!=';
      else if (text.includes('>')) op = '>';
      else if (text.includes('<')) op = '<';
      else if (text.includes('=')) op = '=';
      else if (text.includes('is null')) op = 'is null';
      else if (text.includes('is not null')) op = 'is not null';
      else if (text.includes('like') || text.includes('ilike')) op = 'like';
    } else if (chunk && chunk.value !== undefined && 'encoder' in chunk) {
      targetVal = chunk.value;
      hasTargetVal = true;
    }
  }

  if (!colName) return true;

  let val = item[colName];
  if (val === undefined) {
    const camel = colName.replace(/_([a-z])/g, (_, g) => g.toUpperCase());
    val = item[camel];
  }

  if (op === '=' && hasTargetVal) return val === targetVal;
  if (op === '!=' && hasTargetVal) return val !== targetVal;
  if (op === '>=' && hasTargetVal) return val >= targetVal;
  if (op === '<=' && hasTargetVal) return val <= targetVal;
  if (op === '>' && hasTargetVal) return val > targetVal;
  if (op === '<' && hasTargetVal) return val < targetVal;
  if (op === 'is null') return val === null || val === undefined;
  if (op === 'is not null') return val !== null && val !== undefined;
  if (op === 'like' && typeof val === 'string' && typeof targetVal === 'string') {
    const cleanPattern = targetVal.replace(/%/g, '.*');
    return new RegExp(cleanPattern, 'i').test(val);
  }

  return true;
}

function buildMockQueryBuilder(table: unknown) {
  let whereFn: ((item: any) => boolean) | null = null;
  let limitVal: number | null = null;
  let offsetVal: number | null = null;

  const builder: any = {
    where: (clause: any) => {
      if (typeof clause === 'function') {
        whereFn = clause;
      } else if (clause && typeof clause === 'object') {
        whereFn = (item: any) => evaluateDrizzleSql(clause, item);
      }
      return builder;
    },
    orderBy: (..._args: any[]) => {
      return builder;
    },
    limit: (l: number) => {
      limitVal = l;
      return builder;
    },
    offset: (o: number) => {
      offsetVal = o;
      return builder;
    },
    then: (resolve: (val: any) => any, reject?: (err: any) => any) => {
      try {
        const store = getStoreForTable(table);
        let results = [...store];
        if (whereFn) {
          try {
            results = results.filter(whereFn);
          } catch {
            // Keep all if filter failed in mock
          }
        }
        if (offsetVal) {
          results = results.slice(offsetVal);
        }
        if (limitVal !== null) {
          results = results.slice(0, limitVal);
        }
        return Promise.resolve(results).then(resolve, reject);
      } catch (err) {
        if (reject) return reject(err);
        throw err;
      }
    },
  };

  return builder;
}

function buildMockInsertBuilder(table: unknown) {
  let valuesToInsert: any[] = [];

  const builder: any = {
    values: (vals: any) => {
      valuesToInsert = Array.isArray(vals) ? vals : [vals];
      return builder;
    },
    onConflictDoNothing: (_opts?: any) => {
      return builder;
    },
    onConflictDoUpdate: (_opts?: any) => {
      return builder;
    },
    returning: () => {
      return builder;
    },
    then: (resolve: (val: any) => any, reject?: (err: any) => any) => {
      try {
        const store = getStoreForTable(table);
        const inserted: any[] = [];
        for (const item of valuesToInsert) {
          const isAppSub =
            table === schema.applicationSubmissions ||
            (table as any)?._?.name === 'application_submissions';
          const isSeed =
            table === schema.parsingSeeds ||
            (table as any)?._?.name === 'parsing_seeds';
          const isNews =
            table === schema.newsArticles ||
            (table as any)?._?.name === 'news_articles';

          const newItem = {
            id: item.id || crypto.randomUUID(),
            timezone: item.timezone ?? 'Europe/Moscow',
            isOnline: item.isOnline ?? false,
            priceType: item.priceType ?? 'free',
            priceMin: item.priceMin ?? 0,
            priceCurrency: item.priceCurrency ?? 'RUB',
            category: item.category ?? 'other',
            targetAudience: item.targetAudience ?? [],
            status: item.status ?? (isAppSub ? 'new' : isNews ? 'published' : 'pending'),
            isTop: item.isTop ?? false,
            isActive: item.isActive ?? true,
            scrapeStatus: item.scrapeStatus ?? 'idle',
            ...item,
            createdAt: item.createdAt || new Date(),
            updatedAt: item.updatedAt || new Date(),
          };
          store.push(newItem);
          inserted.push(newItem);
        }
        return Promise.resolve(inserted).then(resolve, reject);
      } catch (err) {
        if (reject) return reject(err);
        throw err;
      }
    },
  };

  return builder;
}

function buildMockUpdateBuilder(table: unknown) {
  let setVals: any = {};
  let whereFn: ((item: any) => boolean) | null = null;

  const builder: any = {
    set: (vals: any) => {
      setVals = vals;
      return builder;
    },
    where: (clause: any) => {
      if (typeof clause === 'function') {
        whereFn = clause;
      }
      return builder;
    },
    returning: () => {
      return builder;
    },
    then: (resolve: (val: any) => any, reject?: (err: any) => any) => {
      try {
        const store = getStoreForTable(table);
        const updated: any[] = [];
        for (let i = 0; i < store.length; i++) {
          const item = store[i];
          let matches = true;
          if (whereFn) {
            try {
              matches = whereFn(item);
            } catch {
              matches = false;
            }
          }
          if (matches) {
            store[i] = {
              ...item,
              ...setVals,
              updatedAt: new Date(),
            };
            updated.push(store[i]);
          }
        }
        return Promise.resolve(updated).then(resolve, reject);
      } catch (err) {
        if (reject) return reject(err);
        throw err;
      }
    },
  };

  return builder;
}

function buildMockDeleteBuilder(table: unknown) {
  let whereFn: ((item: any) => boolean) | null = null;

  const builder: any = {
    where: (clause: any) => {
      if (typeof clause === 'function') {
        whereFn = clause;
      }
      return builder;
    },
    returning: () => {
      return builder;
    },
    then: (resolve: (val: any) => any, reject?: (err: any) => any) => {
      try {
        const store = getStoreForTable(table);
        const deleted: any[] = [];
        for (let i = store.length - 1; i >= 0; i--) {
          const item = store[i];
          let matches = true;
          if (whereFn) {
            try {
              matches = whereFn(item);
            } catch {
              matches = false;
            }
          }
          if (matches) {
            deleted.push(item);
            store.splice(i, 1);
          }
        }
        return Promise.resolve(deleted).then(resolve, reject);
      } catch (err) {
        if (reject) return reject(err);
        throw err;
      }
    },
  };

  return builder;
}

const mockRelationalOperators = {
  eq: (col: any, val: any) => ({
    type: 'eq',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
    val,
  }),
  ne: (col: any, val: any) => ({
    type: 'ne',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
    val,
  }),
  gt: (col: any, val: any) => ({
    type: 'gt',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
    val,
  }),
  gte: (col: any, val: any) => ({
    type: 'gte',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
    val,
  }),
  lt: (col: any, val: any) => ({
    type: 'lt',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
    val,
  }),
  lte: (col: any, val: any) => ({
    type: 'lte',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
    val,
  }),
  and: (...conds: any[]) => ({ type: 'and', conds }),
  or: (...conds: any[]) => ({ type: 'or', conds }),
  isNull: (col: any) => ({
    type: 'isNull',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
  }),
  isNotNull: (col: any) => ({
    type: 'isNotNull',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
  }),
  inArray: (col: any, vals: any[]) => ({
    type: 'inArray',
    col: typeof col === 'object' && col?.name ? col.name : String(col),
    vals,
  }),
};

function evaluateRelationalExpr(expr: any, item: any): boolean {
  if (!expr) return true;
  if (typeof expr === 'boolean') return expr;
  if (expr.type === 'eq') {
    const val =
      item[expr.col] !== undefined
        ? item[expr.col]
        : item[expr.col.replace(/_([a-z])/g, (_: any, g: string) => g.toUpperCase())];
    return val === expr.val;
  }
  if (expr.type === 'ne') {
    const val =
      item[expr.col] !== undefined
        ? item[expr.col]
        : item[expr.col.replace(/_([a-z])/g, (_: any, g: string) => g.toUpperCase())];
    return val !== expr.val;
  }
  if (expr.type === 'gte') {
    const val =
      item[expr.col] !== undefined
        ? item[expr.col]
        : item[expr.col.replace(/_([a-z])/g, (_: any, g: string) => g.toUpperCase())];
    return val >= expr.val;
  }
  if (expr.type === 'lte') {
    const val =
      item[expr.col] !== undefined
        ? item[expr.col]
        : item[expr.col.replace(/_([a-z])/g, (_: any, g: string) => g.toUpperCase())];
    return val <= expr.val;
  }
  if (expr.type === 'and') {
    return expr.conds.every((c: any) => evaluateRelationalExpr(c, item));
  }
  if (expr.type === 'or') {
    return expr.conds.some((c: any) => evaluateRelationalExpr(c, item));
  }
  if (expr.type === 'isNull') {
    const val =
      item[expr.col] !== undefined
        ? item[expr.col]
        : item[expr.col.replace(/_([a-z])/g, (_: any, g: string) => g.toUpperCase())];
    return val === null || val === undefined;
  }
  if (expr.type === 'isNotNull') {
    const val =
      item[expr.col] !== undefined
        ? item[expr.col]
        : item[expr.col.replace(/_([a-z])/g, (_: any, g: string) => g.toUpperCase())];
    return val !== null && val !== undefined;
  }
  if (expr.queryChunks) {
    return evaluateDrizzleSql(expr, item);
  }
  return true;
}

function createMockRelationalQuery(storeGetter: () => any[]) {
  const runner = {
    findMany: async (opts?: any) => {
      let items = [...storeGetter()];
      if (opts?.where) {
        if (typeof opts.where === 'function') {
          try {
            const fieldsProxy = new Proxy(
              {},
              {
                get: (_target, prop) => String(prop),
              }
            );
            const result = opts.where(fieldsProxy, mockRelationalOperators);
            if (result && typeof result === 'object') {
              items = items.filter((item) => evaluateRelationalExpr(result, item));
            } else if (typeof result === 'boolean') {
              items = items.filter((item) => opts.where(item));
            }
          } catch {
            try {
              items = items.filter(opts.where);
            } catch {
              // keep all
            }
          }
        } else if (typeof opts.where === 'object') {
          items = items.filter((item) => evaluateDrizzleSql(opts.where, item));
        }
      }
      if (opts?.offset) {
        items = items.slice(opts.offset);
      }
      if (opts?.limit !== undefined && opts?.limit !== null) {
        items = items.slice(0, opts.limit);
      }
      if (opts?.with) {
        items = items.map((item) => {
          const enriched = { ...item };
          if (opts.with.duplicates) {
            enriched.duplicates = mockStore.events.filter(
              (e) => e.mergedIntoId === item.id
            );
          }
          if (opts.with.mergedInto) {
            enriched.mergedInto = item.mergedIntoId
              ? mockStore.events.find((e) => e.id === item.mergedIntoId) || null
              : null;
          }
          if (opts.with.event) {
            enriched.event = item.eventId
              ? mockStore.events.find((e) => e.id === item.eventId) || null
              : null;
          }
          return enriched;
        });
      }
      return items;
    },
    findFirst: async (opts?: any) => {
      const results = await runner.findMany({ ...opts, limit: 1 });
      return results[0] || null;
    },
  };
  return runner;
}

function createMockDrizzleInstance(): NodePgDatabase<typeof schema> {
  const mockDb: any = {
    select: (_fields?: any) => ({
      from: (table: any) => buildMockQueryBuilder(table),
    }),
    insert: (table: any) => buildMockInsertBuilder(table),
    update: (table: any) => buildMockUpdateBuilder(table),
    delete: (table: any) => buildMockDeleteBuilder(table),
    execute: async (_query: any) => {
      return { rows: [] };
    },
    query: {
      events: createMockRelationalQuery(() => mockStore.events),
      parsingSeeds: createMockRelationalQuery(() => mockStore.parsingSeeds),
      newsArticles: createMockRelationalQuery(() => mockStore.newsArticles),
      applicationSubmissions: createMockRelationalQuery(
        () => mockStore.applicationSubmissions
      ),
      moderatorAuditLogs: createMockRelationalQuery(
        () => mockStore.moderatorAuditLogs
      ),
    },
    _isMock: true,
  };

  return mockDb as NodePgDatabase<typeof schema>;
}

// Dummy pool for mock environment
function createMockPool(): Pool {
  const dummy: any = {
    connect: async () => ({
      query: async () => ({ rows: [] }),
      release: () => {},
    }),
    query: async () => ({ rows: [] }),
    end: async () => {},
    on: () => dummy,
  };
  return dummy as Pool;
}

// ============================================================================
// Database & Connection Pool Initialization
// ============================================================================

export const isMockDb = !connectionString || connectionString === 'mock';

export let pool: Pool;
export let db: NodePgDatabase<typeof schema>;

if (!isMockDb && connectionString) {
  try {
    pool = new Pool({
      connectionString,
      max: process.env.NODE_ENV === 'production' ? 20 : 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    pool.on('error', (err) => {
      console.error('[UrsaMajor DB] Unexpected error on idle PostgreSQL pool client:', err);
    });

    db = drizzle(pool, { schema });
  } catch (error) {
    console.warn(
      '[UrsaMajor DB] Failed to initialize PostgreSQL pool with DATABASE_URL, falling back to in-memory store:',
      error
    );
    pool = createMockPool();
    db = createMockDrizzleInstance();
  }
} else {
  // Safe in-memory fallback for Build, CI, or local development without DATABASE_URL
  pool = createMockPool();
  db = createMockDrizzleInstance();
}

/**
 * Returns active database instance (either real PostgreSQL Drizzle or in-memory fallback)
 */
export function getDb(): NodePgDatabase<typeof schema> {
  return db;
}
