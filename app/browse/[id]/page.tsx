'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageContainer from '../../../components/PageContainer';
import { supabase } from '../../../lib/supabase';
import type { BrowseGig } from '../../../lib/mockGigs';
import {
  URGENCY_OPTIONS,
  getUrgencyEmoji,
  getUrgencyLabel,
  type Urgency,
} from '../../../lib/helpCategories';

type ResponseIntent = 'now' | 'today' | 'later' | 'ask';
type CompensationReply = 'ok' | 'free' | 'suggest' | 'discuss';

export default function BrowseGigPage() {
  const params = useParams();
  const router = useRouter();

  const [gig, setGig] = useState<BrowseGig | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [responseOpen, setResponseOpen] = useState(false);
  const [responseIntent, setResponseIntent] =
    useState<ResponseIntent>('today');

  const [compensationReply, setCompensationReply] =
    useState<CompensationReply>('discuss');

  const [suggestedAmount, setSuggestedAmount] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const [responseError, setResponseError] =
    useState<string | null>(null);

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('gigs')
        .select(
          'id,title,category,budget,location,date_time,description,status,listing_type,user_id',
        )
        .eq('id', params.id)
        .maybeSingle();

      if (fetchError) {
        console.error(fetchError);

        setError(
          'Tilannetta ei voitu ladata juuri nyt.',
        );

        setGig(null);
      } else {
        setGig(data as BrowseGig);
        setOwnerId((data as any)?.user_id ?? null);
      }

      setLoading(false);
    };

    if (params.id) {
      fetchGig();
    }
  }, [params.id]);

  const listingType =
    (gig as any)?.listing_type || 'Tarvitsen apua';

  const isOffer =
    listingType === 'Tarjoan apua';

  const isNeed = !isOffer;

  const isUrgency =
    gig &&
    URGENCY_OPTIONS.includes(gig.date_time as Urgency);

  const urgency =
    isUrgency && gig
      ? (gig.date_time as Urgency)
      : null;

  const pageCopy = useMemo(() => {
    if (isOffer) {
      return {
        eyebrow: 'Tarjolla lähialueella',
        actionLabel: 'Pyydä tätä',
        actionTitle: 'Kiinnostuitko tästä?',
        actionText:
          'Lähetä kevyt yhteydenotto. Tarkemmat yksityiskohdat sovitaan vasta myöhemmin.',
        modalTitle: 'Pyydä tätä',
        modalIntro:
          'Tämä ei vielä sido kumpaakaan osapuolta.',
        placeholder:
          'Hei! Tämä voisi sopia tarpeeseeni. Onnistuisiko esimerkiksi viikonloppuna?',
        success: 'Pyyntö lähetetty.',
      };
    }

    return {
      eyebrow: 'Tarve lähialueella',
      actionLabel: 'Voin auttaa',
      actionTitle: 'Voisitko auttaa tässä?',
      actionText:
        'Kerro nopeasti milloin onnistuu ja miten haluaisit edetä.',
      modalTitle: 'Voin auttaa',
      modalIntro:
        'Tee kevyt vastaus. Keskustelu tarkentuu vasta myöhemmin.',
      placeholder:
        'Hei! Tämä voisi onnistua minulta esimerkiksi tänään illalla.',
      success: 'Vastaus lähetetty.',
    };
  }, [isOffer]);

  const handleSendResponse = async () => {
    setResponseError(null);
    setSuccessMessage(null);

    const { data: sessionData } =
      await supabase.auth.getSession();

    if (!sessionData.session) {
      router.push('/login');
      return;
    }

    if (!gig || !ownerId) {
      setResponseError(
        'Tilannetta ei voitu varmistaa.',
      );
      return;
    }

    if (
      sessionData.session.user.id === ownerId
    ) {
      setResponseError(
        'Et voi vastata omaan julkaisuusi.',
      );
      return;
    }

    setSending(true);

    const structuredMessage =
      buildStructuredMessage({
        isOffer,
        responseIntent,
        compensationReply,
        suggestedAmount,
        message,
      });

    const { error: insertError } =
      await supabase
        .from('gig_responses')
        .insert({
          gig_id: gig.id,
          sender_id:
            sessionData.session.user.id,
          owner_id: ownerId,
          message: structuredMessage,
          status: 'pending',
        });

    if (insertError) {
      console.error(insertError);

      setResponseError(
        'Vastauksen lähetys epäonnistui.',
      );

      setSending(false);
      return;
    }

    setSuccessMessage(pageCopy.success);

    setMessage('');
    setSuggestedAmount('');
    setSending(false);

    window.setTimeout(() => {
      setResponseOpen(false);
      setSuccessMessage(null);
    }, 1500);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] p-8 text-center text-slate-500">
          Ladataan lähialueen tilannetta...
        </div>
      </PageContainer>
    );
  }

  if (error || !gig) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] p-8 text-center">
          <p className="text-lg font-semibold text-slate-900">
            Tätä ei voitu näyttää
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {error ??
              'Julkaisua ei löytynyt.'}
          </p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-5xl">
      <div className="space-y-6">

        <Link
          href="/browse"
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Takaisin lähialueelle
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">

          <div className="bg-[#fffaf3] px-5 py-7 sm:px-8 sm:py-9">

            <div className="flex flex-wrap items-center justify-between gap-3">

              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
                {pageCopy.eyebrow}
              </p>

              <span className="rounded-full border border-orange-100 bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                {gig.status || 'Avoin'}
              </span>
            </div>

            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
              {gig.title}
            </h1>

            <div className="mt-6 flex flex-wrap gap-2">

              <MetaPill>
                {isNeed
                  ? 'Tarvitsen'
                  : 'Tarjoan'}
              </MetaPill>

              <MetaPill>
                {gig.category}
              </MetaPill>

              <MetaPill>
                📍 {gig.location}
              </MetaPill>

              <MetaPill>
                💶 {gig.budget || 'Sovitaan'}
              </MetaPill>

              {urgency ? (
                <MetaPill>
                  {getUrgencyEmoji(
                    urgency,
                  )}{' '}
                  {getUrgencyLabel(
                    urgency,
                  )}
                </MetaPill>
              ) : (
                <MetaPill>
                  {gig.date_time}
                </MetaPill>
              )}
            </div>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">

            <div className="p-5 sm:p-8">

              <section className="rounded-[1.75rem] border border-orange-100 bg-[#fffaf3] p-5">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  Tilanne
                </p>

                <p className="mt-4 text-lg leading-8 text-slate-800">
                  {gig.description?.trim()
                    ? gig.description
                    : 'Tarkemmat yksityiskohdat voidaan sopia myöhemmin yhdessä.'}
                </p>
              </section>

              <section className="mt-5 rounded-[1.75rem] border border-slate-200 bg-white p-5">

                <p className="text-sm font-semibold text-slate-900">
                  Miten tämä yleensä etenee?
                </p>

                <div className="mt-5 space-y-4">

                  <Step
                    number="1"
                    text={
                      isNeed
                        ? 'Lähetät nopean vastauksen ja kerrot milloin voisit auttaa.'
                        : 'Lähetät kevyen pyynnön ja kerrot mitä tarvitset.'
                    }
                  />

                  <Step
                    number="2"
                    text="Toinen osapuoli näkee vastauksesi ja voi jatkaa keskustelua."
                  />

                  <Step
                    number="3"
                    text="Tarkempi aika, paikka ja mahdollinen korvaus sovitaan yhdessä."
                  />
                </div>
              </section>
            </div>

            <aside className="border-t border-orange-100 bg-[#fffaf3] p-5 sm:p-8 lg:border-l lg:border-t-0">

              <div className="sticky top-6 rounded-[1.75rem] border border-orange-100 bg-white p-5">

                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  Seuraava askel
                </p>

                <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950">
                  {pageCopy.actionTitle}
                </h2>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {pageCopy.actionText}
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setResponseOpen(true)
                  }
                  className="mt-6 inline-flex w-full items-center justify-center rounded-full bg-slate-950 px-6 py-4 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  {pageCopy.actionLabel}
                </button>

                <p className="mt-4 text-center text-xs leading-5 text-slate-500">
                  Tarkemmat yhteystiedot kannattaa jakaa vasta, kun molemmat haluavat jatkaa.
                </p>
              </div>
            </aside>
          </div>
        </section>
      </div>

      {responseOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-3 sm:items-center sm:p-6">

          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-[2rem] border border-orange-100 bg-white p-5 shadow-2xl sm:p-6">

            <div className="flex items-start justify-between gap-4">

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  Kevyt yhteydenotto
                </p>

                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                  {pageCopy.modalTitle}
                </h2>
              </div>

              <button
                type="button"
                onClick={() =>
                  setResponseOpen(false)
                }
                className="rounded-full bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-200"
              >
                Sulje
              </button>
            </div>

            <p className="mt-4 text-sm leading-7 text-slate-600">
              {pageCopy.modalIntro}
            </p>

            <div className="mt-6 space-y-6">

              <div>

                <p className="mb-3 text-sm font-semibold text-slate-900">
                  Milloin tämä voisi onnistua?
                </p>

                <div className="grid gap-2 sm:grid-cols-2">

                  <ChoiceButton
                    active={
                      responseIntent ===
                      'now'
                    }
                    onClick={() =>
                      setResponseIntent(
                        'now',
                      )
                    }
                    title="Heti / pian"
                    text="Sopii nopeisiin tilanteisiin."
                  />

                  <ChoiceButton
                    active={
                      responseIntent ===
                      'today'
                    }
                    onClick={() =>
                      setResponseIntent(
                        'today',
                      )
                    }
                    title="Tänään"
                    text="Voidaan sopia saman päivän aikana."
                  />

                  <ChoiceButton
                    active={
                      responseIntent ===
                      'later'
                    }
                    onClick={() =>
                      setResponseIntent(
                        'later',
                      )
                    }
                    title="Myöhemmin"
                    text="Vaatii hieman sopimista."
                  />

                  <ChoiceButton
                    active={
                      responseIntent ===
                      'ask'
                    }
                    onClick={() =>
                      setResponseIntent(
                        'ask',
                      )
                    }
                    title="Kysyn ensin"
                    text="Tarvitsen lisätietoja."
                  />
                </div>
              </div>

              <div>

                <p className="mb-3 text-sm font-semibold text-slate-900">
                  Korvaus
                </p>

                <div className="grid gap-2">

                  <ChoiceButton
                    active={
                      compensationReply ===
                      'ok'
                    }
                    onClick={() =>
                      setCompensationReply(
                        'ok',
                      )
                    }
                    title="Ilmoitettu korvaus sopii"
                    text="Jatketaan nykyisellä ajatuksella."
                  />

                  <ChoiceButton
                    active={
                      compensationReply ===
                      'free'
                    }
                    onClick={() =>
                      setCompensationReply(
                        'free',
                      )
                    }
                    title="Voin auttaa ilman korvausta"
                    text="Sopii kevyeen naapuriapuun."
                  />

                  <ChoiceButton
                    active={
                      compensationReply ===
                      'discuss'
                    }
                    onClick={() =>
                      setCompensationReply(
                        'discuss',
                      )
                    }
                    title="Sovitaan yhdessä"
                    text="Korvaus tarkentuu myöhemmin."
                  />

                  <ChoiceButton
                    active={
                      compensationReply ===
                      'suggest'
                    }
                    onClick={() =>
                      setCompensationReply(
                        'suggest',
                      )
                    }
                    title="Ehdotan summaa"
                    text="Anna oma ehdotuksesi."
                  />
                </div>

                {compensationReply ===
                'suggest' ? (
                  <input
                    type="number"
                    min="0"
                    value={suggestedAmount}
                    onChange={(event) =>
                      setSuggestedAmount(
                        event.target.value,
                      )
                    }
                    placeholder="Summa euroissa"
                    className="mt-3 w-full rounded-full border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                  />
                ) : null}
              </div>

              <label className="block">

                <span className="mb-2 block text-sm font-semibold text-slate-900">
                  Lyhyt viesti
                  <span className="ml-1 font-normal text-slate-400">
                    (valinnainen)
                  </span>
                </span>

                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(
                      event.target.value,
                    )
                  }
                  rows={4}
                  placeholder={
                    pageCopy.placeholder
                  }
                  className="w-full rounded-[1.5rem] border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
                />
              </label>
            </div>

            {responseError ? (
              <p className="mt-4 text-sm text-rose-600">
                {responseError}
              </p>
            ) : null}

            {successMessage ? (
              <p className="mt-4 text-sm text-emerald-700">
                {successMessage}
              </p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

              <button
                type="button"
                onClick={() =>
                  setResponseOpen(false)
                }
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Peruuta
              </button>

              <button
                type="button"
                onClick={
                  handleSendResponse
                }
                disabled={sending}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {sending
                  ? 'Lähetetään...'
                  : pageCopy.actionLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}

function MetaPill({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
      {children}
    </span>
  );
}

function Step({
  number,
  text,
}: {
  number: string;
  text: string;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-950 text-xs font-semibold text-white">
        {number}
      </span>

      <p className="pt-1 text-sm leading-6 text-slate-600">
        {text}
      </p>
    </div>
  );
}

function ChoiceButton({
  active,
  onClick,
  title,
  text,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  text: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.35rem] border p-4 text-left transition ${
        active
          ? 'border-orange-300 bg-orange-50 text-slate-950'
          : 'border-slate-200 bg-slate-50 text-slate-700 hover:border-orange-200 hover:bg-[#fffaf3]'
      }`}
    >
      <span className="block text-sm font-semibold">
        {title}
      </span>

      <span
        className={`mt-1 block text-xs leading-5 ${
          active
            ? 'text-slate-600'
            : 'text-slate-500'
        }`}
      >
        {text}
      </span>
    </button>
  );
}

function buildStructuredMessage({
  isOffer,
  responseIntent,
  compensationReply,
  suggestedAmount,
  message,
}: {
  isOffer: boolean;
  responseIntent: ResponseIntent;
  compensationReply: CompensationReply;
  suggestedAmount: string;
  message: string;
}) {
  const intentText: Record<
    ResponseIntent,
    string
  > = {
    now: 'Heti / pian',
    today: 'Tänään',
    later: 'Myöhemmin',
    ask: 'Tarvitsen lisätietoja',
  };

  const compensationText: Record<
    CompensationReply,
    string
  > = {
    ok: 'Ilmoitettu korvaus sopii',
    free: 'Voin auttaa ilman korvausta',
    discuss:
      'Sovitaan korvaus yhdessä',
    suggest: suggestedAmount
      ? `Ehdotan korvausta: ${suggestedAmount} €`
      : 'Ehdotan korvausta',
  };

  const intro = isOffer
    ? 'Pyyntö tähän tarjontaan'
    : 'Vastaus tähän tarpeeseen';

  return [
    intro,
    `Aikataulu: ${intentText[responseIntent]}`,
    `Korvaus: ${compensationText[compensationReply]}`,
    message.trim()
      ? `Viesti: ${message.trim()}`
      : null,
  ]
    .filter(Boolean)
    .join('\n');
}