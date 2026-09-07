import { NextRequest, NextResponse } from 'next/server';
import { getDb, events } from '@/shared/db';
import { eq, and, sql, asc, desc } from 'drizzle-orm';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format');
    const price = searchParams.get('price');
    const category = searchParams.get('category');
    const resident = searchParams.get('resident');
    const search = searchParams.get('search')?.trim().toLowerCase();
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '12', 10)));

    const db = getDb();
    const rawEvents = await db.query.events.findMany();

    // Only approved events for public listing
    let filtered = rawEvents
      .map(formatEventRecord)
      .filter((e) => e.status === 'approved');

    // Filter by format: 'online' | 'offline'
    if (format && format !== 'all') {
      if (format === 'online') {
        filtered = filtered.filter((e) => e.isOnline);
      } else if (format === 'offline') {
        filtered = filtered.filter((e) => !e.isOnline);
      }
    }

    // Filter by price: 'free' | 'paid'
    if (price && price !== 'all') {
      if (price === 'free') {
        filtered = filtered.filter((e) => e.priceType === 'free' || e.priceMin === 0);
      } else if (price === 'paid') {
        filtered = filtered.filter(
          (e) => e.priceType === 'paid' && (e.priceMin ?? 0) > 0
        );
      }
    }

    // Filter by category
    if (category && category !== 'all') {
      filtered = filtered.filter((e) => e.category === category);
    }

    // Filter by resident organizer
    if (resident && resident !== 'all') {
      filtered = filtered.filter(
        (e) => e.residentOrganizer?.toLowerCase() === resident.toLowerCase()
      );
    }

    // Filter by search term
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          (e.description && e.description.toLowerCase().includes(search)) ||
          (e.location && e.location.toLowerCase().includes(search)) ||
          (e.venueName && e.venueName.toLowerCase().includes(search)) ||
          (e.residentOrganizer && e.residentOrganizer.toLowerCase().includes(search)) ||
          e.targetAudience.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    // Sort: isTop first, then chronologically by startAt ASC
    filtered.sort((a, b) => {
      if (a.isTop && !b.isTop) return -1;
      if (!a.isTop && b.isTop) return 1;
      return new Date(a.startAt).getTime() - new Date(b.startAt).getTime();
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const offset = (page - 1) * limit;
    const paginated = filtered.slice(offset, offset + limit);

    return NextResponse.json({
      success: true,
      events: paginated,
      total: totalCount,
      page,
      limit,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
    });
  } catch (error) {
    console.error('[API /api/events] Error fetching events:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при получении событий' },
      { status: 500 }
    );
  }
}
