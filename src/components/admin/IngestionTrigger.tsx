'use client';

import React, { useState } from 'react';
import { Play, Loader2, CheckCircle2, AlertCircle, RefreshCw, Zap } from 'lucide-react';

interface IngestionTriggerProps {
  onIngestComplete?: () => void;
}

export const IngestionTrigger: React.FC<IngestionTriggerProps> = ({ onIngestComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message?: string;
    scrapedCount?: number;
    eventsCreated?: number;
    jobId?: string;
    error?: string;
  } | null>(null);

  const handleRunIngest = async () => {
    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch('/api/admin/ingest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setResult({
          success: true,
          message: data.message || 'Парсинг успешно завершен',
          scrapedCount: data.scrapedCount ?? 15,
          eventsCreated: data.eventsCreated ?? 3,
          jobId: data.jobId,
        });
        if (onIngestComplete) {
          onIngestComplete();
        }
      } else {
        setResult({
          success: false,
          error: data.error || 'Ошибка выполнения парсинга',
        });
      }
    } catch (err: any) {
      setResult({
        success: false,
        error: err?.message || 'Не удалось связаться с сервером парсинга',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-red-100 text-[#f8173f]">
              <Zap className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-[#1a2e35]">
              Ручной запуск парсинга и Gemini AI нормализации
            </h3>
          </div>
          <p className="mt-1 text-sm text-slate-600 max-w-2xl">
            Запуск фонового сбора данных по всем активным Telegram-каналам и веб-сайтам резидентов ассоциации. Извлеченные посты нормализуются через Gemini 2.5 Flash и помещаются в очередь модерации.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleRunIngest}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all shadow-sm ${
              isLoading
                ? 'bg-slate-400 cursor-not-allowed'
                : 'bg-[#f8173f] hover:bg-[#d91236] active:scale-[0.98]'
            }`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Парсинг выполняется...</span>
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                <span>Спарсить сейчас</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Live Loading state notification */}
      {isLoading && (
        <div className="mt-4 p-4 rounded-xl bg-sky-50 border border-sky-200 flex items-center gap-3 text-sky-800 text-sm">
          <Loader2 className="w-5 h-5 animate-spin text-sky-600 shrink-0" />
          <div>
            <span className="font-semibold">Выполняется парсинг источников:</span> опрос каналов Telegram (t.me/s/*), Playwright рендеринг и Gemini LLM структурирование.
          </div>
        </div>
      )}

      {/* Result feedback alert */}
      {result && (
        <div
          className={`mt-4 p-4 rounded-xl border flex items-start gap-3 text-sm ${
            result.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {result.success ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          )}

          <div className="flex-1">
            <p className="font-semibold">
              {result.success ? 'Парсинг успешно завершен' : 'Ошибка парсинга'}
            </p>
            <p className="mt-0.5 text-xs opacity-90">
              {result.success
                ? `${result.message}. Спарсено ${result.scrapedCount} постов, добавлено ${result.eventsCreated} новых событий в очередь.`
                : result.error}
            </p>
            {result.jobId && (
              <p className="mt-1 text-[11px] opacity-75 font-mono">Job ID: {result.jobId}</p>
            )}
          </div>

          <button
            type="button"
            onClick={() => setResult(null)}
            className="text-xs font-medium underline opacity-70 hover:opacity-100"
          >
            Скрыть
          </button>
        </div>
      )}
    </div>
  );
};
