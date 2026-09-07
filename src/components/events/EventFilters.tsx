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
    <div className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5">
      {/* Top Row: Search input + Results summary */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Поиск по названию, организатору, городу..."
            className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] transition-all"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch("");
                onChange({ ...filters, search: "" });
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
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
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-[#f8173f] hover:bg-red-50 transition-colors whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Сбросить фильтры</span>
          </button>
        )}
      </div>

      {/* Filter Options Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center pt-2 border-t border-gray-100">
        {/* Format Selector (Online / Offline) */}
        <div className="md:col-span-5 flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => onChange({ ...filters, format: "all" })}
            className={`flex-1 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.format === "all"
                ? "bg-white text-[#111111] shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Все форматы
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, format: "online" })}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.format === "online"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <Video className="w-3.5 h-3.5" />
            <span>Онлайн</span>
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, format: "offline" })}
            className={`flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.format === "offline"
                ? "bg-sky-600 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Оффлайн</span>
          </button>
        </div>

        {/* Price Selector (Free / Paid) */}
        <div className="md:col-span-3 flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100">
          <button
            type="button"
            onClick={() => onChange({ ...filters, price: "all" })}
            className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.price === "all"
                ? "bg-white text-[#111111] shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Все цены
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, price: "free" })}
            className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.price === "free"
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Бесплатно
          </button>
          <button
            type="button"
            onClick={() => onChange({ ...filters, price: "paid" })}
            className={`flex-1 py-1.5 px-2.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              filters.price === "paid"
                ? "bg-[#1a2e35] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            Платно
          </button>
        </div>

        {/* Resident Organizer Dropdown */}
        <div className="md:col-span-4 flex items-center gap-2">
          <select
            name="resident"
            aria-label="Резидент-организатор"
            value={filters.resident}
            onChange={(e) => onChange({ ...filters, resident: e.target.value })}
            className="w-full py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] transition-all cursor-pointer"
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
