'use client';

import React, { useState } from 'react';
import {
  CheckCircle,
  Star,
  Edit2,
  Trash2,
  ExternalLink,
  Calendar,
  MapPin,
  Building2,
  Filter,
  Search,
  Check,
  AlertOctagon,
  Sparkles,
} from 'lucide-react';
import type { EventItem, EventStatus } from '@/shared/types';
import { EventEditModal } from './EventEditModal';

interface ModerationQueueProps {
  events: EventItem[];
  onAction: (eventId: string, action: 'approve' | 'top' | 'ban' | 'edit', data?: Partial<EventItem>) => Promise<void>;
  onRefresh?: () => void;
}

export const ModerationQueue: React.FC<ModerationQueueProps> = ({
  events,
  onAction,
  onRefresh,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | EventStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter events
  const filteredEvents = events.filter((ev) => {
    if (statusFilter !== 'all' && ev.status !== statusFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = ev.title.toLowerCase().includes(q);
      const matchDesc = ev.description?.toLowerCase().includes(q);
      const matchResident = ev.residentOrganizer?.toLowerCase().includes(q);
      const matchLoc = ev.location?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchResident && !matchLoc) return false;
    }
    return true;
  });

  const handleAction = async (
    eventId: string,
    action: 'approve' | 'top' | 'ban' | 'edit',
    data?: Partial<EventItem>
  ) => {
    setActionLoading(`${eventId}-${action}`);
    try {
      await onAction(eventId, action, data);
    } catch (err) {
      console.error(`Failed to execute ${action} on ${eventId}:`, err);
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: EventStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Check className="w-3 h-3" /> Одобрено
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800">
            <AlertOctagon className="w-3 h-3" /> Отклонено
          </span>
        );
      case 'pending':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
            <Sparkles className="w-3 h-3" /> Ожидает проверки
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h2 className="text-xl font-bold text-[#1a2e35]">
            Очередь модерации мероприятий
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Проверка спарсенных и поданных резидентами событий перед публикацией на витрине
          </p>
        </div>

        {/* Filter Pills & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-[#1a2e35] placeholder-slate-400 w-48 sm:w-64"
            />
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-1">
            {(
              [
                { id: 'all', label: 'Все' },
                { id: 'pending', label: 'Ожидают' },
                { id: 'approved', label: 'Одобрены' },
                { id: 'rejected', label: 'Отклонены' },
              ] as const
            ).map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setStatusFilter(tab.id)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                  statusFilter === tab.id
                    ? 'bg-white text-[#1a2e35] shadow-xs'
                    : 'text-slate-600 hover:text-[#1a2e35]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Events List */}
      <div className="mt-6 space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
            <CheckCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-600">
              События не найдены
            </p>
            <p className="text-xs text-slate-400 mt-1">
              {statusFilter === 'pending'
                ? 'Все спарсенные события успешно промодерированы!'
                : 'Попробуйте изменить параметры фильтрации или поиска.'}
            </p>
          </div>
        ) : (
          filteredEvents.map((ev) => {
            const isApproved = ev.status === 'approved';
            const isPending = ev.status === 'pending';
            const isRejected = ev.status === 'rejected';

            return (
              <div
                key={ev.id}
                className={`p-5 rounded-xl border transition-all ${
                  ev.isTop
                    ? 'border-amber-300 bg-amber-50/20'
                    : isPending
                    ? 'border-red-200 bg-red-50/10'
                    : 'border-slate-200 bg-white'
                } hover:shadow-sm`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  {/* Event Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      {getStatusBadge(ev.status)}

                      {ev.isTop && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                          <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                          В ТОПЕ
                        </span>
                      )}

                      {ev.residentOrganizer && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          {ev.residentOrganizer}
                        </span>
                      )}

                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                        {ev.isOnline ? 'Онлайн' : 'Оффлайн'}
                      </span>

                      {ev.priceType === 'free' ? (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                          Бесплатно
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          {ev.priceMin ? `${ev.priceMin} ₽` : 'Платно'}
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-[#1a2e35] hover:text-[#f8173f] transition-colors line-clamp-2">
                      {ev.title}
                    </h3>

                    {ev.description && (
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {ev.description}
                      </p>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {new Date(ev.startAt).toLocaleString('ru-RU', {
                          day: 'numeric',
                          month: 'long',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>

                      {ev.location && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {ev.location}
                        </span>
                      )}

                      {ev.sourceUrl && (
                        <a
                          href={ev.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#f8173f] hover:underline"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Источник
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 shrink-0 pt-2 lg:pt-0">
                    {/* Approve Button */}
                    <button
                      type="button"
                      onClick={() => handleAction(ev.id, 'approve')}
                      disabled={actionLoading === `${ev.id}-approve`}
                      title="Одобрить и опубликовать"
                      className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      <Check className="w-4 h-4" />
                      <span>{isApproved ? 'Одобрено' : 'Одобрить'}</span>
                    </button>

                    {/* Pin to Top Button */}
                    <button
                      type="button"
                      onClick={() => handleAction(ev.id, 'top')}
                      disabled={actionLoading === `${ev.id}-top`}
                      title={ev.isTop ? 'Снять из ТОПа' : 'Закрепить в ТОП'}
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all border ${
                        ev.isTop
                          ? 'bg-amber-400 border-amber-400 text-slate-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Star className={`w-4 h-4 ${ev.isTop ? 'fill-current' : ''}`} />
                      <span>В ТОП</span>
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => setEditingEvent(ev)}
                      title="Редактировать событие"
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      <span>Редактировать</span>
                    </button>

                    {/* Ban / Reject Button */}
                    <button
                      type="button"
                      onClick={() => handleAction(ev.id, 'ban')}
                      disabled={actionLoading === `${ev.id}-ban`}
                      title="Отклонить и заблокировать"
                      className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isRejected
                          ? 'bg-red-200 text-red-900'
                          : 'bg-white border border-red-200 text-red-600 hover:bg-red-50'
                      }`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Отклонить</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Edit Modal */}
      <EventEditModal
        event={editingEvent}
        isOpen={Boolean(editingEvent)}
        onClose={() => setEditingEvent(null)}
        onSave={async (eventId, updatedData) => {
          await handleAction(eventId, 'edit', updatedData);
        }}
      />
    </div>
  );
};
