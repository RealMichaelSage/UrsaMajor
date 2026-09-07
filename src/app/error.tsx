"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log unexpected runtime errors for observability
    console.error("App Router caught unhandled error:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#fbfbf9] flex items-center justify-center px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-md w-full bg-white border border-gray-200 p-8 sm:p-10 shadow-lg text-center">
        {/* Warning Icon Badge */}
        <div className="w-16 h-16 rounded-full bg-red-50 text-[#f8173f] mx-auto flex items-center justify-center mb-6">
          <AlertTriangle className="w-8 h-8" />
        </div>

        {/* Brand Eyebrow */}
        <div className="w-10 h-1 bg-[#f8173f] mx-auto mb-4" />
        <span className="text-xs uppercase tracking-widest font-semibold text-gray-500 block mb-2">
          Ассоциация «Большая Медведица»
        </span>

        {/* Error Headline */}
        <h1 className="text-2xl sm:text-3xl font-bold text-[#111111] tracking-tight mb-3">
          Что-то пошло не так
        </h1>

        <p className="text-sm font-light text-gray-600 leading-relaxed mb-6">
          Произошла непредвиденная ошибка при загрузке страницы. Мы уже зафиксировали сбой. Пожалуйста, попробуйте обновить состояние или вернитесь на главную страницу.
        </p>

        {error?.digest && (
          <div className="bg-gray-50 border border-gray-200 rounded p-2.5 mb-6 text-xs text-gray-500 font-mono">
            Код ошибки: {error.digest}
          </div>
        )}

        {/* Action Controls */}
        <div className="space-y-3">
          <Button
            variant="primary"
            size="md"
            fullWidth
            onClick={() => reset()}
            className="flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Попробовать снова</span>
          </Button>

          <Link href="/" className="block w-full">
            <Button
              variant="outline"
              size="md"
              fullWidth
              className="flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>На главную страницу</span>
            </Button>
          </Link>
        </div>

        {/* Emergency Contact */}
        <div className="mt-8 pt-6 border-t border-gray-100 text-xs text-gray-500">
          Срочная связь с координацией:{" "}
          <a
            href="https://t.me/ursa_major_rf"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#f8173f] font-medium hover:underline inline-flex items-center gap-1"
          >
            <Send className="w-3 h-3" />
            @ursa_major_rf
          </a>
        </div>
      </div>
    </div>
  );
}
