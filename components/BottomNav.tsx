'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Bell,
  CirclePlus,
  CircleUserRound,
  House,
  MessagesSquare,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
  center?: boolean;
};

const navItems: NavItem[] = [
  {
    label: 'Lähellä',
    href: '/browse',
    icon: <House size={22} strokeWidth={2} />,
  },
  {
    label: 'Omat jutut',
    href: '/activity',
    icon: <MessagesSquare size={22} strokeWidth={2} />,
    requiresAuth: true,
  },
  {
    label: 'Uusi',
    href: '/create',
    icon: <CirclePlus size={24} strokeWidth={2.1} />,
    requiresAuth: true,
    center: true,
  },
  {
    label: 'Tapahtumat',
    href: '/notifications',
    icon: <Bell size={22} strokeWidth={2} />,
    requiresAuth: true,
  },
  {
    label: 'Profiili',
    href: '/profile',
    icon: <CircleUserRound size={22} strokeWidth={2} />,
    requiresAuth: true,
  },
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
        .select(
          `
          id,
          sender_id,
          read_at,
          gig_responses!inner (
            sender_id,
            owner_id
          )
        `,
        )
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

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        if (!mounted) return;
        setSession(newSession ?? null);
        loadSessionAndUnread();
      },
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  if (
    pathname.includes('/login') ||
    pathname.includes('/reset-password') ||
    pathname.includes('/onboarding')
  ) {
    return null;
  }

  const isLoggedIn = Boolean(session?.user);

  // Replace with real unread events state later.
  const hasUnreadEvents = hasUnread;

  const visibleNavItems = navItems.filter(
    (item) => !item.requiresAuth || isLoggedIn,
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="grid h-[86px] grid-cols-5 items-center rounded-[2rem] bg-white/95 px-2 shadow-[0_-6px_20px_rgba(74,59,47,0.08)] ring-1 ring-stone-200/70 backdrop-blur-md">
          {visibleNavItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            const showUnreadDot =
              item.href === '/notifications' && hasUnreadEvents;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-label={item.label}
                className="flex min-w-0 justify-center"
              >
                <span
                  className={`relative inline-flex min-h-[58px] min-w-[58px] items-center justify-center rounded-[1.45rem] px-3 transition ${
                    isActive
                      ? 'bg-[#e6d7c3] text-stone-950 shadow-sm ring-1 ring-stone-200/70'
                      : item.center
                        ? 'bg-[#f6efe4] text-stone-800 ring-1 ring-stone-200/70 hover:bg-[#eadfce]'
                        : 'text-stone-500 hover:bg-[#fbf8f2] hover:text-stone-800'
                  }`}
                >
                  <span className="relative flex items-center justify-center">
                    {item.icon}

                    {showUnreadDot ? (
                      <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                    ) : null}
                  </span>

                  {isActive ? (
                    <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap text-[10px] font-semibold tracking-tight text-stone-950">
                      {item.label}
                    </span>
                  ) : null}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}