"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Calendar, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EventCard } from "./EventCard";
import { EventModal } from "./EventModal";
import type { EventItem } from "@/shared/types";

export interface EventsShowcaseProps {
  initialEvents?: EventItem[];
  onOpenSubmissionModal?: () => void;
  maxItems?: number;
}

export function EventsShowcase({
  initialEvents,
  onOpenSubmissionModal,
  maxItems = 3,
}: EventsShowcaseProps) {
  const [events, setEvents] = useState<EventItem[]>(initialEvents || []);
  const [loading, setLoading] = useState<boolean>(!initialEvents);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEvents() {
      try {
        const res = await fetch("/api/events?limit=6");
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.events)) {
            setEvents(data.events);
          }
        }
      } catch (err) {
        console.error("[EventsShowcase] Error loading events:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadEvents();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSelectEvent = (event: EventItem) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const displayedEvents = events.slice(0, maxItems);

  return (
    <div className="space-y-8">
      {/* Event Cards Grid or Empty State */}
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
      ) : displayedEvents.length === 0 ? (
        <div className="bg-white border border-dashed border-gray-300 rounded-2xl p-12 text-center max-w-2xl mx-auto space-y-4">
          <div className="w-14 h-14 mx-auto rounded-full bg-red-50 text-[#f8173f] flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold text-[#111111]">
            Ближайшие мероприятия формируются
          </h3>
          <p className="text-sm text-gray-500 font-light max-w-md mx-auto leading-relaxed">
            В данный момент нет запланированных открытых мероприятий. Новые инвестиционные питчи и закрытые встречи клубов скоро появятся в расписании.
          </p>
          {onOpenSubmissionModal && (
            <div className="pt-2">
              <Button
                variant="primary"
                size="md"
                onClick={onOpenSubmissionModal}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Разместить мероприятие
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onSelect={handleSelectEvent}
            />
          ))}
        </div>
      )}

      {/* Modal View for Event Card Clicks on Showcase */}
      <EventModal
        isOpen={isModalOpen}
        event={selectedEvent}
        onClose={handleCloseModal}
      />
    </div>
  );
}
