'use client';

import React, { useState } from 'react';
import { X, Save, Calendar, MapPin, Tag, Building2, DollarSign } from 'lucide-react';
import type { EventItem, EventCategory, PriceType } from '@/shared/types';

interface EventEditModalProps {
  event: EventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventId: string, data: Partial<EventItem>) => Promise<void>;
}

export const EventEditModal: React.FC<EventEditModalProps> = ({
  event,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !event) return null;

  const [title, setTitle] = useState(event.title || '');
  const [description, setDescription] = useState(event.description || '');
  const [startAt, setStartAt] = useState(
    event.startAt ? new Date(event.startAt).toISOString().slice(0, 16) : ''
  );
  const [isOnline, setIsOnline] = useState(Boolean(event.isOnline));
  const [location, setLocation] = useState(event.location || '');
  const [venueName, setVenueName] = useState(event.venueName || '');
  const [priceType, setPriceType] = useState<PriceType>(event.priceType || 'free');
  const [priceMin, setPriceMin] = useState(event.priceMin?.toString() || '0');
  const [residentOrganizer, setResidentOrganizer] = useState(event.residentOrganizer || '');
  const [category, setCategory] = useState<EventCategory>(event.category || 'other');
  const [paymentUrl, setPaymentUrl] = useState(event.paymentUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSave(event.id, {
        title,
        description: description || null,
        startAt: startAt ? new Date(startAt).toISOString() : event.startAt,
        isOnline,
        location: location || null,
        venueName: venueName || null,
        priceType,
        priceMin: priceType === 'free' ? 0 : parseInt(priceMin, 10) || 0,
        residentOrganizer: residentOrganizer || null,
        category,
        paymentUrl: paymentUrl || null,
      });
      onClose();
    } catch (err) {
      console.error('Failed to save event edits:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
          <div>
            <h3 className="text-xl font-bold text-[#1a2e35]">
              Редактирование мероприятия
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              ID: {event.id}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Название мероприятия *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
              placeholder="Название события..."
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Описание
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
              placeholder="Подробное описание..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Start Date / Time */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> Дата и время начала *
              </label>
              <input
                type="datetime-local"
                required
                value={startAt}
                onChange={(e) => setStartAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
              />
            </div>

            {/* Format (Online / Offline) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Формат проведения
              </label>
              <select
                value={isOnline ? 'online' : 'offline'}
                onChange={(e) => setIsOnline(e.target.value === 'online')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
              >
                <option value="offline">Оффлайн (очно)</option>
                <option value="online">Онлайн (вебинар / трансляция)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Location */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" /> Город / Локация
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                placeholder="Санкт-Петербург, ул. Римского-Корсакова..."
              />
            </div>

            {/* Venue Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Площадка / Зал
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                placeholder="Отель Амбассадор, зал Премьер"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Price Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> Тип цены
              </label>
              <select
                value={priceType}
                onChange={(e) => setPriceType(e.target.value as PriceType)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
              >
                <option value="free">Бесплатно</option>
                <option value="paid">Платно</option>
                <option value="donation">Донат / Взнос</option>
              </select>
            </div>

            {/* Price Min */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Стоимость (₽)
              </label>
              <input
                type="number"
                disabled={priceType === 'free'}
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35] disabled:bg-slate-100"
                placeholder="3500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" /> Категория
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
              >
                <option value="pitch">Питч-сессия</option>
                <option value="networking">Нетворкинг</option>
                <option value="conference">Конференция</option>
                <option value="education">Образование</option>
                <option value="analytics">Аналитика</option>
                <option value="other">Другое</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Resident Organizer */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" /> Организатор (Резидент)
              </label>
              <input
                type="text"
                value={residentOrganizer}
                onChange={(e) => setResidentOrganizer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                placeholder="СОБА, Синдикат, Finmuster..."
              />
            </div>

            {/* Payment URL */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Ссылка на билеты / Регистрацию
              </label>
              <input
                type="url"
                value={paymentUrl}
                onChange={(e) => setPaymentUrl(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#f8173f]/20 focus:border-[#f8173f] text-sm text-[#1a2e35]"
                placeholder="https://soba.spb.ru/tickets"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
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
  );
};
