'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import type { Session } from '@supabase/supabase-js';

const navLinks = [
  { label: 'Etusivu', href: '/' },
  { label: 'Selaa', href: '/browse' },
  { label: 'Profiili', href: '/profile' },
];

function navLinkClass(isActive: boolean) {
  return `rounded-full px-4 py-2 text-sm font-semibold transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  }`;
}

export default function NavBar() {
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
      // `newSession` is the Session object or null
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

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-sm shadow-slate-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Korttelinfo
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href} className={navLinkClass(isActive)}>
                {link.label}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <button
              onClick={handleSignOut}
              className="rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
          )}

          <Link
            href="/create"
            className="rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Luo keikka
          </Link>
        </div>
      </div>
    </nav>
  );
}
