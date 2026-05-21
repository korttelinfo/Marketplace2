'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import GigCard from '../../components/GigCard';
import ConfirmModal from '../../components/ConfirmModal';
import { supabase } from '../../lib/supabase';
import type { BrowseGig } from '../../lib/mockGigs';

type Profile = {
  display_name: string | null;
  location: string | null;
  bio: string | null;
  created_at: string | null;
};

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
  const [bio, setBio] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState<string | null>(null);

  const profileIncomplete = !displayName || !profileLocation || !bio;

  useEffect(() => {
    const loadProfilePage = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      const userId = sessionData.session.user.id;
      setUserEmail(sessionData.session.user.email ?? null);

      const createdAt = sessionData.session.user.created_at;
      if (createdAt) {
        setMemberSince(String(new Date(createdAt).getFullYear()));
      }

      const gigsResult = await supabase
        .from('gigs')
        .select('id,title,category,budget,location,date_time,description,status,listing_type')
        .eq('user_id', userId)
        .order('date_time', { ascending: false });

      if (gigsResult.error) {
        console.error('Supabase profile gigs fetch error:', gigsResult.error);
        setError(gigsResult.error.message);
      } else {
        setGigs((gigsResult.data as BrowseGig[]) ?? []);
      }

      const profileResult = await supabase
        .from('profiles')
        .select('display_name,location,bio,created_at')
        .eq('id', userId)
        .single();

      const profileData = profileResult.data as Profile | null;

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error('Supabase profile fetch error:', profileResult.error);
        setError('Profiilin latauksessa tapahtui virhe. Yritä uudelleen.');
      }

      if (!profileData) {
        const { error: insertError } = await supabase.from('profiles').insert({
          id: userId,
          display_name: null,
          location: null,
          bio: null,
          created_at: new Date().toISOString(),
        });

        if (insertError) {
          console.error('Supabase profile create error:', insertError);
          setError('Profiilin luonti epäonnistui. Yritä uudelleen.');
          setLoading(false);
          return;
        }

        setDisplayName(null);
        setProfileLocation(null);
        setBio(null);
      } else {
        setDisplayName(profileData.display_name);
        setProfileLocation(profileData.location);
        setBio(profileData.bio);

        if (profileData.created_at) {
          setMemberSince(String(new Date(profileData.created_at).getFullYear()));
        }
      }

      setLoading(false);
    };

    loadProfilePage();
  }, [router]);

  const handleDelete = (id: string) => {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  };

  const performDelete = async (id: string) => {
    setDeletingId(id);

    const { error: deleteError } = await supabase.from('gigs').delete().eq('id', id);

    if (deleteError) {
      console.error('Supabase delete error:', deleteError);
      setError('Ilmoituksen poistossa tapahtui virhe. Yritä uudelleen.');
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
        <div className="rounded-[2rem] bg-white/90 p-8 text-center text-slate-500 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          Profiilia ladataan...
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 text-center shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-900">Tietoja ei voitu ladata</p>
          <p className="mt-2 text-sm leading-7 text-slate-600">{error}</p>
        </div>
      </PageContainer>
    );
  }

  const totalGigs = gigs.length;
  const openGigs = gigs.filter((gig) => gig.status?.toLowerCase() === 'vapaa').length;
  const latestGigs = gigs.slice(0, 6);

  return (
    <PageContainer>
      <div className="space-y-8">
        <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Oma profiili
              </p>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  {displayName ?? 'Täydennä profiilisi'}
                </h1>
                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {profileLocation ?? 'Sijainti puuttuu'} · Jäsen vuodesta {memberSince ?? '2026'}
                </p>
              </div>

              <p className="max-w-2xl text-sm leading-7 text-slate-700">
                {bio ?? 'Lisää lyhyt esittely, jotta muut alueen ihmiset saavat sinusta luotettavamman ensivaikutelman.'}
              </p>

              {profileIncomplete ? (
                <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                  <p className="font-semibold">Täydennä profiilisi tiedot.</p>
                  <p className="mt-2 text-amber-800">
                    Nimi, sijainti ja lyhyt esittely tekevät yhteydenotoista luontevampia.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
              <Link
                href="/create"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Luo uusi ilmoitus
              </Link>

              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Muokkaa profiilia
              </Link>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Ilmoituksia
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{totalGigs}</p>
            </article>

            <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Avoimia ilmoituksia
              </p>
              <p className="mt-3 text-3xl font-semibold text-slate-900">{openGigs}</p>
            </article>

            <article className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:col-span-2 lg:col-span-1">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                Tilin sähköposti
              </p>
              <p className="mt-3 break-all text-sm font-semibold text-slate-900">
                {userEmail ?? 'Ei sähköpostia'}
              </p>
            </article>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Omat ilmoitukset
              </p>
              <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
                Hallitse julkaisemiasi ilmoituksia
              </h2>
            </div>

            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Luo ilmoitus
            </Link>
          </div>

          {latestGigs.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {latestGigs.map((gig) => (
                <div key={gig.id} className="space-y-3">
                  <GigCard gig={gig} />

                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/profile/edit/${gig.id}`}
                      className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Muokkaa
                    </Link>

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
              ))}
            </div>
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">Ei vielä ilmoituksia</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Luo ensimmäinen ilmoitus, jos tarvitset apua tai haluat tarjoutua auttamaan lähialueella.
              </p>
              <Link
                href="/create"
                className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Luo ilmoitus
              </Link>
            </div>
          )}
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Saapuneet yhteydenotot
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Tulossa seuraavaksi
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Kun joku vastaa ilmoitukseesi, yhteydenotto näkyy täällä. Voit myöhemmin hyväksyä, hylätä tai arkistoida yhteydenoton.
            </p>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Lähetetyt yhteydenotot
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
              Omat yhteydenottosi
            </h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Näet täällä myöhemmin ilmoitukset, joihin olet tarjoutunut auttamaan tai joista olet pyytänyt apua.
            </p>
          </article>
        </section>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Poista ilmoitus"
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false);
          setPendingDeleteId(null);
        }}
      >
        Haluatko varmasti poistaa tämän ilmoituksen? Toimintoa ei voi peruuttaa.
      </ConfirmModal>
    </PageContainer>
  );
}