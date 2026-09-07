import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/shared/db";
import { initialNews } from "@/shared/db/seed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const search = searchParams.get("search")?.toLowerCase().trim();
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.max(1, parseInt(searchParams.get("limit") || "10", 10));

    let allArticles: any[] = [];
    try {
      const db = getDb();
      allArticles = await db.query.newsArticles.findMany();
    } catch {
      allArticles = [];
    }

    if (!allArticles || allArticles.length === 0) {
      allArticles = initialNews;
    }

    // Filter only published articles
    let filtered = allArticles.filter(
      (n) => !n.status || n.status === "published"
    );

    // Filter by tag if provided
    if (tag && tag !== "all") {
      const lowerTag = tag.toLowerCase().trim();
      filtered = filtered.filter((n) => {
        if (!Array.isArray(n.tags)) return false;
        return n.tags.some((t: string) => {
          const lt = t.toLowerCase();
          return lt === lowerTag || lt.includes(lowerTag) || lowerTag.includes(lt);
        });
      });
    }

    // Filter by search text in title, summary, content
    if (search) {
      filtered = filtered.filter((n) => {
        const titleMatch = n.title && n.title.toLowerCase().includes(search);
        const summaryMatch = n.summary && n.summary.toLowerCase().includes(search);
        const contentMatch = n.content && n.content.toLowerCase().includes(search);
        const authorMatch = n.authorOrSource && n.authorOrSource.toLowerCase().includes(search);
        return titleMatch || summaryMatch || contentMatch || authorMatch;
      });
    }

    // Sort descending chronologically by publishedAt
    filtered.sort((a, b) => {
      const dateA = new Date(a.publishedAt).getTime();
      const dateB = new Date(b.publishedAt).getTime();
      return dateB - dateA;
    });

    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    const formatted = paginated.map((item) => ({
      ...item,
      publishedAt:
        typeof item.publishedAt === "string"
          ? item.publishedAt
          : new Date(item.publishedAt).toISOString(),
      createdAt:
        typeof item.createdAt === "string"
          ? item.createdAt
          : new Date(item.createdAt).toISOString(),
    }));

    return NextResponse.json({
      success: true,
      news: formatted,
      articles: formatted,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      total: totalCount,
    });
  } catch (error) {
    console.error("[API /api/news] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Не удалось получить список новостей" },
      { status: 500 }
    );
  }
}
