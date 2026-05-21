'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

type NavLink = {
  label: string;
  href: string;
  requiresAuth?: boolean;
};

const navLinks: NavLink[] = [
  { label: 'Etusivu', href: '/' },
  { label: 'Selaa', href: '/browse' },
  { label: 'Posti', href: '/inbox', requiresAuth: true },
  { label: 'Profiili', href: '/profile', requiresAuth: true },
];

function navLinkClass(isActive: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-900 text-white'
      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  }`;
}

export default function NavBar() {
  const pathname = usePathname() ?? '/';
  const router = useRouter();

  const [session, setSession] = useState<Session | null>(null);
  const [hasUnread, setHasUnread] = useState(false);

  const loadSessionAndUnread = async () => {
    const { data } = await supabase.auth.getSession();

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

  useEffect(() => {
    let mounted = true;

    const run = async () => {
      if (!mounted) return;
      await loadSessionAndUnread();
    };

    run();

    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      if (!mounted) return;
      loadSessionAndUnread();
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
    setHasUnread(false);
    router.push('/');
  };

  const isLoggedIn = Boolean(session?.user);

  const visibleLinks = navLinks.filter(
    (link) => !link.requiresAuth || isLoggedIn
  );

  return (
    <nav className="sticky top-0 z-40 hidden border-b border-slate-200/70 bg-white/95 shadow-sm shadow-slate-100 backdrop-blur-md md:block">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="text-xl font-semibold tracking-tight text-slate-900"
        >
          Kortteli
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {visibleLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            const showUnreadDot = link.href === '/inbox' && hasUnread;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`${navLinkClass(isActive)} relative`}
              >
                {link.label}

                {showUnreadDot ? (
                  <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : null}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <>
              <Link
                href="/create"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Luo ilmoitus
              </Link>

              <button
                onClick={handleSignOut}
                className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
              >
                Poistu
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className={navLinkClass(pathname === '/login')}
              >
                Kirjaudu
              </Link>

              <Link
                href="/login"
                className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Luo ilmoitus
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}