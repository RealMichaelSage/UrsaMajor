import { NextRequest, NextResponse } from 'next/server';
import { getDb, events, moderatorAuditLogs } from '@/shared/db';
import { eq } from 'drizzle-orm';
import { revalidateTag, revalidatePath } from 'next/cache';
import type { EventItem, EventStatus } from '@/shared/types';

export const dynamic = 'force-dynamic';

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
    status: (e.status as EventStatus) ?? 'pending',
    isTop: Boolean(e.isTop),
    mergedIntoId: e.mergedIntoId ?? null,
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : String(e.updatedAt),
  };
}

/**
 * GET /api/admin/events
 * List events with pagination and status filter for the moderation dashboard.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search')?.trim().toLowerCase();
    const resident = searchParams.get('resident');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.max(1, Math.min(100, parseInt(searchParams.get('limit') || '50', 10)));

    const db = getDb();
    const rawEvents = await db.query.events.findMany();
    const allFormatted = rawEvents.map(formatEventRecord);

    // Compute metrics
    const metrics = {
      total: allFormatted.length,
      pending: allFormatted.filter((e) => e.status === 'pending').length,
      approved: allFormatted.filter((e) => e.status === 'approved').length,
      rejected: allFormatted.filter((e) => e.status === 'rejected').length,
    };

    let filtered = [...allFormatted];

    // Status filter
    if (status && status !== 'all') {
      filtered = filtered.filter((e) => e.status === status);
    }

    // Resident filter
    if (resident && resident !== 'all') {
      filtered = filtered.filter(
        (e) => e.residentOrganizer?.toLowerCase() === resident.toLowerCase()
      );
    }

    // Search query
    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.title.toLowerCase().includes(search) ||
          (e.description && e.description.toLowerCase().includes(search)) ||
          (e.location && e.location.toLowerCase().includes(search)) ||
          (e.venueName && e.venueName.toLowerCase().includes(search)) ||
          (e.residentOrganizer && e.residentOrganizer.toLowerCase().includes(search))
      );
    }

    // Sort: pending first, then isTop, then startAt ASC
    filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
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
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      metrics,
    });
  } catch (error) {
    console.error('[Admin API Events GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при получении событий' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/events
 * Moderation actions: { eventId, action, data }
 * Actions: 'approve', 'top', 'ban', 'edit'
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json();
    const { eventId, action, data } = payload || {};

    if (!eventId || !action) {
      return NextResponse.json(
        { success: false, error: 'eventId и action обязательны' },
        { status: 400 }
      );
    }

    const db = getDb();
    const rawEvents = await db.query.events.findMany();
    const target = rawEvents.find((e) => e.id === eventId);

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    const oldValue: Record<string, unknown> = {
      title: target.title,
      status: target.status,
      isTop: target.isTop,
    };
    const updatePayload: Record<string, any> = {
      updatedAt: new Date(),
    };

    switch (action) {
      case 'approve':
        updatePayload.status = 'approved';
        break;

      case 'top':
        if (data?.isTop !== undefined) {
          updatePayload.isTop = Boolean(data.isTop);
        } else {
          // Toggle or enable
          updatePayload.isTop = !target.isTop;
        }
        updatePayload.status = 'approved';
        break;

      case 'ban':
        updatePayload.status = 'rejected';
        updatePayload.isTop = false;
        break;

      case 'edit':
        if (data && typeof data === 'object') {
          if (data.title !== undefined) updatePayload.title = data.title;
          if (data.description !== undefined) updatePayload.description = data.description;
          if (data.startAt !== undefined) updatePayload.startAt = new Date(data.startAt);
          if (data.endAt !== undefined) {
            updatePayload.endAt = data.endAt ? new Date(data.endAt) : null;
          }
          if (data.isOnline !== undefined) updatePayload.isOnline = Boolean(data.isOnline);
          if (data.location !== undefined) updatePayload.location = data.location;
          if (data.venueName !== undefined) updatePayload.venueName = data.venueName;
          if (data.priceType !== undefined) updatePayload.priceType = data.priceType;
          if (data.priceMin !== undefined) updatePayload.priceMin = Number(data.priceMin);
          if (data.priceMax !== undefined) {
            updatePayload.priceMax = data.priceMax !== null ? Number(data.priceMax) : null;
          }
          if (data.paymentUrl !== undefined) updatePayload.paymentUrl = data.paymentUrl;
          if (data.residentOrganizer !== undefined) {
            updatePayload.residentOrganizer = data.residentOrganizer;
          }
          if (data.category !== undefined) updatePayload.category = data.category;
          if (data.imageUrl !== undefined) updatePayload.imageUrl = data.imageUrl;
          if (data.targetAudience !== undefined) {
            updatePayload.targetAudience = Array.isArray(data.targetAudience)
              ? data.targetAudience
              : [];
          }
        }
        break;

      default:
        return NextResponse.json(
          { success: false, error: `Неизвестное действие модерации: ${action}` },
          { status: 400 }
        );
    }

    // Apply update in DB
    await db.update(events).set(updatePayload).where(eq(events.id, eventId));

    // Record audit log
    try {
      await db.insert(moderatorAuditLogs).values({
        eventId,
        action,
        changedBy: 'moderator',
        oldValue,
        newValue: updatePayload,
      });
    } catch (auditErr) {
      console.warn('[Admin Moderation] Failed to record audit log:', auditErr);
    }

    // Trigger instant ISR cache invalidation
    try {
      revalidateTag('events');
      revalidatePath('/events');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch (revalErr) {
      console.warn('[Admin Moderation] Cache revalidation warning:', revalErr);
    }

    return NextResponse.json({
      success: true,
      action,
      eventId,
      message: `Действие "${action}" успешно выполнено`,
      updatedFields: updatePayload,
    });
  } catch (error) {
    console.error('[Admin API Events POST] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при модерации события' },
      { status: 500 }
    );
  }
}
