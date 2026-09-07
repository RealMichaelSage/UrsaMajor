import React from "react";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/shared/db";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import {
  Calendar,
  MapPin,
  Building,
  Ticket,
  ExternalLink,
  ArrowLeft,
  Video,
  Share2,
} from "lucide-react";
import {
  formatEventDateTime,
  buildTicketUrl,
  sanitizeUrl,
  DEFAULT_POSTER,
  DEFAULT_EVENTS,
} from "@/components/events/utils";
import type { EventItem } from "@/shared/types";

function formatEvent(e: any): EventItem {
  return {
    id: e.id,
    title: e.title,
    description: e.description ?? null,
    rawText: e.rawText ?? null,
    startAt: e.startAt instanceof Date ? e.startAt.toISOString() : String(e.startAt),
    endAt: e.endAt ? (e.endAt instanceof Date ? e.endAt.toISOString() : String(e.endAt)) : null,
    timezone: e.timezone ?? "Europe/Moscow",
    isOnline: Boolean(e.isOnline),
    location: e.location ?? null,
    venueName: e.venueName ?? null,
    priceType: e.priceType ?? "free",
    priceMin: e.priceMin !== null && e.priceMin !== undefined ? Number(e.priceMin) : 0,
    priceMax: e.priceMax !== null && e.priceMax !== undefined ? Number(e.priceMax) : null,
    priceCurrency: e.priceCurrency ?? "RUB",
    paymentUrl: e.paymentUrl ?? null,
    sourceUrl: e.sourceUrl,
    imageUrl: e.imageUrl ?? null,
    category: e.category ?? "other",
    targetAudience: Array.isArray(e.targetAudience) ? e.targetAudience : [],
    residentOrganizer: e.residentOrganizer ?? null,
    status: e.status ?? "approved",
    isTop: Boolean(e.isTop),
    createdAt: e.createdAt instanceof Date ? e.createdAt.toISOString() : String(e.createdAt),
    updatedAt: e.updatedAt instanceof Date ? e.updatedAt.toISOString() : String(e.updatedAt),
  };
}

async function getEvent(id: string): Promise<EventItem | null> {
  try {
    const db = getDb();
    const rawEvents = await db.query.events.findMany();
    const found = rawEvents.find((e) => e.id === id);
    if (found && found.status !== "rejected") {
      return formatEvent(found);
    }
  } catch (err) {
    // fallback to DEFAULT_EVENTS
  }
  const defaultFound = DEFAULT_EVENTS.find((e) => e.id === id);
  return (defaultFound as unknown as EventItem) || null;
}

