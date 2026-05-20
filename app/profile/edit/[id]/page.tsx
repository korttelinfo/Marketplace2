'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../../../components/PageContainer';
import { formCategories } from '../../../../lib/mockGigs';
import { supabase } from '../../../../lib/supabase';
import type { BrowseGig } from '../../../../lib/mockGigs';

type Props = {
  params: {
    id: string;
  };
};

export default function EditGigPage({ params }: Props) {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(formCategories[0]);
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadGig = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      const userId = sessionData.session.user.id;
      const { data, error } = await supabase
        .from<BrowseGig>('gigs')
        .select('id,title,category,budget,location,date_time,description,status,user_id')
        .eq('id', params.id)
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        console.error('Supabase edit load error:', error);
        setError('Keikkaa ei löytynyt tai sinulla ei ole oikeutta muokata sitä.');
        setLoading(false);
        return;
      }

      setTitle(data.title);
      setDescription(data.description);
      setCategory(data.category);
      setBudget(data.budget);
      setLocation(data.location);
      setDateTime(data.date_time);
      setLoading(false);
    };

    loadGig();
  }, [params.id, router]);

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setError(null);

    const { error } = await supabase
      .from('gigs')
      .update({
        title,
        description,
        category,
        budget,
        location,
        date_time: dateTime,
      })
      .eq('id', params.id);

    if (error) {
      console.error('Supabase update error:', error);
      setError('Keikan päivitys epäonnistui. Yritä uudelleen.');
      setSaving(false);
      return;
    }

    router.push('/profile');
  };

  if (loading) {
    return (
      <PageContainer contentClassName="max-w-3xl">
        <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center text-slate-500">
          Keikkaa ladataan...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-3xl">
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Muokkaa keikkaa</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Muokkaa keikkaa</h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            Päivitä keikan tiedot ja tallenna muutokset. Vain sinun omat keikkasi voi muokata.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={(event) => { event.preventDefault(); handleSave(); }}>
          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Otsikko</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Esim. Kirjahyllyn kasaus"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Budjetti</span>
              <input
                type="text"
                value={budget}
                onChange={(event) => setBudget(event.target.value)}
                placeholder="Esim. 20 €"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Kuvaus</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kuvaile keikkaa lyhyesti."
              rows={5}
              className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Kategoria</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {formCategories.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Aikataulu</span>
              <input
                type="text"
                value={dateTime}
                onChange={(event) => setDateTime(event.target.value)}
                placeholder="Esim. Tämä viikonloppu"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Noin sijainti</span>
              <input
                type="text"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="Esim. Punavuori, Helsinki"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>
          </div>

          {error ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {saving ? 'Tallennetaan...' : 'Tallenna muutokset'}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
