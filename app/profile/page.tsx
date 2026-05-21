'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  Calendar,
  ChevronRight,
  Clock,
  Mail,
  MapPin,
  Plus,
  ShieldCheck,
  Star,
  User,
} from 'lucide-react';

import PageContainer from '../../components/PageContainer';
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

  const initials =
  displayName
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'KT';
    
  const sortNewestFirst = (items: BrowseGig[]) =>
  [...items].sort((a, b) => {
    const aTime = a.date_time ? new Date(a.date_time).getTime() : 0;
    const bTime = b.date_time ? new Date(b.date_time).getTime() : 0;
    return bTime - aTime;
  });

const activeGigs = sortNewestFirst(
  gigs.filter((gig) => {
    const status = gig.status?.toLowerCase() ?? '';
    return status === 'vapaa' || status === 'aktiivinen' || status === 'open';
  })
).slice(0, 2);

const ongoingGigs = sortNewestFirst(
  gigs.filter((gig) => {
    const status = gig.status?.toLowerCase() ?? '';
    return (
      status === 'sovittu' ||
      status === 'hyväksytty' ||
      status === 'meneillään' ||
      status === 'accepted' ||
      status === 'in_progress'
    );
  })
).slice(0, 2);

const completedGigs = sortNewestFirst(
  gigs.filter((gig) => {
    const status = gig.status?.toLowerCase() ?? '';
    return (
      status === 'valmis' ||
      status === 'suoritettu' ||
      status === 'completed' ||
      status === 'done'
    );
  })
).slice(0, 2);
  return (
    <PageContainer>
      <div className="space-y-8">
        <section className="rounded-[2rem] bg-white/95 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
            <div className="flex flex-col gap-6 sm:flex-row">
              <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-slate-200 text-3xl font-semibold text-slate-900 sm:h-28 sm:w-28 sm:text-4xl">
                {initials}
                <span className="absolute bottom-1 right-1 rounded-full bg-emerald-500 p-1 text-white">
                  <BadgeCheck size={18} />
                </span>
              </div>

              <div className="min-w-0 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                    Oma profiili
                  </p>

                  <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                    {displayName ?? 'Täydennä profiilisi'}
                  </h1>

                  <p className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-600">
                    <MapPin size={16} />
                    <span>{profileLocation ?? 'Sijainti puuttuu'}</span>
                    <span>·</span>
                    <span>Jäsen vuodesta {memberSince ?? '2026'}</span>
                  </p>

                  <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-700">
                    {bio ??
                      'Lisää lyhyt esittely, jotta muut alueen ihmiset saavat sinusta luotettavamman ensivaikutelman.'}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 text-sm">
                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    <ShieldCheck size={17} />
                    Vahvistettu käyttäjä
                  </span>

                  <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-slate-700">
                    <Clock size={17} />
                    Vastaa yleensä nopeasti
                  </span>
                </div>

                {profileIncomplete ? (
                  <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
                    <p className="font-semibold">Täydennä profiilisi tiedot.</p>
                    <p className="mt-1 text-amber-800">
                      Nimi, sijainti ja lyhyt esittely tekevät yhteydenotoista luontevampia.
                    </p>
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row lg:min-w-56 lg:flex-col">
              <Link
                href="/profile/edit"
                className="inline-flex items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
              >
                Muokkaa profiilia
              </Link>

              <Link
                href="/profile/public"
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-50"
              >
                Näytä julkinen profiili
              </Link>
            </div>
          </div>

          <div className="mt-9 grid overflow-hidden rounded-3xl border border-slate-200 bg-white sm:grid-cols-2 lg:grid-cols-4">
            <StatCard value={totalGigs} label="Ilmoituksia" helper="yhteensä" />
            <StatCard value={openGigs} label="Avoimia ilmoituksia" helper="tällä hetkellä" />
            <StatCard
              value="5.0"
              label="Saatu arviointi"
              helper="2 arvostelua"
              icon={<Star size={18} className="fill-emerald-500 text-emerald-500" />}
            />
            <StatCard value={memberSince ?? '2026'} label="Liittynyt" helper="tammikuu" />
          </div>
        </section>

        <section className="space-y-4">
  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h2 className="text-2xl font-bold tracking-tight text-slate-950">
        Omat ilmoitukset
      </h2>
      <p className="mt-1 text-sm text-slate-500">
        Tuoreimmat ilmoitukset ja työnkulut yhdessä näkymässä.
      </p>
    </div>

    <Link
      href="/create"
      className="inline-flex items-center justify-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
    >
      <Plus size={17} />
      Luo ilmoitus
    </Link>
  </div>

  <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
    <div className="grid divide-y divide-slate-200 lg:grid-cols-3 lg:divide-x lg:divide-y-0">
      <ListingColumn
        title="Aktiiviset ilmoitukset"
        count={activeGigs.length}
        gigs={activeGigs}
        emptyText="Ei aktiivisia ilmoituksia"
        tone="green"
        deletingId={deletingId}
        onDelete={handleDelete}
      />

      <ListingColumn
        title="Meneillään olevat"
        count={ongoingGigs.length}
        gigs={ongoingGigs}
        emptyText="Ei meneillään olevia"
        tone="blue"
        deletingId={deletingId}
        onDelete={handleDelete}
      />

      <ListingColumn
        title="Valmiit / hyväksytyt"
        count={completedGigs.length}
        gigs={completedGigs}
        emptyText="Ei valmiita ilmoituksia"
        tone="purple"
        deletingId={deletingId}
        onDelete={handleDelete}
      />
    </div>

    <div className="border-t border-slate-100 px-5 py-4 text-center">
      <Link
        href="/profile/listings"
        className="text-sm font-semibold text-slate-700 transition hover:text-slate-950"
      >
        Näytä kaikki ilmoitukset →
      </Link>
    </div>
  </div>
</section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Arvostelut</h2>
            <button className="text-sm font-medium text-slate-500 hover:text-slate-950">
              Näytä kaikki
            </button>
          </div>

          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <ReviewRow
              initial="A"
              name="Anni M."
              title="Koiran ulkoilutus"
              date="12.5.2026"
              text="Erittäin luotettava ja mukava tyyppi! Koira oli iloinen lenkin jälkeen."
            />

            <ReviewRow
              initial="L"
              name="Lassi V."
              title="Pensaiden leikkaus"
              date="4.5.2026"
              text="Työ tehty siististi ja ajallaan. Suosittelen!"
            />
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-2">
          <article className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Yhteenveto</h2>

            <div className="mt-5 space-y-4 text-sm">
              <SummaryRow label="Ilmoituksia yhteensä" value={totalGigs} />
              <SummaryRow label="Suoritettuja sopimuksia" value={6} />
              <SummaryRow label="Peruutettuja" value={1} />
              <SummaryRow label="Käyttäjäpisteet" value={320} />
            </div>
          </article>

          <article className="rounded-[2rem] border border-slate-200 bg-white/95 p-6 shadow-sm sm:p-8">
            <h2 className="text-xl font-bold text-slate-950">Tili ja asetukset</h2>

            <div className="mt-5 divide-y divide-slate-100 text-sm">
              <SettingsLink icon={<User size={18} />} label="Henkilötiedot" href="/profile/edit" />
              <SettingsLink
                icon={<Mail size={18} />}
                label={userEmail ?? 'Sähköposti ja salasana'}
                href="/profile/edit"
              />
              <SettingsLink
                icon={<ShieldCheck size={18} />}
                label="Tietosuoja ja turvallisuus"
                href="/profile/edit"
              />
            </div>
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

function StatCard({
  value,
  label,
  helper,
  icon,
}: {
  value: string | number;
  label: string;
  helper: string;
  icon?: React.ReactNode;
}) {
  return (
    <article className="border-b border-slate-200 p-6 text-center sm:border-r lg:border-b-0 last:border-r-0">
      {icon ? <div className="mb-2 flex justify-center">{icon}</div> : null}

      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        {label}
      </p>

      <p className="mt-3 text-3xl font-bold text-slate-950">{value}</p>

      <p className="mt-1 text-sm text-slate-500">{helper}</p>
    </article>
  );
}

function ReviewRow({
  initial,
  name,
  title,
  date,
  text,
}: {
  initial: string;
  name: string;
  title: string;
  date: string;
  text: string;
}) {
  return (
    <article className="grid gap-4 border-b border-slate-100 p-5 last:border-b-0 sm:grid-cols-[auto_1fr_auto] sm:p-6">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 font-semibold text-slate-900">
        {initial}
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <p className="font-semibold text-slate-950">{name}</p>

          <div className="flex text-emerald-600">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} size={17} fill="currentColor" />
            ))}
          </div>

          <span className="text-sm text-slate-600">5.0</span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
            {title}
          </span>
        </div>

        <p className="mt-2 text-sm leading-6 text-slate-700">{text}</p>
      </div>

      <p className="text-sm text-slate-500">{date}</p>
    </article>
  );
}
function ListingColumn({
  title,
  count,
  gigs,
  emptyText,
  tone,
  deletingId,
  onDelete,
}: {
  title: string;
  count: number;
  gigs: BrowseGig[];
  emptyText: string;
  tone: 'green' | 'blue' | 'purple';
  deletingId: string | null;
  onDelete: (id: string) => void;
}) {
  const toneClasses = {
    green: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    purple: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="min-h-[210px] p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-950">{title}</h3>
        <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${toneClasses[tone]}`}>
          {count}
        </span>
      </div>

      {gigs.length > 0 ? (
        <div className="space-y-3">
          {gigs.map((gig) => {
            const listingType = (gig as any).listing_type;
            const isOffer = listingType === 'offer';

            return (
              <div
                key={gig.id}
                className="rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-1.5">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                          isOffer
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        {isOffer ? 'Tarjoan' : 'Tarvitsen'}
                      </span>

                      {gig.status ? (
                        <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          {gig.status}
                        </span>
                      ) : null}
                    </div>

                    <h4 className="truncate text-sm font-bold text-slate-950">
                      {gig.title}
                    </h4>

                    <p className="mt-1 truncate text-xs text-slate-500">
                      {gig.location ? `${gig.location} · ` : ''}
                      {gig.budget ? `${gig.budget} €` : 'Sovitaan yhdessä'}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDelete(gig.id)}
                    disabled={deletingId === gig.id}
                    className="shrink-0 rounded-full px-2 py-1 text-xs font-semibold text-rose-600 transition hover:bg-rose-50 disabled:text-rose-300"
                  >
                    {deletingId === gig.id ? '...' : 'Poista'}
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    href={`/gig/${gig.id}`}
                    className="flex-1 rounded-full bg-slate-950 px-3 py-1.5 text-center text-xs font-semibold text-white transition hover:bg-slate-800"
                  >
                    Katso
                  </Link>

                  <Link
                    href={`/profile/edit/${gig.id}`}
                    className="flex-1 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-center text-xs font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Muokkaa
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex h-[140px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 text-center text-sm text-slate-400">
          {emptyText}
        </div>
      )}
    </div>
  );
}
function SummaryRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-slate-600">{label}</span>
      <span className="font-semibold text-slate-950">{value}</span>
    </div>
  );
}

function SettingsLink({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between gap-4 py-4 text-slate-700 transition hover:text-slate-950"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="shrink-0 text-slate-500">{icon}</span>
        <span className="truncate">{label}</span>
      </span>

      <ChevronRight size={18} className="shrink-0 text-slate-400" />
    </Link>
  );
}