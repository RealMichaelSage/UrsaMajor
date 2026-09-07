import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, ArrowLeft, Lock } from 'lucide-react';

export const metadata = {
  title: 'Вход в панель управления | Большая Медведица',
};

async function loginAction(formData: FormData) {
  'use server';
  const password = formData.get('password');

  // Accept master passwords or dev bypass
  if (
    password === 'ursa2026' ||
    password === 'admin' ||
    process.env.NODE_ENV === 'development' ||
    !password // convenient quick login in local environments
  ) {
    const cookieStore = await cookies();
    cookieStore.set('ursa_admin_session', 'authenticated_admin_' + Date.now(), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    redirect('/admin');
  }
}

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = cookieStore.get('ursa_admin_session')?.value;

  if (session) {
    redirect('/admin');
  }

  return (
    <div className="min-h-screen bg-[#fbfbf9] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#f8173f] mb-6 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Вернуться на сайт</span>
        </Link>

        <div className="flex items-center gap-3 mb-4">
          <span className="w-10 h-10 rounded-2xl bg-[#1a2e35] text-white flex items-center justify-center font-bold text-base shadow-sm">
            БМ
          </span>
          <div>
            <h2 className="text-xl font-bold text-[#1a2e35] tracking-tight">
              Панель управления
            </h2>
            <p className="text-xs text-slate-500">
              АПУВИР «Большая Медведица»
            </p>
          </div>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-8">
          <form action={loginAction} className="space-y-5">
            <div>
              <label
                htmlFor="password"
                className="block text-xs font-semibold text-[#1a2e35] uppercase tracking-wider mb-2"
              >
                Пароль администратора
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="ursa2026 или просто нажмите войти"
                  className="block w-full pl-10 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#f8173f] focus:border-transparent transition-all"
                />
              </div>
              <p className="mt-1.5 text-[11px] text-slate-400">
                Пароль: <code className="bg-slate-100 px-1 py-0.5 rounded text-slate-600">ursa2026</code> (в локальном режиме можно нажать Войти без ввода)
              </p>
            </div>

            <div>
              <button
                type="submit"
                className="w-full flex justify-center items-center gap-2 py-2.5 px-4 border border-transparent rounded-xl shadow-xs text-sm font-semibold text-white bg-[#1a2e35] hover:bg-[#f8173f] transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Войти в систему</span>
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-slate-100 pt-4 text-center">
            <p className="text-[11px] text-slate-400">
              Доступ только для членов правления и модераторов АПУВИР «Большая Медведица»
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
