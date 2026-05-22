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
  { label: 'Lähellä', href: '/browse' },
  { label: 'Omat jutut', href: '/activity', requiresAuth: true },
  { label: 'Profiili', href: '/profile', requiresAuth: true },
];

function navLinkClass(isActive: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive
      ? 'bg-slate-950 text-white'
      : 'text-slate-700 hover:bg-orange-50 hover:text-slate-950'
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

  const visibleLinks = navLinks.filter((link) => !link.requiresAuth || isLoggedIn);

  if (
    pathname.includes('/login') ||
    pathname.includes('/reset-password') ||
    pathname.includes('/onboarding')
  ) {
    return null;
  }

  return (
    <nav className="sticky top-0 z-40 hidden border-b border-orange-100 bg-white/90 shadow-sm shadow-orange-50 backdrop-blur-md md:block">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/browse" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fffaf3] text-lg ring-1 ring-orange-100 transition group-hover:bg-orange-50">
            🏘️
          </div>

          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-950">
              Kortteli
            </p>
            <p className="-mt-0.5 text-xs font-medium text-slate-500">
              Lähellä tapahtuu
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-2">
          {visibleLinks.map((link) => {
            const isActive =
              link.href === '/'
                ? pathname === '/'
                : pathname.startsWith(link.href);

            return (
              <Link key={link.href} href={link.href} className={navLinkClass(isActive)}>
                {link.label}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <>
              <Link
                href="/create"
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                + Tarvitsen
              </Link>

              <Link
                href="/notifications"
                className={`relative flex h-10 w-10 items-center justify-center rounded-full text-lg transition ${
                  pathname.startsWith('/notifications')
                    ? 'bg-slate-950 text-white'
                    : 'bg-[#fffaf3] text-slate-700 ring-1 ring-orange-100 hover:bg-orange-50'
                }`}
                aria-label="Ilmoitukset"
              >
                🔔
                {hasUnread ? (
                  <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full bg-orange-500 ring-2 ring-white" />
                ) : null}
              </Link>

              <button
                type="button"
                onClick={handleSignOut}
                className="rounded-full border border-orange-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-orange-50"
              >
                Poistu
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass(pathname === '/login')}>
                Kirjaudu
              </Link>

              <Link
                href="/login"
                className="rounded-full bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Aloita
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}