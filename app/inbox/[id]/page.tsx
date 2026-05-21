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
  workflow_status?: string | null;
  agreement_requested_by?: string | null;

  sender_deleted_at?: string | null;
  owner_deleted_at?: string | null;

  read_at: string | null;
  created_at: string;

  gigs?: {
    title: string | null;
    category: string | null;
    location: string | null;
    listing_type: string | null;
  } | null;
};

export default function InboxThreadPage() {
  const params = useParams();
  const router = useRouter();

  const [response, setResponse] = useState<InboxResponse | null>(null);
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [replyMessage, setReplyMessage] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadThread = async () => {
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
        *,
        gigs (
          title,
          category,
          location,
          listing_type
        )
      `)
      .eq('id', responseId)
      .maybeSingle();

    const responseData = responseResult.data as InboxResponse;

    const messagesResult = await supabase
      .from('gig_response_messages')
      .select('*')
      .eq('response_id', responseId)
      .order('created_at', { ascending: true });

    const loadedMessages =
      (messagesResult.data as InboxMessage[]) ?? [];

    const unreadIds = loadedMessages
      .filter(
        (msg) =>
          msg.sender_id !== userId &&
          !msg.read_at
      )
      .map((msg) => msg.id);

    if (unreadIds.length > 0) {
      await supabase
        .from('gig_response_messages')
        .update({
          read_at: new Date().toISOString(),
        })
        .in('id', unreadIds);
    }

    setResponse(responseData);
    setMessages(
      loadedMessages.map((msg) =>
        unreadIds.includes(msg.id)
          ? {
              ...msg,
              read_at: new Date().toISOString(),
            }
          : msg
      )
    );
  };

  useEffect(() => {
    loadThread();
  }, [params.id]);

  const updateWorkflow = async (
    updates: Partial<InboxResponse>,
    systemMessage?: string
  ) => {
    if (!response || !currentUserId) return;

    await supabase
      .from('gig_responses')
      .update(updates)
      .eq('id', response.id);

    if (systemMessage) {
      await supabase
        .from('gig_response_messages')
        .insert({
          response_id: response.id,
          sender_id: currentUserId,
          message: systemMessage,
        });
    }

    await loadThread();
  };

  const archiveConversation = async () => {
    if (!response || !currentUserId) return;

    if (response.sender_id === currentUserId) {
      await supabase
        .from('gig_responses')
        .update({
          sender_deleted_at: new Date().toISOString(),
        })
        .eq('id', response.id);
    } else {
      await supabase
        .from('gig_responses')
        .update({
          owner_deleted_at: new Date().toISOString(),
        })
        .eq('id', response.id);
    }

    router.push('/inbox');
  };

  const handleReply = async () => {
    if (!response || !replyMessage.trim()) return;

    await supabase
      .from('gig_response_messages')
      .insert({
        response_id: response.id,
        sender_id: currentUserId,
        message: replyMessage.trim(),
      });

    setReplyMessage('');

    await loadThread();
  };

  if (!response) {
    return null;
  }

  const workflowStatus =
    response.workflow_status ?? 'pending';

  const isAgreementRequester =
    response.agreement_requested_by === currentUserId;

  return (
    <PageContainer>
      <div className="space-y-6">
        <Link
          href="/inbox"
          className="text-sm font-semibold text-slate-600"
        >
          ← Takaisin postilaatikkoon
        </Link>

        <section className="rounded-[2rem] border border-slate-200 bg-white p-6">
          <div className="space-y-4">
            {messages.map((msg) => {
              const isOwn =
                msg.sender_id === currentUserId;

              return (
                <div
                  key={msg.id}
                  className={`max-w-[85%] rounded-[1.5rem] p-4 ${
                    isOwn
                      ? 'ml-auto bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  {msg.message}
                </div>
              );
            })}
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {(workflowStatus === 'pending' ||
              workflowStatus === 'agreement_rejected') ? (
              <button
                onClick={() =>
                  updateWorkflow(
                    {
                      workflow_status:
                        'agreement_requested',
                      agreement_requested_by:
                        currentUserId,
                    },
                    'Sopimusta ehdotettiin.'
                  )
                }
                className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
              >
                Merkitse sovituksi
              </button>
            ) : null}

            {workflowStatus ===
            'agreement_requested' ? (
              isAgreementRequester ? (
                <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700">
                  Odotetaan hyväksyntää
                </div>
              ) : (
                <>
                  <button
                    onClick={() =>
                      updateWorkflow(
                        {
                          workflow_status:
                            'active',
                        },
                        'Sopimus hyväksyttiin.'
                      )
                    }
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Hyväksy
                  </button>

                  <button
                    onClick={() =>
                      updateWorkflow(
                        {
                          workflow_status:
                            'agreement_rejected',
                          agreement_requested_by:
                            null,
                        },
                        'Sopimusehdotus hylättiin.'
                      )
                    }
                    className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white"
                  >
                    Hylkää
                  </button>
                </>
              )
            ) : null}

            {workflowStatus === 'active' ? (
              <button
                onClick={() =>
                  updateWorkflow(
                    {
                      workflow_status:
                        'completed',
                    },
                    'Ilmoitus merkittiin suoritetuksi.'
                  )
                }
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Merkitse suoritetuksi
              </button>
            ) : null}

            <button
              onClick={archiveConversation}
              className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
            >
              Poista keskustelu
            </button>
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <textarea
              value={replyMessage}
              onChange={(e) =>
                setReplyMessage(e.target.value)
              }
              rows={4}
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3"
            />

            <div className="mt-4 flex justify-end">
              <button
                onClick={handleReply}
                className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                Lähetä vastaus
              </button>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
