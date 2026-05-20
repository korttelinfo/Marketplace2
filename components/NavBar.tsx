export default function NavBar() {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/95 backdrop-blur-md shadow-sm shadow-slate-100">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6 lg:px-8">
        <a href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          Korttelinfo
        </a>

        <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-700">
          <a
            href="/"
            className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Etusivu
          </a>
          <a
            href="/browse"
            className="rounded-full px-4 py-2 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Selaa
          </a>
          <a
            href="/create"
            className="rounded-full border border-slate-200 bg-slate-950 px-4 py-2 text-white transition hover:bg-slate-800"
          >
            Luo keikka
          </a>
        </div>
      </div>
    </nav>
  );
}
