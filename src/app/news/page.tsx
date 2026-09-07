"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { ApplicationModal } from "@/components/landing/ApplicationModal";
import { NewsGrid } from "@/components/news/NewsGrid";
import { DEFAULT_NEWS } from "@/components/news/data";
import type { NewsArticle } from "@/shared/types";
import { Search, X, ChevronRight, Newspaper, SlidersHorizontal } from "lucide-react";

interface CategoryPill {
  id: string;
  label: string;
  tags?: string[];
}

const CATEGORY_PILLS: CategoryPill[] = [
  { id: "all", label: "Все публикации" },
  { id: "аналитика", label: "Аналитика", tags: ["аналитика", "статистика", "рынок"] },
  { id: "сделки", label: "Сделки и раунды", tags: ["венчур", "синдикаты", "сделки"] },
  { id: "законодательство", label: "Законодательство и налоги", tags: ["законодательство", "налоги", "госрегулирование", "asb-consulting"] },
  { id: "инвестиции", label: "Инвестиции и Pre-IPO", tags: ["pre-ipo", "инвестиции", "ликвидность", "finmuster"] },
  { id: "резиденты", label: "Новости резидентов", tags: ["резиденты", "партнерство", "регионы", "сибирь"] },
];

const ITEMS_PER_PAGE = 9;

export default function NewsFeedPage() {
  const [isAppModalOpen, setIsAppModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [articles, setArticles] = useState<NewsArticle[]>(() =>
    DEFAULT_NEWS.map((n) => ({
      ...n,
      publishedAt:
        typeof n.publishedAt === "string"
          ? n.publishedAt
          : new Date(n.publishedAt).toISOString(),
      createdAt:
        typeof n.createdAt === "string"
          ? n.createdAt
          : new Date(n.createdAt).toISOString(),
    }))
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Fetch articles from API to sync with mocks/backend
  useEffect(() => {
    let isMounted = true;
    async function fetchNews() {
      try {
        setIsLoading(true);
        const res = await fetch("/api/news?limit=50");
        if (res.ok) {
          const data = await res.json();
          const items = data.news || data.articles;
          if (Array.isArray(items) && items.length > 0 && isMounted) {
            setArticles(items);
          }
        }
      } catch (err) {
        console.warn("Failed to fetch news from API, using fallback data:", err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    fetchNews();
    return () => {
      isMounted = false;
    };
  }, []);

  // Filter and sort articles
  const filteredArticles = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const currentPill = CATEGORY_PILLS.find((p) => p.id === activeCategory);

    return articles.filter((article) => {
      // 1. Category pill filter
      if (activeCategory !== "all") {
        const pillTags = currentPill?.tags || [activeCategory];
        const hasMatchingTag =
          Array.isArray(article.tags) &&
          article.tags.some((t) => {
            const lt = t.toLowerCase();
            return (
              pillTags.some((pt) => lt.includes(pt) || pt.includes(lt)) ||
              lt.includes(activeCategory)
            );
          });
        if (!hasMatchingTag) return false;
      }

      // 2. Search query filter
      if (q) {
        const titleMatch = article.title?.toLowerCase().includes(q);
        const summaryMatch = article.summary?.toLowerCase().includes(q);
        const contentMatch = article.content?.toLowerCase().includes(q);
        const authorMatch = article.authorOrSource?.toLowerCase().includes(q);
        const tagsMatch =
          Array.isArray(article.tags) &&
          article.tags.some((t) => t.toLowerCase().includes(q));

        if (!titleMatch && !summaryMatch && !contentMatch && !authorMatch && !tagsMatch) {
          return false;
        }
      }

      return true;
    });
  }, [articles, activeCategory, searchQuery]);

  // Reset to page 1 on filter/search change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredArticles.length / ITEMS_PER_PAGE) || 1;
  const paginatedArticles = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredArticles.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredArticles, currentPage]);

  const handleResetFilters = () => {
    setActiveCategory("all");
    setSearchQuery("");
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] overflow-x-hidden selection:bg-[#f8173f] selection:text-white">
      {/* Top Header */}
      <Header onOpenApplicationModal={() => setIsAppModalOpen(true)} />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        {/* Breadcrumbs & Page Intro */}
        <div className="bg-[#fbfbf9] border-b border-gray-100 py-12 sm:py-16">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb Navigation */}
            <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider mb-6">
              <Link href="/" className="hover:text-[#f8173f] transition-colors">
                Главная
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-gray-900 font-medium">Новости и аналитика</span>
            </nav>

            <div className="max-w-3xl">
              <div className="w-12 h-1 bg-[#f8173f] mb-6" />
              <div className="inline-flex items-center gap-2 text-xs font-bold text-[#f8173f] tracking-widest uppercase mb-2">
                <Newspaper className="w-4 h-4" />
                <span>Медиа и аналитика Ассоциации</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] uppercase tracking-tight mb-4">
                Новости и аналитика
              </h1>
              <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
                Экспертные дайджесты российского венчурного рынка, обзоры синдицированных раундов, изменения налогового и корпоративного законодательства, а также новости членов ассоциации «Большая Медведица».
              </p>
            </div>
          </div>
        </div>

        {/* Toolbar: Search and Filter Pills */}
        <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="space-y-6">
            {/* Search Input Bar */}
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                <Search className="w-5 h-5" />
              </div>
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по новостям, аналитике и авторам..."
                className="w-full pl-11 pr-10 py-3 bg-white border border-gray-200 text-sm text-[#111111] placeholder:text-gray-400 focus:outline-none focus:border-[#f8173f] focus:ring-1 focus:ring-[#f8173f] transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  aria-label="Очистить поиск"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Tag Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5" />
                <span>Тематика:</span>
              </span>
              {CATEGORY_PILLS.map((pill) => {
                const isActive = activeCategory === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setActiveCategory(pill.id)}
                    className={`inline-flex items-center px-4 py-2 text-xs sm:text-sm font-medium tracking-wide whitespace-nowrap transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#f8173f] text-white shadow-sm font-semibold"
                        : "bg-[#fbfbf9] text-[#1a2e35] border border-gray-200 hover:border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Results count & active search indication */}
            {(searchQuery || activeCategory !== "all") && (
              <div className="flex items-center justify-between text-xs text-gray-500 pt-2">
                <span>
                  Найдено материалов: <strong className="text-gray-900">{filteredArticles.length}</strong>
                  {searchQuery && (
                    <span> по запросу «{searchQuery}»</span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-[#f8173f] hover:underline cursor-pointer font-medium"
                >
                  Сбросить все фильтры
                </button>
              </div>
            )}
          </div>

          {/* Main Grid */}
          <div className="mt-8 sm:mt-10">
            <NewsGrid
              articles={paginatedArticles}
              isLoading={isLoading}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              onResetFilters={handleResetFilters}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Membership / Consultation Modal */}
      <ApplicationModal
        isOpen={isAppModalOpen}
        onClose={() => setIsAppModalOpen(false)}
      />
    </div>
  );
}
