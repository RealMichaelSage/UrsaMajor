import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/shared/db";
import { initialNews } from "@/shared/db/seed";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Параметр ID обязателен" },
        { status: 400 }
      );
    }

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

    const found = allArticles.find(
      (n) =>
        (n.id === id || n.slug === id) &&
        (!n.status || n.status === "published")
    );

    if (!found) {
      return NextResponse.json(
        { success: false, error: "Статья не найдена" },
        { status: 404 }
      );
    }

    const article = {
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

    return NextResponse.json({
      success: true,
      article,
    });
  } catch (error) {
    console.error("[API /api/news/[id]] Internal error:", error);
    return NextResponse.json(
      { success: false, error: "Внутренняя ошибка сервера" },
      { status: 500 }
    );
  }
}
