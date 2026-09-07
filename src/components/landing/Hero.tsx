"use client";

import React from "react";
import { Button } from "@/components/ui/button";

export interface HeroProps {
  onOpenApplicationModal: () => void;
}

export function Hero({ onOpenApplicationModal }: HeroProps) {
  return (
    <section
      id="up"
      className="relative pt-32 pb-20 sm:pt-40 sm:pb-28 lg:pt-48 lg:pb-36 overflow-hidden bg-white"
    >
      {/* Authentic Astronomical Ursa Major Constellation (Большая Медведица) */}
      <div className="absolute -right-6 lg:right-2 xl:right-8 -top-6 sm:-top-2 lg:top-2 w-[400px] lg:w-[460px] xl:w-[520px] pointer-events-none select-none overflow-visible opacity-80 hidden md:block">
        <svg
          className="w-full h-auto text-slate-300"
          viewBox="0 0 700 460"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Glow Filter */}
            <filter id="star-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="polaris-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f8173f" stopOpacity="0.75" />
              <stop offset="50%" stopColor="#f8173f" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#f8173f" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background Ambient Celestial Grid / Orbit Lines */}
          <circle cx="545" cy="80" r="160" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4,6" />
          <circle cx="545" cy="80" r="280" stroke="#f8fafc" strokeWidth="1" />

          {/* Pointer Vector to Polaris: Merak -> Dubhe -> Polaris */}
          <line
            x1="430"
            y1="310"
            x2="545"
            y2="80"
            stroke="#f8173f"
            strokeWidth="1.5"
            strokeDasharray="4,4"
            strokeOpacity="0.75"
          />

          {/* Constellation Lines — Bowl (Ковш) */}
          <line x1="320" y1="225" x2="480" y2="210" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="480" y1="210" x2="430" y2="310" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="430" y1="310" x2="280" y2="330" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="280" y1="330" x2="320" y2="225" stroke="#94a3b8" strokeWidth="1.8" />

          {/* Constellation Lines — Handle (Рукоять) */}
          <line x1="320" y1="225" x2="210" y2="210" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="210" y1="210" x2="120" y2="250" stroke="#94a3b8" strokeWidth="1.8" />
          <line x1="120" y1="250" x2="45" y2="315" stroke="#94a3b8" strokeWidth="1.8" />

          {/* Star 1: Alkaid / Бенетнаш (кончик ручки) */}
          <circle cx="45" cy="315" r="5" fill="#1e293b" filter="url(#star-glow)" />
          <circle cx="45" cy="315" r="2" fill="#ffffff" />
          <text x="45" y="338" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans tracking-wide">
            Бенетнаш
          </text>

          {/* Star 2: Mizar / Мицар & Alcor / Алькор (двойная звезда) */}
          <circle cx="120" cy="250" r="5" fill="#1e293b" filter="url(#star-glow)" />
          <circle cx="120" cy="250" r="2" fill="#ffffff" />
          <circle cx="127" cy="240" r="2.2" fill="#64748b" />
          <text x="120" y="273" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans tracking-wide">
            Мицар
          </text>

          {/* Star 3: Alioth / Алиот */}
          <circle cx="210" cy="210" r="6" fill="#1e293b" filter="url(#star-glow)" />
          <circle cx="210" cy="210" r="2.5" fill="#ffffff" />
          <text x="210" y="193" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans tracking-wide">
            Алиот
          </text>

          {/* Star 4: Megrez / Мегрец */}
          <circle cx="320" cy="225" r="4.5" fill="#1e293b" filter="url(#star-glow)" />
          <circle cx="320" cy="225" r="2" fill="#ffffff" />
          <text x="320" y="208" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans tracking-wide">
            Мегрец
          </text>

          {/* Star 5: Phecda / Фекда */}
          <circle cx="280" cy="330" r="5" fill="#1e293b" filter="url(#star-glow)" />
          <circle cx="280" cy="330" r="2" fill="#ffffff" />
          <text x="280" y="353" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans tracking-wide">
            Фекда
          </text>

          {/* Star 6: Merak / Мерак */}
          <circle cx="430" cy="310" r="5.5" fill="#1e293b" filter="url(#star-glow)" />
          <circle cx="430" cy="310" r="2.2" fill="#ffffff" />
          <text x="430" y="333" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans tracking-wide">
            Мерак
          </text>

          {/* Star 7: Dubhe / Дубхе */}
          <circle cx="480" cy="210" r="6" fill="#1e293b" filter="url(#star-glow)" />
          <circle cx="480" cy="210" r="2.5" fill="#ffffff" />
          <text x="480" y="192" textAnchor="middle" className="text-[11px] fill-slate-500 font-sans tracking-wide">
            Дубхе
          </text>

          {/* Polaris / Полярная Звезда — Главный ориентир в фирменном красном цвете */}
          <circle cx="545" cy="80" r="22" fill="url(#polaris-glow)" />
          <circle cx="545" cy="80" r="6" fill="#f8173f" filter="url(#star-glow)" />
          <circle cx="545" cy="80" r="2.5" fill="#ffffff" />
          {/* 4-Point Star Sparkle on Polaris */}
          <line x1="545" y1="62" x2="545" y2="98" stroke="#f8173f" strokeWidth="1.8" strokeOpacity="0.9" />
          <line x1="527" y1="80" x2="563" y2="80" stroke="#f8173f" strokeWidth="1.8" strokeOpacity="0.9" />
          <text
            x="545"
            y="116"
            textAnchor="middle"
            className="text-[12px] font-bold fill-[#f8173f] font-sans tracking-wider"
          >
            ПОЛЯРНАЯ ЗВЕЗДА
          </text>
        </svg>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl">
          {/* Eyebrow */}
          <div className="mb-6 sm:mb-8">
            <span className="text-xs sm:text-sm uppercase tracking-[0.18em] font-normal text-gray-800 block leading-relaxed">
              Ассоциация профессиональных участников венчурного и инвестиционного рынка &quot;БОЛЬШАЯ МЕДВЕДИЦА&quot;
            </span>
          </div>

          {/* Main Heading H1 */}
          <h1 className="text-3xl sm:text-5xl lg:text-[76px] font-thin text-[#1a2e35] tracking-tight leading-[1.12] mb-6 sm:mb-8 font-['TildaSans',sans-serif]">
            Равный доступ к лучшим инвестиционным проектам и сделкам
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-2xl lg:text-[26px] font-light text-[#222222] leading-[1.4] mb-10 sm:mb-12 max-w-3xl">
            Вместе создаем и поддерживаем общие стандарты инвестиционного рынка
          </p>

          {/* CTA Button */}
          <div>
            <Button
              variant="outline"
              size="lg"
              onClick={onOpenApplicationModal}
              className="min-w-[240px] sm:min-w-[260px] h-[54px] sm:h-[58px] text-sm sm:text-base font-medium tracking-wider"
            >
              ПОДАТЬ ЗАЯВКУ
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
