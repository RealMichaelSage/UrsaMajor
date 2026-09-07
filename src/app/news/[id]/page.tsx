import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";
import { NewsShareBar } from "@/components/news/NewsShareBar";
import { NewsCard, formatRussianDate, calculateReadingTime } from "@/components/news/NewsCard";
import { getDb } from "@/shared/db";
import { DEFAULT_NEWS } from "@/components/news/data";
import type { NewsArticle } from "@/shared/types";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Building2,
  ExternalLink,
  ChevronRight,
  Bookmark,
  Share2,
} from "lucide-react";

export interface NewsDetailPageProps {
  params: Promise<{ id: string }>;
}

async function getArticle(idOrSlug: string): Promise<NewsArticle | null> {
  let allArticles: any[] = [];
  try {
    const db = getDb();
    allArticles = await db.query.newsArticles.findMany();
  } catch {
    allArticles = [];
  }

  if (!allArticles || allArticles.length === 0) {
    allArticles = DEFAULT_NEWS;
  }

  const found = allArticles.find(
    (n) =>
      (n.id === idOrSlug || n.slug === idOrSlug) &&
      (!n.status || n.status === "published")
  );

  if (!found) return null;

  return {
    ...found,
    publishedAt:
      typeof found.publishedAt === "string"
        ? found.publishedAt
        : new Date(found.publishedAt).toISOString(),
    createdAt:
      typeof found.createdAt === "string"
        ? found.createdAt
        : new Date(found.createdAt).toISOString(),
  };
}

export async function generateMetadata({
  params,
}: NewsDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const article = await getArticle(id);
  if (!article) {
    return {
      title: "Статья не найдена — АПУВИР «Большая Медведица»",
      description: "Запрашиваемый аналитический материал не найден",
    };
  }

  return {
    title: `${article.title} — АПУВИР «Большая Медведица»`,
    description: article.summary,
    openGraph: {
      title: article.title,
      description: article.summary,
      type: "article",
      publishedTime: article.publishedAt,
      authors: [article.authorOrSource],
      images: article.imageUrl ? [{ url: article.imageUrl }] : undefined,
    },
  };
}

export function generateStaticParams() {
  return DEFAULT_NEWS.map((n) => ({ id: n.id }));
}

export const dynamicParams = true;

/**
 * Lightweight structured content renderer supporting markdown headers, lists, and bolding
 */
function renderArticleContent(rawContent: string) {
  const lines = rawContent.split("\n");
  const elements: React.ReactNode[] = [];

  let currentList: string[] = [];

  const flushList = (keyPrefix: number) => {
    if (currentList.length > 0) {
      elements.push(
        <ul key={`ul-${keyPrefix}`} className="list-disc list-inside space-y-2 mb-6 text-gray-700">
          {currentList.map((item, idx) => (
            <li key={idx} className="leading-relaxed">
              {renderInlineFormatting(item)}
            </li>
          ))}
        </ul>
      );
      currentList = [];
    }
  };

  const renderInlineFormatting = (text: string) => {
    // Bold **text**
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return (
          <strong key={i} className="font-semibold text-gray-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      currentList.push(trimmed.slice(2));
      return;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      currentList.push(trimmed.replace(/^\d+\.\s/, ""));
      return;
    }

    flushList(index);

    if (trimmed.startsWith("### ")) {
      elements.push(
        <h3
          key={index}
          className="text-xl sm:text-2xl font-bold text-[#111111] uppercase tracking-tight mt-8 mb-4 border-l-2 border-[#f8173f] pl-4"
        >
          {trimmed.slice(4)}
        </h3>
      );
    } else if (trimmed.startsWith("## ")) {
      elements.push(
        <h2
          key={index}
          className="text-2xl sm:text-3xl font-bold text-[#111111] uppercase tracking-tight mt-10 mb-5"
        >
          {trimmed.slice(3)}
        </h2>
      );
    } else if (trimmed.length > 0) {
      elements.push(
        <p key={index} className="text-base sm:text-lg font-light text-gray-700 leading-relaxed mb-6">
          {renderInlineFormatting(trimmed)}
        </p>
      );
    }
  });

  flushList(lines.length);

  return elements;
}

