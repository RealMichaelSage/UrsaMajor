'use client';

import React from 'react';
import { Calendar, Clock, CheckCircle, Radio, Users } from 'lucide-react';

export interface AdminMetricsData {
  totalEvents: number;
  pendingEvents: number;
  approvedEvents: number;
  activeSeeds: number;
  totalApplications?: number;
}

interface AdminMetricsProps {
  metrics: AdminMetricsData;
}

export const AdminMetrics: React.FC<AdminMetricsProps> = ({ metrics }) => {
  const cards = [
    {
      label: 'Всего событий в базе',
      value: metrics.totalEvents,
      sublabel: 'Все статусы',
      icon: Calendar,
      color: 'text-[#1a2e35]',
      bg: 'bg-slate-50',
      border: 'border-slate-200',
    },
    {
      label: 'Очередь модерации',
      value: metrics.pendingEvents,
      sublabel: metrics.pendingEvents > 0 ? 'Требуют рассмотрения' : 'Все промодерировано',
      icon: Clock,
      color: metrics.pendingEvents > 0 ? 'text-[#f8173f]' : 'text-slate-600',
      bg: metrics.pendingEvents > 0 ? 'bg-red-50' : 'bg-slate-50',
      border: metrics.pendingEvents > 0 ? 'border-red-200' : 'border-slate-200',
      badge: metrics.pendingEvents > 0 ? `${metrics.pendingEvents} новых` : null,
    },
    {
      label: 'Одобрено событий',
      value: metrics.approvedEvents,
      sublabel: 'На витрине /events',
      icon: CheckCircle,
      color: 'text-emerald-700',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
    },
    {
      label: 'Активных источников (Seeds)',
      value: metrics.activeSeeds,
      sublabel: 'Telegram & Web парсеры',
      icon: Radio,
      color: 'text-sky-700',
      bg: 'bg-sky-50',
      border: 'border-sky-200',
    },
    {
      label: 'Заявок на вступление',
      value: metrics.totalApplications ?? 14,
      sublabel: 'Членство & консультации',
      icon: Users,
      color: 'text-purple-700',
      bg: 'bg-purple-50',
      border: 'border-purple-200',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`p-5 rounded-2xl bg-white border ${card.border} shadow-sm transition-all hover:shadow-md`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {card.label}
              </span>
              <div className={`p-2 rounded-xl ${card.bg}`}>
                <Icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[#1a2e35]">
                {card.value}
              </span>
              {card.badge && (
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[#f8173f] text-white">
                  {card.badge}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs text-slate-500">{card.sublabel}</p>
          </div>
        );
      })}
    </div>
  );
};
