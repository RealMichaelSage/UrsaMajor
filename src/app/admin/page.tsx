import React from 'react';
import { getDb } from '@/shared/db';
import type { EventItem, ParsingSeed, EventStatus, SeedType, ScrapeStatus } from '@/shared/types';
import { AdminDashboard } from '@/components/admin/AdminDashboard';

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

function formatSeedRecord(s: any): ParsingSeed {
  return {
    id: s.id,
    name: s.name,
    type: (s.type as SeedType) || 'telegram',
    url: s.url,
    residentOrganizer: s.residentOrganizer ?? null,
    isActive: Boolean(s.isActive),
    lastScrapedAt: s.lastScrapedAt
      ? s.lastScrapedAt instanceof Date
        ? s.lastScrapedAt.toISOString()
        : String(s.lastScrapedAt)
      : null,
    scrapeStatus: (s.scrapeStatus as ScrapeStatus) || 'idle',
    scrapeError: s.scrapeError ?? null,
    rules: s.rules ?? {},
    createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
  };
}

export default async function AdminPage() {
  const db = getDb();
  const [rawEvents, rawSeeds] = await Promise.all([
    db.query.events.findMany(),
    db.query.parsingSeeds.findMany(),
  ]);

  const initialEvents = rawEvents.map(formatEventRecord);
  const initialSeeds = rawSeeds.map(formatSeedRecord);

  return (
    <div className="space-y-6">
      <AdminDashboard
        initialEvents={initialEvents}
        initialSeeds={initialSeeds}
      />
    </div>
  );
}
