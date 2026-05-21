'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../../components/PageContainer';
import { supabase } from '../../../lib/supabase';

export default function ProfileEditPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [location, setLocation] = useState('');
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
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name,location,bio')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Supabase profile load error:', error);
        setError('Profiilin latauksessa tapahtui virhe. Yritä uudelleen.');
        setLoading(false);
        return;
      }

      const profile = data as { display_name: string | null; location: string | null; bio: string | null } | null;
      setDisplayName(profile?.display_name ?? '');
      setLocation(profile?.location ?? '');
      setBio(profile?.bio ?? '');
      setLoading(false);
    };

    loadProfile();
  }, [router]);

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      router.replace('/login');
      return;
    }

    const userId = sessionData.session.user.id;

    const { data: existingProfile, error: existingError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Supabase profile lookup error:', existingError);
      setError('Profiilin tallennus epäonnistui. Yritä uudelleen.');
      setSaving(false);
      return;
    }

    const payload = {
      id: userId,
      display_name: displayName.trim() || null,
      location: location.trim() || null,
      bio: bio.trim() || null,
    };

    let result;
    if (existingProfile) {
      result = await supabase.from('profiles').update(payload).eq('id', userId);
    } else {
      result = await supabase.from('profiles').insert({
        ...payload,
        created_at: new Date().toISOString(),
      });
    }

    if (result.error) {
      console.error('Supabase profile save error:', result.error);
      setError('Profiilin tallennus epäonnistui. Yritä uudelleen.');
      setSaving(false);
      return;
    }

    router.push('/profile');
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center text-slate-500">
          Profiilitietoja ladataan...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-3xl">
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Muokkaa profiilia</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Täydennä profiilisi tiedot</h1>
          <p className="max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            Lisää nimi, sijainti ja lyhyt esittely, jotta muut tunnistavat sinut helposti palvelussa.
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

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Sijainti</span>
            <input
              type="text"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
              placeholder="Esim. Helsinki"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

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
            {saving ? 'Tallennetaan...' : 'Tallenna profiili'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
