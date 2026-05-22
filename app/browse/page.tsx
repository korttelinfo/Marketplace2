'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageContainer from '../../components/PageContainer';
import GigCard from '../../components/GigCard';
import type { BrowseGig } from '../../lib/mockGigs';
import {
  helpCategories,
  URGENCY_OPTIONS,
  getUrgencyEmoji,
  type Urgency,
} from '../../lib/helpCategories';
import { cities } from '../../lib/locations';
import { supabase } from '../../lib/supabase';

const listingTypes = [
  { label: 'Kaikki', value: 'Kaikki' },
  { label: 'Tarvitaan', value: 'Tarvitsen apua' },
  { label: 'Tarjolla', value: 'Tarjoan apua' },
];

const quickSearches = [
  'porakone',
  'kissanhoito',
  'kantoapu',
  'Excel-apu',
  'koiran ulkoilutus',
  'lenkkiseura',
  'muuttoapu',
];

const topCategories = Object.keys(helpCategories);

export default function BrowsePage() {
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Kaikki');
  const [activeCategoryGroup, setActiveCategoryGroup] = useState('Kaikki');
  const [activeListingType, setActiveListingType] = useState('Kaikki');
  const [activeTiming, setActiveTiming] = useState('Kaikki');
  const [gigs, setGigs] = useState<BrowseGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('gigs')
        .select('id,title,category,budget,location,date_time,description,status,listing_type')
        .or('status.eq.vapaa,status.is.null');

      if (fetchError) {
        console.error(fetchError);
        setError(fetchError.message);
        setGigs([]);
      } else {
        setGigs(data ?? []);
      }

      setLoading(false);
    };

    fetchGigs();
  }, []);

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      const listingType = (gig as any).listing_type || 'Tarvitsen apua';

      const matchesListingType =
        activeListingType === 'Kaikki' || listingType === activeListingType;

      const matchesCity =
        selectedCity === 'Kaikki' ||
        gig.location?.toLowerCase().includes(selectedCity.toLowerCase());

      const categoryGroupMatch =
        activeCategoryGroup === 'Kaikki'
          ? true
          : helpCategories[activeCategoryGroup]?.includes(gig.category);

      const matchesTiming =
        activeTiming === 'Kaikki' || gig.date_time === activeTiming;

      const search = query.trim().toLowerCase();

      const matchesQuery = search
        ? [gig.title, gig.description, gig.category, gig.location, gig.budget]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(search))
        : true;

      return (
        matchesListingType &&
        matchesCity &&
        categoryGroupMatch &&
        matchesTiming &&
        matchesQuery
      );
    });
  }, [activeCategoryGroup, activeListingType, activeTiming, gigs, query, selectedCity]);

  const hasActiveFilters =
    query ||
    selectedCity !== 'Kaikki' ||
    activeCategoryGroup !== 'Kaikki' ||
    activeListingType !== 'Kaikki' ||
    activeTiming !== 'Kaikki';

  const resetFilters = () => {
    setQuery('');
    setSelectedCity('Kaikki');
    setActiveCategoryGroup('Kaikki');
    setActiveListingType('Kaikki');
    setActiveTiming('Kaikki');
  };

  return (
    <PageContainer contentClassName="max-w-7xl">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                Lähellä nyt
              </p>

              <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Mitä lähialueella tapahtuu?
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Löydä arjen apua, tavaroita, osaamista ja pieniä kohtaamisia läheltäsi.
              </p>
            </div>

            <Link
              href="/create"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Kerro mitä tarvitset
            </Link>
          </div>

          <div className="mt-7">
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Mitä etsit? Esim. porakone, kissanhoito, muuttoapu..."
              className="w-full rounded-full border border-orange-100 bg-white px-5 py-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
            />

            <div className="mt-4 flex flex-wrap gap-2">
              {quickSearches.map((word) => (
                <button
                  key={word}
                  type="button"
                  onClick={() => setQuery(word)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition ${
                    query.toLowerCase() === word.toLowerCase()
                      ? 'bg-slate-950 text-white'
                      : 'border border-orange-100 bg-white text-slate-600 hover:bg-orange-50'
                  }`}
                >
                  {word}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="h-fit rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm lg:sticky lg:top-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-orange-700">
                  Rajaa näkymää
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Kevyet valinnat, ei katalogia.
                </p>
              </div>
            </div>

            <FilterGroup title="Näytä">
              {listingTypes.map((type) => (
                <FilterButton
                  key={type.value}
                  active={activeListingType === type.value}
                  onClick={() => setActiveListingType(type.value)}
                >
                  {type.label}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="Aiheet">
              <FilterButton
                active={activeCategoryGroup === 'Kaikki'}
                onClick={() => setActiveCategoryGroup('Kaikki')}
              >
                Kaikki aiheet
              </FilterButton>

              {topCategories.map((category) => (
                <FilterButton
                  key={category}
                  active={activeCategoryGroup === category}
                  onClick={() => setActiveCategoryGroup(category)}
                >
                  {category}
                </FilterButton>
              ))}
            </FilterGroup>

            <FilterGroup title="Aika">
              <FilterButton
                active={activeTiming === 'Kaikki'}
                onClick={() => setActiveTiming('Kaikki')}
              >
                Kaikki ajat
              </FilterButton>

              {URGENCY_OPTIONS.map((timing) => (
                <FilterButton
                  key={timing}
                  active={activeTiming === timing}
                  onClick={() => setActiveTiming(timing)}
                >
                  {getUrgencyEmoji(timing as Urgency)} {timing}
                </FilterButton>
              ))}
            </FilterGroup>

            <div className="mt-6">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Kaupunki
              </label>

              <select
                value={selectedCity}
                onChange={(event) => setSelectedCity(event.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-[#fffaf3] px-4 py-3 text-sm text-slate-700 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
              >
                <option value="Kaikki">Kaikki kaupungit</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters ? (
              <button
                type="button"
                onClick={resetFilters}
                className="mt-5 w-full rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Tyhjennä rajaukset
              </button>
            ) : null}
          </aside>

          <main className="space-y-4">
            <div className="flex flex-col gap-3 rounded-[1.75rem] border border-orange-100 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-950">
                  {loading ? 'Ladataan...' : `${filteredGigs.length} asiaa lähelläsi`}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {hasActiveFilters
                    ? 'Näytetään valintojesi mukaiset tilanteet.'
                    : 'Näytetään kaikki avoimet tarpeet ja tarjonnat.'}
                </p>
              </div>

              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex justify-center rounded-full bg-[#fffaf3] px-4 py-2 text-sm font-semibold text-slate-700 ring-1 ring-orange-100 transition hover:bg-orange-50"
                >
                  Näytä kaikki
                </button>
              ) : null}
            </div>

            {loading ? (
              <div className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] p-8 text-center text-slate-500">
                Ladataan lähialueen tilanteita...
              </div>
            ) : error ? (
              <div className="rounded-[2rem] border border-red-200 bg-red-50 p-6 text-center text-red-700">
                {error}
              </div>
            ) : filteredGigs.length === 0 ? (
              <div className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] p-8 text-center">
                <p className="text-lg font-semibold text-slate-900">
                  Mitään sopivaa ei löytynyt
                </p>

                <p className="mt-2 text-sm text-slate-600">
                  Kokeile toista hakusanaa tai julkaise oma tarve.
                </p>

                <Link
                  href="/create"
                  className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Kerro mitä tarvitset
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredGigs.map((gig) => (
                  <GigCard key={gig.id} gig={gig} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </PageContainer>
  );
}

function FilterGroup({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-6">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title}
      </p>

      <div className="space-y-2">{children}</div>
    </div>
  );
}

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl px-4 py-3 text-left text-sm font-semibold transition ${
        active
          ? 'bg-slate-950 text-white'
          : 'bg-[#fffaf3] text-slate-600 ring-1 ring-orange-100 hover:bg-orange-50'
      }`}
    >
      {children}
    </button>
  );
}