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

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getDb();
    const rawEvents = await db.query.events.findMany();
    const found = rawEvents.find((e) => e.id === id);

    if (!found) {
      return NextResponse.json(
        { success: false, error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      event: formatEventRecord(found),
    });
  } catch (error) {
    console.error('[Admin API Events [id] GET] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при получении события' },
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
    const rawEvents = await db.query.events.findMany();
    const target = rawEvents.find((e) => e.id === id);

    if (!target) {
      return NextResponse.json(
        { success: false, error: 'Событие не найдено' },
        { status: 404 }
      );
    }

    const updatePayload: Record<string, any> = {
      ...body,
      updatedAt: new Date(),
    };

    if (body.startAt) updatePayload.startAt = new Date(body.startAt);
    if (body.endAt !== undefined) {
      updatePayload.endAt = body.endAt ? new Date(body.endAt) : null;
    }

    await db.update(events).set(updatePayload).where(eq(events.id, id));

    try {
      await db.insert(moderatorAuditLogs).values({
        eventId: id,
        action: 'edit_direct',
        changedBy: 'moderator',
        oldValue: { title: target.title, status: target.status },
        newValue: updatePayload,
      });
    } catch {}

    try {
      revalidateTag('events');
      revalidatePath('/events');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      event: { ...target, ...updatePayload },
    });
  } catch (error) {
    console.error('[Admin API Events [id] PATCH] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при обновлении события' },
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
    await db.delete(events).where(eq(events.id, id));

    try {
      revalidateTag('events');
      revalidatePath('/events');
      revalidatePath('/');
      revalidatePath('/admin');
    } catch {}

    return NextResponse.json({
      success: true,
      message: 'Событие удалено',
    });
  } catch (error) {
    console.error('[Admin API Events [id] DELETE] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Ошибка сервера при удалении события' },
      { status: 500 }
    );
  }
}
