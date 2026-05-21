'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type NavItem = {
  label: string;
  href: string;
  icon: string;
};

const navItems: NavItem[] = [
  { label: 'Etusivu', href: '/', icon: '🏠' },
  { label: 'Selaa', href: '/browse', icon: '🔍' },
  { label: 'Luo', href: '/create', icon: '➕' },
  { label: 'Profiili', href: '/profile', icon: '👤' },
];

export default function BottomNav() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    router.push('/');
  };

  const isLoggedIn = Boolean(session?.user);

  // Don't show bottom nav on login, reset-password, or onboarding pages
  if (pathname.includes('/login') || pathname.includes('/reset-password') || pathname.includes('/onboarding')) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/70 bg-white/95 backdrop-blur-md shadow-lg shadow-slate-200 md:hidden">
      <div className="mx-auto flex h-16 max-w-full items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium transition ${
                isActive
                  ? 'text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="line-clamp-1">{item.label}</span>
            </Link>
          );
        })}
        {isLoggedIn && (
          <button
            onClick={handleSignOut}
            className="flex flex-col items-center justify-center gap-1 px-2 py-2 text-xs font-medium text-slate-500 transition hover:text-slate-700"
          >
            <span className="text-lg">🚪</span>
            <span>Poistu</span>
          </button>
        )}
      </div>
    </nav>
  );
}
