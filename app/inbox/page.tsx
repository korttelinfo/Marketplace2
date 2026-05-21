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
  workflow_status?: string | null;

  sender_deleted_at?: string | null;
  owner_deleted_at?: string | null;

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

  function getGigInfo(item: InboxResponse) {
    return Array.isArray(item.gigs) ? item.gigs[0] : item.gigs;
  }

  function getStatusLabel(status?: string | null) {
    switch (status) {
      case 'agreement_requested':
        return 'Sopimusta ehdotettu';
      case 'agreement_rejected':
        return 'Sopimus hylätty';
      case 'active':
        return 'Meneillään';
      case 'completed':
        return 'Suoritettu';
      case 'cancelled':
        return 'Lopetettu';
      default:
        return 'Keskustelu';
    }
  }

  const loadInbox = async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();

    if (!sessionData.session) {
      router.replace('/login');
      return;
    }

    const userId = sessionData.session.user.id;

    const responsesResult = await supabase
      .from('gig_responses')
      .select(`
        *,
        gigs (
          title,
          category,
          location,
          listing_type
        )
      `)
      .or(`sender_id.eq.${userId},owner_id.eq.${userId}`)
      .order('created_at', { ascending: false });

    const responseData = (responsesResult.data as InboxResponse[]) ?? [];

    const visibleResponses = responseData.filter((item) => {
      if (
        item.sender_id === userId &&
        item.sender_deleted_at
      ) {
        return false;
      }

      if (
        item.owner_id === userId &&
        item.owner_deleted_at
      ) {
        return false;
      }

      return true;
    });

    const responseIds = visibleResponses.map((item) => item.id);

    const messagesByResponse: Record<string, InboxMessage[]> = {};

    if (responseIds.length > 0) {
      const messagesResult = await supabase
        .from('gig_response_messages')
        .select('*')
        .in('response_id', responseIds)
        .order('created_at', { ascending: true });

      for (const msg of (messagesResult.data as InboxMessage[]) ?? []) {
        if (!messagesByResponse[msg.response_id]) {
          messagesByResponse[msg.response_id] = [];
        }

        messagesByResponse[msg.response_id].push(msg);
      }
    }

    const mapped = visibleResponses.map((item) => {
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
        <div className="rounded-[2rem] bg-white/90 p-8 text-center">
          Postilaatikkoa ladataan...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-4">
        {conversations.map((item) => {
          const gig = getGigInfo(item);

          return (
            <Link
              key={item.id}
              href={`/inbox/${item.id}`}
              className={`block rounded-[2rem] border p-6 shadow-sm ${
                item.unread
                  ? 'border-orange-200 bg-orange-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {item.unread ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                    ) : null}

                    <h2 className="text-lg font-semibold text-slate-900">
                      {gig?.title ?? 'Ilmoitus'}
                    </h2>
                  </div>

                  <p className="mt-1 text-sm text-slate-500">
                    {gig?.category} · {gig?.location}
                  </p>

                  <p className="mt-4 text-sm text-slate-700">
                    {item.latestMessage}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-3">
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                    {getStatusLabel(item.workflow_status)}
                  </span>

                  <p className="text-xs text-slate-500">
                    {new Date(item.latestAt).toLocaleDateString('fi-FI')}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </PageContainer>
  );
}