'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';
import { cities, formatLocation, getNeighborhoods, parseLocation, type City } from '../../lib/locations';

type Profile = {
  display_name: string | null;
  location: string | null;
  bio: string | null;
  created_at: string | null;
};

export default function OnboardingPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [city, setCity] = useState<City>('Helsinki');
  const [neighborhood, setNeighborhood] = useState<string>(getNeighborhoods('Helsinki')[0]);
  const [location, setLocation] = useState<string>(formatLocation('Helsinki', getNeighborhoods('Helsinki')[0]));
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      const userId = sessionData.session.user.id;
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('display_name,location,bio,created_at')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase profile load error:', error);
        setError('Profiilin latauksessa tapahtui virhe. Yritä uudelleen.');
        setLoading(false);
        return;
      }

      const profile = profileData as Profile | null;
      if (profile && profile.display_name && profile.location && profile.bio) {
        router.replace('/profile');
        return;
      }

      const parsed = parseLocation(profile?.location ?? '');
      setCity(parsed.city);
      setNeighborhood(parsed.neighborhood);
      setLocation(formatLocation(parsed.city, parsed.neighborhood));
      setDisplayName(profile?.display_name ?? '');
      setBio(profile?.bio ?? '');
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.replace('/login');
      return;
    }

    const userId = sessionData.session.user.id;
    const newProfile = {
      id: userId,
      display_name: displayName.trim(),
      location: formatLocation(city, neighborhood),
      bio: bio.trim(),
      created_at: new Date().toISOString(),
    };

    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    const result = existingProfile
      ? await supabase.from('profiles').update(newProfile).eq('id', userId)
      : await supabase.from('profiles').insert(newProfile);

    if (result.error) {
      console.error('Supabase onboarding save error:', result.error);
      setError('Profiilin tallennus epäonnistui. Yritä uudelleen.');
      setSaving(false);
      return;
    }

    router.replace('/profile');
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center text-slate-500">
          Profiilin tiedot ladataan...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-3xl">
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Profiilin luominen</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Tervetuloa palveluun!</h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            Täydennä profiilisi tiedot, jotta naapurit näkevät sinut ja voivat luottaa tarjoukseesi.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Nimimerkki</span>
            <input
              type="text"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Esim. Anna"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Kaupunki</span>
              <select
                value={city}
                onChange={(event) => {
                  const nextCity = event.target.value as City;
                  const nextNeighborhood = getNeighborhoods(nextCity)[0] ?? '';
                  setCity(nextCity);
                  setNeighborhood(nextNeighborhood);
                  setLocation(formatLocation(nextCity, nextNeighborhood));
                }}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {cities.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Alue</span>
              <select
                value={neighborhood}
                onChange={(event) => {
                  const nextNeighborhood = event.target.value;
                  setNeighborhood(nextNeighborhood);
                  setLocation(formatLocation(city, nextNeighborhood));
                }}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {getNeighborhoods(city).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Lyhyt esittely</span>
            <textarea
              value={bio}
              onChange={(event) => setBio(event.target.value)}
              rows={4}
              placeholder="Kerro lyhyesti, millaista apua tarjotaan."
              className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Tallennetaan...' : 'Jatka profiiliin'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
