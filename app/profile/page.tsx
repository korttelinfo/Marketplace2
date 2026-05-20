import PageContainer from '../../components/PageContainer';
import GigCard from '../../components/GigCard';
import { supabase } from '../../lib/supabase';
import type { BrowseGig } from '../../lib/mockGigs';

async function getGigs() {
  const { data, error } = await supabase
    .from<BrowseGig>('gigs')
    .select('id,title,category,budget,location,date_time,description,status')
    .order('date_time', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export default async function ProfilePage() {
  let gigs: BrowseGig[] = [];

  try {
    gigs = await getGigs();
  } catch (error) {
    console.error('Supabase profile fetch error:', error);
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center">
          <p className="text-lg font-semibold text-slate-900">Tietoja ei voitu ladata</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            Yritä hetken kuluttua uudelleen.
          </p>
        </div>
      </PageContainer>
    );
  }

  const totalGigs = gigs.length;
  const openGigs = gigs.filter((gig) => gig.status?.toLowerCase() === 'vapaa').length;
  const newestGigDate = gigs[0]?.date_time ?? 'Ei keikkoja';
  const latestGigs = gigs.slice(0, 4);

  return (
    <PageContainer>
      <div className="grid gap-8 lg:grid-cols-[1.25fr_0.9fr]">
        <section className="space-y-6 rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Oma profiili</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Testikäyttäjä</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Helsinki · Jäsen vuodesta 2026
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Yhteensä keikkoja</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{totalGigs}</p>
            </article>
            <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Avoimia keikkoja</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{openGigs}</p>
            </article>
            <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500">Uusin keikka</p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{newestGigDate}</p>
            </article>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Omat tilastot</p>
            <p className="text-sm leading-7 text-slate-600">
              Näet uusimmat keikat ja avoimet työpyynnöt suorasta tietokannasta.
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <div className="rounded-[1.75rem] bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Nimi</p>
              <p className="mt-2">Testikäyttäjä</p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Sijainti</p>
              <p className="mt-2">Helsinki</p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Jäsen vuodesta</p>
              <p className="mt-2">2026</p>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-8 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Viimeisimmät keikat</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Julkaistu viimeksi</h2>
          </div>
          <p className="text-sm text-slate-500">Näytetään {latestGigs.length} uusinta keikkaa</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {latestGigs.length > 0 ? (
            latestGigs.map((gig) => <GigCard key={gig.id} gig={gig} />)
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Keikkoja ei löytynyt.
            </div>
          )}
        </div>
      </section>
    </PageContainer>
  );
}
