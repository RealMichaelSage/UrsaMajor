import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  ShieldCheck,
  LogOut,
  Calendar,
  Radio,
  FileText,
  ExternalLink,
  Users,
} from 'lucide-react';

export const metadata = {
  title: 'Панель управления ассоциации | Большая Медведица',
  description: 'Административная панель управления парсингом и модерацией мероприятий ассоциации венчурных инвесторов «Большая Медведица»',
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const session = cookieStore.get('ursa_admin_session')?.value;

  // Unauthenticated user protection
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9] text-[#1a2e35]">
      {/* Admin Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo and Dashboard Title */}
            <div className="flex items-center gap-3">
              <Link href="/admin" className="flex items-center gap-2 group">
                <span className="w-8 h-8 rounded-xl bg-[#1a2e35] text-white flex items-center justify-center font-bold text-sm group-hover:bg-[#f8173f] transition-colors">
                  БМ
                </span>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-[#1a2e35] leading-tight">
                    Панель управления
                  </h1>
                  <span className="text-[11px] text-slate-500 block">
                    АПУВИР «Большая Медведица»
                  </span>
                </div>
              </Link>
            </div>

            {/* Navigation links (Moderation, Sources, Applications) */}
            <nav className="hidden md:flex items-center space-x-1 lg:space-x-2" aria-label="Основная навигация админ-панели">
              <Link
                href="/admin"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-[#1a2e35] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5 text-[#f8173f]" />
                <span>Модерация</span>
              </Link>

              <Link
                href="/admin#seeds-section"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#1a2e35] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Radio className="w-3.5 h-3.5 text-sky-600" />
                <span>Источники</span>
              </Link>

              <Link
                href="/admin#audit-section"
                className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-[#1a2e35] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <Users className="w-3.5 h-3.5 text-purple-600" />
                <span>Заявки</span>
              </Link>

              <Link
                href="/"
                target="_blank"
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-[#1a2e35] hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <span>На сайт</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </nav>

            {/* User Session & Logout Action */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-xs font-medium text-slate-700">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Модератор</span>
              </div>

              <form
                action={async () => {
                  'use server';
                  const cStore = await cookies();
                  cStore.delete('ursa_admin_session');
                  redirect('/');
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Выйти</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
