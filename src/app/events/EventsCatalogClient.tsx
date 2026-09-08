"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ApplicationModal } from "@/components/landing/ApplicationModal";
import { EventSubmissionModal } from "@/components/landing/EventSubmissionModal";
import { PrivacyModal } from "@/components/landing/PrivacyModal";
import { EventCard } from "@/components/events/EventCard";
import { EventModal } from "@/components/events/EventModal";
import { EventFilters, FilterState } from "@/components/events/EventFilters";
import { DEFAULT_EVENTS } from "@/components/events/utils";
import { Button } from "@/components/ui/button";
import { Calendar, Plus, ChevronLeft, ChevronRight, Layers } from "lucide-react";
import type { EventItem } from "@/shared/types";

export default function EventsCatalogClient() {
  const searchParams = useSearchParams();

  // Initial state derived from URL search parameters
  const [filters, setFilters] = useState<FilterState>(() => ({
    format: (searchParams.get("format") as "all" | "online" | "offline") || "all",
    price: (searchParams.get("price") as "all" | "free" | "paid") || "all",
    category: searchParams.get("category") || "all",
    resident: searchParams.get("resident") || "all",
    search: searchParams.get("search") || "",
  }));

  const [events, setEvents] = useState<EventItem[]>(DEFAULT_EVENTS as unknown as EventItem[]);
  const [loading, setLoading] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(DEFAULT_EVENTS.length);
  const [totalPages, setTotalPages] = useState<number>(1);
  const pageSize = 12;

  // Modals state
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);
  const [isAppModalOpen, setIsAppModalOpen] = useState<boolean>(false);
  const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);

  // Sync state when URL params change externally (e.g. back/forward navigation)
  useEffect(() => {
    const urlFormat = searchParams.get("format") as "all" | "online" | "offline" | null;
    const urlPrice = searchParams.get("price") as "all" | "free" | "paid" | null;
    const urlCategory = searchParams.get("category");
    const urlResident = searchParams.get("resident");
    const urlSearch = searchParams.get("search");

    setFilters({
      format: urlFormat || "all",
      price: urlPrice || "all",
      category: urlCategory || "all",
      resident: urlResident || "all",
      search: urlSearch || "",
    });
  }, [searchParams]);

  // Fetch events matching active filters
  const fetchEvents = useCallback(async (currentFilters: FilterState, currentPage: number) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (currentFilters.format !== "all") q.set("format", currentFilters.format);
      if (currentFilters.price !== "all") q.set("price", currentFilters.price);
      if (currentFilters.category !== "all") q.set("category", currentFilters.category);
      if (currentFilters.resident !== "all") q.set("resident", currentFilters.resident);
      if (currentFilters.search) q.set("search", currentFilters.search);
      q.set("page", String(currentPage));
      q.set("limit", String(pageSize));

      let apiDataLoaded = false;
      try {
        const res = await fetch(`/ursa/api/events/?${q.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && Array.isArray(data.events)) {
            let processedEvents: EventItem[] = data.events;
            if (
              currentFilters.format !== "all" ||
              currentFilters.price !== "all" ||
              currentFilters.category !== "all" ||
              currentFilters.resident !== "all" ||
              Boolean(currentFilters.search)
            ) {
              if (currentFilters.format === "online") processedEvents = processedEvents.filter((e) => e.isOnline);
              if (currentFilters.format === "offline") processedEvents = processedEvents.filter((e) => !e.isOnline);
              if (currentFilters.price !== "all") processedEvents = processedEvents.filter((e) => e.priceType === currentFilters.price);
              if (currentFilters.category !== "all") processedEvents = processedEvents.filter((e) => e.category === currentFilters.category);
              if (currentFilters.resident !== "all") processedEvents = processedEvents.filter((e) => e.residentOrganizer === currentFilters.resident);
              if (currentFilters.search) {
                const s = currentFilters.search.toLowerCase();
                processedEvents = processedEvents.filter(
                  (e) =>
                    e.title.toLowerCase().includes(s) ||
                    (e.description && e.description.toLowerCase().includes(s)) ||
                    (e.location && e.location.toLowerCase().includes(s)) ||
                    (e.residentOrganizer && e.residentOrganizer.toLowerCase().includes(s))
                );
              }
            }
            const start = (currentPage - 1) * pageSize;
            setEvents(processedEvents.slice(start, start + pageSize));
            setTotalCount(processedEvents.length);
            setTotalPages(Math.ceil(processedEvents.length / pageSize) || 1);
            apiDataLoaded = true;

            // Check if ?event=[id] is present in URL to open modal on deep-link
            const eventIdParam = new URLSearchParams(window.location.search).get("event");
            if (eventIdParam) {
              const matched = data.events.find((e: EventItem) => e.id === eventIdParam);
              if (matched) {
                setSelectedEvent(matched);
                setIsDetailModalOpen(true);
              }
            }
          }
        }
      } catch {
        // Fallback to local filtering
      }

      if (!apiDataLoaded) {
        let filtered = [...(DEFAULT_EVENTS as unknown as EventItem[])];
        if (currentFilters.format === "online") filtered = filtered.filter((e) => e.isOnline);
        if (currentFilters.format === "offline") filtered = filtered.filter((e) => !e.isOnline);
        if (currentFilters.price !== "all") filtered = filtered.filter((e) => e.priceType === currentFilters.price);
        if (currentFilters.category !== "all") filtered = filtered.filter((e) => e.category === currentFilters.category);
        if (currentFilters.resident !== "all") filtered = filtered.filter((e) => e.residentOrganizer === currentFilters.resident);
        if (currentFilters.search) {
          const s = currentFilters.search.toLowerCase();
          filtered = filtered.filter(
            (e) =>
              e.title.toLowerCase().includes(s) ||
              (e.description && e.description.toLowerCase().includes(s)) ||
              (e.location && e.location.toLowerCase().includes(s)) ||
              (e.residentOrganizer && e.residentOrganizer.toLowerCase().includes(s))
          );
        }
        const start = (currentPage - 1) * pageSize;
        setEvents(filtered.slice(start, start + pageSize));
        setTotalCount(filtered.length);
        setTotalPages(Math.ceil(filtered.length / pageSize) || 1);

        const eventIdParam = new URLSearchParams(window.location.search).get("event");
        if (eventIdParam) {
          const matched = filtered.find((e: EventItem) => e.id === eventIdParam);
          if (matched) {
            setSelectedEvent(matched);
            setIsDetailModalOpen(true);
          }
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents(filters, page);
  }, [fetchEvents, filters, page]);

  // Handle filter changes and sync shallow URL
  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setPage(1);

    const params = new URLSearchParams();
    if (newFilters.format !== "all") params.set("format", newFilters.format);
    if (newFilters.price !== "all") params.set("price", newFilters.price);
    if (newFilters.category !== "all") params.set("category", newFilters.category);
    if (newFilters.resident !== "all") params.set("resident", newFilters.resident);
    if (newFilters.search) params.set("search", newFilters.search);

    // Preserve event param if modal is open
    if (selectedEvent) {
      params.set("event", selectedEvent.id);
    }

    const queryString = params.toString();
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/events";
    const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;
    window.history.replaceState(null, "", newUrl);
  };

  const handleResetFilters = () => {
    const resetState: FilterState = {
      format: "all",
      price: "all",
      category: "all",
      resident: "all",
      search: "",
    };
    setFilters(resetState);
    setPage(1);
    fetchEvents(resetState, 1);

    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/events";
    const newUrl = selectedEvent ? `${currentPath}?event=${selectedEvent.id}` : currentPath;
    window.history.replaceState(null, "", newUrl);
  };

  // Open detail modal and shallowly append ?event=[id]
  const handleOpenDetailModal = (event: EventItem) => {
    setSelectedEvent(event);
    setIsDetailModalOpen(true);

    const params = new URLSearchParams(window.location.search);
    params.set("event", event.id);
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/events";
    window.history.replaceState(null, "", `${currentPath}?${params.toString()}`);
  };

  // Close detail modal and remove ?event=[id]
  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedEvent(null);

    const params = new URLSearchParams(window.location.search);
    params.delete("event");
    const queryString = params.toString();
    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/events";
    const newUrl = queryString ? `${currentPath}?${queryString}` : currentPath;
    window.history.replaceState(null, "", newUrl);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfbf9] text-[#111111]">
      <Header onOpenApplicationModal={() => setIsAppModalOpen(true)} />

      <main className="flex-1 max-w-[1240px] w-full mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-36 pb-16 sm:pb-24 space-y-8">
        {/* Page Header matching Ursa Major Design System */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-gray-200">
          <div className="max-w-3xl">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider mb-6">
              <Link href="/" className="hover:text-[#f8173f] transition-colors">
                Главная
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 font-medium">Мероприятия ассоциации</span>
            </nav>
            <div className="w-12 h-1 bg-[#f8173f] mb-6" />
            <span className="text-xs sm:text-sm uppercase tracking-[0.18em] font-normal text-gray-800 block mb-2">
              Ассоциация профессиональных участников инвестиционного рынка
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
              Мероприятия и события
            </h1>
            <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
              Инвестиционные питч-сессии, закрытые встречи бизнес-ангелов, образовательные практикумы и венчурные форумы участников «Большой Медведицы».
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsSubmissionModalOpen(true)}
              className="text-xs sm:text-sm font-semibold tracking-wider uppercase whitespace-nowrap"
            >
              РАЗМЕСТИТЬ МЕРОПРИЯТИЕ
            </Button>
          </div>
        </div>

        {/* Multi-Criteria Filters Bar (Sticky on desktop, natural flow on mobile) */}
        <div className="sm:sticky sm:top-[72px] z-30 sm:bg-[#fbfbf9]/95 sm:backdrop-blur-md py-2 -my-2">
          <EventFilters
            filters={filters}
            onChange={handleFilterChange}
            onReset={handleResetFilters}
            totalFound={totalCount}
          />
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-gray-500 font-medium px-1">
          <span>
            {loading ? "Загрузка мероприятий..." : `Найдено мероприятий: ${totalCount}`}
          </span>
          {totalPages > 1 && (
            <span>
              Страница {page} из {totalPages}
            </span>
          )}
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div
                key={n}
                className="bg-white border border-gray-200 rounded-xl p-6 h-88 animate-pulse space-y-4"
              >
                <div className="w-full h-44 bg-gray-200 rounded-lg" />
                <div className="w-28 h-4 bg-gray-200 rounded" />
                <div className="w-full h-6 bg-gray-200 rounded" />
                <div className="w-3/4 h-4 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 sm:p-16 text-center max-w-xl mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-50 text-[#f8173f] flex items-center justify-center">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#111111]">
              Событий не найдено
            </h3>
            <p className="text-sm text-gray-500 font-light leading-relaxed">
              По выбранным критериям фильтрации мероприятий не найдено. Попробуйте сбросить фильтры или изменить поисковый запрос.
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3">
              <Button
                variant="outline"
                size="md"
                onClick={handleResetFilters}
                className="text-xs font-semibold"
              >
                Сбросить все фильтры
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setIsSubmissionModalOpen(true)}
                className="text-xs font-semibold uppercase tracking-wider"
              >
                Разместить своё событие
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onSelect={handleOpenDetailModal}
              />
            ))}
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="pt-8 pb-4 flex items-center justify-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Предыдущая страница"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
              <button
                key={pNum}
                type="button"
                onClick={() => setPage(pNum)}
                className={`w-10 h-10 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  page === pNum
                    ? "bg-[#f8173f] text-white shadow-md"
                    : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {pNum}
              </button>
            ))}

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Следующая страница"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>

      {/* Fast Detail Modal */}
      <EventModal
        isOpen={isDetailModalOpen}
        event={selectedEvent}
        onClose={handleCloseDetailModal}
      />

      {/* Application & Submission Modals */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
        onOpenPrivacy={() => {
          setIsAppModalOpen(false);
          setIsPrivacyModalOpen(true);
        }}
      />

      <EventSubmissionModal
        isOpen={isSubmissionModalOpen}
        onClose={() => setIsSubmissionModalOpen(false)}
        onOpenPrivacy={() => {
          setIsSubmissionModalOpen(false);
          setIsPrivacyModalOpen(true);
        }}
      />

      <PrivacyModal
        isOpen={isPrivacyModalOpen}
        onClose={() => setIsPrivacyModalOpen(false)}
      />

      <Footer onOpenPrivacy={() => setIsPrivacyModalOpen(true)} />
    </div>
  );
}
