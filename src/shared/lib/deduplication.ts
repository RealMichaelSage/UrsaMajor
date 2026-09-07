import { db } from '../db';
import { events } from '../db/schema';
import { eq, sql, or, and, isNotNull } from 'drizzle-orm';
import crypto from 'crypto';

export interface DeduplicationResult {
  action: 'skip' | 'merge' | 'create_new'; // 'skip' = exact URL exists, 'merge' = duplicate of existing event, 'create_new' = unique event
  duplicateOfId: string | null;
  similarity: number;
  inheritedImageUrl?: string | null;
}

export interface EventCheckData {
  title: string;
  city?: string | null;
  eventDate: Date | string;
  sourceUrl: string;
  place?: string | null;
  address?: string | null;
  imageUrl?: string | null;
}

/**
 * Trigram similarity computation matching PostgreSQL pg_trgm algorithm.
 * Generates trigrams with leading double-space and trailing single-space padding,
 * then returns intersection / union ratio.
 */
export function calculateTrigramSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  const s1 = `  ${str1.toLowerCase().trim()} `;
  const s2 = `  ${str2.toLowerCase().trim()} `;

  const getTrigrams = (str: string): Set<string> => {
    const trigrams = new Set<string>();
    for (let i = 0; i < str.length - 2; i++) {
      trigrams.add(str.substring(i, i + 3));
    }
    return trigrams;
  };

  const set1 = getTrigrams(s1);
  const set2 = getTrigrams(s2);

  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) {
      intersection++;
    }
  }

  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * Generates deterministic MD5 checksum from normalized title and date
 */
export function generateEventHash(title: string, eventDate: Date | string): string {
  const normTitle = title.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const d = eventDate instanceof Date ? eventDate : new Date(eventDate);
  const dateKey = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : String(eventDate);
  return crypto.createHash('md5').update(`${normTitle}|${dateKey}`).digest('hex');
}

/**
 * Checks if a candidate event is a duplicate of an existing event in the database.
 * Supports both PostgreSQL pg_trgm similarity queries and in-memory fallback.
 *
 * Matching Priority:
 * 1. Exact Time + Location Similarity > 0.5 + Title Similarity > 0.15
 * 2. Same Calendar Day (Europe/Moscow) + Title Similarity >= 0.40
 * 3. Same Calendar Day + Same Source URL + Title Similarity > 0.30
 * 4. Exact Hash Checksum
 */
