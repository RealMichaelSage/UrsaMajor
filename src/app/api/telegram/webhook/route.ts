import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/shared/db';
import { events, parsingSeeds } from '@/shared/db/schema';
import { extractEventsFromPostBatch } from '@/shared/lib/gemini';
import { checkDuplicate } from '@/shared/lib/deduplication';

export const dynamic = 'force-dynamic';

/**
 * Telegram Webhook Handler for @Michaelsage_bot
 * Listens for messages posted in authorized chats/topics (e.g. -1002103289961)
 * and ingests them into the events/news database in real time.
 */
export async function POST(req: NextRequest) {
  try {
    const update = await req.json();

    const message = update.message || update.channel_post;
    if (!message || !message.text) {
      return NextResponse.json({ ok: true, ignored: 'No text message' });
    }

    const chatId = String(message.chat?.id);
    const messageId = String(message.message_id);
    const text = message.text;
    const date = new Date(message.date * 1000).toISOString();

    // Source link
    const channelUsername = message.chat?.username;
    const sourceUrl = channelUsername
      ? `https://t.me/${channelUsername}/${messageId}`
      : `https://t.me/c/${chatId.replace(/^-100/, '')}/${messageId}`;

    // Extract event via AI
    const extractedEvents = await extractEventsFromPostBatch([
      {
        id: `${chatId}/${messageId}`,
        text,
        sourceUrl,
        date,
        residentOrganizer: 'Большая Медведица',
      },
    ]);

    let insertedCount = 0;
    for (const ev of extractedEvents) {
      if (!ev.isValidEvent || !ev.title || !ev.startAt) continue;

      const dupCheck = await checkDuplicate({
        title: ev.title,
        eventDate: ev.startAt,
        sourceUrl: ev.sourceUrl || sourceUrl,
      });

      if (dupCheck.action !== 'create_new') {
        continue;
      }

      await db.insert(events).values({
        title: ev.title,
        description: ev.description,
        rawText: text,
        startAt: new Date(ev.startAt),
        endAt: ev.endAt ? new Date(ev.endAt) : null,
        timezone: ev.timezone || 'Europe/Moscow',
        isOnline: ev.isOnline,
        location: ev.location || null,
        venueName: ev.venueName || null,
        priceType: ev.priceType,
        priceMin: ev.priceMin || 0,
        priceMax: ev.priceMax || null,
        priceCurrency: ev.priceCurrency || 'RUB',
        paymentUrl: ev.paymentUrl || null,
        sourceUrl: ev.sourceUrl || sourceUrl,
        imageUrl: ev.imageUrl || null,
        category: ev.category,
        targetAudience: ev.targetAudience || [],
        residentOrganizer: ev.residentOrganizer || 'Большая Медведица',
        status: 'approved',
        isTop: false,
      });
      insertedCount++;
    }

    return NextResponse.json({
      ok: true,
      chatId,
      messageId,
      extractedCount: extractedEvents.length,
      insertedCount,
    });
  } catch (error: any) {
    console.error('[Telegram Webhook] Error processing update:', error);
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'active',
    endpoint: '/api/telegram/webhook',
    bot: '@Michaelsage_bot',
  });
}
