'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PageContainer from '../../components/PageContainer';
import GigCard from '../../components/GigCard';
import type { BrowseGig } from '../../lib/mockGigs';
import { getAllCategories } from '../../lib/helpCategories';
import { cities } from '../../lib/locations';
import { supabase } from '../../lib/supabase';

const listingTypes = ['Kaikki', 'Tarvitsen apua', 'Tarjoan apua'];

export default function BrowsePage() {
  const [query, setQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Kaikki');
  const [activeCategory, setActiveCategory] = useState('Kaikki');
  const [activeListingType, setActiveListingType] = useState('Kaikki');
  const [gigs, setGigs] = useState<BrowseGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const allCategories = getAllCategories();

  useEffect(() => {
    const fetchGigs = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
  .from('gigs')
  .select('id,title,category,budget,location,date_time,description,status,listing_type')
  .eq('status', 'vapaa');

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        setError(fetchError.message);
        setGigs([]);
      } else {
        setGigs(data ?? []);
      }

      setLoading(false);
    };

    fetchGigs();
  }, []);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => {
      setError(null);
    }, 10000);

    return () => clearTimeout(timer);
  }, [error]);

  const filteredGigs = useMemo(() => {
    return gigs.filter((gig) => {
      const listingType = (gig as any).listing_type || 'Tarvitsen apua';

      const matchesListingType =
        activeListingType === 'Kaikki' || listingType === activeListingType;

      const matchesCategory =
        activeCategory === 'Kaikki' || gig.category === activeCategory;

      const matchesCity =
        selectedCity === 'Kaikki' ||
        gig.location?.toLowerCase().includes(selectedCity.toLowerCase());

      const matchesQuery = query
        ? [gig.title, gig.description, gig.category, gig.location]
            .filter(Boolean)
            .some((field) => field.toLowerCase().includes(query.toLowerCase()))
        : true;

      return matchesListingType && matchesCategory && matchesCity && matchesQuery;
    });
  }, [activeCategory, activeListingType, gigs, query, selectedCity]);

  const hasActiveFilters =
    query || selectedCity !== 'Kaikki' || activeCategory !== 'Kaikki' || activeListingType !== 'Kaikki';

  return (
    <PageContainer>
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Selaa arkiapua
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Löydä apua tai auta lähelläsi.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            Selaa naapuruston apupyyntöjä ja tarjouksia. Voit etsiä apua, tarjoutua auttamaan tai löytää sopivan ilmoituksen omalta alueeltasi.
          </p>
        </div>

        <div className="mt-8 rounded-[1.5rem] bg-slate-100 p-1">
          <div className="grid grid-cols-3 gap-1">
            {listingTypes.map((type) => {
              const selected = activeListingType === type;

              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setActiveListingType(type)}
                  className={`rounded-full px-3 py-2 text-xs font-semibold transition sm:text-sm ${
                    selected
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-white hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_220px_220px_auto] lg:items-end">
          <label className="block w-full">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Haku</span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Esim. siivous, koira, muuttoapu..."
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block w-full">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Kaupunki</span>
            <select
              value={selectedCity}
              onChange={(event) => setSelectedCity(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="Kaikki">Kaikki kaupungit</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </label>

          <label className="block w-full">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Kategoria</span>
            <select
              value={activeCategory}
              onChange={(event) => setActiveCategory(event.target.value)}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <option value="Kaikki">Kaikki kategoriat</option>
              {allCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <p className="rounded-full bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600">
            {loading ? 'Ladataan...' : `${filteredGigs.length} ilmoitusta`}
          </p>
        </div>

        {hasActiveFilters ? (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span>Rajaukset käytössä.</span>
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSelectedCity('Kaikki');
                setActiveCategory('Kaikki');
                setActiveListingType('Kaikki');
              }}
              className="font-semibold text-slate-900 hover:text-slate-700"
            >
              Tyhjennä rajaukset
            </button>
          </div>
        ) : null}

        {loading ? (
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
            Ladataan ilmoituksia...
          </div>
        ) : error ? (
          <div className="mt-8 rounded-[2rem] border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : filteredGigs.length === 0 ? (
          <div className="mt-8 rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center">
            <p className="text-lg font-semibold text-slate-900">Ei ilmoituksia löytynyt</p>
            <p className="mt-2 text-sm text-slate-600">
              {hasActiveFilters
                ? 'Yritä muuttaa hakua tai poistaa jokin rajaus.'
                : 'Tule takaisin myöhemmin tai luo ensimmäinen arkiavun ilmoitus.'}
            </p>
            <Link
              href="/create"
              className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Luo ilmoitus
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {filteredGigs.map((gig) => (
              <GigCard key={gig.id} gig={gig} />
            ))}
          </div>
        )}
      </div>
    </PageContainer>
  );
}