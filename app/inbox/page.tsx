'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';

type InboxResponse = {
  id: string;
  gig_id: string;
  sender_id: string;
  owner_id: string;
  message: string;
  status: string;
  created_at: string;
gigs?:
  | {
      title: string | null;
      category: string | null;
      location: string | null;
      listing_type: string | null;
    }
  | {
      title: string | null;
      category: string | null;
      location: string | null;
      listing_type: string | null;
    }[]
  | null;
};

export default function InboxPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');
  const [received, setReceived] = useState<InboxResponse[]>([]);
  const [sent, setSent] = useState<InboxResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadInbox = async () => {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.replace('/login');
        return;
      }

      const userId = sessionData.session.user.id;

      const receivedResult = await supabase
        .from('gig_responses')
        .select(`
          id,
          gig_id,
          sender_id,
          owner_id,
          message,
          status,
          created_at,
          gigs (
            title,
            category,
            location,
            listing_type
          )
        `)
        .eq('owner_id', userId)
        .order('created_at', { ascending: false });

      const sentResult = await supabase
        .from('gig_responses')
        .select(`
          id,
          gig_id,
          sender_id,
          owner_id,
          message,
          status,
          created_at,
          gigs (
            title,
            category,
            location,
            listing_type
          )
        `)
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (receivedResult.error || sentResult.error) {
        console.error('Inbox fetch error:', receivedResult.error ?? sentResult.error);
        setError('Yhteydenottojen lataus epäonnistui. Yritä uudelleen.');
        setLoading(false);
        return;
      }

      setReceived((receivedResult.data as InboxResponse[]) ?? []);
      setSent((sentResult.data as InboxResponse[]) ?? []);
      setLoading(false);
    };

    loadInbox();
  }, [router]);

  const currentItems = activeTab === 'received' ? received : sent;

  function getGigInfo(item: InboxResponse) {
  return Array.isArray(item.gigs) ? item.gigs[0] : item.gigs;
}
  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 text-center text-slate-500 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          Postilaatikkoa ladataan...
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 text-center shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-900">Postilaatikkoa ei voitu ladata</p>
          <p className="mt-2 text-sm text-slate-600">{error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-8">
        <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
              Postilaatikko
            </p>

            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              Yhteydenotot yhdessä paikassa.
            </h1>

            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Näet täällä sekä sinulle tulleet yhteydenotot että omat lähettämäsi viestit.
            </p>
          </div>

          <div className="mt-8 rounded-[1.5rem] bg-slate-100 p-1">
            <div className="grid grid-cols-2 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('received')}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  activeTab === 'received'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                Saapuneet ({received.length})
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('sent')}
                className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
                  activeTab === 'sent'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-white hover:text-slate-900'
                }`}
              >
                Lähetetyt ({sent.length})
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          {currentItems.length > 0 ? (
            currentItems.map((item) => (
              <article
                key={item.id}
                className="rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-500">
                      {activeTab === 'received' ? 'Saapunut yhteydenotto' : 'Lähetetty yhteydenotto'}
                    </p>

                    <h2 className="mt-3 text-xl font-semibold text-slate-900">
                      {getGigInfo(item)?.title ?? 'Ilmoitus'}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                     {getGigInfo(item)?.category ?? 'Kategoria'} · {getGigInfo(item)?.location ?? 'Sijainti'}
                    </p>
                  </div>

                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {item.status === 'pending' ? 'Odottaa' : item.status}
                  </span>
                </div>

                <div className="mt-5 rounded-[1.5rem] bg-slate-50 p-4">
                  <p className="text-sm leading-7 text-slate-700">
                    {item.message}
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-slate-500">
                    Lähetetty {new Date(item.created_at).toLocaleDateString('fi-FI')}
                  </p>

                  <Link
                    href={`/browse/${item.gig_id}`}
                    className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                  >
                    Avaa ilmoitus
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                {activeTab === 'received'
                  ? 'Ei saapuneita yhteydenottoja'
                  : 'Ei lähetettyjä yhteydenottoja'}
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                {activeTab === 'received'
                  ? 'Kun joku vastaa ilmoitukseesi, viesti näkyy täällä.'
                  : 'Kun otat yhteyttä toisen ilmoitukseen, viesti näkyy täällä.'}
              </p>

              <Link
                href="/browse"
                className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
              >
                Selaa ilmoituksia
              </Link>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}