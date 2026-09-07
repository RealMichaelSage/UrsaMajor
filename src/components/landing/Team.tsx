"use client";

import React from "react";
import Image from "next/image";
import { BOARD_MEMBERS } from "./data";
import { Button } from "@/components/ui/button";

export interface TeamProps {
  onOpenApplicationModal: () => void;
}

export function Team({ onOpenApplicationModal }: TeamProps) {
  return (
    <section id="team" className="py-20 sm:py-28 bg-[#fbfbf9] border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="w-12 h-1 bg-[#f8173f] mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
            Правление ассоциации:
          </h2>
          <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
            Лидеры инвестиционного сообщества, основатели ведущих клубов и эксперты с совокупным портфелем более 500+ венчурных сделок.
          </p>
        </div>

        {/* 12 Board Members Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-8 mb-14 sm:mb-16">
          {BOARD_MEMBERS.map((member) => (
            <div
              key={member.id}
              className="bg-white border border-gray-200 p-6 flex flex-col items-center text-center hover:border-gray-300 hover:shadow-md transition-all group"
            >
              {/* Photo Portrait */}
              <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 border-2 border-gray-100 group-hover:border-[#f8173f] transition-colors">
                <Image
                  src={member.photo}
                  alt={member.name}
                  fill
                  className="object-cover transition-transform group-hover:scale-105 duration-300"
                  unoptimized
                />
              </div>

              {/* Name */}
              <h3 className="text-base sm:text-lg font-bold text-[#111111] mb-2 leading-snug group-hover:text-[#f8173f] transition-colors">
                {member.name}
              </h3>

              {/* Role / Description */}
              <p className="text-xs sm:text-sm font-light text-gray-600 leading-relaxed">
                {member.role}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="lg"
            onClick={onOpenApplicationModal}
            className="min-w-[240px] sm:min-w-[260px] h-[54px] sm:h-[58px] text-sm sm:text-base font-medium tracking-wider"
          >
            ПРИСОЕДИНИТЬСЯ
          </Button>
        </div>
      </div>
    </section>
  );
}
