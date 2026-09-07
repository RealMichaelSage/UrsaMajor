"use client";

import React from "react";
import { GOALS_DATA } from "./data";

export function Goals() {
  return (
    <section id="goals" className="py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="w-12 h-1 bg-[#f8173f] mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
            Цели и задачи
          </h2>
          <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
            Системное развитие венчурного рынка России через консолидацию инфраструктуры, стандартизацию сделок и защиту инвесторов.
          </p>
        </div>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
          {GOALS_DATA.map((pillar, colIdx) => (
            <div
              key={pillar.category}
              className="flex flex-col space-y-8 relative pt-6 border-t-2 border-slate-900/10 hover:border-[#f8173f] transition-colors"
            >
              {/* Category Header */}
              <div>
                <span className="text-xs uppercase tracking-widest font-semibold text-[#f8173f] block mb-2">
                  Направление {colIdx + 1}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#111111] leading-snug">
                  {pillar.category}
                </h3>
              </div>

              {/* Goals in this pillar */}
              <ul className="space-y-6" role="list">
                {pillar.goals.map((goal) => (
                  <li key={goal.id} className="group list-none">
                    <div className="flex items-start space-x-3">
                      <span className="text-sm font-bold text-[#f8173f] bg-red-50 border border-red-100 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        {goal.id}
                      </span>
                      <div>
                        <h4 className="text-base font-semibold text-[#111111] leading-snug">
                          <span className="text-[#f8173f] font-bold">
                            {goal.title}{" "}
                          </span>
                          <span className="text-gray-900 font-medium">
                            {goal.subtitle}
                          </span>
                        </h4>
                        <p className="text-xs sm:text-sm text-gray-500 font-light mt-1 leading-relaxed">
                          {goal.description}
                        </p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
