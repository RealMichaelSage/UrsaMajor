"use client";

import React from "react";
import { BENEFITS_DATA } from "./data";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export interface BenefitsProps {
  onOpenApplicationModal: () => void;
}

export function Benefits({ onOpenApplicationModal }: BenefitsProps) {
  const leftCol = BENEFITS_DATA.filter((b) => b.column === "left");
  const rightCol = BENEFITS_DATA.filter((b) => b.column === "right");

  return (
    <section id="benefit" className="scroll-mt-20 sm:scroll-mt-24 py-20 sm:py-28 bg-[#fbfbf9] border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="w-12 h-1 bg-[#f8173f] mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
            Преимущества участия
          </h2>
          <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
            Большая Медведица объединяет независимые клубы, платформы и синдикаты, создавая синергию без внутренней конкуренции.
          </p>
        </div>

        {/* 2-Column Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 mb-14">
          {/* Left Column */}
          <div className="space-y-6 sm:space-y-8">
            {leftCol.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 p-6 sm:p-7 hover:border-gray-300 transition-all shadow-sm flex items-start space-x-4"
              >
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#f8173f] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#111111] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm font-light text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column */}
          <div className="space-y-6 sm:space-y-8">
            {rightCol.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 p-6 sm:p-7 hover:border-gray-300 transition-all shadow-sm flex items-start space-x-4"
              >
                <div className="w-8 h-8 rounded-full bg-red-50 text-[#f8173f] flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-[#111111] mb-2 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-sm font-light text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="flex justify-center">
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
    </section>
  );
}
