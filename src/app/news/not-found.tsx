import React from "react";
import Link from "next/link";
import { ArrowLeft, Newspaper } from "lucide-react";
import { Header } from "@/components/landing/Header";
import { Footer } from "@/components/landing/Footer";

export default function NewsNotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111]">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 py-32">
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#f8173f] flex items-center justify-center mb-6">
          <Newspaper className="w-8 h-8" />
        </div>
        <div className="text-6xl sm:text-7xl font-bold text-[#f8173f] mb-3 tracking-tighter">
          404
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] uppercase tracking-tight mb-3">
          Статья не найдена
        </h1>
        <p className="text-gray-500 font-light max-w-md mx-auto mb-8 leading-relaxed">
          Запрашиваемый аналитический материал не существует, был перемещен или находится на модерации.
        </p>
        <Link
          href="/news"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#f8173f] text-white font-semibold text-xs sm:text-sm uppercase tracking-wider hover:bg-[#dc1235] transition-colors shadow-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Все новости</span>
        </Link>
      </main>

      <Footer />
    </div>
  );
}
