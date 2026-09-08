"use client";

import React from "react";
import Image from "next/image";
import { RESIDENT_PARTNERS } from "./data";
import { Badge } from "@/components/ui/badge";
import { getAssetUrl } from "@/shared/lib/assets";

export function Partners() {
  return (
    <section id="partners" className="scroll-mt-20 sm:scroll-mt-24 py-20 sm:py-28 bg-[#fbfbf9] border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="w-12 h-1 bg-[#f8173f] mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
            Уже с нами
          </h2>
          <p className="text-base sm:text-xl font-light text-gray-600 leading-relaxed">
            Наши резиденты — не логотипы и не громкие имена, наши резиденты — ведущие в России инвестиционные клубы, стартап-хабы и платформы.
          </p>
        </div>

        {/* 12 Resident Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {RESIDENT_PARTNERS.map((partner) => (
            <div
              key={partner.id}
              className="bg-white border border-gray-200 p-6 sm:p-7 flex flex-col justify-between hover:border-gray-300 hover:shadow-md transition-all duration-200 group"
            >
              <div>
                {/* Header: Logo and Badge */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="relative h-12 w-28 sm:w-32 flex items-center">
                    <Image
                      src={getAssetUrl(partner.logo)}
                      alt={partner.name}
                      width={120}
                      height={48}
                      className="max-h-12 w-auto object-contain transition-transform group-hover:scale-105"
                      unoptimized
                    />
                  </div>
                  {partner.badge && (
                    <Badge variant="red" size="sm">
                      {partner.badge}
                    </Badge>
                  )}
                </div>

                {/* Name */}
                <h3 className="text-lg font-bold text-[#111111] mb-3 leading-snug group-hover:text-[#f8173f] transition-colors">
                  {partner.name}
                </h3>

                {/* Description */}
                <p className="text-sm font-light text-gray-600 leading-relaxed">
                  {partner.description}
                </p>
              </div>

              {partner.website && (
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                  <span className="group-hover:text-[#111111] transition-colors">
                    Резидент ассоциации
                  </span>
                  <a
                    href={partner.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#f8173f] font-medium hover:underline hover:text-[#dc1235] inline-flex items-center gap-1 transition-colors cursor-pointer py-1"
                    aria-label={`Подробнее о резиденте ${partner.name} на внешнем сайте`}
                  >
                    Подробнее →
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
