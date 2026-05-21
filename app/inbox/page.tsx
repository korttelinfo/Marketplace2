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

  const [replyOpen, setReplyOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<InboxResponse | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  function getGigInfo(item: InboxResponse) {
    return Array.isArray(item.gigs) ? item.gigs[0] : item.gigs;
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

    setCurrentUserId(userId);

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

  const handleReply = async () => {
    if (!selectedResponse || !replyMessage.trim() || !currentUserId) {
      return;
    }

    setSendingReply(true);

    const { error: insertError } = await supabase
      .from('gig_response_messages')
      .insert({
        response_id: selectedResponse.id,
        sender_id: currentUserId,
        message: replyMessage.trim(),
      });

    if (insertError) {
      console.error('Reply insert error:', insertError);
      setSendingReply(false);
      return;
    }

    setReplyMessage('');
    setReplyOpen(false);
    setSelectedResponse(null);

    await loadInbox();

    setSendingReply(false);
  };

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
                      {activeTab === 'received'
                        ? 'Saapunut yhteydenotto'
                        : 'Lähetetty yhteydenotto'}
                    </p>

                    <h2 className="mt-3 text-xl font-semibold text-slate-900">
                      {getGigInfo(item)?.title ?? 'Ilmoitus'}
                    </h2>

                    <p className="mt-2 text-sm text-slate-500">
                      {getGigInfo(item)?.category ?? 'Kategoria'} ·{' '}
                      {getGigInfo(item)?.location ?? 'Sijainti'}
                    </p>
                  </div>

                  <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {item.status === 'pending' ? 'Odottaa' : item.status}
                  </span>
                </div>

                <div className="mt-5 space-y-3">
                  <div className="rounded-[1.5rem] bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                      Ensimmäinen yhteydenotto
                    </p>

                    <p className="mt-2 text-sm leading-7 text-slate-700">
                      {item.message}
                    </p>
                  </div>

                  {item.messages?.map((msg) => {
                    const isOwn = msg.sender_id === currentUserId;

                    return (
                      <div
                        key={msg.id}
                        className={`rounded-[1.5rem] p-4 ${
                          isOwn
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-900'
                        }`}
                      >
                        <p className="text-sm leading-7">
                          {msg.message}
                        </p>

                        <p
                          className={`mt-3 text-xs ${
                            isOwn ? 'text-slate-300' : 'text-slate-500'
                          }`}
                        >
                          {new Date(msg.created_at).toLocaleDateString('fi-FI')}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResponse(item);
                        setReplyOpen(true);
                      }}
                      className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                    >
                      Vastaa
                    </button>

                    <Link
                      href={`/browse/${item.gig_id}`}
                      className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
                    >
                      Avaa ilmoitus
                    </Link>
                  </div>

                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleDateString('fi-FI')}
                  </p>
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
            </div>
          )}
        </section>
      </div>

      {replyOpen ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-4 sm:items-center">
          <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">
              Vastaa viestiin
            </h2>

            <textarea
              value={replyMessage}
              onChange={(event) => setReplyMessage(event.target.value)}
              rows={5}
              placeholder="Kirjoita vastauksesi..."
              className="mt-5 w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setReplyOpen(false);
                  setSelectedResponse(null);
                }}
                className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                Peruuta
              </button>

              <button
                type="button"
                onClick={handleReply}
                disabled={sendingReply}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {sendingReply ? 'Lähetetään...' : 'Lähetä vastaus'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </PageContainer>
  );
}