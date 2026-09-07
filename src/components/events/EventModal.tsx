"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  X,
  Calendar,
  MapPin,
  Building,
  Ticket,
  ExternalLink,
  Share2,
  Check,
  Video,
  ArrowRight,
} from "lucide-react";
import type { EventItem } from "@/shared/types";
import {
  formatEventDateTime,
  buildTicketUrl,
  sanitizeUrl,
  DEFAULT_POSTER,
} from "./utils";

export interface EventModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
}

export function EventModal({ isOpen, event, onClose }: EventModalProps) {
  const [copied, setCopied] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>(event?.imageUrl || DEFAULT_POSTER);

  useEffect(() => {
    if (event?.imageUrl) {
      setImgSrc(event.imageUrl);
    } else {
      setImgSrc(DEFAULT_POSTER);
    }
  }, [event]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const prevOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prevOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen || !event) return null;

  const formattedDate = formatEventDateTime(event.startAt);
  const ticketUrl = buildTicketUrl(event.paymentUrl, event.sourceUrl);
  const safeSourceUrl = sanitizeUrl(event.sourceUrl);

  const isFree = event.priceType === "free" || event.priceMin === 0 || !event.priceMin;
  const priceDisplay = isFree
    ? "Бесплатно"
    : event.priceMax && event.priceMax > event.priceMin!
    ? `${event.priceMin?.toLocaleString("ru-RU")} – ${event.priceMax.toLocaleString("ru-RU")} ₽`
    : `от ${event.priceMin?.toLocaleString("ru-RU")} ₽`;

  const handleCopyLink = async () => {
    const directUrl = `${window.location.origin}/events/${event.id}`;
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(directUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      data-state="open"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      {/* Dimmed backdrop */}
      <div
        className="backdrop fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        data-state="open"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden my-8 z-10 animate-scale-up text-[#111111]">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white backdrop-blur-md transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Poster Banner */}
        <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-slate-900">
          <img
            src={imgSrc}
            alt={event.title}
            onError={() => setImgSrc(DEFAULT_POSTER)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Badges Overlay */}
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

        {/* Content Area */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Date & Location Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#fbfbf9] p-4 rounded-xl border border-gray-100">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-50 text-[#f8173f]">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Дата и время
                </div>
                <div className="text-sm font-bold text-[#111111] mt-0.5">
                  {formattedDate}
                </div>
                <div className="text-xs text-gray-500">Часовой пояс: {event.timezone}</div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Локация
                </div>
                <div className="text-sm font-bold text-[#111111] mt-0.5">
                  {event.venueName || (event.isOnline ? "Онлайн трансляция" : "Оффлайн площадка")}
                </div>
                {event.location && (
                  <div className="text-xs text-gray-500 line-clamp-1">{event.location}</div>
                )}
              </div>
            </div>
          </div>

          {/* Event Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#1a2e35] leading-snug">
              {event.title}
            </h2>
          </div>

          {/* Full Description */}
          {event.description && (
            <div className="space-y-3 text-sm sm:text-base text-gray-700 font-light leading-relaxed">
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

          {/* Actions & Sharing Footer */}
          <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {ticketUrl && (
                <a
                  href={ticketUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-[#f8173f] hover:bg-[#d91034] text-white transition-colors shadow-md"
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
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Источник</span>
                </a>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-3 rounded-xl text-sm font-semibold border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                title="Скопировать ссылку на событие"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copied ? "Скопировано!" : "Поделиться"}</span>
              </button>
            </div>

            <Link
              href={`/events/${event.id}`}
              className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-[#1a2e35] hover:text-[#f8173f] transition-colors py-2"
            >
              <span>Страница события</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