export default async function NewsArticlePage({ params }: NewsDetailPageProps) {
  const { id } = await params;
  const article = await getArticle(id);

  if (!article) {
    notFound();
  }

  const readTime = calculateReadingTime(article.content || article.summary);
  const formattedDate = formatRussianDate(article.publishedAt);
  const imageSrc = article.imageUrl || "/assets/news/default-news.jpg";

  // Related articles (exclude current)
  const relatedArticles = DEFAULT_NEWS
    .filter((n) => n.id !== article.id)
    .slice(0, 3)
    .map((n) => ({
      ...n,
      publishedAt:
        typeof n.publishedAt === "string"
          ? n.publishedAt
          : new Date(n.publishedAt).toISOString(),
      createdAt:
        typeof n.createdAt === "string"
          ? n.createdAt
          : new Date(n.createdAt).toISOString(),
    }));

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] selection:bg-[#f8173f] selection:text-white">
      <Header />

      <main className="flex-1 pt-24 sm:pt-28 pb-20">
        {/* Navigation Breadcrumbs */}
        <div className="bg-[#fbfbf9] border-b border-gray-100 py-6">
          <div className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <nav className="flex items-center space-x-2 text-xs text-gray-500 uppercase tracking-wider truncate">
                <Link href="/" className="hover:text-[#f8173f] transition-colors">
                  Главная
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <Link href="/news" className="hover:text-[#f8173f] transition-colors">
                  Новости
                </Link>
                <ChevronRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="text-gray-900 font-medium truncate">
                  {article.title}
                </span>
              </nav>

              <Link
                href="/news"
                className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[#f8173f] hover:underline flex-shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Все новости</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Article Container */}
        <article className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 sm:pt-14">
          {/* Header Metadata */}
          <div className="space-y-4 mb-8">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {article.tags && article.tags.length > 0 && (
                <span className="px-3 py-1 bg-[#1a2e35] text-white font-bold uppercase tracking-wider text-[11px]">
                  {article.tags[0]}
                </span>
              )}
              <div className="flex items-center gap-1 text-[#f8173f] font-semibold uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5" />
                <span>{article.authorOrSource}</span>
              </div>
              <div className="flex items-center gap-1 text-gray-400 font-light">
                <Calendar className="w-3.5 h-3.5" />
                <time dateTime={article.publishedAt}>{formattedDate}</time>
              </div>
              <div className="flex items-center gap-1 text-gray-400 font-light">
                <Clock className="w-3.5 h-3.5" />
                <span>{readTime} мин чтения</span>
              </div>
            </div>

            <div className="w-12 h-1 bg-[#f8173f]" />

            {/* H1 Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#111111] leading-tight tracking-tight">
              {article.title}
            </h1>

            {/* Lead Summary */}
            <p className="text-lg sm:text-xl font-normal text-gray-600 leading-relaxed pt-2 border-l-4 border-gray-200 pl-4 italic">
              {article.summary}
            </p>
          </div>

          {/* Featured Cover Image (16:9) */}
          <div className="relative w-full aspect-video bg-[#1a2e35] overflow-hidden my-8 shadow-sm">
            <Image
              src={imageSrc}
              alt={article.title}
              fill
              priority
              className="object-cover"
              unoptimized
            />
          </div>

          {/* Social Share Bar */}
          <NewsShareBar title={article.title} />

          {/* Main Article Body */}
          <div className="prose prose-lg max-w-none text-[#111111] py-4">
            {renderArticleContent(article.content)}
          </div>

          {/* Source Attribution & Tags Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 bg-[#fbfbf9] p-5 border border-gray-100">
              <div>
                <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                  Источник и автор материала
                </div>
                <div className="text-sm font-semibold text-[#111111]">
                  {article.authorOrSource}
                </div>
              </div>

              {article.sourceUrl && (
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 text-xs font-semibold uppercase tracking-wider text-[#f8173f] hover:bg-[#f8173f] hover:text-white transition-colors"
                >
                  <span>Первоисточник публикации</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {/* Tags Pills */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-1">
                  Теги публикации:
                </span>
                {article.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/news?tag=${encodeURIComponent(tag)}`}
                    className="px-2.5 py-1 text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            {/* Bottom Navigation Link Back to /news */}
            <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-xs sm:text-sm font-semibold uppercase tracking-wider text-[#111111] hover:bg-[#f8173f] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Все новости</span>
              </Link>
            </div>
          </div>
        </article>

        {/* "Читайте также" Related Articles Section */}
        {relatedArticles.length > 0 && (
          <section className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 pt-16 border-t border-gray-100">
            <div className="mb-10">
              <div className="w-12 h-1 bg-[#f8173f] mb-4" />
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111111] uppercase tracking-tight">
                Читайте также
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {relatedArticles.map((rel) => (
                <NewsCard key={rel.id} article={rel} />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
