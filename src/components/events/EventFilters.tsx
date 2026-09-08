"use client";

import React, { useEffect, useState } from "react";
import { Search, RotateCcw, Filter, Video, MapPin, X } from "lucide-react";

export interface FilterState {
  format: "all" | "online" | "offline";
  price: "all" | "free" | "paid";
  category: string;
  resident: string;
  search: string;
}

export interface EventFiltersProps {
  filters: FilterState;
  onChange: (newFilters: FilterState) => void;
  onReset: () => void;
  totalFound?: number;
}

export const RESIDENT_OPTIONS = [
  { value: "all", label: "Все организаторы" },
  { value: "СОБА", label: "Союз Бизнес-Ангелов" },
  { value: "Finmuster", label: "Инвестиционная платформа" },
  { value: "Клуб инвесторов Сибири, Урала и Дальнего Востока", label: "Инвесторы Азиатской России" },
  { value: "ASB Consulting Group", label: "Консалтинговая группа" },
  { value: "UNCRN.ru", label: "Стартап-студия UNCRN" },
  { value: "Pitchleaks", label: "Акселератор Pitchleaks" },
  { value: "ARGENT CLUB", label: "Клуб инвесторов ARGENT" },
  { value: "Центр Сообществ", label: "Объединение лидеров" },
  { value: "Бизнес-союз ЛАVА", label: "Бизнес-союз" },
  { value: "DocSourcing", label: "Гранты и льготы" },
  { value: "KPD", label: "Каталог проектов KPD" },
];

export const CATEGORY_OPTIONS = [
  { value: "all", label: "Все категории" },
  { value: "pitch", label: "Питч-сессии" },
  { value: "education", label: "Образование и право" },
  { value: "networking", label: "Нетворкинг и клубы" },
  { value: "conference", label: "Конференции и саммиты" },
  { value: "analytics", label: "Аналитика и Pre-IPO" },
  { value: "other", label: "Прочие события" },
];

export function EventFilters({
  filters,
  onChange,
  onReset,
  totalFound,
}: EventFiltersProps) {
  const [localSearch, setLocalSearch] = useState(filters.search);

  // Synchronize local search if external filters change (e.g. onReset)
  useEffect(() => {
    setLocalSearch(filters.search);
  }, [filters.search]);

  // Debounced search (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localSearch !== filters.search) {
        onChange({ ...filters, search: localSearch });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, filters, onChange]);

  const hasActiveFilters =
    filters.format !== "all" ||
    filters.price !== "all" ||
    filters.category !== "all" ||
    filters.resident !== "all" ||
    Boolean(filters.search);

  return (
    <div className="bg-white border border-gray-200 p-4 sm:p-6 shadow-sm space-y-4">
      {/* Top Row: Search input + Results summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Поиск по названию, организатору, городу..."
            className="w-full min-h-[44px] pl-11 pr-10 py-2.5 bg-[#fbfbf9] border border-gray-300 focus:border-[#f8173f] text-sm text-[#111111] placeholder:text-gray-400 outline-none transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onChange({ ...filters, search: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1.5 cursor-pointer"
              aria-label="Очистить поиск"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Reset Filters Button */}
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center justify-center gap-1.5 min-h-[44px] px-4 py-2.5 border border-[#f8173f] text-xs font-semibold uppercase tracking-wider text-[#f8173f] hover:bg-[#f8173f] hover:text-white active:bg-[#dc1235] transition-all whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить фильтры</span>
          </button>
        )}
      </div>

      {/* Filter Options Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end pt-4 border-t border-gray-100">
        {/* Format Selector (Online / Offline) */}
        <div className="lg:col-span-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Формат участия
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...filters, format: "all" })}
              className={`flex-1 min-h-[42px] py-2 px-2.5 text-xs font-semibold uppercase tracking-wider border transition-all text-center cursor-pointer select-none ${
                filters.format === "all"
                  ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                  : "bg-[#fbfbf9] text-[#111111] border-gray-300 hover:border-gray-400"
              }`}
            >
              Все
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, format: "online" })}
              className={`flex-1 min-h-[42px] inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold uppercase tracking-wider border transition-all text-center cursor-pointer select-none ${
                filters.format === "online"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-[#fbfbf9] text-[#111111] border-gray-300 hover:border-gray-400"
              }`}
            >
              <Video className="w-3.5 h-3.5" />
              <span>Онлайн</span>
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, format: "offline" })}
              className={`flex-1 min-h-[42px] inline-flex items-center justify-center gap-1 py-2 px-2.5 text-xs font-semibold uppercase tracking-wider border transition-all text-center cursor-pointer select-none ${
                filters.format === "offline"
                  ? "bg-[#f8173f] text-white border-[#f8173f] shadow-xs"
                  : "bg-[#fbfbf9] text-[#111111] border-gray-300 hover:border-gray-400"
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Оффлайн</span>
            </button>
          </div>
        </div>

        {/* Price Selector (Free / Paid) */}
        <div className="lg:col-span-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Стоимость
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onChange({ ...filters, price: "all" })}
              className={`flex-1 min-h-[42px] py-2 px-2.5 text-xs font-semibold uppercase tracking-wider border transition-all text-center cursor-pointer select-none ${
                filters.price === "all"
                  ? "bg-[#111111] text-white border-[#111111] shadow-xs"
                  : "bg-[#fbfbf9] text-[#111111] border-gray-300 hover:border-gray-400"
              }`}
            >
              Все цены
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, price: "free" })}
              className={`flex-1 min-h-[42px] py-2 px-2.5 text-xs font-semibold uppercase tracking-wider border transition-all text-center cursor-pointer select-none ${
                filters.price === "free"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                  : "bg-[#fbfbf9] text-[#111111] border-gray-300 hover:border-gray-400"
              }`}
            >
              Бесплатно
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...filters, price: "paid" })}
              className={`flex-1 min-h-[42px] py-2 px-2.5 text-xs font-semibold uppercase tracking-wider border transition-all text-center cursor-pointer select-none ${
                filters.price === "paid"
                  ? "bg-[#1a2e35] text-white border-[#1a2e35] shadow-xs"
                  : "bg-[#fbfbf9] text-[#111111] border-gray-300 hover:border-gray-400"
              }`}
            >
              Платно
            </button>
          </div>
        </div>

        {/* Resident Organizer Dropdown */}
        <div className="lg:col-span-4">
          <div className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
            Организатор
          </div>
          <select
            name="resident"
            aria-label="Резидент-организатор"
            value={filters.resident}
            onChange={(e) => onChange({ ...filters, resident: e.target.value })}
            className="w-full min-h-[42px] py-2.5 px-3 bg-[#fbfbf9] border border-gray-300 text-xs font-semibold uppercase tracking-wider text-[#111111] focus:border-[#f8173f] outline-none transition-colors cursor-pointer"
          >
            {RESIDENT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
