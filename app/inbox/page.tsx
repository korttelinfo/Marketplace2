'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';

type InboxMessage = {
  id: string;
  response_id: string;
  sender_id: string;
  message: string;
  created_at: string;
};

type InboxResponse = {
  id: string;
  gig_id: string;
  sender_id: string;
  owner_id: string;
  message: string;
  status: string;
  created_at: string;
  messages?: InboxMessage[];
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

  function getGigInfo(item: InboxResponse) {
    return Array.isArray(item.gigs) ? item.gigs[0] : item.gigs;
  }

  function getLatestMessage(item: InboxResponse) {
    if (item.messages && item.messages.length > 0) {
      return item.messages[item.messages.length - 1].message;
    }

    return item.message;
  }

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

      setError('Yhteydenottojen lataus epäonnistui.');
      setLoading(false);
      return;
    }

    const receivedData = (receivedResult.data as InboxResponse[]) ?? [];
    const sentData = (sentResult.data as InboxResponse[]) ?? [];

    const allResponses = [...receivedData, ...sentData];

    const responseIds = allResponses.map((item) => item.id);

    let messagesByResponse: Record<string, InboxMessage[]> = {};

    if (responseIds.length > 0) {
      const messagesResult = await supabase
        .from('gig_response_messages')
        .select('*')
        .in('response_id', responseIds)
        .order('created_at', { ascending: true });

      if (!messagesResult.error) {
        for (const msg of (messagesResult.data as InboxMessage[]) ?? []) {
          if (!messagesByResponse[msg.response_id]) {
            messagesByResponse[msg.response_id] = [];
          }

          messagesByResponse[msg.response_id].push(msg);
        }
      }
    }

    setReceived(
      receivedData.map((item) => ({
        ...item,
        messages: messagesByResponse[item.id] ?? [],
      }))
    );

    setSent(
      sentData.map((item) => ({
        ...item,
        messages: messagesByResponse[item.id] ?? [],
      }))
    );

    setLoading(false);
  };

  useEffect(() => {
    loadInbox();
  }, []);

  const currentItems = activeTab === 'received' ? received : sent;

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
          <p className="text-lg font-semibold text-slate-900">
            Postilaatikkoa ei voitu ladata
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {error}
          </p>
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
              Keskustelut
            </h1>

            <p className="max-w-2xl text-sm leading-7 text-slate-600">
              Avaa keskustelu nähdäksesi viestiketjun ja vastataksesi.
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
              <Link
                key={item.id}
                href={`/inbox/${item.id}`}
                className="block rounded-[2rem] border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h2 className="text-lg font-semibold text-slate-900">
                      {getGigInfo(item)?.title ?? 'Ilmoitus'}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {getGigInfo(item)?.category ?? 'Kategoria'} ·{' '}
                      {getGigInfo(item)?.location ?? 'Sijainti'}
                    </p>

                    <p className="mt-4 line-clamp-2 text-sm leading-7 text-slate-700">
                      {getLatestMessage(item)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                      {item.status === 'pending' ? 'Odottaa' : item.status}
                    </span>

                    <p className="text-xs text-slate-500">
                      {new Date(item.created_at).toLocaleDateString('fi-FI')}
                    </p>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">
                Ei keskusteluja
              </p>

              <p className="mt-2 text-sm leading-7 text-slate-600">
                Keskustelut näkyvät täällä, kun otat yhteyttä ilmoituksiin.
              </p>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}