import { NextRequest, NextResponse } from 'next/server';
import { getDb, parsingSeeds } from '@/shared/db';
import type { ParsingSeed, SeedType, ScrapeStatus } from '@/shared/types';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function formatSeedRecord(s: any): ParsingSeed {
  return {
    id: s.id,
    name: s.name,
    type: (s.type as SeedType) || 'telegram',
    url: s.url,
    residentOrganizer: s.residentOrganizer ?? null,
    isActive: Boolean(s.isActive),
    lastScrapedAt: s.lastScrapedAt ? (s.lastScrapedAt instanceof Date ? s.lastScrapedAt.toISOString() : String(s.lastScrapedAt)) : null,
    scrapeStatus: (s.scrapeStatus as ScrapeStatus) || 'idle',
    scrapeError: s.scrapeError ?? null,
    rules: s.rules ?? {},
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
  };
}

/**
 * GET /api/admin/seeds
 * Returns list of configured parsing sources (Telegram channels and websites).
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const active = searchParams.get('active');
    const type = searchParams.get('type');
    const search = searchParams.get('search')?.trim().toLowerCase();

    const db = getDb();
    const rawSeeds = await db.query.parsingSeeds.findMany();
    let seeds = rawSeeds.map(formatSeedRecord);

    if (active !== null && active !== undefined && active !== '') {
      const isActiveBool = active === 'true';
      seeds = seeds.filter((s) => s.isActive === isActiveBool);
    }

    if (type && type !== 'all') {
      seeds = seeds.filter((s) => s.type === type);
    }

    if (search) {
      seeds = seeds.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          s.url.toLowerCase().includes(search) ||
          (s.residentOrganizer && s.residentOrganizer.toLowerCase().includes(search))
      );
    }

    return NextResponse.json({
      success: true,
      seeds,
      total: seeds.length,
    });
  } catch (error) {
    console.error('[Admin API Seeds GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при получении источников' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/seeds
 * Creates a new parsing seed (validates URL).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, name, type, residentOrganizer, isActive, rules } = body || {};

    // URL validation
    if (!url || typeof url !== 'string' || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return NextResponse.json(
        {
          success: false,
          error: 'Некорректный URL источника. URL должен начинаться с http:// или https://',
        },
        { status: 400 }
      );
    }

    // Determine type
    const inferredType: SeedType = type || (url.includes('t.me') ? 'telegram' : 'website');

    // Default name if missing
    let defaultName = name;
    if (!defaultName) {
      try {
        if (url.includes('t.me')) {
          const channel = url.split('/').filter(Boolean).pop();
          defaultName = channel ? `Telegram @${channel}` : 'Telegram канал';
        } else {
          const parsed = new URL(url);
          defaultName = parsed.hostname;
        }
      } catch {
        defaultName = 'Новый источник';
      }
    }

    const newSeedId = crypto.randomUUID();
    const seedRecord = {
      id: newSeedId,
      name: defaultName,
      type: inferredType,
      url: url.trim(),
      residentOrganizer: residentOrganizer || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      scrapeStatus: 'idle' as ScrapeStatus,
      scrapeError: null,
      rules: rules || {},
      createdAt: new Date(),
    };

    const db = getDb();
    await db.insert(parsingSeeds).values(seedRecord as any);

    return NextResponse.json({
      success: true,
      seed: formatSeedRecord(seedRecord),
      message: 'Источник успешно добавлен',
    });
  } catch (error: any) {
    console.error('[Admin API Seeds POST] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Ошибка сервера при создании источника' },
      { status: 500 }
    );
  }
}
