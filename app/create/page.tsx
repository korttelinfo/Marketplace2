'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';
import { cities, formatLocation, getNeighborhoods, parseLocation, type City } from '../../lib/locations';
import {
  COMPENSATION_TYPES,
  URGENCY_OPTIONS,
  SITUATION_OPTIONS,
  helpCategories,
  getUrgencyEmoji,
  getSituationEmoji,
  getSituationDescription,
  type ListingType,
  type CompensationType,
  type Urgency,
  type SituationType,
} from '../../lib/helpCategories';

const TOTAL_STEPS = 6;

export default function CreatePage() {
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [listingType, setListingType] = useState<ListingType>('Tarvitsen apua');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryGroup, setCategoryGroup] = useState<string>('Koti & arki');
  const [category, setCategory] = useState<string>(helpCategories['Koti & arki'][0]);
  const [situationType, setSituationType] = useState<SituationType | ''>('');
  const [compensation, setCompensation] = useState<CompensationType>('Sovitaan yhdessä');
  const [compensationAmount, setCompensationAmount] = useState('');
  const [urgency, setUrgency] = useState<Urgency>('Lähipäivinä');
  const [city, setCity] = useState<City>('Helsinki');
  const [neighborhood, setNeighborhood] = useState<string>(getNeighborhoods('Helsinki')[0]);
  const [location, setLocation] = useState<string>(formatLocation('Helsinki', getNeighborhoods('Helsinki')[0]));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  const isNeed = listingType === 'Tarvitsen apua';

  const copy = useMemo(() => {
    if (isNeed) {
      return {
        eyebrow: 'Uusi pyyntö',
        heroTitle: 'Mitä tarvitset?',
        heroText: 'Kerro lyhyesti mitä etsit lähialueelta. Kortteli auttaa tekemään arjen pienistä asioista helpompia.',
        intentLabel: 'Tarvitsen',
        titlePlaceholder: 'Esim. porakone illaksi, kissanhoitoa viikonlopuksi, Excel-apua',
        categoryTitle: 'Mihin tämä liittyy?',
        timingTitle: 'Kuinka pian tarvitset tätä?',
        situationTitle: 'Millaisesta jutusta on kyse?',
        situationText: 'Tämä on vapaaehtoinen tarkennus. Se auttaa muita ymmärtämään, onko kyse nopeasta jutusta vai pidemmästä järjestelystä.',
        compensationTitle: 'Tarjoatko korvausta?',
        detailsTitle: 'Haluatko lisätä jotain?',
        detailsPlaceholder: 'Esim. “Voin hakea itse”, “Kissa tarvitsee ruokinnan aamulla ja illalla” tai “Tarvitsen apua noin tunniksi”.',
        submitLabel: 'Julkaise pyyntö',
        success: 'Pyyntö julkaistu! Ohjataan selaamaan lähialueen juttuja...',
      };
    }

    return {
      eyebrow: 'Uusi tarjonta',
      heroTitle: 'Mitä voit tarjota?',
      heroText: 'Kerro mitä voit lainata, tehdä tai tarjota lähialueella. Muut voivat löytää sinut tarpeen hetkellä.',
      intentLabel: 'Tarjoan',
      titlePlaceholder: 'Esim. akkuporakone lainaan, ompeluapua, koiran ulkoilutusta',
      categoryTitle: 'Mihin tämä liittyy?',
      timingTitle: 'Milloin tämä voisi onnistua?',
      situationTitle: 'Millaisesta tarjonnasta on kyse?',
      situationText: 'Tämä on vapaaehtoinen tarkennus. Se auttaa muita ymmärtämään, onko tarjontasi nopeaa, pidempää vai toistuvaa.',
      compensationTitle: 'Haluatko korvausta?',
      detailsTitle: 'Haluatko lisätä jotain?',
      detailsPlaceholder: 'Esim. “Vain iltaisin”, “Nouto onnistuu”, “Voin auttaa viikonloppuisin” tai “Sovitaan tarkemmin viestillä”.',
      submitLabel: 'Julkaise tarjonta',
      success: 'Tarjonta julkaistu! Ohjataan selaamaan lähialueen juttuja...',
    };
  }, [isNeed]);

  const examples = isNeed
    ? ['Porakone illaksi', 'Kantoapua 15 min', 'Kissanhoitoa viikonlopuksi', 'Excel-apua', 'Lenkkiseuraa']
    : ['Akkuporakone lainaan', 'Ompeluapua', 'Koiran ulkoilutus', 'Digiapua', 'Muuttoapua iltaisin'];

  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        router.replace('/login');
        return;
      }

      const currentUserId = data.session.user.id;
      setUserId(currentUserId);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('location')
        .eq('id', currentUserId)
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

  const canContinue = () => {
    if (step === 1) return title.trim().length > 1;
    if (step === 2) return Boolean(categoryGroup && category);
    if (step === 3) return Boolean(urgency);
    if (step === 4) return true;
    if (step === 5) {
      if (compensation === 'Kiinteä summa') return compensationAmount.trim().length > 0;
      return Boolean(compensation);
    }
    return true;
  };

  const goNext = () => {
    if (!canContinue()) return;
    setMessage(null);
    setMessageType(null);
    setStep((current) => Math.min(current + 1, TOTAL_STEPS));
  };

  const goBack = () => {
    setMessage(null);
    setMessageType(null);
    setStep((current) => Math.max(current - 1, 1));
  };

  const handleSubmit = async () => {
    if (isSubmitting || !userId) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !category) {
      setMessage('Kerro ensin mitä tarvitset tai tarjoat.');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage(null);
    setMessageType(null);

    const compensationText =
      compensation === 'Kiinteä summa' && compensationAmount
        ? `${compensationAmount} €`
        : compensation;

    const enrichedDescription = [
      situationType ? `Tilanne: ${situationType}` : null,
      trimmedDescription || null,
    ]
      .filter(Boolean)
      .join('\n\n');

    const { error } = await supabase.from('gigs').insert({
      title: trimmedTitle,
      description: enrichedDescription || '',
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
      setMessage('Tapahtui virhe julkaisussa. Yritä uudelleen.');
      setMessageType('error');
      setIsSubmitting(false);
      return;
    }

    setMessage(copy.success);
    setMessageType('success');

    window.setTimeout(() => {
      router.push('/browse');
    }, 800);
  };

  if (checkingAuth) {
    return (
      <PageContainer contentClassName="max-w-3xl">
        <div className="rounded-[2rem] bg-white/90 p-6 text-center text-slate-500 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
          Tarkistetaan kirjautuneisuutta...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-3xl">
      <div className="overflow-hidden rounded-[2rem] bg-[#fffaf3] shadow-xl shadow-slate-200/70 ring-1 ring-orange-100">
        <div className="px-5 py-6 sm:px-8 sm:py-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
              {copy.eyebrow}
            </p>
            <p className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600 ring-1 ring-orange-100">
              {step}/{TOTAL_STEPS}
            </p>
          </div>

          <div className="mb-6 h-2 overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-orange-500 transition-all duration-300"
              style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
            />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
            {step === 1 ? copy.heroTitle : getStepTitle(step, copy)}
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
            {step === 1 ? copy.heroText : getStepText(step, copy)}
          </p>
        </div>

        <div className="bg-white p-5 sm:p-8">
          {step === 1 && (
            <div className="space-y-7">
              <div className="grid grid-cols-2 gap-2 rounded-[1.5rem] bg-slate-100 p-2">
                <button
                  type="button"
                  onClick={() => setListingType('Tarvitsen apua')}
                  className={`rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition ${
                    isNeed ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Tarvitsen
                </button>

                <button
                  type="button"
                  onClick={() => setListingType('Tarjoan apua')}
                  className={`rounded-[1.15rem] px-4 py-3 text-sm font-semibold transition ${
                    !isNeed ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  Tarjoan
                </button>
              </div>

              <label className="block">
                <span className="mb-3 block text-sm font-semibold text-slate-800">
                  {copy.intentLabel}
                </span>
                <input
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder={copy.titlePlaceholder}
                  className="w-full rounded-[1.75rem] border border-orange-100 bg-[#fffaf3] px-5 py-5 text-lg font-medium text-slate-950 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  autoFocus
                />
              </label>

              <div>
                <p className="mb-3 text-sm font-semibold text-slate-700">Esimerkkejä</p>
                <div className="flex flex-wrap gap-2">
                  {examples.map((example) => (
                    <button
                      key={example}
                      type="button"
                      onClick={() => setTitle(example)}
                      className="rounded-full border border-orange-100 bg-[#fffaf3] px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-orange-200 hover:bg-orange-50"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-3 sm:grid-cols-2">
                {Object.keys(helpCategories).map((group) => (
                  <button
                    key={group}
                    type="button"
                    onClick={() => {
                      setCategoryGroup(group);
                      setCategory(helpCategories[group][0]);
                    }}
                    className={`rounded-[1.5rem] border p-5 text-left transition ${
                      categoryGroup === group
                        ? 'border-orange-300 bg-orange-50 text-slate-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-[#fffaf3]'
                    }`}
                  >
                    <span className="block text-base font-semibold">{group}</span>
                    <span className="mt-2 block text-sm leading-5 text-slate-500">
                      {helpCategories[group]?.slice(0, 3).join(', ')}
                    </span>
                  </button>
                ))}
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  Tarkempi aihe
                </span>
                <select
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                >
                  {helpCategories[categoryGroup]?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          {step === 3 && (
            <div className="grid gap-3">
              {URGENCY_OPTIONS.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setUrgency(option)}
                  className={`flex items-center gap-4 rounded-[1.5rem] border px-5 py-4 text-left transition ${
                    urgency === option
                      ? 'border-orange-300 bg-orange-50 text-slate-950 shadow-sm'
                      : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-[#fffaf3]'
                  }`}
                >
                  <span className="text-2xl">{getUrgencyEmoji(option)}</span>
                  <span className="text-base font-semibold">{option}</span>
                </button>
              ))}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setSituationType('')}
                className={`w-full rounded-[1.5rem] border px-5 py-4 text-left transition ${
                  situationType === ''
                    ? 'border-orange-300 bg-orange-50 text-slate-950 shadow-sm'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-[#fffaf3]'
                }`}
              >
                <span className="block text-base font-semibold">En määrittele tätä vielä</span>
                <span className="mt-1 block text-sm leading-5 text-slate-500">
                  Hyvä valinta, jos aikamääre ja lisätiedot riittävät.
                </span>
              </button>

              <div className="grid gap-3">
                {SITUATION_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setSituationType(option)}
                    className={`rounded-[1.5rem] border px-5 py-4 text-left transition ${
                      situationType === option
                        ? 'border-orange-300 bg-orange-50 text-slate-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-[#fffaf3]'
                    }`}
                  >
                    <span className="flex items-center gap-3 text-base font-semibold">
                      <span>{getSituationEmoji(option)}</span>
                      {option}
                    </span>
                    <span className="mt-1 block text-sm leading-5 text-slate-500">
                      {getSituationDescription(option)}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-5">
              <div className="grid gap-3">
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
                    className={`rounded-[1.5rem] border px-5 py-4 text-left transition ${
                      compensation === type
                        ? 'border-orange-300 bg-orange-50 text-slate-950 shadow-sm'
                        : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-[#fffaf3]'
                    }`}
                  >
                    <span className="block text-base font-semibold">{type}</span>
                    <span className="mt-1 block text-sm text-slate-500">
                      {getCompensationDescription(type)}
                    </span>
                  </button>
                ))}
              </div>

              {compensation === 'Kiinteä summa' && (
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-800">
                    Summa euroissa
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={compensationAmount}
                    onChange={(event) => setCompensationAmount(event.target.value)}
                    placeholder="Esim. 10"
                    className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-5 py-4 text-lg font-medium text-slate-950 placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                </label>
              )}
            </div>
          )}

          {step === 6 && (
            <div className="space-y-6">
              <div className="rounded-[1.75rem] border border-orange-100 bg-[#fffaf3] p-5">
                <p className="text-sm font-semibold text-orange-700">Yhteenveto</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {title || copy.heroTitle}
                </h2>

                <div className="mt-4 grid gap-2 text-sm text-slate-600">
                  <p><span className="font-semibold text-slate-900">Tyyppi:</span> {isNeed ? 'Tarvitsen' : 'Tarjoan'}</p>
                  <p><span className="font-semibold text-slate-900">Aihe:</span> {category}</p>
                  <p><span className="font-semibold text-slate-900">Aika:</span> {urgency}</p>
                  <p><span className="font-semibold text-slate-900">Tilanne:</span> {situationType || 'Ei määritelty'}</p>
                  <p>
                    <span className="font-semibold text-slate-900">Korvaus:</span>{' '}
                    {compensation === 'Kiinteä summa' && compensationAmount ? `${compensationAmount} €` : compensation}
                  </p>
                  <p><span className="font-semibold text-slate-900">Alue:</span> {location}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-800">Kaupunki</span>
                  <select
                    value={city}
                    onChange={(event) => {
                      const nextCity = event.target.value as City;
                      const nextNeighborhood = getNeighborhoods(nextCity)[0] ?? '';
                      setCity(nextCity);
                      setNeighborhood(nextNeighborhood);
                      setLocation(formatLocation(nextCity, nextNeighborhood));
                    }}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {cities.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-sm font-semibold text-slate-800">Alue</span>
                  <select
                    value={neighborhood}
                    onChange={(event) => {
                      const nextNeighborhood = event.target.value;
                      setNeighborhood(nextNeighborhood);
                      setLocation(formatLocation(city, nextNeighborhood));
                    }}
                    className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  >
                    {getNeighborhoods(city).map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-800">
                  {copy.detailsTitle}
                  <span className="ml-1 font-normal text-slate-400">(valinnainen)</span>
                </span>
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder={copy.detailsPlaceholder}
                  rows={4}
                  className="w-full rounded-[1.75rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>
          )}

          {message ? (
            <div
              className={`mt-6 rounded-3xl border px-4 py-3 text-sm ${
                messageType === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                  : 'border-rose-200 bg-rose-50 text-rose-700'
              }`}
            >
              {message}
            </div>
          ) : null}

          <div className="mt-8 flex gap-3">
            {step > 1 && (
              <button
                type="button"
                onClick={goBack}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Takaisin
              </button>
            )}

            {step < TOTAL_STEPS ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canContinue()}
                className="flex-1 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                Jatka
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting || !title.trim() || !category}
                className="flex-1 rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {isSubmitting ? 'Julkaistaan...' : copy.submitLabel}
              </button>
            )}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

function getStepTitle(
  step: number,
  copy: {
    categoryTitle: string;
    timingTitle: string;
    situationTitle: string;
    compensationTitle: string;
  },
) {
  if (step === 2) return copy.categoryTitle;
  if (step === 3) return copy.timingTitle;
  if (step === 4) return copy.situationTitle;
  if (step === 5) return copy.compensationTitle;
  return 'Viimeistellään';
}

function getStepText(
  step: number,
  copy: {
    situationText: string;
  },
) {
  if (step === 2) return 'Valitse lähin yläkategoria. Tarkempi aihe auttaa muita löytämään tämän helpommin.';
  if (step === 3) return 'Aika kertoo muille, kuinka nopeasti asiaan kannattaa reagoida.';
  if (step === 4) return copy.situationText;
  if (step === 5) return 'Kaiken ei tarvitse olla maksullista. Voitte sopia myös vaihdosta, pienestä korvauksesta tai ilmaisesta naapuriavusta.';
  return 'Tarkista vielä tiedot. Tarkempi osoite tai yhteystiedot voidaan sopia vasta, kun sopiva henkilö löytyy.';
}

function getCompensationDescription(type: CompensationType) {
  if (type === 'Ilmainen') return 'Sopii lainaamiseen, vaihtoon tai matalan kynnyksen naapuriapuun.';
  if (type === 'Sovitaan yhdessä') return 'Hyvä valinta, jos et vielä tiedä sopivaa korvausta.';
  if (type === 'Kiinteä summa') return 'Kirjoita selkeä summa, jonka olet valmis tarjoamaan tai pyytämään.';
  if (type === 'Vaihto käy') return 'Voitte sopia vastavuoroisesta avusta tai muusta vaihtotavasta.';
  return 'Sovitaan tarkemmin yhdessä.';
}