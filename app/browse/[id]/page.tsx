import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '../../../components/PageContainer';
import { supabase } from '../../../lib/supabase';
import type { BrowseGig } from '../../../lib/mockGigs';

type Props = {
  params: {
    id: string;
  };
};

export default async function BrowseGigPage({ params }: Props) {
  const { data: gig, error } = await supabase
    .from<BrowseGig>('gigs')
    .select('id,title,category,budget,location,date_time,description,status')
    .eq('id', params.id)
    .maybeSingle();

  if (error) {
    console.error('Supabase gig fetch error:', error);
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <div className="text-center text-slate-700">
            <p className="text-lg font-semibold">Keikkaa ei voitu ladata</p>
            <p className="mt-2 text-sm">Tarkista verkkoyhteys ja yritä uudelleen.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!gig) {
    notFound();
  }

  return (
    <PageContainer>
      <div className="space-y-6 rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-3">
            <Link
              href="/browse"
              className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
            >
              ← Takaisin keikkoihin
            </Link>
            <div className="space-y-2">
              <p className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                {gig.category}
              </p>
              <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {gig.title}
              </h1>
            </div>
          </div>
          <div className="space-y-2 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-4 text-right">
            <p className="text-sm text-slate-500">Hinta</p>
            <p className="text-2xl font-semibold text-slate-900">{gig.budget}</p>
          </div>
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Sijainti</p>
            <p className="text-sm font-semibold text-slate-900">{gig.location}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Aika</p>
            <p className="text-sm font-semibold text-slate-900">{gig.date_time}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Tila</p>
            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
              {gig.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.5fr_0.9fr]">
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Keikan kuvaus</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{gig.description}</p>
            </div>
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm font-semibold text-slate-900">Julkaissut</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-slate-200" />
                <div>
                  <p className="font-semibold text-slate-900">Naapuri Nimi</p>
                  <p className="text-sm text-slate-500">Korttelilainen | 12 arviota</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-slate-500">Tarvittavat tiedot</p>
              <ul className="mt-4 space-y-3 text-sm text-slate-600">
                <li>• Selkeä aikataulu</li>
                <li>• Paikallinen sijainti</li>
                <li>• Tarjouskelpoinen hinta</li>
              </ul>
            </div>
            <Link
              href="#"
              className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Tarjoudu auttamaan
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
