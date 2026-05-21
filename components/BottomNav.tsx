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
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    let mounted = true;

    const loadSessionAndUnread = async () => {
      const { data } = await supabase.auth.getSession();

      if (!mounted) return;

      setSession(data.session);

      if (!data.session) {
        setHasUnread(false);
        return;
      }

      const userId = data.session.user.id;

      const responsesResult = await supabase
        .from('gig_responses')
        .select('id')
        .eq('owner_id', userId)
        .is('read_at', null)
        .limit(1);

      const messagesResult = await supabase
        .from('gig_response_messages')
        .select(`
          id,
          sender_id,
          read_at,
          gig_responses!inner (
            sender_id,
            owner_id
          )
        `)
        .neq('sender_id', userId)
        .is('read_at', null)
        .or(`sender_id.eq.${userId},owner_id.eq.${userId}`, {
          foreignTable: 'gig_responses',
        })
        .limit(1);

      const unreadResponses = responsesResult.data?.length ?? 0;
      const unreadMessages = messagesResult.data?.length ?? 0;

      setHasUnread(unreadResponses + unreadMessages > 0);
    };

    loadSessionAndUnread();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!mounted) return;
      setSession(newSession ?? null);
      loadSessionAndUnread();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

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
          const showUnreadDot = item.href === '/inbox' && hasUnread;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl px-1 py-2 text-xs font-medium transition ${
                isActive
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <span className="relative text-lg">
                {item.icon}

                {showUnreadDot ? (
                  <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : null}
              </span>

              <span className="line-clamp-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}