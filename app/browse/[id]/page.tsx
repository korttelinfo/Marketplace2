'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import PageContainer from '../../../components/PageContainer';
import { supabase } from '../../../lib/supabase';
import type { BrowseGig } from '../../../lib/mockGigs';
import {
  getUrgencyEmoji,
  getUrgencyLabel,
  type Urgency,
} from '../../../lib/helpCategories';

export default function BrowseGigPage() {
  const params = useParams();
  const router = useRouter();

  const [gig, setGig] = useState<BrowseGig | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [contactOpen, setContactOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('gigs')
        .select(
          'id,title,category,budget,location,date_time,description,status,listing_type,user_id'
        )
        .eq('id', params.id)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase gig fetch error:', fetchError);
        setError('Ilmoitusta ei voitu ladata. Tarkista verkkoyhteys ja yritä uudelleen.');
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

  const handleSendMessage = async () => {
    setContactError(null);
    setSuccessMessage(null);

    if (!message.trim()) {
      setContactError('Kirjoita lyhyt viesti ennen lähettämistä.');
      return;
    }

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      router.push('/login');
      return;
    }

    if (!gig || !ownerId) {
      setContactError('Ilmoituksen tietoja ei voitu varmistaa.');
      return;
    }

    if (sessionData.session.user.id === ownerId) {
      setContactError('Et voi lähettää yhteydenottoa omaan ilmoitukseesi.');
      return;
    }

    setSending(true);

    const { error: insertError } = await supabase.from('gig_responses').insert({
      gig_id: gig.id,
      sender_id: sessionData.session.user.id,
      owner_id: ownerId,
      message: message.trim(),
      status: 'pending',
    });

    if (insertError) {
      console.error('Supabase response insert error:', insertError);
      setContactError('Yhteydenoton lähetys epäonnistui. Yritä uudelleen.');
      setSending(false);
      return;
    }

    setSuccessMessage('Yhteydenotto lähetetty.');
    setMessage('');
    setSending(false);

    setTimeout(() => {
      setContactOpen(false);
      setSuccessMessage(null);
    }, 1800);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 text-center text-slate-500 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          Ilmoitusta ladataan...
        </div>
      </PageContainer>
    );
  }

  if (error || !gig) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 text-center shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-900">Ilmoitusta ei voitu ladata</p>
          <p className="mt-2 text-sm text-slate-600">
            {error ?? 'Ilmoitusta ei löytynyt.'}
          </p>
        </div>
      </PageContainer>
    );
  }

  const listingType = (gig as any).listing_type || 'Tarvitsen apua';
  const isHelping = listingType === 'Tarjoan apua';

  const urgencyOptions = ['Tänään', 'Tällä viikolla', 'Ei kiirettä'];
  const isUrgency = urgencyOptions.includes(gig.date_time);
  const urgency = isUrgency ? (gig.date_time as Urgency) : null;

  const ctaText = isHelping ? 'Pyydä apua' : 'Tarjoudu auttamaan';

  return (
    <PageContainer>
      <div className="space-y-8">
        <Link
          href="/browse"
          className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          ← Takaisin ilmoituksiin
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.8fr]">
          <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  isHelping
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {listingType}
              </span>

              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {gig.category}
              </span>

              {urgency && (
                <span className="flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-600">
                  <span>{getUrgencyEmoji(urgency)}</span>
                  {getUrgencyLabel(urgency)}
                </span>
              )}
            </div>

            <div className="mt-6">
              <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
                {gig.title}
              </h1>

              <p className="mt-6 text-base leading-8 text-slate-700">
                {gig.description}
              </p>
            </div>

            <div className="mt-8 grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Sijainti
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{gig.location}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Korvaus
                </p>
                <p className="mt-2 text-sm font-semibold text-slate-900">{gig.budget}</p>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                  Tila
                </p>
                <span className="mt-2 inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">
                  {gig.status}
                </span>
              </div>
            </div>
          </section>

          <aside className="space-y-4">
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Yhteydenotto
              </p>

              <h2 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">
                {ctaText}
              </h2>

              <p className="mt-3 text-sm leading-7 text-slate-600">
                Lähetä lyhyt viesti ilmoituksen julkaisijalle ja sovi tarkemmat yksityiskohdat.
              </p>

              <button
                type="button"
                onClick={() => setContactOpen(true)}
                className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-6 py-4 text-sm font-semibold text-white transition ${
                  isHelping
                    ? 'bg-emerald-700 hover:bg-emerald-600'
                    : 'bg-slate-900 hover:bg-slate-700'
                }`}
              >
                {ctaText}
              </button>
            </div>
          </aside>
        </div>
      </div>

      {contactOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">{ctaText}</h2>

            <p className="mt-3 text-sm leading-7 text-slate-600">
              Kirjoita lyhyt ja ystävällinen viesti. Ilmoituksen julkaisija näkee sen profiilissaan.
            </p>

            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={5}
              placeholder="Hei! Voin auttaa tässä..."
              className="mt-5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />

            {contactError ? (
              <p className="mt-3 text-sm text-rose-600">{contactError}</p>
            ) : null}

            {successMessage ? (
              <p className="mt-3 text-sm text-emerald-700">{successMessage}</p>
            ) : null}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setContactOpen(false)}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Peruuta
              </button>

              <button
                type="button"
                onClick={handleSendMessage}
                disabled={sending}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {sending ? 'Lähetetään...' : 'Lähetä yhteydenotto'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}