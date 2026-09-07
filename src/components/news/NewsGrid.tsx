import React from "react";
import { NewsCard } from "./NewsCard";
import type { NewsArticle } from "@/shared/types";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";

export interface NewsGridProps {
  articles: NewsArticle[];
  isLoading?: boolean;
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onResetFilters?: () => void;
}

export function NewsGrid({
  articles,
  isLoading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onResetFilters,
}: NewsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {[1, 2, 3, 4, 5, 6].map((idx) => (
          <div
            key={idx}
            className="card bg-white border border-gray-200 animate-pulse overflow-hidden flex flex-col h-[420px]"
          >
            <div className="w-full aspect-video bg-gray-200" />
            <div className="p-6 space-y-4 flex-1 flex flex-col">
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-6 bg-gray-200 rounded w-4/5" />
              <div className="h-4 bg-gray-200 rounded w-full" />
              <div className="h-4 bg-gray-200 rounded w-2/3" />
              <div className="mt-auto pt-4 border-t border-gray-100 flex gap-2">
                <div className="h-4 bg-gray-200 rounded w-16" />
                <div className="h-4 bg-gray-200 rounded w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div className="py-16 sm:py-24 px-4 text-center bg-[#fbfbf9] border border-dashed border-gray-300">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 text-[#f8173f] flex items-center justify-center">
          <SearchX className="w-8 h-8" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-[#111111] mb-2 uppercase tracking-tight">
          Материалы не найдены
        </h3>
        <p className="text-gray-500 font-light max-w-md mx-auto mb-6">
          По вашему запросу не найдено ни одной статьи. Попробуйте изменить ключевые слова или выбрать другую тематическую категорию.
        </p>
        {onResetFilters && (
          <button
            type="button"
            onClick={onResetFilters}
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#f8173f] text-white font-semibold text-xs uppercase tracking-wider hover:bg-[#dc1235] transition-colors cursor-pointer"
          >
            Сбросить фильтры
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        {articles.map((article) => (
          <NewsCard key={article.id} article={article} />
        ))}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && onPageChange && (
        <nav
          className="flex items-center justify-center space-x-2 pt-6 border-t border-gray-100"
          aria-label="Навигация по страницам"
        >
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="inline-flex items-center justify-center w-10 h-10 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Предыдущая страница"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`inline-flex items-center justify-center w-10 h-10 text-sm font-semibold transition-colors ${
                  isActive
                    ? "bg-[#f8173f] text-white"
                    : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
                aria-current={isActive ? "page" : undefined}
              >
                {page}
              </button>
            );
          })}

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="inline-flex items-center justify-center w-10 h-10 border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Следующая страница"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </nav>
      )}
    </div>
  );
}
