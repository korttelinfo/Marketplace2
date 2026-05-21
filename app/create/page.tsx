'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';
import { cities, formatLocation, getNeighborhoods, parseLocation, type City } from '../../lib/locations';
import {
  LISTING_TYPES,
  COMPENSATION_TYPES,
  URGENCY_OPTIONS,
  helpCategories,
  getUrgencyEmoji,
  getUrgencyLabel,
  getCategoryGroup,
  type ListingType,
  type CompensationType,
  type Urgency,
} from '../../lib/helpCategories';

export default function CreatePage() {
  const router = useRouter();
  const [listingType, setListingType] = useState<ListingType>('Tarvitsen apua');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryGroup, setCategoryGroup] = useState<string>('Koti ja kodin apu');
  const [category, setCategory] = useState<string>(helpCategories['Koti ja kodin apu'][0]);
  const [compensation, setCompensation] = useState<CompensationType>('Sovitaan yhdessä');
  const [compensationAmount, setCompensationAmount] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Tällä viikolla');
  const [city, setCity] = useState<City>('Helsinki');
  const [neighborhood, setNeighborhood] = useState<string>(getNeighborhoods('Helsinki')[0]);
  const [location, setLocation] = useState<string>(formatLocation('Helsinki', getNeighborhoods('Helsinki')[0]));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace('/login');
        return;
      }

      const userId = data.session.user.id;
      setUserId(userId);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', userId)
        .single();

      if (profileData?.location) {
        const parsed = parseLocation(profileData.location);
        setCity(parsed.city);
        setNeighborhood(parsed.neighborhood);
        setLocation(formatLocation(parsed.city, parsed.neighborhood));
      }

      setCheckingAuth(false);
    };

    checkAuth();
  }, [router]);

  const handleSubmit = async () => {
    if (isSubmitting || !userId) return;

    setIsSubmitting(true);
    setMessage(null);
    setMessageType(null);

    const compensationText =
      compensation === 'Kiinteä summa' && compensationAmount
        ? `${compensationAmount} €`
        : compensation === 'Ilmainen'
          ? 'Ilmainen'
          : 'Sovitaan yhdessä';

   const { error } = await supabase.from('gigs').insert({
  title,
  description,
  category,
  budget: compensationText,
  location,
  date_time: urgency,
  user_id: userId,
  listing_type: listingType,
  status: 'vapaa',
});

    if (error) {
      console.error('Supabase insert error:', error);
      setMessage('Tapahtui virhe keikan lisäämisessä. Yritä uudelleen.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    setMessage('Keikka lisätty! Ohjataan selaamaan keikkoja...');
    setMessageType('success');

    window.setTimeout(() => {
      router.push('/browse');
    }, 800);
  };

  if (checkingAuth) {
    return (
      <PageContainer contentClassName="max-w-3xl">
        <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8 text-center text-slate-500">
          Tarkistetaan kirjautuneisuutta...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-3xl">
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Luo keikka</p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Julkaise uusi arjen apukeikka.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            Täytä tiedot nopeasti, niin naapurit näkevät ja voivat tarjoutua auttamaan.
          </p>
        </div>

        <form className="mt-8 space-y-6">
          {/* Listing Type */}
          <div>
            <span className="mb-3 block text-sm font-semibold text-slate-700">Mitä haluat tehdä?</span>
            <div className="flex gap-3">
              {LISTING_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setListingType(type)}
                  className={`flex-1 rounded-full px-4 py-3 text-sm font-semibold transition ${
                    listingType === type
                      ? 'bg-slate-900 text-white'
                      : 'border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Otsikko</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={listingType === 'Tarvitsen apua' ? 'Esim. Kirjahyllyn kasaus' : 'Esim. Tarjoan puutarhapäivän'}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {/* Description */}
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Kuvaus</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Kuvaile keikkaa lyhyesti ja rehellisesti."
              rows={4}
              className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {/* Category Group + Specific Category */}
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Apualueen ryhmä</span>
              <select
                value={categoryGroup}
                onChange={(event) => {
                  const group = event.target.value;
                  setCategoryGroup(group);
                  setCategory(helpCategories[group][0]);
                }}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {Object.keys(helpCategories).map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Tarkempi kategoria</span>
              <select
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                {helpCategories[categoryGroup]?.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Compensation */}
          <div className="space-y-3">
            <span className="block text-sm font-semibold text-slate-700">Korvaus</span>
            <div className="grid gap-2">
              {COMPENSATION_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => {
                    setCompensation(type);
                    if (type !== 'Kiinteä summa') {
                      setCompensationAmount('');
                    }
                  }}
                  className={`rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    compensation === type
                      ? 'border border-slate-400 bg-slate-100 text-slate-900'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {compensation === 'Kiinteä summa' && (
              <input
                type="number"
                value={compensationAmount}
                onChange={(event) => setCompensationAmount(event.target.value)}
                placeholder="Summa euroissa"
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            )}
          </div>

          {/* Urgency */}
          <div>
            <span className="mb-3 block text-sm font-semibold text-slate-700">Milloin tarvitset apua?</span>
            <div className="grid gap-2">
              {URGENCY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUrgency(option)}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm font-medium transition ${
                    urgency === option
                      ? 'border border-slate-400 bg-slate-100 text-slate-900'
                      : 'border border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className="text-lg">{getUrgencyEmoji(option)}</span>
                  <span>{option}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="grid gap-3 sm:grid-cols-2">
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

          {message ? (
            <div
              className={`rounded-3xl border px-4 py-3 text-sm ${
                messageType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {message}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !title || !description || !category}
            className="inline-flex w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSubmitting ? 'Lähetetään...' : 'Julkaise keikka'}
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
