"use client";

import React from "react";
import { PRODUCTS_DATA } from "./data";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

export interface ProductsProps {
  onOpenApplicationModal: () => void;
}

export function Products({ onOpenApplicationModal }: ProductsProps) {
  return (
    <section id="product" className="py-20 sm:py-28 bg-white border-t border-gray-100">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14 sm:mb-16">
          <div className="w-12 h-1 bg-[#f8173f] mb-6" />
          <h2 className="text-3xl sm:text-4xl lg:text-[44px] font-bold text-[#111111] tracking-tight uppercase mb-4">
            Совместные продукты
          </h2>
          <p className="text-base sm:text-lg font-light text-gray-600 leading-relaxed">
            Флагманские инициативы и инфраструктурные сервисы, доступные резидентам и партнерам ассоциации.
          </p>
        </div>

        {/* 5 Product Modules */}
        <div className="space-y-6 sm:space-y-8 mb-14">
          {PRODUCTS_DATA.map((product, idx) => (
            <div
              key={product.id}
              className="bg-[#fbfbf9] border border-gray-200 p-6 sm:p-8 lg:p-10 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Left Column: Number, Title, Description */}
                <div className="lg:col-span-6 space-y-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-[#f8173f] tracking-widest uppercase">
                      Продукт 0{idx + 1}
                    </span>
                    {product.badge && (
                      <Badge variant="red" size="sm">
                        {product.badge}
                      </Badge>
                    )}
                  </div>

                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#111111] uppercase tracking-tight">
                    {product.name}
                  </h3>

                  <p className="text-sm sm:text-base font-light text-gray-600 leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Right Column: Key Program Features */}
                <div className="lg:col-span-6 bg-white border border-gray-200 p-5 sm:p-6 space-y-3">
                  <div className="text-xs uppercase tracking-wider font-semibold text-gray-400 mb-2">
                    Ключевые возможности:
                  </div>
                  {product.features.map((feature, fIdx) => (
                    <div key={fIdx} className="flex items-start space-x-3 text-sm text-gray-700">
                      <ArrowRight className="w-4 h-4 text-[#f8173f] flex-shrink-0 mt-0.5" />
                      <span className="leading-snug">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
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
            ПОДАТЬ ЗАЯВКУ
          </Button>
        </div>
      </div>
    </section>
  );
}
