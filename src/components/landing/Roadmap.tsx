"use client";

import React from "react";
import { ROADMAP_DATA } from "./data";
import { CheckCircle2, Clock } from "lucide-react";

export function Roadmap() {
  return (
    <section id="roadmap" className="scroll-mt-20 sm:scroll-mt-24 py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="w-12 h-1 bg-[#f8173f] mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
            Планы развития ассоциации
          </h2>
          <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
            Поэтапная стратегия масштабирования от межклубной консолидации до международных инвестиционных хабов и цифровой платформы.
          </p>
        </div>

        {/* 5-Phase Timeline */}
        <div className="relative">
          {/* Connecting line on desktop */}
          <div className="hidden lg:block absolute top-12 left-0 right-0 h-0.5 bg-gray-200 z-0" />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 sm:gap-8 relative z-10">
            {ROADMAP_DATA.map((phase) => {
              const isCompleted = phase.status === "completed";
              const isActive = phase.status === "active";

              return (
                <div
                  key={phase.number}
                  className={`bg-[#fbfbf9] border p-6 flex flex-col justify-between transition-all ${
                    isActive
                      ? "border-[#f8173f] shadow-sm bg-white"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div>
                    {/* Top indicator icon & number */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-2xl font-black ${
                          isActive
                            ? "text-[#f8173f]"
                            : isCompleted
                            ? "text-slate-800"
                            : "text-gray-400"
                        }`}
                      >
                        {phase.number}
                      </span>
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : isActive ? (
                        <span className="flex h-3 w-3 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f8173f] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-[#f8173f]"></span>
                        </span>
                      ) : (
                        <Clock className="w-4 h-4 text-gray-400" />
                      )}
                    </div>

                    <div className="text-xs uppercase tracking-wider font-semibold text-gray-500 mb-1">
                      {phase.subtitle}
                    </div>

                    <h3 className="text-lg font-bold text-[#111111] mb-3 leading-snug">
                      {phase.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-light text-gray-600 leading-relaxed">
                      {phase.description}
                    </p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <span
                      className={`text-[11px] font-bold uppercase tracking-wider ${
                        isCompleted
                          ? "text-emerald-700"
                          : isActive
                          ? "text-[#f8173f]"
                          : "text-gray-400"
                      }`}
                    >
                      {isCompleted
                        ? "Реализовано"
                        : isActive
                        ? "В процессе"
                        : "В планах"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
