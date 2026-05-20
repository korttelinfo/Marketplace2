'use client';

import { useMemo, useState } from 'react';
import PageContainer from '../../components/PageContainer';
import GigCard from '../../components/GigCard';
import { browseCategories, browseGigs } from '../../lib/mockGigs';

export default function BrowsePage() {
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Kaikki');

  const filteredGigs = useMemo(() => {
    return browseGigs.filter((gig) => {
      const matchesCategory = activeCategory === 'Kaikki' || gig.category === activeCategory;
      const matchesQuery = query
        ? [gig.title, gig.description, gig.category, gig.location].some((field) =>
            field.toLowerCase().includes(query.toLowerCase()),
          )
        : true;
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, query]);

  return (
    <PageContainer>
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Selaa keikkoja</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Löydä seuraava naapurin apukeikka.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            Suodata lähelläsi olevia pienimuotoisia töitä, löydä sopiva hinta ja ota yhteys nopeasti.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="relative block w-full">
            <span className="sr-only">Hae keikkoja</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Hae keikkoja esimerkiksi siivous, koira, pihatyö..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>
          <p className="text-sm text-slate-500 sm:text-right">{filteredGigs.length} keikkaa</p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {browseCategories.map((category) => {
            const selected = activeCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  selected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredGigs.map((gig) => (
            <GigCard key={gig.title} gig={gig} />
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
