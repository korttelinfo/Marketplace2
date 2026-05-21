'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type NavItem = {
  label: string;
  href: string;
  icon: string;
  requiresAuth?: boolean;
};

const navItems: NavItem[] = [
  { label: 'Etusivu', href: '/', icon: '🏠' },
  { label: 'Selaa', href: '/browse', icon: '🔍' },
  { label: 'Luo', href: '/create', icon: '➕', requiresAuth: true },
  { label: 'Posti', href: '/inbox', icon: '✉️', requiresAuth: true },
  { label: 'Profiili', href: '/profile', icon: '👤', requiresAuth: true },
];

export default function BottomNav() {
  const pathname = usePathname() ?? '/';
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const isLoggedIn = Boolean(session?.user);

  if (
    pathname.includes('/login') ||
    pathname.includes('/reset-password') ||
    pathname.includes('/onboarding')
  ) {
    return null;
  }

  const visibleNavItems = navItems.filter((item) => !item.requiresAuth || isLoggedIn);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/95 shadow-lg shadow-slate-200 backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-full items-center justify-around px-2">
        {visibleNavItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="line-clamp-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}