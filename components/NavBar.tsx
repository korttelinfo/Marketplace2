'use client';

import { usePathname } from 'next/navigation';

const navLinks = [
  { label: 'Etusivu', href: '/' },
  { label: 'Selaa', href: '/browse' },
  { label: 'Profiili', href: '/profile' },
];

function navLinkClass(isActive: boolean) {
  return `rounded-full px-4 py-2 transition ${
    isActive ? 'bg-slate-900 text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
  }`;
}

export default function NavBar() {
  const pathname = usePathname() ?? '/';

  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-sm shadow-slate-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8">
        <a href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Korttelinfo
        </a>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          {navLinks.map((link) => {
            const isActive = link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
            return (
              <a key={link.href} href={link.href} className={navLinkClass(isActive)}>
                {link.label}
              </a>
            );
          })}
          <a
            href="/create"
            className="rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Luo keikka
          </a>
        </div>
      </div>
    </nav>
  );
}
