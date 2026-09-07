"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUp } from "lucide-react";

export interface FooterProps {
  onOpenPrivacy?: () => void;
}

export function Footer({ onOpenPrivacy }: FooterProps) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-12 sm:py-16 text-sm text-gray-600 relative">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Legal Name */}
          <div className="flex items-center space-x-4">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src="/assets/ursa-major-logo.svg"
                alt="Большая Медведица"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-base text-[#111111] uppercase tracking-tight block">
                АПУВИР &quot;Большая Медведица&quot;
              </span>
              <span className="text-xs text-gray-500 font-light">
                © АПУВИР &quot;Большая Медведица&quot; . 2026 Все права защищены.
              </span>
            </div>
          </div>

          {/* Statutory Links */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs sm:text-sm font-medium">
            <a
              href="https://drive.google.com/file/d/1QqHZN90cuaKc0H1mI4oNdoMdV_8QGsdx/view"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#111111] hover:text-[#f8173f] transition-colors uppercase tracking-wider"
            >
              УСТАВ
            </a>

            <button
              type="button"
              onClick={onOpenPrivacy}
              className="text-[#111111] hover:text-[#f8173f] transition-colors cursor-pointer"
            >
              Политика конфиденциальности
            </button>

            <Link
              href="/events"
              className="text-[#111111] hover:text-[#f8173f] transition-colors"
            >
              Каталог событий
            </Link>

            <Link
              href="/news"
              className="text-[#111111] hover:text-[#f8173f] transition-colors"
            >
              Новости рынка
            </Link>

            <Link
              href="/admin"
              className="text-gray-400 hover:text-[#f8173f] transition-colors"
            >
              Панель управления
            </Link>
          </div>

          {/* Designer Credit */}
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <span>Designed by</span>
            <a
              href="https://michaelsage.ru"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[#111111] hover:text-[#f8173f] transition-colors underline"
            >
              Michael Sage
            </a>
          </div>
        </div>
      </div>

      {/* Floating Scroll-to-Top Button */}
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Наверх"
        className="fixed bottom-6 right-6 z-30 p-3 rounded-full bg-white border border-gray-300 text-[#f8173f] shadow-lg hover:bg-[#f8173f] hover:text-white transition-all duration-200 cursor-pointer focus:outline-none"
      >
        <ArrowUp className="w-5 h-5 stroke-[2.5]" />
      </button>
    </footer>
  );
}