export function generateStaticParams() {
  return DEFAULT_EVENTS.map((e) => ({ id: e.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    return {
      title: "Мероприятие не найдено | Ассоциация «Большая Медведица»",
      description: "Запрошенное инвестиционное мероприятие не найдено или было удалено.",
    };
  }

  const descSnippet = event.description || "Инвестиционное событие ассоциации «Большая Медведица».";

  return {
    title: `${event.title} | Ассоциация «Большая Медведица»`,
    description: descSnippet,
    openGraph: {
      title: event.title,
      description: descSnippet,
      url: `https://ursa-major.ru/events/${event.id}`,
      siteName: "Большая Медведица",
      locale: "ru_RU",
      type: "website",
      images: event.imageUrl ? [{ url: event.imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: event.title,
      description: descSnippet,
    },
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const event = await getEvent(id);

  if (!event) {
    notFound();
  }

  const formattedDate = formatEventDateTime(event.startAt);
  const ticketUrl = buildTicketUrl(event.paymentUrl, event.sourceUrl);
  const safeSourceUrl = sanitizeUrl(event.sourceUrl);

  const isFree = event.priceType === "free" || event.priceMin === 0 || !event.priceMin;
  const priceDisplay = isFree
    ? "Бесплатно"
    : event.priceMax && event.priceMax > event.priceMin!
    ? `${event.priceMin?.toLocaleString("ru-RU")} – ${event.priceMax.toLocaleString("ru-RU")} ₽`
    : `от ${event.priceMin?.toLocaleString("ru-RU")} ₽`;

  const jsonLdData = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description || "",
    startDate: event.startAt,
    endDate: event.endAt || undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: event.isOnline
      ? "https://schema.org/OnlineEventAttendanceMode"
      : "https://schema.org/OfflineEventAttendanceMode",
    location: event.isOnline
      ? {
          "@type": "VirtualLocation",
          url: event.paymentUrl || event.sourceUrl,
        }
      : {
          "@type": "Place",
          name: event.venueName || event.location || "Площадка мероприятия",
          address: event.location || "",
        },
    organizer: {
      "@type": "Organization",
      name: event.residentOrganizer || "Ассоциация «Большая Медведица»",
      url: "https://ursa-major.ru",
    },
    offers: {
      "@type": "Offer",
      price: event.priceMin || 0,
      priceCurrency: event.priceCurrency || "RUB",
      url: event.paymentUrl || event.sourceUrl,
      availability: "https://schema.org/InStock",
    },
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-[#111111]">
      <Header />

      {/* Schema.org Event JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdData) }}
      />

      <main className="flex-1 max-w-[1040px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-12 sm:pb-16 space-y-8">
        {/* Navigation Breadcrumb / Back Link */}
        <div>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[#f8173f] hover:underline cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← Ко всем мероприятиям</span>
          </Link>
        </div>

        {/* Hero Card Container */}
        <article className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
          {/* Cover Poster Banner */}
          <div className="relative aspect-[21/9] sm:aspect-[24/9] w-full overflow-hidden bg-slate-900">
            <img
              src={event.imageUrl || DEFAULT_POSTER}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

            {/* Badges */}
            <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {event.isOnline ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-md">
                    <Video className="w-3.5 h-3.5" />
                    <span>Онлайн</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-600 text-white shadow-md">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Оффлайн</span>
                  </span>
                )}

                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-white text-[#111111] shadow-md">
                  {priceDisplay}
                </span>

                {event.isTop && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-[#f8173f] text-white shadow-md tracking-wider uppercase">
                    ★ ТОП
                  </span>
                )}
              </div>

              {event.residentOrganizer && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-[#1a2e35] backdrop-blur-md">
                  <Building className="w-3.5 h-3.5" />
                  <span>{event.residentOrganizer}</span>
                </span>
              )}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-6 sm:p-10 space-y-8">
            {/* Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1a2e35] tracking-tight leading-snug">
              {event.title}
            </h1>

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fbfbf9] p-5 rounded-xl border border-gray-100">
              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-red-50 text-[#f8173f]">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Дата и время начала
                  </div>
                  <div className="text-base font-bold text-[#111111] mt-0.5">
                    {formattedDate}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Часовой пояс: {event.timezone}
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Формат и локация
                  </div>
                  <div className="text-base font-bold text-[#111111] mt-0.5">
                    {event.venueName || (event.isOnline ? "Онлайн трансляция" : "Оффлайн площадка")}
                  </div>
                  {event.location && (
                    <div className="text-xs text-gray-600 mt-0.5">{event.location}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Paragraphs */}
            {event.description && (
              <div className="space-y-4 text-base text-gray-700 font-light leading-relaxed">
                {event.description.split("\n\n").map((para, pIdx) => (
                  <p key={pIdx}>{para}</p>
                ))}
              </div>
            )}

            {/* Target Audience */}
            {event.targetAudience && event.targetAudience.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Целевая аудитория
                </div>
                <div className="flex flex-wrap gap-2">
                  {event.targetAudience.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-gray-100 text-gray-800 px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions Bar */}
            <div className="pt-6 border-t border-gray-100 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                {ticketUrl && (
                  <a
                    href={ticketUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-sm font-bold bg-[#f8173f] hover:bg-[#d91034] text-white transition-colors shadow-md"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>Купить билет / Регистрация</span>
                  </a>
                )}

                {safeSourceUrl && (
                  <a
                    href={safeSourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-3.5 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Источник</span>
                  </a>
                )}
              </div>

              <Link
                href="/events"
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a2e35] hover:text-[#f8173f] transition-colors"
              >
                <span>Все мероприятия ассоциации</span>
                <ArrowLeft className="w-4 h-4 rotate-180" />
              </Link>
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
}