export async function checkDuplicate(
  event: EventCheckData
): Promise<DeduplicationResult> {
  const eventDateObj = event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate);
  const validDate = !isNaN(eventDateObj.getTime()) ? eventDateObj : new Date();
  const eventDateIso = validDate.toISOString();
  const eventLocationStr = `${event.place || ''} ${event.address || ''}`.trim();
  const newHash = generateEventHash(event.title, validDate);

  // Try real PostgreSQL query with pg_trgm if active database supports it
  try {
    const isMock = (db as any)._isMock;
    if (!isMock) {
      const exactTimeCondition = sql`DATE_TRUNC('minute', ${events.startAt} AT TIME ZONE 'Europe/Moscow') = DATE_TRUNC('minute', ${eventDateIso}::timestamptz AT TIME ZONE 'Europe/Moscow')`;
      const locationSimilarity = eventLocationStr
        ? sql`similarity(COALESCE(${events.venueName}, '') || ' ' || COALESCE(${events.location}, ''), ${eventLocationStr}) > 0.5`
        : sql`false`;

      const priority1 = and(
        exactTimeCondition,
        locationSimilarity,
        sql`similarity(${events.title}, ${event.title}) > 0.15`
      );

      const dateOnlyCondition = sql`DATE(${events.startAt} AT TIME ZONE 'Europe/Moscow') = DATE(${eventDateIso}::timestamptz AT TIME ZONE 'Europe/Moscow')`;

      const priority2 = and(
        dateOnlyCondition,
        sql`similarity(${events.title}, ${event.title}) >= 0.4`
      );

      const priority3 = and(
        dateOnlyCondition,
        isNotNull(events.sourceUrl),
        eq(events.sourceUrl, event.sourceUrl),
        sql`similarity(${events.title}, ${event.title}) > 0.3`
      );

      const query = db
        .select({
          id: events.id,
          mergedIntoId: events.mergedIntoId,
          sim: sql<number>`similarity(${events.title}, ${event.title})`,
          sourceUrl: events.sourceUrl,
          imageUrl: events.imageUrl,
        })
        .from(events)
        .where(or(priority1, priority2, priority3))
        .orderBy(sql`similarity(${events.title}, ${event.title}) DESC`)
        .limit(1);

      const results = await query;
      if (results.length > 0) {
        const match = results[0];
        const parentId = match.mergedIntoId || match.id;
        const similarity = Number(match.sim) || 0.8;

        if (match.sourceUrl === event.sourceUrl) {
          return {
            action: 'skip',
            duplicateOfId: parentId,
            similarity,
          };
        }

        // Inheritance: if canonical event lacks image and candidate has one, inherit it
        let inheritedImageUrl: string | null = null;
        if (!match.imageUrl && event.imageUrl) {
          inheritedImageUrl = event.imageUrl;
          await db
            .update(events)
            .set({ imageUrl: event.imageUrl })
            .where(eq(events.id, parentId));
        }

        return {
          action: 'merge',
          duplicateOfId: parentId,
          similarity,
          inheritedImageUrl,
        };
      }
    }
  } catch (dbError) {
    // If pg_trgm is not installed or error occurs, gracefully fall through to in-memory check
    console.warn('[Deduplication] PostgreSQL pg_trgm query bypassed, using in-memory matcher:', dbError);
  }

  // In-Memory or Fallback Multi-Tier Fuzzy Matching
  try {
    const candidateDay = validDate.toISOString().slice(0, 10);
    const candidateTimeMin = Math.floor(validDate.getTime() / 60000);

    // Fetch existing events to check
    const existingList = await db.query.events.findMany({
      limit: 200,
    });

    let bestMatch: {
      id: string;
      mergedIntoId: string | null;
      sourceUrl: string;
      imageUrl: string | null;
      sim: number;
    } | null = null;

    for (const item of existingList) {
      const itemDate = item.startAt instanceof Date ? item.startAt : new Date(item.startAt);
      const itemDay = !isNaN(itemDate.getTime()) ? itemDate.toISOString().slice(0, 10) : '';
      const itemTimeMin = !isNaN(itemDate.getTime()) ? Math.floor(itemDate.getTime() / 60000) : 0;

      // Exact title and date match
      const itemHash = generateEventHash(item.title, itemDate);
      if (itemHash === newHash) {
        bestMatch = {
          id: item.id,
          mergedIntoId: item.mergedIntoId,
          sourceUrl: item.sourceUrl,
          imageUrl: item.imageUrl,
          sim: 1.0,
        };
        break;
      }

      // Exact source URL
      if (item.sourceUrl && item.sourceUrl === event.sourceUrl && itemDay === candidateDay) {
        bestMatch = {
          id: item.id,
          mergedIntoId: item.mergedIntoId,
          sourceUrl: item.sourceUrl,
          imageUrl: item.imageUrl,
          sim: 1.0,
        };
        break;
      }

      const titleSim = calculateTrigramSimilarity(item.title, event.title);

      // Priority 1: Exact minute + location similarity > 0.5 + title similarity > 0.15
      if (Math.abs(itemTimeMin - candidateTimeMin) <= 1 && eventLocationStr) {
        const itemLocationStr = `${item.venueName || ''} ${item.location || ''}`.trim();
        const locSim = calculateTrigramSimilarity(itemLocationStr, eventLocationStr);
        if (locSim > 0.5 && titleSim > 0.15) {
          if (!bestMatch || titleSim > bestMatch.sim) {
            bestMatch = {
              id: item.id,
              mergedIntoId: item.mergedIntoId,
              sourceUrl: item.sourceUrl,
              imageUrl: item.imageUrl,
              sim: titleSim,
            };
          }
        }
      }

      // Priority 2: Same calendar day + title similarity >= 0.4
      if (itemDay === candidateDay && titleSim >= 0.4) {
        if (!bestMatch || titleSim > bestMatch.sim) {
          bestMatch = {
            id: item.id,
            mergedIntoId: item.mergedIntoId,
            sourceUrl: item.sourceUrl,
            imageUrl: item.imageUrl,
            sim: titleSim,
          };
        }
      }
    }

    if (bestMatch) {
      const parentId = bestMatch.mergedIntoId || bestMatch.id;

      if (bestMatch.sourceUrl === event.sourceUrl) {
        return {
          action: 'skip',
          duplicateOfId: parentId,
          similarity: bestMatch.sim,
        };
      }

      let inheritedImageUrl: string | null = null;
      if (!bestMatch.imageUrl && event.imageUrl) {
        inheritedImageUrl = event.imageUrl;
        await db
          .update(events)
          .set({ imageUrl: event.imageUrl })
          .where(eq(events.id, parentId));
      }

      return {
        action: 'merge',
        duplicateOfId: parentId,
        similarity: bestMatch.sim,
        inheritedImageUrl,
      };
    }
  } catch (err) {
    console.error('[Deduplication] Error during fallback duplicate check:', err);
  }

  // Unique event
  return {
    action: 'create_new',
    duplicateOfId: null,
    similarity: 0,
  };
}
