import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/shared/db';
import type { EventItem, EventStatus } from '@/shared/types';

function formatEventRecord(e: any): EventItem {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? null,
    rawText: e.rawText ?? null,
    startAt: e.startAt instanceof Date ? e.startAt.toISOString() : String(e.startAt),
    endAt: e.endAt ? (e.endAt instanceof Date ? e.endAt.toISOString() : String(e.endAt)) : null,
    timezone: e.timezone ?? 'Europe/Moscow',
    isOnline: Boolean(e.isOnline),
    location: e.location ?? null,
    venueName: e.venueName ?? null,
    priceType: e.priceType ?? 'free',
    priceMin: e.priceMin !== null && e.priceMin !== undefined ? Number(e.priceMin) : 0,
    priceMax: e.priceMax !== null && e.priceMax !== undefined ? Number(e.priceMax) : null,
    priceCurrency: e.priceCurrency ?? 'RUB',
    paymentUrl: e.paymentUrl ?? null,
    sourceUrl: e.sourceUrl,
    imageUrl: e.imageUrl ?? null,
    category: e.category ?? 'other',
    targetAudience: Array.isArray(e.targetAudience) ? e.targetAudience : [],
    residentOrganizer: e.residentOrganizer ?? null,
    status: (e.status as EventStatus) ?? 'approved',
    isTop: Boolean(e.isTop),
    mergedIntoId: e.mergedIntoId ?? null,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : String(e.updatedAt),
  };
}

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID события не указан' },
        { status: 400 }
      );
    }

    const db = getDb();
    const rawEvents = await db.query.events.findMany();
    const found = rawEvents.find((e) => e.id === id);

    if (!found || found.status === 'rejected') {
      return NextResponse.json(
        { success: false, error: 'Мероприятие не найдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: formatEventRecord(found),
    });
  } catch (error) {
    console.error('[API /api/events/[id]] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при получении события' },
      { status: 500 }
    );
  }
}
