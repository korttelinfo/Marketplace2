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

  workflow_status?: string | null;
  agreement_requested_by?: string | null;
  requester_completed_at?: string | null;
  owner_completed_at?: string | null;
  cancelled_at?: string | null;

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

  function getWorkflowLabel(status?: string | null) {
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

      case 'archived':
        return 'Arkistoitu';

      default:
        return 'Keskustelu käynnissä';
    }
  }

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
        workflow_status,
        agreement_requested_by,
        requester_completed_at,
        owner_completed_at,
        cancelled_at,
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

    if (
      responseData.sender_id !== userId &&
      responseData.owner_id !== userId
    ) {
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

    setResponse(responseData);
    setMessages((messagesResult.data as InboxMessage[]) ?? []);

    setLoading(false);
  };

  useEffect(() => {
    loadThread();
  }, [params.id]);

  const updateWorkflow = async (
    updates: Partial<InboxResponse>,
    systemMessage?: string
  ) => {
    if (!response || !currentUserId) return;

    const { error: updateError } = await supabase
      .from('gig_responses')
      .update(updates)
      .eq('id', response.id);

    if (updateError) {
      console.error(updateError);
      return;
    }

    if (systemMessage) {
      const { error: messageError } = await supabase
        .from('gig_response_messages')
        .insert({
          response_id: response.id,
          sender_id: currentUserId,
          message: systemMessage,
        });

      if (messageError) {
        console.error('System message insert error:', messageError);
      }
    }

    await loadThread();
  };

  const handleReply = async () => {
    if (
      !response ||
      !replyMessage.trim() ||
      !currentUserId ||
      response.workflow_status === 'cancelled'
    ) {
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
          <p className="text-lg font-semibold text-slate-900">
            Keskustelua ei voitu ladata
          </p>

          <p className="mt-2 text-sm text-slate-600">
            {error ?? 'Keskustelua ei löytynyt.'}
          </p>
        </div>
      </PageContainer>
    );
  }

  const gigInfo = getGigInfo(response);

  const workflowStatus = response.workflow_status ?? 'pending';

  const isAgreementRequester =
    response.agreement_requested_by === currentUserId;

  const isCancelled = workflowStatus === 'cancelled';

  const isCompleted = workflowStatus === 'completed';

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
                {gigInfo?.category ?? 'Kategoria'} ·{' '}
                {gigInfo?.location ?? 'Sijainti'}
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-slate-200 bg-white/90 p-4 shadow-sm sm:p-6">
          <div className="space-y-4">
            <div className="max-w-[85%] rounded-[1.5rem] bg-slate-100 p-4 text-slate-900">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                Ensimmäinen yhteydenotto
              </p>

              <p className="mt-2 text-sm leading-7">
                {response.message}
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
                  <p className="text-sm leading-7">
                    {msg.message}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                {getWorkflowLabel(workflowStatus)}
              </span>

              {(workflowStatus === 'pending' ||
                workflowStatus === 'agreement_rejected') ? (
                <button
                  type="button"
                  onClick={() =>
                    updateWorkflow(
                      {
                        workflow_status: 'agreement_requested',
                        agreement_requested_by: currentUserId,
                      },
                      'Sopimusta ehdotettiin. Odotetaan toisen osapuolen hyväksyntää.'
                    )
                  }
                  className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                >
                  Merkitse sovituksi
                </button>
              ) : null}

              {workflowStatus === 'agreement_requested' ? (
                isAgreementRequester ? (
                  <span className="rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
                    Odotetaan toisen hyväksyntää
                  </span>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() =>
                        updateWorkflow(
                          {
                            workflow_status: 'active',
                          },
                          'Sopimus hyväksyttiin. Ilmoitus on nyt meneillään.'
                        )
                      }
                      className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500"
                    >
                      Hyväksy sopimus
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        updateWorkflow(
                          {
                            workflow_status: 'agreement_rejected',
                            agreement_requested_by: null,
                          },
                          'Sopimusehdotus hylättiin. Keskustelua voi jatkaa.'
                        )
                      }
                      className="rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-400"
                    >
                      Hylkää
                    </button>
                  </>
                )
              ) : null}

              {workflowStatus === 'active' ? (
                <button
                  type="button"
                  onClick={() =>
                    updateWorkflow(
                      {
                        workflow_status: 'completed',
                      },
                      'Ilmoitus merkittiin suoritetuksi.'
                    )
                  }
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Merkitse suoritetuksi
                </button>
              ) : null}

              {isCompleted ? (
                <button
                  type="button"
                  className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500"
                >
                  Anna arvio
                </button>
              ) : null}

              {!isCancelled && !isCompleted ? (
                <button
                  type="button"
                  onClick={() =>
                    updateWorkflow(
                      {
                        workflow_status: 'cancelled',
                        cancelled_at: new Date().toISOString(),
                      },
                      'Keskustelu lopetettiin. Uusia viestejä ei voi enää lähettää.'
                    )
                  }
                  className="rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                >
                  Lopeta keskustelu
                </button>
              ) : null}
            </div>

            {isCancelled ? (
              <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Tämä keskustelu on lopetettu.
                </p>

                <p className="mt-1 text-sm text-red-600">
                  Uusia viestejä ei voi enää lähettää.
                </p>
              </div>
            ) : null}
          </div>

          <div className="mt-6 border-t border-slate-200 pt-5">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Vastaa keskusteluun
              </span>

              <textarea
                value={replyMessage}
                onChange={(event) => setReplyMessage(event.target.value)}
                disabled={isCancelled}
                rows={4}
                placeholder={
                  isCancelled
                    ? 'Keskustelu on lopetettu'
                    : 'Kirjoita viesti...'
                }
                className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
              />
            </label>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={handleReply}
                disabled={sendingReply || !replyMessage.trim() || isCancelled}
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