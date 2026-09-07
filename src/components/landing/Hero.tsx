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
