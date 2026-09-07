'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Clock,
  Radio,
  Play,
  FileText,
  Layers,
  RefreshCw,
  History,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { EventItem, ParsingSeed, ModeratorAuditLog } from '@/shared/types';
import { AdminMetrics } from './AdminMetrics';
import { IngestionTrigger } from './IngestionTrigger';
import { ModerationQueue } from './ModerationQueue';
import { SeedsManager } from './SeedsManager';

interface AdminDashboardProps {
  initialEvents: EventItem[];
  initialSeeds: ParsingSeed[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  initialEvents,
  initialSeeds,
}) => {
  const [events, setEvents] = useState<EventItem[]>(initialEvents);
  const [seeds, setSeeds] = useState<ParsingSeed[]>(initialSeeds);
  const [activeTab, setActiveTab] = useState<'all' | 'moderation' | 'seeds' | 'ingest' | 'audit'>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<
    {
      id: string;
      action: string;
      changedBy: string;
      timestamp: string;
      details?: string;
    }[]
  >([
    {
      id: 'log-1',
      action: 'seed_created',
      changedBy: 'system',
      timestamp: new Date().toISOString(),
      details: 'Инициализирован источник СОБА Новости & Питчи',
    },
    {
      id: 'log-2',
      action: 'event_approved',
      changedBy: 'модератор',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      details: 'Одобрено мероприятие: Инвестиционный питч-день СОБА',
    },
  ]);

  // Fetch fresh events and seeds from API
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      const [eventsRes, seedsRes] = await Promise.all([
        fetch('/api/admin/events?limit=100').then((r) => (r.ok ? r.json() : null)),
        fetch('/api/admin/seeds').then((r) => (r.ok ? r.json() : null)),
      ]);

      if (eventsRes && eventsRes.events) {
        setEvents(eventsRes.events);
      }
      if (seedsRes && seedsRes.seeds) {
        setSeeds(seedsRes.seeds);
      }
    } catch (err) {
      console.warn('[Admin Dashboard] Refresh warning:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial sync with API
    refreshData();
  }, []);

  // Moderation Action Handler
  const handleModerationAction = async (
    eventId: string,
    action: 'approve' | 'top' | 'ban' | 'edit',
    data?: Partial<EventItem>
  ) => {
    // Optimistic UI update
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        if (action === 'approve') return { ...e, status: 'approved' };
        if (action === 'top') return { ...e, isTop: true, status: 'approved' };
        if (action === 'ban') return { ...e, status: 'rejected', isTop: false };
        if (action === 'edit' && data) return { ...e, ...data };
        return e;
      })
    );

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, action, data }),
      });

      if (!res.ok) {
        console.error('Failed to execute moderation action:', await res.text());
        // Revert by re-fetching
        refreshData();
      } else {
        // Append to audit logs
        setAuditLogs((prev) => [
          {
            id: 'log-' + Date.now(),
            action: `event_${action}`,
            changedBy: 'модератор',
            timestamp: new Date().toISOString(),
            details: `Мероприятие ${eventId.slice(0, 8)}... -> ${action}`,
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Error in handleModerationAction:', err);
      refreshData();
    }
  };

  // Seed Toggle Handler
  const handleToggleSeed = async (seedId: string, currentActive: boolean) => {
    const nextState = !currentActive;
    setSeeds((prev) =>
      prev.map((s) => (s.id === seedId ? { ...s, isActive: nextState } : s))
    );

    try {
      await fetch(`/api/admin/seeds/${seedId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: nextState }),
      });
    } catch (err) {
      console.error('Failed to toggle seed status:', err);
      refreshData();
    }
  };

  // Add Seed Handler
  const handleAddSeed = async (newSeed: Partial<ParsingSeed>) => {
    try {
      const res = await fetch('/api/admin/seeds', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSeed),
      });

      if (res.ok) {
        const json = await res.json();
        if (json.seed) {
          setSeeds((prev) => [json.seed, ...prev]);
        } else {
          refreshData();
        }
      }
    } catch (err) {
      console.error('Failed to add seed:', err);
      refreshData();
    }
  };

  // Delete Seed Handler
  const handleDeleteSeed = async (seedId: string) => {
    if (!confirm('Вы уверены, что хотите удалить этот источник парсинга?')) {
      return;
    }

    setSeeds((prev) => prev.filter((s) => s.id !== seedId));
    try {
      await fetch(`/api/admin/seeds/${seedId}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete seed:', err);
      refreshData();
    }
  };

  // Calculate metrics
  const metricsData = {
    totalEvents: events.length,
    pendingEvents: events.filter((e) => e.status === 'pending').length,
    approvedEvents: events.filter((e) => e.status === 'approved').length,
    activeSeeds: seeds.filter((s) => s.isActive).length,
    totalApplications: 14,
  };

  return (
    <div className="space-y-8">
      {/* Executive Metrics Overview */}
      <section aria-label="Метрики экосистемы">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[#1a2e35]">
            Ключевые метрики экосистемы
          </h2>
          <button
            type="button"
            onClick={refreshData}
            disabled={isRefreshing}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Обновить данные</span>
          </button>
        </div>
        <AdminMetrics metrics={metricsData} />
      </section>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200">
        <nav className="flex space-x-2 sm:space-x-4 overflow-x-auto pb-px" aria-label="Разделы управления">
          {[
            { id: 'all', label: 'Все разделы', icon: Layers },
            { id: 'moderation', label: 'Очередь модерации', icon: Clock, count: metricsData.pendingEvents },
            { id: 'seeds', label: 'Источники парсинга (Seeds)', icon: Radio, count: seeds.length },
            { id: 'ingest', label: 'Ручной запуск', icon: Play },
            { id: 'audit', label: 'Журнал аудита', icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`inline-flex items-center gap-2 py-3 px-4 border-b-2 text-sm font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-[#f8173f] text-[#f8173f]'
                    : 'border-transparent text-slate-600 hover:text-[#1a2e35] hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.count !== undefined && tab.count > 0 && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                      tab.id === 'moderation'
                        ? 'bg-red-100 text-[#f8173f]'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Ingestion Trigger Card */}
      {(activeTab === 'all' || activeTab === 'ingest') && (
        <section id="ingest-section">
          <IngestionTrigger onIngestComplete={refreshData} />
        </section>
      )}

      {/* Event Moderation Queue */}
      {(activeTab === 'all' || activeTab === 'moderation') && (
        <section id="moderation-section">
          <ModerationQueue
            events={events}
            onAction={handleModerationAction}
            onRefresh={refreshData}
          />
        </section>
      )}

      {/* Parsing Seeds Management */}
      {(activeTab === 'all' || activeTab === 'seeds') && (
        <section id="seeds-section">
          <SeedsManager
            seeds={seeds}
            onAddSeed={handleAddSeed}
            onToggleActive={handleToggleSeed}
            onDeleteSeed={handleDeleteSeed}
          />
        </section>
      )}

      {/* Moderator Audit Log */}
      {(activeTab === 'all' || activeTab === 'audit') && (
        <section id="audit-section" className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-2 pb-4 mb-4 border-b border-slate-100">
            <span className="p-1.5 rounded-lg bg-purple-100 text-purple-700">
              <History className="w-4 h-4" />
            </span>
            <h3 className="text-lg font-bold text-[#1a2e35]">
              Журнал аудита действий модератора (Audit Log)
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Время (UTC+3)</th>
                  <th className="py-2.5 px-3">Действие</th>
                  <th className="py-2.5 px-3">Пользователь</th>
                  <th className="py-2.5 px-3">Детали</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50">
                    <td className="py-3 px-3 text-xs text-slate-500 font-mono">
                      {new Date(log.timestamp).toLocaleString('ru-RU')}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-700 font-medium">
                      {log.changedBy}
                    </td>
                    <td className="py-3 px-3 text-xs text-slate-600">
                      {log.details || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
