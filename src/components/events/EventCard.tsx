"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Building,
  ExternalLink,
  Ticket,
  Video,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import type { EventItem } from "@/shared/types";
import {
  DEFAULT_POSTER,
  formatEventDateTime,
  sanitizeUrl,
  buildTicketUrl,
} from "./utils";

export { DEFAULT_POSTER, formatEventDateTime, sanitizeUrl, buildTicketUrl };

const AUDIENCE_LABELS: Record<string, string> = {
  business_angels: "Бизнес-ангелы",
  seed_startups: "Стартапы",
  funds: "Фонды",
  lawyers: "Юристы",
  family_offices: "Family Offices",
  founders: "Фаундеры",
  investors: "Инвесторы",
};

export interface EventCardProps {
  event: EventItem;
  onSelect?: (event: EventItem) => void;
  className?: string;
}

export function EventCard({ event, onSelect, className = "" }: EventCardProps) {
  const [imgSrc, setImgSrc] = useState<string>(event.imageUrl || DEFAULT_POSTER);

  const formattedDate = formatEventDateTime(event.startAt);
  const ticketUrl = buildTicketUrl(event.paymentUrl, event.sourceUrl);
  const safeSourceUrl = sanitizeUrl(event.sourceUrl);

  const isFree = event.priceType === "free" || event.priceMin === 0 || !event.priceMin;
  const priceDisplay = isFree
    ? "Бесплатно"
    : event.priceMax && event.priceMax > event.priceMin!
    ? `${event.priceMin?.toLocaleString("ru-RU")} – ${event.priceMax.toLocaleString("ru-RU")} ₽`
    : `от ${event.priceMin?.toLocaleString("ru-RU")} ₽`;

  const handleCardClick = (e: React.MouseEvent) => {
    // Only trigger modal if clicking non-interactive element
    if (onSelect) {
      onSelect(event);
    }
  };

  return (
    <article
      data-testid={`event-card-${event.id}`}
      onClick={handleCardClick}
      className={`event-card group relative bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-xl hover:border-gray-300 transition-all duration-300 flex flex-col cursor-pointer ${className}`}
    >
      {/* 16:10 Aspect Ratio Poster Container */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={imgSrc}
          alt={event.title}
          onError={() => setImgSrc(DEFAULT_POSTER)}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />

        {/* Top Badges: Format & Price */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          {/* Format Badge */}
          {event.isOnline ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/90 text-white backdrop-blur-md shadow-sm">
              <Video className="w-3.5 h-3.5" />
              <span>Онлайн</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-600/90 text-white backdrop-blur-md shadow-sm">
              <MapPin className="w-3.5 h-3.5" />
              <span>{event.location ? `Оффлайн • ${event.location.split(",")[0]}` : "Оффлайн"}</span>
            </span>
          )}

          {/* Price Badge */}
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md ${
              isFree
                ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                : "bg-white/95 text-[#111111] border border-gray-200"
            }`}
          >
            {priceDisplay}
          </span>
        </div>

        {/* Top Feature Tag (isTop) */}
        {event.isTop && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#f8173f] text-white tracking-wider uppercase shadow-md">
              ★ В ТОПЕ
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Date and Time Badge */}
          <div className="flex items-center gap-2 text-xs font-semibold text-[#f8173f]">
            <Calendar className="w-4 h-4 flex-shrink-0" />
            <span>{formattedDate}</span>
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-[#1a2e35] group-hover:text-[#f8173f] transition-colors line-clamp-2 leading-snug">
            {event.title}
          </h3>

          {/* Resident Organizer Attribution */}
          {event.residentOrganizer && (
            <div className="flex items-center gap-1.5 text-xs text-gray-700 bg-gray-50 border border-gray-100 px-2.5 py-1.5 rounded-md">
              <Building className="w-3.5 h-3.5 text-[#1a2e35] flex-shrink-0" />
              <span className="font-semibold text-[#1a2e35]">{event.residentOrganizer}</span>
            </div>
          )}

          {/* Description snippet */}
          {event.description && (
            <p className="text-sm text-gray-600 font-light line-clamp-2 leading-relaxed">
              {event.description}
            </p>
          )}

          {/* Target Audience Tags */}
          {event.targetAudience && event.targetAudience.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {event.targetAudience.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded"
                >
                  {AUDIENCE_LABELS[tag] || tag}
                </span>
              ))}
              {event.targetAudience.length > 3 && (
                <span className="text-[11px] font-medium text-gray-500 py-0.5">
                  +{event.targetAudience.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons Bar */}
        <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            {ticketUrl && (
              <a
                href={ticketUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#f8173f] hover:bg-[#d91034] text-white transition-colors shadow-sm"
              >
                <Ticket className="w-3.5 h-3.5" />
                <span>Купить билет</span>
              </a>
            )}

            {safeSourceUrl && (
              <a
                href={safeSourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900 transition-colors p-1"
                title="Оригинал анонса"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Источник</span>
              </a>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onSelect) onSelect(event);
            }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#1a2e35] hover:text-[#f8173f] transition-colors ml-auto cursor-pointer"
          >
            <span>Подробнее</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
