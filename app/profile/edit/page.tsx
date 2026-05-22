'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BadgeCheck,
  Camera,
  Check,
  Coffee,
  Dog,
  Facebook,
  Gamepad2,
  Hammer,
  HeartHandshake,
  Home,
  Instagram,
  Laptop,
  Leaf,
  Linkedin,
  Loader2,
  Mail,
  MapPin,
  Moon,
  Music,
  PawPrint,
  Phone,
  Save,
  Sparkles,
  Truck,
  User,
  Wrench,
} from 'lucide-react';

import PageContainer from '../../../components/PageContainer';
import { supabase } from '../../../lib/supabase';

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

type ChipOption = {
  id: string;
  label: string;
  icon: React.ReactNode;
  type: 'identity' | 'helper';
};

const MAX_CHIPS = 5;

const chipOptions: ChipOption[] = [
  {
    id: 'aamukahvi',
    label: 'Aamukahvi-ihminen',
    icon: <Coffee size={16} />,
    type: 'identity',
  },
  {
    id: 'elaimet',
    label: 'Tulee toimeen eläinten kanssa',
    icon: <Dog size={16} />,
    type: 'identity',
  },
  {
    id: 'kasvit',
    label: 'Kasvi-intoilija',
    icon: <Leaf size={16} />,
    type: 'identity',
  },
  {
    id: 'ikea',
    label: 'Ikea ei pelota',
    icon: <Hammer size={16} />,
    type: 'identity',
  },
  {
    id: 'pelailee',
    label: 'Pelailee joskus',
    icon: <Gamepad2 size={16} />,
    type: 'identity',
  },
  {
    id: 'musiikki',
    label: 'Musiikki mukana',
    icon: <Music size={16} />,
    type: 'identity',
  },
  {
    id: 'yoihminen',
    label: 'Valvoo joskus myöhään',
    icon: <Moon size={16} />,
    type: 'identity',
  },
  {
    id: 'muuttoapu',
    label: 'Muuttoapu',
    icon: <Truck size={16} />,
    type: 'helper',
  },
  {
    id: 'kasaus',
    label: 'Kasaus ja pienet korjaukset',
    icon: <Wrench size={16} />,
    type: 'helper',
  },
  {
    id: 'kauppa-apu',
    label: 'Kauppa-apu',
    icon: <HeartHandshake size={16} />,
    type: 'helper',
  },
  {
    id: 'tietokoneapu',
    label: 'Tietokoneapu',
    icon: <Laptop size={16} />,
    type: 'helper',
  },
  {
    id: 'elainten-apu',
    label: 'Eläinapu',
    icon: <PawPrint size={16} />,
    type: 'helper',
  },
  {
    id: 'arkiapu',
    label: 'Arjen pienet avut',
    icon: <HeartHandshake size={16} />,
    type: 'helper',
  },
];

