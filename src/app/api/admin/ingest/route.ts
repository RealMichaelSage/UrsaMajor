import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/db';
import { events, parsingSeeds, moderatorAuditLogs } from '@/shared/db/schema';
import { eq, inArray } from 'drizzle-orm';
import { scrapeUrl, ScrapedPost } from '@/shared/lib/scraper';
import { extractEventsFromPostBatch, PostItem } from '@/shared/lib/gemini';
import { checkDuplicate } from '@/shared/lib/deduplication';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * POST /api/admin/ingest:
 * Manual scraping trigger ("Спарсить сейчас")
 * Fetches active seeds from `parsing_seeds`, scrapes posts, runs Gemini extraction,
 * normalizes, deduplicates, and inserts new events into database with status: 'pending'.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const jobId = crypto.randomUUID();

  try {
    let body: { seedId?: string } = {};
    try {
      body = await req.json();
    } catch {
      // Body is optional
    }

    // 1. Fetch active seed(s) to process
    let targetSeeds: any[] = [];
    if (body.seedId) {
      targetSeeds = await db.query.parsingSeeds.findMany({
        where: (seeds: any, { eq }: any) => eq(seeds.id, body.seedId),
      });
    } else {
      targetSeeds = await db.query.parsingSeeds.findMany({
        where: (seeds: any, { eq }: any) => eq(seeds.isActive, true),
      });
    }

    // Fallback to any seeds if none marked active
    if (targetSeeds.length === 0) {
      targetSeeds = await db.query.parsingSeeds.findMany({ limit: 10 });
    }

    if (targetSeeds.length === 0) {
      return NextResponse.json({
        success: true,
        jobId,
        message: 'Нет настроенных источников для парсинга',
        scrapedCount: 0,
        eventsCreated: 0,
        eventsUpdated: 0,
        duplicatesFiltered: 0,
        durationMs: Date.now() - startTime,
      });
    }

    let totalScrapedPosts = 0;
    let totalEventsCreated = 0;
    let totalDuplicatesFiltered = 0;
    let totalEventsUpdated = 0;

    for (const seed of targetSeeds) {
      // Update status to running
      try {
        await db
          .update(parsingSeeds)
          .set({ scrapeStatus: 'running' })
          .where(eq(parsingSeeds.id, seed.id));
      } catch {}

      let rawPosts: ScrapedPost[] = [];
      try {
        rawPosts = await scrapeUrl(seed.url, seed.type, {
          rules: seed.rules as any,
        });
      } catch (scrapeErr: any) {
        console.error(`[Admin Ingest] Error scraping seed "${seed.name}" (${seed.url}):`, scrapeErr);
        try {
          await db
            .update(parsingSeeds)
            .set({
              scrapeStatus: 'failed',
              scrapeError: scrapeErr?.message || String(scrapeErr),
            })
            .where(eq(parsingSeeds.id, seed.id));
        } catch {}
        continue;
      }

      totalScrapedPosts += rawPosts.length;

      if (rawPosts.length === 0) {
        try {
          await db
            .update(parsingSeeds)
            .set({
              lastScrapedAt: new Date(),
              scrapeStatus: 'idle',
            })
            .where(eq(parsingSeeds.id, seed.id));
        } catch {}
        continue;
      }

      // Prepare posts for batch extraction
      const postItems: PostItem[] = rawPosts.map((p) => ({
        id: p.id,
        text: p.text,
        sourceUrl: p.sourceUrl || seed.url,
        imageUrl: p.imageUrl,
        date: p.date,
        categoryHint: seed.categoryHint,
        residentOrganizer: seed.residentOrganizer,
      }));

      // Run batch extraction
      const extractedEvents = await extractEventsFromPostBatch(postItems, {
        residentOrganizer: seed.residentOrganizer,
      });

      let seedEventsCreated = 0;

      for (const event of extractedEvents) {
        if (!event.isValidEvent || !event.startAt) {
          continue;
        }

        const rawPost = postItems.find((p) => p.id === event.postId);

        // Run deduplication check
        const dedupResult = await checkDuplicate({
          title: event.title,
          city: event.city,
          eventDate: event.startAt,
          sourceUrl: event.sourceUrl || seed.url,
          place: event.venueName,
          address: event.location,
          imageUrl: event.imageUrl,
        });

        if (dedupResult.action === 'skip') {
          totalDuplicatesFiltered++;
          continue;
        }

        const startAtDate = new Date(event.startAt);
        const endAtDate = event.endAt ? new Date(event.endAt) : null;

        if (dedupResult.action === 'merge') {
          // Insert as pending merged child linked to canonical event
          await db.insert(events).values({
            title: event.title,
            description: event.description,
            rawText: rawPost?.text || null,
            startAt: startAtDate,
            endAt: endAtDate,
            timezone: event.timezone || 'Europe/Moscow',
            isOnline: event.isOnline,
            location: event.location,
            venueName: event.venueName,
            priceType: event.priceType,
            priceMin: event.priceMin || 0,
            priceMax: event.priceMax,
            priceCurrency: event.priceCurrency || 'RUB',
            paymentUrl: event.paymentUrl,
            sourceUrl: event.sourceUrl || seed.url,
            imageUrl: event.imageUrl,
            category: event.category,
            targetAudience: event.targetAudience,
            residentOrganizer: event.residentOrganizer || seed.residentOrganizer,
            status: 'pending',
            isTop: false,
            mergedIntoId: dedupResult.duplicateOfId,
          });

          totalDuplicatesFiltered++;
          totalEventsUpdated++;
        } else {
          // Create new independent pending event
          await db.insert(events).values({
            title: event.title,
            description: event.description,
            rawText: rawPost?.text || null,
            startAt: startAtDate,
            endAt: endAtDate,
            timezone: event.timezone || 'Europe/Moscow',
            isOnline: event.isOnline,
            location: event.location,
            venueName: event.venueName,
            priceType: event.priceType,
            priceMin: event.priceMin || 0,
            priceMax: event.priceMax,
            priceCurrency: event.priceCurrency || 'RUB',
            paymentUrl: event.paymentUrl,
            sourceUrl: event.sourceUrl || seed.url,
            imageUrl: event.imageUrl,
            category: event.category,
            targetAudience: event.targetAudience,
            residentOrganizer: event.residentOrganizer || seed.residentOrganizer,
            status: 'pending',
            isTop: false,
            mergedIntoId: null,
          });

          seedEventsCreated++;
          totalEventsCreated++;
        }
      }

      // Update seed record with success
      try {
        const currentRules = (seed.rules as Record<string, unknown>) || {};
        await db
          .update(parsingSeeds)
          .set({
            lastScrapedAt: new Date(),
            scrapeStatus: 'success',
            scrapeError: null,
            rules: {
              ...currentRules,
              eventsFoundCount: (Number(currentRules.eventsFoundCount) || 0) + seedEventsCreated,
            },
          })
          .where(eq(parsingSeeds.id, seed.id));
      } catch {}
    }

    // Log admin audit telemetry
    try {
      await db.insert(moderatorAuditLogs).values({
        action: 'ingest_run',
        changedBy: 'admin_manual_trigger',
        newValue: {
          jobId,
          scrapedCount: totalScrapedPosts,
          eventsCreated: totalEventsCreated,
          duplicatesFiltered: totalDuplicatesFiltered,
          durationMs: Date.now() - startTime,
        },
      });
    } catch {}

    return NextResponse.json({
      success: true,
      jobId,
      message: `Спарсено ${totalScrapedPosts} постов, создано ${totalEventsCreated} новых событий`,
      scrapedCount: totalScrapedPosts,
      eventsCreated: totalEventsCreated,
      eventsUpdated: totalEventsUpdated,
      duplicatesFiltered: totalDuplicatesFiltered,
      durationMs: Date.now() - startTime,
    });
  } catch (error: any) {
    console.error('[Admin Ingest] Fatal error during manual ingestion:', error);
    return NextResponse.json(
      {
        success: false,
        jobId,
        error: error?.message || 'Ошибка выполнения парсинга',
        durationMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/admin/ingest:
 * Returns current ingestion engine status and active seeds count.
 */
export async function GET() {
  try {
    const seeds = await db.query.parsingSeeds.findMany();
    const activeCount = seeds.filter((s) => s.isActive).length;

    return NextResponse.json({
      success: true,
      engine: 'Ursa Major Gemini AI Ingestion Engine',
      status: 'ready',
      totalSeeds: seeds.length,
      activeSeeds: activeCount,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'DB query error' },
      { status: 500 }
    );
  }
}
