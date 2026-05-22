'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  Euro,
  FileText,
  Loader2,
  MapPin,
  Save,
  Sparkles,
  Tag,
} from 'lucide-react';

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
  const [category, setCategory] = useState<string>(formCategories[0]);
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

      const result = await supabase
        .from('gigs')
        .select('id,title,category,budget,location,date_time,description,status,user_id')
        .eq('id', params.id)
        .eq('user_id', userId)
        .single();

      const data = result.data as BrowseGig | null;
      const fetchError = result.error;

      if (fetchError || !data) {
        console.error('Supabase edit load error:', fetchError);
        setError('Ilmoitusta ei löytynyt tai sinulla ei ole oikeutta muokata sitä.');
        setLoading(false);
        return;
      }

      setTitle(data.title ?? '');
      setDescription(data.description ?? '');
      setCategory(data.category ?? formCategories[0]);
      setBudget(data.budget ?? '');
      setLocation(data.location ?? '');
      setDateTime(data.date_time ?? '');
      setLoading(false);
    };

    loadGig();
  }, [params.id, router]);

  const completionScore = useMemo(() => {
    let score = 0;
    if (title.trim()) score += 25;
    if (description.trim().length >= 20) score += 30;
    if (category.trim()) score += 15;
    if (location.trim()) score += 15;
    if (dateTime.trim()) score += 10;
    if (budget.trim()) score += 5;
    return Math.min(score, 100);
  }, [title, description, category, location, dateTime, budget]);

  const handleSave = async () => {
    if (saving) return;

    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('gigs')
      .update({
        title: title.trim(),
        description: description.trim(),
        category,
        budget: budget.trim(),
        location: location.trim(),
        date_time: dateTime.trim(),
      })
      .eq('id', params.id);

    if (updateError) {
      console.error('Supabase update error:', updateError);
      setError('Ilmoituksen päivitys epäonnistui. Yritä uudelleen.');
      setSaving(false);
      return;
    }

    router.push('/profile');
  };

  if (loading) {
    return (
      <PageContainer contentClassName="max-w-3xl">
        <div className="rounded-[2rem] bg-[#fbf8f2] p-8 text-center text-stone-500 shadow-sm ring-1 ring-stone-200/70">
          Ilmoitusta ladataan...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-5xl">
      <div className="relative space-y-6 pb-10 text-stone-900">
        <div className="pointer-events-none absolute -right-16 top-10 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-12 h-72 w-72 rounded-full bg-emerald-200/15 blur-3xl" />
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
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
          >
            {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
            {saving ? 'Tallennetaan...' : 'Tallenna'}
          </button>
        </div>

        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#fbf8f2] p-6 shadow-sm ring-1 ring-stone-200/70 sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />

          <div className="relative grid gap-8 lg:grid-cols-[1fr_300px] lg:items-center">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-stone-700 ring-1 ring-stone-200/80">
                <Sparkles size={16} className="text-emerald-700" />
                Päivitä ilmoitustasi
              </p>

              <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
                Tee ilmoituksesta sellainen, että siihen on helppo tarttua.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                Korttelissa hyvä ilmoitus kuulostaa enemmän naapurin viestiltä kuin tuotelistaukselta. Selkeys, sijainti ja pieni arkinen kuvaus riittävät pitkälle.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white/75 p-5 shadow-sm ring-1 ring-stone-200/80 backdrop-blur">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-stone-950">Ilmoituksen selkeys</p>
                <span className="text-sm font-semibold text-emerald-700">{completionScore}%</span>
              </div>

              <div className="mt-3 h-2 overflow-hidden rounded-full bg-stone-200">
                <div
                  className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>

              <p className="mt-4 text-sm leading-6 text-stone-600">
                Hyvä ilmoitus kertoo mitä tarvitaan, missä päin ja milloin. Kaiken ei tarvitse olla täydellistä.
              </p>
            </div>
          </div>
        </section>

        {error ? (
          <div className="rounded-[1.5rem] bg-rose-50 p-4 text-sm text-rose-800 ring-1 ring-rose-200">
            {error}
          </div>
        ) : null}

        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
          <main className="space-y-6">
            <form
              className="space-y-6"
              onSubmit={(event) => {
                event.preventDefault();
                handleSave();
              }}
            >
              <EditSection
                eyebrow="1"
                title="Mitä ilmoitus koskee?"
                text="Kirjoita otsikko niin, että toinen ymmärtää asian yhdellä vilkaisulla."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <LabelledInput
                    label="Otsikko"
                    value={title}
                    onChange={setTitle}
                    placeholder="Esim. Kirjahyllyn kasaus"
                    icon={<FileText size={17} />}
                  />

                  <label className="block">
                    <span className="mb-2 block text-sm font-medium text-stone-800">
                      Minkä tyyppisestä avusta on kyse?
                    </span>
                    <span className="flex items-center gap-3 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-stone-500 transition focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-stone-200/60">
                      <Tag size={17} />
                      <select
                        value={category}
                        onChange={(event) => setCategory(event.target.value)}
                        className="w-full bg-transparent text-sm text-stone-900 outline-none"
                      >
                        {formCategories.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </span>
                  </label>
                </div>
              </EditSection>

              <EditSection
                eyebrow="2"
                title="Kerro hieman lisää"
                text="Pidä kuvaus arkisena. Kerro mitä pitäisi tehdä, onko jotain huomioitavaa ja millainen apu olisi hyödyllistä."
              >
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  rows={6}
                  maxLength={700}
                  placeholder="Esim. Tarvitsisin apua kirjahyllyn kasaamisessa. Paketti on jo kotona ja työkalut löytyvät. Aikaa menisi ehkä noin tunti."
                  className="w-full resize-none rounded-[1.5rem] border border-stone-200 bg-white px-4 py-3 text-sm leading-7 text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-200/60"
                />
                <div className="mt-2 flex justify-between text-xs text-stone-500">
                  <span>Vinkki: lyhyt ja konkreettinen kuvaus toimii parhaiten.</span>
                  <span>{description.length}/700</span>
                </div>
              </EditSection>

              <EditSection
                eyebrow="3"
                title="Missä ja milloin?"
                text="Tarkkaa osoitetta ei tarvitse lisätä. Alue tai kaupunginosa riittää tässä vaiheessa."
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <LabelledInput
                    label="Noin sijainti"
                    value={location}
                    onChange={setLocation}
                    placeholder="Esim. Punavuori, Helsinki"
                    icon={<MapPin size={17} />}
                  />

                  <LabelledInput
                    label="Aikataulu"
                    value={dateTime}
                    onChange={setDateTime}
                    placeholder="Esim. Tämä viikonloppu"
                    icon={<CalendarDays size={17} />}
                  />
                </div>
              </EditSection>

              <EditSection
                eyebrow="4"
                title="Korvaus"
                text="Korvaus voi olla tarkka summa, suuntaa-antava tai sovittavissa. Korttelissa kaiken ei tarvitse alkaa hinnasta."
              >
                <LabelledInput
                  label="Korvaus tai muu sopimus"
                  value={budget}
                  onChange={setBudget}
                  placeholder="Esim. 20 €, kahvipaketti tai sovitaan yhdessä"
                  icon={<Euro size={17} />}
                />
              </EditSection>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link
                  href="/profile"
                  className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-stone-700 ring-1 ring-stone-200 transition hover:bg-stone-50 hover:text-stone-950"
                >
                  Peruuta
                </Link>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-stone-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:bg-stone-400"
                >
                  {saving ? <Loader2 size={17} className="animate-spin" /> : <Save size={17} />}
                  {saving ? 'Tallennetaan...' : 'Tallenna muutokset'}
                </button>
              </div>
            </form>
          </main>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[2rem] bg-[#fbf8f2] p-5 shadow-sm ring-1 ring-stone-200/70">
              <p className="mb-4 text-sm font-semibold text-stone-950">Esikatselu</p>

              <div className="rounded-[1.75rem] bg-[#fffdf9] p-5 shadow-sm ring-1 ring-stone-200/70">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <span className="rounded-full bg-[#fbf8f2] px-3 py-1 text-xs font-semibold text-stone-700 ring-1 ring-stone-200/70">
                    {category || 'Kategoria'}
                  </span>

                  {completionScore >= 70 ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-100">
                      <Check size={13} />
                      Selkeä
                    </span>
                  ) : null}
                </div>

                <h2 className="text-xl font-semibold leading-7 tracking-tight text-stone-950">
                  {title || 'Ilmoituksen otsikko'}
                </h2>

                <p className="mt-3 line-clamp-5 text-sm leading-7 text-stone-700">
                  {description || 'Lyhyt kuvaus näkyy tässä. Kirjoita se niin kuin selittäisit asian naapurille.'}
                </p>

                <div className="mt-5 flex flex-wrap gap-2 text-xs text-stone-500">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5">
                    <MapPin size={13} />
                    {location || 'Alue'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5">
                    <CalendarDays size={13} />
                    {dateTime || 'Aikataulu'}
                  </span>
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-50 px-3 py-1.5">
                    <Euro size={13} />
                    {budget || 'Sovitaan yhdessä'}
                  </span>
                </div>
              </div>

              <div className="mt-4 rounded-[1.5rem] bg-[#fffdf9]/80 p-4 text-sm leading-6 text-stone-600 ring-1 ring-stone-200/70">
                Ilmoitus voi olla keskeneräinenkin. Tärkeintä on, että toinen saa turvallisen ja selkeän ensikuvan.
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
  children,
}: {
  eyebrow: string;
  title: string;
  text: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[2rem] bg-[#fffdf9] p-6 shadow-sm ring-1 ring-stone-200/70 sm:p-7">
      <div className="mb-6 flex gap-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#fbf8f2] text-sm font-semibold text-stone-800 ring-1 ring-stone-200/70">
          {eyebrow}
        </div>

        <div>
          <h2 className="text-xl font-semibold tracking-tight text-stone-950">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-stone-600">{text}</p>
        </div>
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
      <span className="mb-2 block text-sm font-medium text-stone-800">{label}</span>
      <span className="flex items-center gap-3 rounded-[1.25rem] border border-stone-200 bg-white px-4 py-3 text-stone-500 transition focus-within:border-stone-400 focus-within:ring-4 focus-within:ring-stone-200/60">
        {icon}
        <input
          type="text"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm text-stone-900 outline-none placeholder:text-stone-400"
        />
      </span>
    </label>
  );
}
