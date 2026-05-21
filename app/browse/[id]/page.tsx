import Link from 'next/link';
import { notFound } from 'next/navigation';
import PageContainer from '../../../components/PageContainer';
import { supabase } from '../../../lib/supabase';
import type { BrowseGig } from '../../../lib/mockGigs';
import {
  getUrgencyEmoji,
  getUrgencyLabel,
  type Urgency,
} from '../../../lib/helpCategories';

type Props = {
  params: {
    id: string;
  };
};

export default async function BrowseGigPage({ params }: Props) {
  const result = await supabase
    .from('gigs')
    .select(
      'id,title,category,budget,location,date_time,description,status,listing_type'
    )
    .eq('id', params.id)
    .maybeSingle();

  const gig = result.data as BrowseGig | null;
  const error = result.error;

  if (error) {
    console.error('Supabase gig fetch error:', error);

    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <div className="text-center text-slate-700">
            <p className="text-lg font-semibold">
              Ilmoitusta ei voitu ladata
            </p>

            <p className="mt-2 text-sm">
              Tarkista verkkoyhteys ja yritä uudelleen.
            </p>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (!gig) {
    notFound();
  }

  const listingType = (gig as any).listing_type || 'Tarvitsen apua';

  const isHelping = listingType === 'Tarjoan apua';

  const urgencyOptions = ['Tänään', 'Tällä viikolla', 'Ei kiirettä'];

  const isUrgency = urgencyOptions.includes(gig.date_time);

  const urgency = isUrgency ? (gig.date_time as Urgency) : null;

  return (
    <PageContainer>
      <div className="space-y-8">
        <div>
          <Link
            href="/browse"
            className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
          >
            ← Takaisin ilmoituksiin
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.8fr]">
          <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  isHelping
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {listingType}
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {gig.category}
              </span>

              {urgency && (
                <span
                  className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${
                    urgency === 'Tänään'
                      ? 'bg-orange-100 text-orange-700'
                      : urgency === 'Tällä viikolla'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  <span>{getUrgencyEmoji(urgency)}</span>
                  {getUrgencyLabel(urgency)}
                </span>
              )}
            </div>

            <div className="mt-6">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                {gig.title}
              </h1>

              <p className="mt-6 text-base leading-8 text-slate-700">
                {gig.description}
              </p>
            </div>

            <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Sijainti
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {gig.location}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Korvaus
                </p>

                <p className="text-sm font-semibold text-slate-900">
                  {gig.budget}
                </p>
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Tila
                </p>

                <span className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {gig.status}
                </span>
              </div>
            </div>

            <div className="mt-8 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Julkaisija
              </p>

              <div className="mt-5 flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-200 text-lg font-semibold text-slate-700">
                  N
                </div>

                <div>
                  <p className="font-semibold text-slate-900">
                    Korttelilainen
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Paikallinen käyttäjä · Jäsen vuodesta 2026
                  </p>
                </div>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Yhteydenotto
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                {isHelping
                  ? 'Pyydä apua'
                  : 'Tarjoudu auttamaan'}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Yhteydenotot avautuvat seuraavassa vaiheessa. Tämän jälkeen voit lähettää lyhyen viestin ilmoituksen julkaisijalle.
              </p>

              <button
                type="button"
                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold text-white transition ${
                  isHelping
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : 'bg-slate-900 hover:bg-slate-700'
                }`}
              >
                {isHelping
                  ? 'Pyydä apua'
                  : 'Tarjoudu auttamaan'}
              </button>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Korttelin vinkki
              </p>

              <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
                <li>• Sovi yksityiskohdat selkeästi ennen tapaamista</li>
                <li>• Pidä yhteydenpito asiallisena ja ystävällisenä</li>
                <li>• Tapaa julkisella paikalla tarvittaessa</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </PageContainer>
  );
}