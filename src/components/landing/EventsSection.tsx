"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "@/components/events/EventCard";
import { EventModal } from "@/components/events/EventModal";
import { DEFAULT_EVENTS } from "@/components/events/utils";
import type { EventItem } from "@/shared/types";

export interface EventsSectionProps {
  onOpenEventModal: () => void;
}

export function EventsSection({ onOpenEventModal }: EventsSectionProps) {
  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS as EventItem[]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function fetchTopEvents() {
      try {
        const res = await fetch("/api/events?limit=3");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.events) && data.events.length > 0) {
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.warn("[EventsSection] Live API unreachable, using default curated events:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    fetchTopEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);
  };

  return (
    <section id="events" className="py-20 sm:py-28 bg-[#fbfbf9] border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Title and Action Buttons */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl">
            <div className="w-12 h-1 bg-[#f8173f] mb-6" />
            <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
              Мероприятия ассоциации
            </h2>
            <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
              Актуальные инвестиционные питчи, закрытые встречи ангелов, конференции и выездные семинары участников ассоциации.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button
              variant="outline"
              size="md"
              onClick={onOpenEventModal}
              className="text-xs sm:text-sm font-semibold tracking-wider whitespace-nowrap"
            >
              РАЗМЕСТИТЬ МЕРОПРИЯТИЕ
            </Button>

            <Link href="/events">
              <Button
                variant="primary"
                size="md"
                className="w-full sm:w-auto text-xs sm:text-sm font-semibold tracking-wider whitespace-nowrap flex items-center gap-1.5"
              >
                <span>Все мероприятия</span>
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Events Grid or Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="bg-white border border-gray-200 rounded-xl p-6 h-80 animate-pulse space-y-4"
              >
                <div className="w-full h-40 bg-gray-200 rounded-lg" />
                <div className="w-24 h-4 bg-gray-200 rounded" />
                <div className="w-3/4 h-6 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-[#f8173f] flex items-center justify-center">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-[#111111]">
              Ближайшие мероприятия формируются
            </h3>
            <p className="text-sm text-gray-500 font-light max-w-md mx-auto leading-relaxed">
              В данный момент нет запланированных открытых мероприятий. Новые события участников ассоциации скоро появятся в расписании.
            </p>
            <div className="pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={onOpenEventModal}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Разместить мероприятие
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.slice(0, 3).map((event) => (
                <EventCard
                  key={event.id}
                  event={event}
                  onSelect={handleSelectEvent}
                />
              ))}
            </div>

            {/* Bottom Centered CTA Button to All Events */}
            <div className="mt-12 text-center">
              <Link href="/events">
                <Button
                  variant="outline"
                  size="lg"
                  className="min-w-[280px] h-[54px] text-sm font-semibold tracking-wider hover:bg-[#f8173f] hover:text-white hover:border-[#f8173f] transition-all inline-flex items-center justify-center gap-2"
                >
                  <span>ВСЕ МЕРОПРИЯТИЯ КАТАЛОГА</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal when Clicking Showcase Card */}
      <EventModal
        isOpen={isDetailModalOpen}
        event={selectedEvent}
        onClose={handleCloseDetailModal}
      />
    </section>
  );
}
