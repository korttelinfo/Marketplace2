'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import GigCard from '../../components/GigCard';
import ConfirmModal from '../../components/ConfirmModal';
import { supabase } from '../../lib/supabase';
import type { BrowseGig } from '../../lib/mockGigs';

export default function ProfilePage() {
  const router = useRouter();
  const [gigs, setGigs] = useState<BrowseGig[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profileLocation, setProfileLocation] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  useEffect(() => {
    const loadUserGigs = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      const userId = sessionData.session.user.id;
      const email = sessionData.session.user.email ?? null;
      setUserEmail(email);

      const createdAt = sessionData.session.user.created_at;
      if (createdAt) setMemberSince(String(new Date(createdAt).getFullYear()));
      const { data, error } = await supabase
        .from<BrowseGig>('gigs')
        .select('id,title,category,budget,location,date_time,description,status')
        .eq('user_id', userId)
        .order('date_time', { ascending: false });

      if (error) {
        console.error('Supabase profile fetch error:', error);
        setError(error.message);
      } else {
        setGigs(data ?? []);
      }

      // Attempt to load an optional `profiles` table for richer user info
      const { data: profileData } = await supabase.from('profiles').select('full_name,location').eq('id', userId).single();
      if (profileData) {
        setDisplayName(profileData.full_name ?? email);
        setProfileLocation(profileData.location ?? null);
      } else {
        setDisplayName(email);
      }

      setLoading(false);
    };

    loadUserGigs();
  }, [router]);

  const handleDelete = (id: string) => {
    // open confirmation modal
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const performDelete = async (id: string) => {
    setDeletingId(id);
    const { error } = await supabase.from('gigs').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      setError('Keikan poistossa tapahtui virhe. Yritä uudelleen.');
      setDeletingId(null);
      return;
    }

    setGigs((current) => current.filter((gig) => gig.id !== id));
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteId) return;
    setConfirmOpen(false);
    await performDelete(pendingDeleteId);
    setPendingDeleteId(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center text-slate-500">
          Profiilia ladataan...
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center">
          <p className="text-lg font-semibold text-slate-900">Tietoja ei voitu ladata</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{error}</p>
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
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{displayName ?? userEmail ?? 'Profiili'}</h1>
            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              {profileLocation ?? 'Helsinki'} · Jäsen vuodesta {memberSince ?? '2026'}
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
              <p className="mt-2">{displayName ?? userEmail ?? 'Ei nimeä'}</p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Sijainti</p>
              <p className="mt-2">{profileLocation ?? 'Helsinki'}</p>
            </div>
            <div className="rounded-[1.75rem] bg-slate-50 p-5 text-sm text-slate-600">
              <p className="font-semibold text-slate-900">Jäsen vuodesta</p>
              <p className="mt-2">{memberSince ?? '2026'}</p>
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
            latestGigs.map((gig) => (
              <div key={gig.id} className="space-y-3">
                <GigCard gig={gig} />
                <div className="flex flex-wrap gap-3">
                  <a
                    href={`/profile/edit/${gig.id}`}
                    className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Muokkaa
                  </a>
                  <button
                    type="button"
                      onClick={() => handleDelete(gig.id)}
                    disabled={deletingId === gig.id}
                    className="inline-flex flex-1 items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                  >
                    {deletingId === gig.id ? 'Poistetaan...' : 'Poista'}
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-slate-50 p-8 text-center text-slate-500">
              Sinulla ei ole vielä keikkoja. Luo ensimmäinen keikka profiilista.
            </div>
          )}
        </div>
      </section>
      <ConfirmModal
        open={confirmOpen}
        title="Poista keikka"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      >
        Haluatko varmasti poistaa tämän keikan? Toimintoa ei voi peruuttaa.
      </ConfirmModal>
    </PageContainer>
  );
}
