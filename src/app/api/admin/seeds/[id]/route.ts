import { NextRequest, NextResponse } from 'next/server';
import { getDb, parsingSeeds } from '@/shared/db';
import { eq } from 'drizzle-orm';
import type { ParsingSeed, SeedType, ScrapeStatus } from '@/shared/types';

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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const rawSeeds = await db.query.parsingSeeds.findMany();
    const found = rawSeeds.find((s) => s.id === id);

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Источник не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      seed: formatSeedRecord(found),
    });
  } catch (error) {
    console.error('[Admin API Seeds [id] GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при получении источника' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const db = getDb();
    const rawSeeds = await db.query.parsingSeeds.findMany();
    const target = rawSeeds.find((s) => s.id === id);

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Источник не найден' },
        { status: 404 }
      );
    }

    const updatePayload: Record<string, any> = {};

    if (body.isActive !== undefined) updatePayload.isActive = Boolean(body.isActive);
    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.type !== undefined) updatePayload.type = body.type;
    if (body.url !== undefined) {
      if (!body.url.startsWith('http://') && !body.url.startsWith('https://')) {
        return NextResponse.json(
          { success: false, error: 'URL должен начинаться с http:// или https://' },
          { status: 400 }
        );
      }
      updatePayload.url = body.url;
    }
    if (body.residentOrganizer !== undefined) {
      updatePayload.residentOrganizer = body.residentOrganizer;
    }
    if (body.rules !== undefined) updatePayload.rules = body.rules;
    if (body.scrapeStatus !== undefined) updatePayload.scrapeStatus = body.scrapeStatus;

    await db.update(parsingSeeds).set(updatePayload).where(eq(parsingSeeds.id, id));

    return NextResponse.json({
      success: true,
      seed: formatSeedRecord({ ...target, ...updatePayload }),
      message: 'Источник успешно обновлен',
    });
  } catch (error: any) {
    console.error('[Admin API Seeds [id] PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Ошибка сервера при обновлении источника' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getDb();
    await db.delete(parsingSeeds).where(eq(parsingSeeds.id, id));

    return NextResponse.json({
      success: true,
      message: 'Источник успешно удален',
    });
  } catch (error) {
    console.error('[Admin API Seeds [id] DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при удалении источника' },
      { status: 500 }
    );
  }
}
