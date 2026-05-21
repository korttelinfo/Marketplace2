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

type ConversationItem = InboxResponse & {
  latestMessage: string;
  latestAt: string;
  latestSenderId: string;
  unread: boolean;
};

export default function InboxPage() {
  const router = useRouter();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    const responsesResult = await supabase
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
      .or(`sender_id.eq.${userId},owner_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (responsesResult.error) {
      console.error('Inbox fetch error:', responsesResult.error);
      setError('Yhteydenottojen lataus epäonnistui.');
      setLoading(false);
      return;
    }

    const responseData = (responsesResult.data as InboxResponse[]) ?? [];
    const responseIds = responseData.map((item) => item.id);

    let messagesByResponse: Record<string, InboxMessage[]> = {};

    if (responseIds.length > 0) {
      const messagesResult = await supabase
        .from('gig_response_messages')
        .select('*')
        .in('response_id', responseIds)
        .order('created_at', { ascending: true });

      if (messagesResult.error) {
        console.error('Message fetch error:', messagesResult.error);
      } else {
        for (const msg of (messagesResult.data as InboxMessage[]) ?? []) {
          if (!messagesByResponse[msg.response_id]) {
            messagesByResponse[msg.response_id] = [];
          }

          messagesByResponse[msg.response_id].push(msg);
        }
      }
    }

    const mapped = responseData.map((item) => {
      const messages = messagesByResponse[item.id] ?? [];
      const latestReply = messages[messages.length - 1];

      const latestMessage = latestReply?.message ?? item.message;
      const latestAt = latestReply?.created_at ?? item.created_at;
      const latestSenderId = latestReply?.sender_id ?? item.sender_id;

      const unread =
        latestSenderId !== userId &&
        (latestReply ? !latestReply.read_at : !item.read_at);

      return {
        ...item,
        messages,
        latestMessage,
        latestAt,
        latestSenderId,
        unread,
      };
    });

    mapped.sort((a, b) => {
      return new Date(b.latestAt).getTime() - new Date(a.latestAt).getTime();
    });

    setConversations(mapped);
    setLoading(false);
  };

  useEffect(() => {
    loadInbox();
  }, []);

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
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            Postilaatikko
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Keskustelut
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
            Kaikki keskustelut näkyvät yhdessä listassa. Uusimmat ja lukemattomat nousevat esiin.
          </p>
        </section>

        <section className="space-y-4">
          {conversations.length > 0 ? (
            conversations.map((item) => {
              const gig = getGigInfo(item);
              const isOwnLatest = item.latestSenderId !== item.owner_id && item.latestSenderId !== item.sender_id
                ? false
                : false;

              return (
                <Link
                  key={item.id}
                  href={`/inbox/${item.id}`}
                  className={`block rounded-[2rem] border p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    item.unread
                      ? 'border-orange-200 bg-orange-50/80 ring-1 ring-orange-100'
                      : 'border-slate-200 bg-white/90'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        {item.unread ? (
                          <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                        ) : null}

                        <h2
                          className={`text-lg text-slate-900 ${
                            item.unread ? 'font-bold' : 'font-semibold'
                          }`}
                        >
                          {gig?.title ?? 'Ilmoitus'}
                        </h2>
                      </div>

                      <p className="mt-1 text-sm text-slate-500">
                        {gig?.category ?? 'Kategoria'} · {gig?.location ?? 'Sijainti'}
                      </p>

                      <p
                        className={`mt-4 line-clamp-2 text-sm leading-7 ${
                          item.unread ? 'font-semibold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {item.latestSenderId === item.sender_id ? 'Aloittaja: ' : 'Julkaisija: '}
                        {item.latestMessage}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col items-end gap-3">
                      {item.unread ? (
                        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
                          Uusi
                        </span>
                      ) : (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {item.status === 'pending' ? 'Odottaa' : item.status}
                        </span>
                      )}

                      <p className="text-xs text-slate-500">
                        {new Date(item.latestAt).toLocaleDateString('fi-FI')}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })
          ) : (
            <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-8 text-center shadow-sm">
              <p className="text-lg font-semibold text-slate-900">Ei keskusteluja</p>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                Keskustelut näkyvät täällä, kun otat yhteyttä ilmoituksiin tai joku vastaa sinun ilmoitukseesi.
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