'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import PageContainer from '../../../components/PageContainer';
import { supabase } from '../../../lib/supabase';

type InboxMessage = {
  id: string;
  response_id: string;
  sender_id: string;
  message: string;
  read_at: string | null;
  created_at: string;
};

type InboxResponse = {
  id: string;
  gig_id: string;
  sender_id: string;
  owner_id: string;
  message: string;
  status: string;
  read_at: string | null;
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

export default function InboxThreadPage() {
  const params = useParams();
  const router = useRouter();

  const [response, setResponse] = useState<InboxResponse | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const [replyMessage, setReplyMessage] = useState('');
  const [sendingReply, setSendingReply] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  function getGigInfo(item: InboxResponse | null) {
    if (!item) return null;
    return Array.isArray(item.gigs) ? item.gigs[0] : item.gigs;
  }

  const markAsRead = async (responseData: InboxResponse, userId: string, threadMessages: InboxMessage[]) => {
    const now = new Date().toISOString();

    if (responseData.sender_id !== userId && !responseData.read_at) {
      await supabase
        .from('gig_responses')
        .update({ read_at: now })
        .eq('id', responseData.id);
    }

    const unreadMessageIds = threadMessages
      .filter((msg) => msg.sender_id !== userId && !msg.read_at)
      .map((msg) => msg.id);

    if (unreadMessageIds.length > 0) {
      await supabase
        .from('gig_response_messages')
        .update({ read_at: now })
        .in('id', unreadMessageIds);
    }
  };

  const loadThread = async () => {
    setLoading(true);
    setError(null);

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      router.replace('/login');
      return;
    }

    const userId = sessionData.session.user.id;
    setCurrentUserId(userId);

    const responseId = String(params.id);

    const responseResult = await supabase
      .from('gig_responses')
      .select(`
        id,
        gig_id,
        sender_id,
        owner_id,
        message,
        status,
        read_at,
        created_at,
        gigs (
          title,
          category,
          location,
          listing_type
        )
      `)
      .eq('id', responseId)
      .maybeSingle();

    if (responseResult.error || !responseResult.data) {
      console.error('Thread fetch error:', responseResult.error);
      setError('Keskustelua ei voitu ladata.');
      setLoading(false);
      return;
    }

    const responseData = responseResult.data as InboxResponse;

    if (responseData.sender_id !== userId && responseData.owner_id !== userId) {
      setError('Sinulla ei ole oikeutta nähdä tätä keskustelua.');
      setLoading(false);
      return;
    }

    const messagesResult = await supabase
      .from('gig_response_messages')
      .select('*')
      .eq('response_id', responseId)
      .order('created_at', { ascending: true });

    if (messagesResult.error) {
      console.error('Messages fetch error:', messagesResult.error);
      setError('Viestejä ei voitu ladata.');
      setLoading(false);
      return;
    }

    const threadMessages = (messagesResult.data as InboxMessage[]) ?? [];

    await markAsRead(responseData, userId, threadMessages);

    setResponse({
      ...responseData,
      read_at:
        responseData.sender_id !== userId
          ? responseData.read_at ?? new Date().toISOString()
          : responseData.read_at,
    });

    setMessages(
      threadMessages.map((msg) =>
        msg.sender_id !== userId && !msg.read_at
          ? { ...msg, read_at: new Date().toISOString() }
          : msg
      )
    );

    setLoading(false);
  };

  useEffect(() => {
    loadThread();
  }, [params.id]);

  const handleReply = async () => {
    if (!response || !replyMessage.trim() || !currentUserId) {
      return;
    }

    setSendingReply(true);

    const { error: insertError } = await supabase
      .from('gig_response_messages')
      .insert({
        response_id: response.id,
        sender_id: currentUserId,
        message: replyMessage.trim(),
      });

    if (insertError) {
      console.error('Reply insert error:', insertError);
      setSendingReply(false);
      return;
    }

    setReplyMessage('');
    await loadThread();
    setSendingReply(false);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 text-center text-slate-500 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          Keskustelua ladataan...
        </div>
      </PageContainer>
    );
  }

  if (error || !response) {
    return (
      <PageContainer>
        <div className="rounded-[2rem] bg-white/90 p-8 text-center shadow-lg shadow-slate-200/60 ring-1 ring-slate-200">
          <p className="text-lg font-semibold text-slate-900">Keskustelua ei voitu ladata</p>
          <p className="mt-2 text-sm text-slate-600">{error ?? 'Keskustelua ei löytynyt.'}</p>
          <Link
            href="/inbox"
            className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
          >
            Takaisin postilaatikkoon
          </Link>
        </div>
      </PageContainer>
    );
  }

  const gigInfo = getGigInfo(response);
  const firstMessageIsOwn = response.sender_id === currentUserId;

  return (
    <PageContainer>
      <div className="space-y-6">
        <Link
          href="/inbox"
          className="text-sm font-semibold text-slate-600 transition hover:text-slate-900"
        >
          ← Takaisin postilaatikkoon
        </Link>

        <section className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
                Keskustelu
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {gigInfo?.title ?? 'Ilmoitus'}
              </h1>
              <p className="mt-3 text-sm text-slate-500">
                {gigInfo?.category ?? 'Kategoria'} · {gigInfo?.location ?? 'Sijainti'}
              </p>
            </div>

            <Link
              href={`/browse/${response.gig_id}`}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
            >
              Avaa ilmoitus
            </Link>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-6">
          <div className="space-y-4">
            <div
              className={`max-w-[85%] rounded-[1.5rem] p-4 ${
                firstMessageIsOwn
                  ? 'ml-auto bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-900'
              }`}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                Ensimmäinen yhteydenotto
              </p>
              <p className="mt-2 text-sm leading-7">{response.message}</p>
              <p className="mt-3 text-xs opacity-70">
                {new Date(response.created_at).toLocaleDateString('fi-FI')}
              </p>
            </div>

            {messages.map((msg) => {
              const isOwn = msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-[1.5rem] p-4 ${
                    isOwn
                      ? 'ml-auto bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p className="text-sm leading-7">{msg.message}</p>
                  <p className="mt-3 text-xs opacity-70">
                    {new Date(msg.created_at).toLocaleDateString('fi-FI')}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Vastaa keskusteluun
              </span>
              <textarea
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                rows={4}
                placeholder="Kirjoita viesti..."
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleReply}
                disabled={sendingReply || !replyMessage.trim()}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {sendingReply ? 'Lähetetään...' : 'Lähetä vastaus'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}