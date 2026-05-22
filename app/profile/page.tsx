'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  BadgeCheck,
  CalendarDays,
  Check,
  ChevronRight,
  Facebook,
  HeartHandshake,
  Home,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
  User,
  Wrench,
} from 'lucide-react';

import PageContainer from '../../components/PageContainer';
import ConfirmModal from '../../components/ConfirmModal';
import { supabase } from '../../lib/supabase';
import type { BrowseGig } from '../../lib/mockGigs';

type Profile = {
  display_name: string | null;
  location: string | null;
  bio: string | null;
  identity_chips: string[] | null;
  helper_chips: string[] | null;
  instagram_url: string | null;
  linkedin_url: string | null;
  facebook_url: string | null;
  phone_number: string | null;
  created_at: string | null;
};

export default function ProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [displayName, setDisplayName] = useState<string | null>(null);
  const [profileLocation, setProfileLocation] = useState<string | null>(null);
  const [bio, setBio] = useState<string | null>(null);

  const [identityChips, setIdentityChips] = useState<string[]>([]);
  const [helperChips, setHelperChips] = useState<string[]>([]);

  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [linkedinUrl, setLinkedinUrl] = useState<string | null>(null);
  const [facebookUrl, setFacebookUrl] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);

  const [memberSince, setMemberSince] = useState<string>('2026');

  const [gigs, setGigs] = useState<BrowseGig[]>([]);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      const user = sessionData.session.user;

      if (user.created_at) {
        setMemberSince(
          String(new Date(user.created_at).getFullYear())
        );
      }

      const profileResult = await supabase
        .from('profiles')
        .select(`
          display_name,
          location,
          bio,
          identity_chips,
          helper_chips,
          instagram_url,
          linkedin_url,
          facebook_url,
          phone_number,
          created_at
        `)
        .eq('id', user.id)
        .single();

      if (profileResult.error) {
        console.error(profileResult.error);
        setError('Profiilin lataus epäonnistui.');
      }

      const profile = profileResult.data as Profile | null;

      if (profile) {
        setDisplayName(profile.display_name);
        setProfileLocation(profile.location);
        setBio(profile.bio);

        setIdentityChips(profile.identity_chips ?? []);
        setHelperChips(profile.helper_chips ?? []);

        setInstagramUrl(profile.instagram_url);
        setLinkedinUrl(profile.linkedin_url);
        setFacebookUrl(profile.facebook_url);
        setPhoneNumber(profile.phone_number);

        if (profile.created_at) {
          setMemberSince(
            String(new Date(profile.created_at).getFullYear())
          );
        }
      }

      const gigsResult = await supabase
        .from('gigs')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!gigsResult.error) {
        setGigs((gigsResult.data as BrowseGig[]) ?? []);
      }

      setLoading(false);
    };

    loadData();
  }, [router]);

  const initials = useMemo(() => {
    return (
      displayName
        ?.split(' ')
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() ?? 'KT'
    );
  }, [displayName]);

  const allChips = [...identityChips, ...helperChips];

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-[#fbf8f2] p-8 text-center text-stone-500 shadow-sm ring-1 ring-stone-200/70">
          Profiilia ladataan...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="mx-auto max-w-6xl space-y-8 pb-10">

        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#fbf8f2] p-6 shadow-sm ring-1 ring-stone-200/70 sm:p-8 lg:p-10">

          <div className="mb-6 flex flex-wrap justify-end gap-2">

            <Link
              href="/profile/edit"
              className="inline-flex items-center justify-center rounded-full bg-[#f6efe4] px-5 py-3 text-sm font-semibold text-stone-800 ring-1 ring-stone-200/70 transition hover:bg-[#efe5d6]"
            >
              Muokkaa profiilia
            </Link>

            <Link
              href="/create"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800"
            >
              <Plus size={17} />
              Luo ilmoitus
            </Link>

          </div>

          <div className="flex flex-col gap-7 sm:flex-row">

            <div className="relative flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-stone-900 text-4xl font-semibold text-white shadow-sm sm:h-32 sm:w-32">
              {initials}

              <span className="absolute bottom-2 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white ring-4 ring-[#fbf8f2]">
                <BadgeCheck size={18} />
              </span>
            </div>

            <div className="max-w-3xl space-y-5">

              <div>

                <h1 className="text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                  {displayName ?? 'Täydennä profiilisi'}
                </h1>

                <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-stone-600">

                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={16} />
                    {profileLocation ?? 'Sijainti puuttuu'}
                  </span>

                  <span className="hidden h-1 w-1 rounded-full bg-stone-300 sm:block" />

                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={16} />
                    Mukana vuodesta {memberSince}
                  </span>

                </div>

              </div>

              <p className="text-base leading-8 text-stone-700 sm:text-lg">
                {bio ??
                  'Kerro hieman itsestäsi ja siitä millaisissa asioissa autat mielelläsi.'}
              </p>

              <div className="flex flex-wrap gap-2.5">

                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm ring-1 ring-stone-200/80">
                  <Check size={15} className="text-emerald-700" />
                  Luotettava
                </span>

                <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm ring-1 ring-stone-200/80">
                  <Check size={15} className="text-emerald-700" />
                  Helppo sopia
                </span>

              </div>

            </div>

          </div>

        </section>

        <section className="grid gap-5 lg:grid-cols-2">

          <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200/70">

            <div className="flex items-center gap-2 text-stone-950">
              <Sparkles size={19} />
              <h2 className="text-xl font-semibold tracking-tight">
                Pieniä asioita minusta
              </h2>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">

              {allChips.length > 0 ? (
                allChips.map((chip) => (
                  <span
                    key={chip}
                    className="inline-flex items-center gap-2 rounded-full bg-[#fbf8f2] px-4 py-2 text-sm font-medium text-stone-700 ring-1 ring-stone-200/70"
                  >
                    {chip}
                  </span>
                ))
              ) : (
                <span className="text-sm text-stone-500">
                  Ei vielä valittuja merkkejä
                </span>
              )}

            </div>

            <div className="mt-5 flex flex-wrap gap-2.5">

              {phoneNumber ? (
                <InfoPill
                  icon={<Phone size={15} />}
                  label={phoneNumber}
                />
              ) : null}

              {instagramUrl ? (
                <ExternalPill
                  icon={<Instagram size={15} />}
                  label="Instagram"
                  href={instagramUrl}
                />
              ) : null}

              {linkedinUrl ? (
                <ExternalPill
                  icon={<Linkedin size={15} />}
                  label="LinkedIn"
                  href={linkedinUrl}
                />
              ) : null}

              {facebookUrl ? (
                <ExternalPill
                  icon={<Facebook size={15} />}
                  label="Facebook"
                  href={facebookUrl}
                />
              ) : null}

            </div>

          </article>

          <article className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200/70">

            <div className="flex items-center gap-2 text-stone-950">
              <ShieldCheck size={20} />
              <h2 className="text-xl font-semibold tracking-tight">
                Luottamuksen merkit
              </h2>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">

              <TrustBox
                icon={<Mail size={17} />}
                label="Sähköposti"
                value="Vahvistettu"
              />

              <TrustBox
                icon={<Phone size={17} />}
                label="Puhelin"
                value={
                  phoneNumber
                    ? 'Lisätty profiiliin'
                    : 'Ei vielä lisätty'
                }
              />

              <TrustBox
                icon={<Home size={17} />}
                label="Lähialue"
                value={
                  profileLocation ?? 'Alue puuttuu'
                }
              />

              <TrustBox
                icon={<HeartHandshake size={17} />}
                label="Kohtaamiset"
                value="Tulossa myöhemmin"
              />

            </div>

          </article>

        </section>

      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Poista ilmoitus"
        onConfirm={() => setConfirmOpen(false)}
        onCancel={() => setConfirmOpen(false)}
      >
        Haluatko varmasti poistaa tämän ilmoituksen?
      </ConfirmModal>

    </PageContainer>
  );
}

function InfoPill({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[#f6efe4] px-4 py-2 text-sm font-medium text-stone-700 ring-1 ring-stone-200/70">
      {icon}
      {label}
    </span>
  );
}

function ExternalPill({
  icon,
  label,
  href,
}: {
  icon: React.ReactNode;
  label: string;
  href: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="inline-flex items-center gap-2 rounded-full bg-[#f6efe4] px-4 py-2 text-sm font-medium text-stone-700 ring-1 ring-stone-200/70 transition hover:bg-[#efe5d6]"
    >
      {icon}
      {label}
    </a>
  );
}

function TrustBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.5rem] bg-[#fbf8f2] p-4 ring-1 ring-stone-200/70">

      <div className="flex items-center gap-2 text-stone-700">
        {icon}

        <span className="text-sm font-semibold text-stone-950">
          {label}
        </span>
      </div>

      <p className="mt-2 text-xs leading-5 text-stone-600">
        {value}
      </p>

    </div>
  );
}