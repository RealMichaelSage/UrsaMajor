'use client';

import React, { useState } from 'react';
import {
  Radio,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Clock,
  Building2,
  Globe,
  Send,
  X,
  Save,
  Check,
} from 'lucide-react';
import type { ParsingSeed, SeedType } from '@/shared/types';

interface SeedsManagerProps {
  seeds: ParsingSeed[];
  onAddSeed: (newSeed: Partial<ParsingSeed>) => Promise<void>;
  onToggleActive: (seedId: string, currentActive: boolean) => Promise<void>;
  onDeleteSeed: (seedId: string) => Promise<void>;
  onUpdateSeed?: (seedId: string, data: Partial<ParsingSeed>) => Promise<void>;
}

export const SeedsManager: React.FC<SeedsManagerProps> = ({
  seeds,
  onAddSeed,
  onToggleActive,
  onDeleteSeed,
  onUpdateSeed,
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [name, setName] = useState('');
  const [type, setType] = useState<SeedType>('telegram');
  const [residentOrganizer, setResidentOrganizer] = useState('СОБА');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-detect type when URL changes
  const handleUrlChange = (val: string) => {
    setUrl(val);
    if (val.includes('t.me')) {
      setType('telegram');
    } else if (val.startsWith('http')) {
      setType('website');
    }
  };

  const handleCreateSeed = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedUrl = url.trim();
    if (!trimmedUrl.startsWith('http://') && !trimmedUrl.startsWith('https://')) {
      setErrorMessage('URL должен начинаться с http:// или https://');
      return;
    }

    setIsSubmitting(true);
    try {
      await onAddSeed({
        url: trimmedUrl,
        name: name.trim() || (trimmedUrl.includes('t.me') ? `Telegram ${trimmedUrl.split('/').pop()}` : 'Новый источник'),
        type,
        residentOrganizer: residentOrganizer.trim() || undefined,
        isActive: true,
      });

      // Reset form
      setUrl('');
      setName('');
      setResidentOrganizer('СОБА');
      setIsAddModalOpen(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Не удалось добавить источник');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-100 text-sky-700">
              <Radio className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-bold text-[#1a2e35]">
              Источники парсинга (Seeds)
            </h2>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Управление каналами Telegram и сайтами резидентов ассоциации для автоматического сбора событий
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1a2e35] hover:bg-black text-white text-sm font-semibold transition-all shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Добавить источник</span>
        </button>
      </div>

      {/* Seeds Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-50/50">
              <th className="py-3 px-4 rounded-l-xl">Источник / Название</th>
              <th className="py-3 px-4">Резидент</th>
              <th className="py-3 px-4">Тип</th>
              <th className="py-3 px-4">Активен</th>
              <th className="py-3 px-4">Последний сбор</th>
              <th className="py-3 px-4 text-right rounded-r-xl">Действия</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {seeds.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-slate-400">
                  Нет добавленных источников. Нажмите «Добавить источник», чтобы подключить канал.
                </td>
              </tr>
            ) : (
              seeds.map((s) => {
                const isTg = s.type === 'telegram';
                return (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4 font-medium text-[#1a2e35]">
                      <div>
                        <span className="font-semibold text-slate-900 block">
                          {s.name}
                        </span>
                        <a
                          href={s.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-[#f8173f] transition-colors mt-0.5"
                        >
                          <span className="truncate max-w-xs">{s.url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      {s.residentOrganizer ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {s.residentOrganizer}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          isTg
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {isTg ? (
                          <>
                            <Send className="w-3 h-3" /> Telegram
                          </>
                        ) : (
                          <>
                            <Globe className="w-3 h-3" /> Website
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={s.isActive}
                        onClick={() => onToggleActive(s.id, s.isActive)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          s.isActive ? 'bg-[#f8173f]' : 'bg-slate-300'
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            s.isActive ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>

                    <td className="py-4 px-4 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        {s.scrapeStatus === 'success' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : s.scrapeStatus === 'failed' ? (
                          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        )}
                        <span>
                          {s.lastScrapedAt
                            ? new Date(s.lastScrapedAt).toLocaleString('ru-RU', {
                                day: 'numeric',
                                month: 'short',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Еще не опрашивался'}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => onDeleteSeed(s.id)}
                        title="Удалить источник"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add Seed Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-[#1a2e35]">
                Добавить новый источник парсинга
              </h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleCreateSeed} className="space-y-4">
              {/* URL */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  URL источника *
                </label>
                <input
                  type="text"
                  name="url"
                  required
                  placeholder="https://t.me/s/channel_name или https://resident.ru/events"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Для Telegram вводите формат https://t.me/s/имя_канала
                </p>
              </div>

              {/* Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                  Название источника
                </label>
                <input
                  type="text"
                  placeholder="Например: СОБА Новости & Питчи"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Type */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Тип источника
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as SeedType)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                  >
                    <option value="telegram">Telegram канал (t.me/s/*)</option>
                    <option value="website">Веб-сайт резидента (HTML)</option>
                  </select>
                </div>

                {/* Resident Organizer */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                    Резидент ассоциации
                  </label>
                  <select
                    value={residentOrganizer}
                    onChange={(e) => setResidentOrganizer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                  >
                    <option value="СОБА">СОБА</option>
                    <option value="Finmuster">Finmuster</option>
                    <option value="Клуб инвесторов Сибири, Урала и Дальнего Востока">
                      Клуб Сибири и ДВ
                    </option>
                    <option value="ARGENT CLUB">ARGENT CLUB</option>
                    <option value="Синдикат">Синдикат</option>
                    <option value="ASB Consulting Group">ASB Consulting Group</option>
                    <option value="Pitchleaks">Pitchleaks</option>
                    <option value="UNCRN.ru">UNCRN.ru</option>
                    <option value="Центр Сообществ">Центр Сообществ</option>
                  </select>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#f8173f] hover:bg-[#d91236] text-white text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>Сохранить</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