export default function EditProfilePage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [memberSince, setMemberSince] = useState('2026');

  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');

  const [selectedChips, setSelectedChips] = useState<string[]>([]);

  const [instagramUrl, setInstagramUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [facebookUrl, setFacebookUrl] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      const user = sessionData.session.user;

      setUserId(user.id);
      setUserEmail(user.email ?? null);

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

      if (profileResult.error && profileResult.error.code !== 'PGRST116') {
        console.error(profileResult.error);
        setError(
          'Profiilin latauksessa tapahtui virhe. Tarkista, että profiles-taulussa on tarvittavat kentät.'
        );
        setLoading(false);
        return;
      }

      const profile = profileResult.data as Profile | null;

      if (profile) {
        setDisplayName(profile.display_name ?? '');
        setLocation(profile.location ?? '');
        setBio(profile.bio ?? '');

        setSelectedChips([
          ...(profile.identity_chips ?? []),
          ...(profile.helper_chips ?? []),
        ].slice(0, MAX_CHIPS));

        setInstagramUrl(profile.instagram_url ?? '');
        setLinkedinUrl(profile.linkedin_url ?? '');
        setFacebookUrl(profile.facebook_url ?? '');
        setPhoneNumber(profile.phone_number ?? '');

        if (profile.created_at) {
          setMemberSince(
            String(new Date(profile.created_at).getFullYear())
          );
        }
      }

      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const initials = useMemo(() => {
    return (
      displayName
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .join('')
        .slice(0, 2)
        .toUpperCase() || 'KT'
    );
  }, [displayName]);

  const selectedChipObjects = chipOptions.filter((chip) =>
    selectedChips.includes(chip.id)
  );

  const identityChips = selectedChips.filter(
    (chipId) =>
      chipOptions.find((chip) => chip.id === chipId)?.type === 'identity'
  );

  const helperChips = selectedChips.filter(
    (chipId) =>
      chipOptions.find((chip) => chip.id === chipId)?.type === 'helper'
  );

  const profileStrength = useMemo(() => {
    let score = 0;

    if (displayName.trim()) score += 20;
    if (location.trim()) score += 20;
    if (bio.trim().length >= 40) score += 25;
    if (selectedChips.length >= 3) score += 20;

    if (
      phoneNumber.trim() ||
      instagramUrl.trim() ||
      linkedinUrl.trim() ||
      facebookUrl.trim()
    ) {
      score += 15;
    }

    return Math.min(score, 100);
  }, [
    displayName,
    location,
    bio,
    selectedChips.length,
    phoneNumber,
    instagramUrl,
    linkedinUrl,
    facebookUrl,
  ]);

  const normalizeUrl = (value: string) => {
    const trimmed = value.trim();

    if (!trimmed) return null;

    if (
      trimmed.startsWith('http://') ||
      trimmed.startsWith('https://')
    ) {
      return trimmed;
    }

    return `https://${trimmed}`;
  };

  const toggleChip = (chipId: string) => {
    setError(null);
    setSuccess(null);

    setSelectedChips((current) => {
      if (current.includes(chipId)) {
        return current.filter((id) => id !== chipId);
      }

      if (current.length >= MAX_CHIPS) {
        setError(
          `Voit valita enintään ${MAX_CHIPS} chipsiä. Poista jokin valinta ennen uuden lisäämistä.`
        );
        return current;
      }

      return [...current, chipId];
    });
  };

  const handleSave = async (returnToProfile = false) => {
    if (!userId || saving) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    const result = await supabase
      .from('profiles')
      .upsert({
        id: userId,
        display_name: displayName.trim() || null,
        location: location.trim() || null,
        bio: bio.trim() || null,
        identity_chips: identityChips,
        helper_chips: helperChips,
        instagram_url: normalizeUrl(instagramUrl),
        linkedin_url: normalizeUrl(linkedinUrl),
        facebook_url: normalizeUrl(facebookUrl),
        phone_number: phoneNumber.trim() || null,
      });

    if (result.error) {
      console.error(result.error);
      setError(
        'Tallennus epäonnistui. Tarkista Supabase-kentät ja yritä uudelleen.'
      );
      setSaving(false);
      return;
    }

    setSaving(false);
    setSuccess('Profiili tallennettu.');

    if (returnToProfile) {
      router.push('/profile');
    }
  };

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
      <div className="mx-auto max-w-6xl space-y-6 pb-10 text-stone-900">

        <div className="flex items-center justify-between gap-4">

          <Link
            href="/profile"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-700 shadow-sm ring-1 ring-stone-200 transition hover:text-stone-950"
          >
            <ArrowLeft size={16} />
            Takaisin profiiliin
          </Link>

          <button
            type="button"
            onClick={() => handleSave(true)}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {saving ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Save size={17} />
            )}
            {saving ? 'Tallennetaan...' : 'Tallenna ja palaa'}
          </button>

        </div>

        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#fbf8f2] p-6 shadow-sm ring-1 ring-stone-200/70 sm:p-8 lg:p-10">

          <div className="relative grid gap-8 lg:grid-cols-[1fr_320px] lg:items-center">

            <div>

              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-stone-700 ring-1 ring-stone-200/80">
                <Sparkles size={16} className="text-emerald-700" />
                Rakenna lämmin naapuri-identiteetti
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                Tee profiilista sellainen, että ensimmäinen viesti tuntuu helpolta.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                Korttelissa profiili ei ole CV tai myyjätili. Se on pieni ensivaikutelma ihmisestä, jonka kanssa voi sopia arjen asioista.
              </p>

            </div>

            <div className="rounded-[2rem] bg-[#fffdf9]/85 p-5 shadow-sm ring-1 ring-stone-200/80 backdrop-blur">

              <div className="flex items-center justify-between gap-3">

                <p className="text-sm font-semibold text-stone-950">
                  Profiilin valmius
                </p>

                <span className="text-sm font-semibold text-emerald-700">
                  {profileStrength}%
                </span>

              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">

                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${profileStrength}%` }}
                />

              </div>

              <p className="mt-4 text-sm leading-6 text-stone-600">
                Hyvä profiili kertoo kuka olet, missä liikut ja millaisissa asioissa olet luontevasti mukana.
              </p>

            </div>

          </div>

        </section>

        {(error || success) ? (
          <div
            className={`rounded-[1.5rem] p-4 text-sm ring-1 ${
              error
                ? 'bg-rose-50 text-rose-800 ring-rose-200'
                : 'bg-emerald-50 text-emerald-800 ring-emerald-200'
            }`}
          >
            {error ?? success}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-start">

          <main className="space-y-6">

            <EditSection
              eyebrow="1"
              title="Kuka olet Korttelissa?"
              text="Pidä tämä selkeänä ja helposti lähestyttävänä. Alue riittää, tarkkaa osoitetta ei tarvita."
            >

              <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">

                <div className="flex flex-col items-center gap-3">

                  <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-stone-900 text-4xl font-semibold text-white shadow-sm">

                    {initials}

                    <span className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-stone-700 ring-1 ring-stone-200">
                      <Camera size={16} />
                    </span>

                  </div>

                  <span className="rounded-full bg-[#fbf8f2] px-4 py-2 text-xs font-semibold text-stone-500 ring-1 ring-stone-200">
                    Profiilikuva tulossa myöhemmin
                  </span>

                </div>

                <div className="grid gap-4">

                  <LabelledInput
                    label="Nimi"
                    value={displayName}
                    onChange={setDisplayName}
                    placeholder="Esim. Juhana"
                    icon={<User size={17} />}
                  />

                  <LabelledInput
                    label="Alue"
                    value={location}
                    onChange={setLocation}
                    placeholder="Esim. Töölö, Helsinki"
                    icon={<MapPin size={17} />}
                  />

                </div>

              </div>

            </EditSection>

            <EditSection
              eyebrow="2"
              title="Valitse enintään viisi pientä merkkiä"
              text="Nämä eivät ole CV-taitoja. Valitse sellaisia, jotka tekevät profiilista inhimillisemmän."
              aside={`${selectedChips.length}/${MAX_CHIPS} valittu`}
            >

              <div className="space-y-5">

                <ChipGroup
                  title="Mikä kuvaa sinua?"
                  chips={chipOptions.filter(
                    (chip) => chip.type === 'identity'
                  )}
                  selectedChips={selectedChips}
                  onToggle={toggleChip}
                />

                <ChipGroup
                  title="Missä autat mielelläsi?"
                  chips={chipOptions.filter(
                    (chip) => chip.type === 'helper'
                  )}
                  selectedChips={selectedChips}
                  onToggle={toggleChip}
                />

              </div>

            </EditSection>

            <EditSection
              eyebrow="3"
              title="Kerro muutamalla lauseella itsestäsi"
              text="Hyvä esittely on arkinen, lyhyt ja luonnollinen. Sen ei tarvitse kuulostaa täydelliseltä."
            >

              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                rows={6}
                maxLength={360}
                placeholder="Esim. Asun Töölössä ja autan mielelläni pienissä arjen asioissa. Olen rauhallinen sopija ja tykkään erityisesti käytännön hommista, joissa tarvitaan käsiparia."
                className="w-full resize-none rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-200/60"
              />

              <div className="mt-2 flex justify-between text-xs text-stone-500">

                <span>Vinkki: 2–4 lausetta riittää.</span>

                <span>{bio.length}/360</span>

              </div>

            </EditSection>

            <EditSection
              eyebrow="4"
              title="Yhteystiedot ja pehmeät luottamussignaalit"
              text="Nämä eivät tee profiilista somea. Ne auttavat vain toista hahmottamaan, että ruudun takana on oikea ihminen."
            >

              <div className="grid gap-4 sm:grid-cols-2">

                <LabelledInput
                  label="Puhelin"
                  value={phoneNumber}
                  onChange={setPhoneNumber}
                  placeholder="Esim. +358 40 123 4567"
                  icon={<Phone size={17} />}
                />

                <LabelledInput
                  label="Instagram"
                  value={instagramUrl}
                  onChange={setInstagramUrl}
                  placeholder="instagram.com/kayttaja"
                  icon={<Instagram size={17} />}
                />

                <LabelledInput
                  label="LinkedIn"
                  value={linkedinUrl}
                  onChange={setLinkedinUrl}
                  placeholder="linkedin.com/in/kayttaja"
                  icon={<Linkedin size={17} />}
                />

                <LabelledInput
                  label="Facebook"
                  value={facebookUrl}
                  onChange={setFacebookUrl}
                  placeholder="facebook.com/kayttaja"
                  icon={<Facebook size={17} />}
                />

              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">

                <TrustBox
                  icon={<Mail size={17} />}
                  label="Sähköposti"
                  value={userEmail ? 'Vahvistettu' : 'Lisää myöhemmin'}
                />

                <TrustBox
                  icon={<Phone size={17} />}
                  label="Puhelin"
                  value={phoneNumber || 'Lisää halutessasi'}
                />

                <TrustBox
                  icon={<Home size={17} />}
                  label="Alue"
                  value={location || 'Lisää alue'}
                />

              </div>

            </EditSection>

          </main>

          <aside className="lg:sticky lg:top-6">

            <div className="rounded-[2rem] bg-[#fbf8f2] p-5 shadow-sm ring-1 ring-stone-200/70">

              <p className="mb-4 text-sm font-semibold text-stone-950">
                Esikatselu
              </p>

              <div className="rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 ring-stone-200/70">

                <div className="flex items-start gap-4">

                  <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-stone-900 text-xl font-semibold text-white">

                    {initials}

                    <span className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-600 text-white ring-2 ring-white">
                      <BadgeCheck size={13} />
                    </span>

                  </div>

                  <div className="min-w-0">

                    <h2 className="truncate text-xl font-semibold tracking-tight text-stone-950">
                      {displayName || 'Nimesi'}
                    </h2>

                    <p className="mt-1 flex items-center gap-1.5 text-sm text-stone-600">
                      <MapPin size={14} />
                      {location || 'Alueesi'}
                    </p>

                  </div>

                </div>

                <p className="mt-5 text-sm leading-7 text-stone-700">
                  {bio ||
                    'Lyhyt esittelysi näkyy tässä. Kirjoita tavalla, joka kuulostaa sinulta.'}
                </p>

                <div className="mt-5 flex flex-wrap gap-2">

                  {selectedChipObjects.length > 0 ? (
                    selectedChipObjects.map((chip) => (
                      <span
                        key={chip.id}
                        className="inline-flex items-center gap-1.5 rounded-full bg-[#fbf8f2] px-3 py-1.5 text-xs font-medium text-stone-700 ring-1 ring-stone-200/70"
                      >
                        <span className="text-emerald-700">
                          {chip.icon}
                        </span>
                        {chip.label}
                      </span>
                    ))
                  ) : (
                    <span className="rounded-full bg-[#fbf8f2] px-3 py-1.5 text-xs text-stone-500 ring-1 ring-stone-200/70">
                      Valitse muutama merkki
                    </span>
                  )}

                </div>

                <div className="mt-5 rounded-[1.25rem] bg-[#fbf8f2] p-4">

                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">
                    Korttelissa
                  </p>

                  <p className="mt-2 text-sm leading-6 text-stone-700">
                    Mukana vuodesta {memberSince}. Profiili täydentyy kohtaamisten ja palautteiden myötä.
                  </p>

                </div>

              </div>

              <div className="mt-4 grid gap-2">

                <button
                  type="button"
                  onClick={() => handleSave(false)}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {saving ? (
                    <Loader2 size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {saving ? 'Tallennetaan...' : 'Tallenna profiili'}
                </button>

                <button
                  type="button"
                  onClick={() => handleSave(true)}
                  disabled={saving}
                  className="inline-flex w-full items-center justify-center rounded-full bg-[#f6efe4] px-5 py-3 text-sm font-semibold text-stone-800 ring-1 ring-stone-200/70 transition hover:bg-[#efe5d6] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Tallenna ja palaa profiiliin
                </button>

              </div>

            </div>

          </aside>

        </div>

      </div>
    </PageContainer>
  );
}

function EditSection({
  eyebrow,
  title,
  text,
  aside,
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  aside?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-stone-200/70 sm:p-7">

      <div className="mb-6 flex items-start justify-between gap-4">

        <div className="flex gap-4">

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fbf8f2] text-sm font-semibold text-stone-800 ring-1 ring-stone-200/70">
            {eyebrow}
          </div>

          <div>

            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              {title}
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">
              {text}
            </p>

          </div>

        </div>

        {aside ? (
          <span className="shrink-0 rounded-full bg-[#fbf8f2] px-3 py-1.5 text-xs font-semibold text-stone-600 ring-1 ring-stone-200/70">
            {aside}
          </span>
        ) : null}

      </div>

      {children}

    </section>
  );
}

function LabelledInput({
  label,
  value,
  onChange,
  placeholder,
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  icon: React.ReactNode;
}) {
  return (
    <label className="block">

      <span className="mb-2 block text-sm font-medium text-stone-800">
        {label}
      </span>

      <span className="flex items-center gap-3 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-stone-500 transition focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-stone-200/60">

        {icon}

        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
        />

      </span>

    </label>
  );
}

function ChipGroup({
  title,
  chips,
  selectedChips,
  onToggle,
}: {
  title: string;
  chips: ChipOption[];
  selectedChips: string[];
  onToggle: (chipId: string) => void;
}) {
  return (
    <div>

      <h3 className="mb-3 text-sm font-semibold text-stone-950">
        {title}
      </h3>

      <div className="flex flex-wrap gap-2.5">

        {chips.map((chip) => {
          const selected = selectedChips.includes(chip.id);

          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onToggle(chip.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 transition ${
                selected
                  ? 'bg-stone-950 text-white ring-stone-950 shadow-sm'
                  : 'bg-[#fbf8f2] text-stone-700 ring-stone-200 hover:bg-stone-50 hover:text-stone-950'
              }`}
            >
              <span className={selected ? 'text-white' : 'text-emerald-700'}>
                {chip.icon}
              </span>

              {chip.label}

              {selected ? <Check size={14} /> : null}
            </button>
          );
        })}

      </div>

    </div>
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
    <div className="rounded-[1.25rem] bg-[#fbf8f2] p-4 ring-1 ring-stone-200/70">

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