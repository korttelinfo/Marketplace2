'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';
import {
  URGENCY_OPTIONS,
  getUrgencyEmoji,
  getUrgencyLabel,
  type Urgency,
} from '../../lib/helpCategories';

type Gig = {
  id: string;
  title: string;
  category: string;
  budget: string | null;
  location: string | null;
  date_time: string | null;
  description: string | null;
  status: string | null;
  listing_type: string | null;
  user_id: string;
};

type GigResponse = {
  id: string;
  gig_id: string;
  sender_id: string;
  owner_id: string;
  message: string | null;
  status: string | null;
  created_at?: string | null;
  gigs?: Gig | null;
};

type Tab = 'situations' | 'sent' | 'done';

export default function ActivityPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<Tab>('situations');
  const [expandedGigId, setExpandedGigId] = useState<string | null>(null);
  const [questionForResponseId, setQuestionForResponseId] = useState<string | null>(null);

  const [myGigs, setMyGigs] = useState<Gig[]>([]);
  const [receivedResponses, setReceivedResponses] = useState<GigResponse[]>([]);
  const [sentResponses, setSentResponses] = useState<GigResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadActivity = async () => {
      setLoading(true);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();

      if (!sessionData.session) {
        router.push('/login');
        return;
      }

      const currentUserId = sessionData.session.user.id;

      const { data: gigsData, error: gigsError } = await supabase
        .from('gigs')
        .select('id,title,category,budget,location,date_time,description,status,listing_type,user_id')
        .eq('user_id', currentUserId)
        .order('id', { ascending: false });

      const { data: receivedData, error: receivedError } = await supabase
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
            id,
            title,
            category,
            budget,
            location,
            date_time,
            description,
            status,
            listing_type,
            user_id
          )
        `)
        .eq('owner_id', currentUserId)
        .order('created_at', { ascending: false });

      const { data: sentData, error: sentError } = await supabase
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
            id,
            title,
            category,
            budget,
            location,
            date_time,
            description,
            status,
            listing_type,
            user_id
          )
        `)
        .eq('sender_id', currentUserId)
        .order('created_at', { ascending: false });

      if (gigsError || receivedError || sentError) {
        console.error({ gigsError, receivedError, sentError });
        setError('Omat jutut eivät latautuneet juuri nyt.');
      } else {
        setMyGigs((gigsData ?? []) as Gig[]);
        setReceivedResponses((receivedData ?? []) as unknown as GigResponse[]);
        setSentResponses((sentData ?? []) as unknown as GigResponse[]);
      }

      setLoading(false);
    };

    loadActivity();
  }, [router]);

  const responsesByGigId = useMemo(() => {
    return receivedResponses.reduce<Record<string, GigResponse[]>>((acc, response) => {
      if (!acc[response.gig_id]) acc[response.gig_id] = [];
      acc[response.gig_id].push(response);
      return acc;
    }, {});
  }, [receivedResponses]);

  const openSituations = myGigs.filter((gig) => !gig.status || gig.status === 'vapaa');

  const situationsWaitingChoice = openSituations.filter(
    (gig) => (responsesByGigId[gig.id] ?? []).length > 0,
  );

  const completedGigs = myGigs.filter(
    (gig) => gig.status === 'valmis' || gig.status === 'completed' || gig.status === 'suoritettu',
  );

  const pendingSent = sentResponses.filter((response) => response.status === 'pending' || !response.status);

  const totalResponsesToday = receivedResponses.length;

  if (loading) {
    return (
      <PageContainer contentClassName="max-w-6xl">
        <div className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] p-8 text-center text-slate-500">
          Ladataan omia juttuja...
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer contentClassName="max-w-6xl">
      <div className="space-y-6">
        <section className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
            Omat jutut
          </p>

          <div className="mt-4 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                Mitä on menossa?
              </h1>

              <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Täällä näkyvät omat pyynnöt, tarjonnat ja niihin tulleet vastaukset — ilman inbox-rumbaa.
              </p>
            </div>

            <Link
              href="/create"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Kerro mitä tarvitset
            </Link>
          </div>
        </section>

        {error ? (
          <div className="rounded-[1.75rem] border border-rose-200 bg-rose-50 p-5 text-sm text-rose-700">
            {error}
          </div>
        ) : null}

        <section className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm">
          <p className="text-sm leading-7 text-slate-700">
            Sinulla on{' '}
            <span className="font-semibold text-slate-950">{openSituations.length}</span>{' '}
            käynnissä olevaa tilannetta,{' '}
            <span className="font-semibold text-slate-950">{situationsWaitingChoice.length}</span>{' '}
            odottaa valintaa ja{' '}
            <span className="font-semibold text-slate-950">{totalResponsesToday}</span>{' '}
            ihmistä on reagoinut.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            <SoftPulse>🧩 {openSituations.length} käynnissä</SoftPulse>
            <SoftPulse>💬 {situationsWaitingChoice.length} vastauksia tullut</SoftPulse>
            <SoftPulse>↗ {pendingSent.length} omaa vastausta</SoftPulse>
            <SoftPulse>✅ {completedGigs.length} hoidettu</SoftPulse>
          </div>
        </section>

        <section className="flex flex-wrap gap-2">
          <TabButton active={activeTab === 'situations'} onClick={() => setActiveTab('situations')}>
            Tilanteet
          </TabButton>
          <TabButton active={activeTab === 'sent'} onClick={() => setActiveTab('sent')}>
            Vastaukset
          </TabButton>
          <TabButton active={activeTab === 'done'} onClick={() => setActiveTab('done')}>
            Valmiit
          </TabButton>
        </section>

        {activeTab === 'situations' ? (
          <section className="space-y-4">
            {openSituations.length === 0 ? (
              <EmptyState
                title="Ei avoimia tilanteita"
                text="Kun julkaiset pyynnön tai tarjonnan, se näkyy täällä omana tilanteenaan."
              />
            ) : (
              openSituations.map((gig) => {
                const responses = responsesByGigId[gig.id] ?? [];
                const isExpanded = expandedGigId === gig.id;

                return (
                  <SituationCard
                    key={gig.id}
                    gig={gig}
                    responses={responses}
                    expanded={isExpanded}
                    onToggle={() => setExpandedGigId(isExpanded ? null : gig.id)}
                    questionForResponseId={questionForResponseId}
                    setQuestionForResponseId={setQuestionForResponseId}
                  />
                );
              })
            )}
          </section>
        ) : activeTab === 'sent' ? (
          <section className="grid gap-4 md:grid-cols-2">
            {sentResponses.length === 0 ? (
              <EmptyState
                title="Et ole vielä vastannut"
                text="Kun vastaat toisen pyyntöön tai tarjontaan, oma vastauksesi näkyy täällä."
              />
            ) : (
              sentResponses.map((response) => <SentResponseCard key={response.id} response={response} />)
            )}
          </section>
        ) : (
          <section className="grid gap-4 md:grid-cols-2">
            {completedGigs.length === 0 ? (
              <EmptyState
                title="Ei valmiita juttuja vielä"
                text="Valmiit ja suoritetut tilanteet näkyvät myöhemmin täällä."
              />
            ) : (
              completedGigs.map((gig) => <CompactGigCard key={gig.id} gig={gig} />)
            )}
          </section>
        )}
      </div>
    </PageContainer>
  );
}

function SituationCard({
  gig,
  responses,
  expanded,
  onToggle,
  questionForResponseId,
  setQuestionForResponseId,
}: {
  gig: Gig;
  responses: GigResponse[];
  expanded: boolean;
  onToggle: () => void;
  questionForResponseId: string | null;
  setQuestionForResponseId: (id: string | null) => void;
}) {
  const listingType = gig.listing_type || 'Tarvitsen apua';
  const isOffer = listingType === 'Tarjoan apua';
  const visibleResponses = expanded ? responses : responses.slice(0, 3);
  const hiddenCount = Math.max(responses.length - 3, 0);

  return (
    <article className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            {isOffer ? 'Tarjontasi' : 'Pyyntösi'}
          </p>

          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
            {gig.title}
          </h2>

          <div className="mt-4 flex flex-wrap gap-2">
            <GigMetaChips gig={gig} />
          </div>

          {responses.length > 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              {responses.length} ihmistä reagoi tähän. Uusin vastaus näkyy alla.
            </p>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              Ei vastauksia vielä. Kun joku reagoi, se näkyy tässä ilman erillistä inboxia.
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            href={`/browse/${gig.id}`}
            className="inline-flex justify-center rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Avaa
          </Link>

          <button
            type="button"
            onClick={onToggle}
            disabled={responses.length === 0}
            className="inline-flex justify-center rounded-full border border-orange-100 bg-[#fffaf3] px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {expanded ? 'Tiivistä' : responses.length > 0 ? `Vastaukset (${responses.length})` : 'Ei vastauksia'}
          </button>
        </div>
      </div>

      {responses.length > 0 ? (
        <div className="mt-5 space-y-3">
          {visibleResponses.map((response, index) => (
            <InlineResponse
              key={response.id}
              response={response}
              index={index}
              questionOpen={questionForResponseId === response.id}
              onToggleQuestion={() =>
                setQuestionForResponseId(questionForResponseId === response.id ? null : response.id)
              }
            />
          ))}

          {!expanded && hiddenCount > 0 ? (
            <button
              type="button"
              onClick={onToggle}
              className="w-full rounded-full border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-orange-50"
            >
              Näytä kaikki {responses.length} vastausta
            </button>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

function InlineResponse({
  response,
  index,
  questionOpen,
  onToggleQuestion,
}: {
  response: GigResponse;
  index: number;
  questionOpen: boolean;
  onToggleQuestion: () => void;
}) {
  const parsed = parseStructuredMessage(response.message || '');
  const displayName = getDemoResponderName(index);
  const timeAgo = getDemoTimeAgo(index);

  return (
    <div className="rounded-[1.5rem] bg-[#fffaf3] p-4 ring-1 ring-orange-100">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-slate-950">
              {displayName} voi auttaa
            </p>

            <span className="text-xs font-medium text-slate-500">
              {timeAgo}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Chip>{response.status || 'odottaa'}</Chip>
            {parsed.timing ? <Chip>🕒 {parsed.timing}</Chip> : null}
            {parsed.compensation ? <Chip>💶 {parsed.compensation}</Chip> : null}
          </div>

          {parsed.note ? (
            <p className="mt-4 text-sm leading-6 text-slate-700">“{parsed.note}”</p>
          ) : (
            <p className="mt-4 text-sm leading-6 text-slate-500">
              Ei erillistä viestiä.
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row lg:flex-col">
          <Link
            href={`/agreements/${response.id}`}
            className="rounded-full bg-slate-950 px-5 py-3 text-center text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            Jatka tästä
          </Link>

          <button
            type="button"
            onClick={onToggleQuestion}
            className="rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Kysy lisää
          </button>
        </div>
      </div>

      {questionOpen ? (
        <div className="mt-4 rounded-[1.35rem] bg-white p-4 ring-1 ring-orange-100">
          <p className="text-sm font-semibold text-slate-950">
            Kysy lisätietoja
          </p>

          <textarea
            rows={3}
            placeholder="Kirjoita lyhyt kysymys..."
            className="mt-3 w-full rounded-[1.25rem] border border-orange-100 bg-[#fffaf3] px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-orange-300 focus:outline-none focus:ring-2 focus:ring-orange-100"
          />

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              className="rounded-full bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-600"
            >
              Tulossa myöhemmin
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function SentResponseCard({ response }: { response: GigResponse }) {
  const gig = response.gigs;
  const parsed = parseStructuredMessage(response.message || '');

  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
        Vastauksesi
      </p>

      <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
        {gig?.title || 'Korttelin tilanne'}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <Chip>{response.status || 'odottaa'}</Chip>
        {gig?.category ? <Chip>{gig.category}</Chip> : null}
        {parsed.timing ? <Chip>🕒 {parsed.timing}</Chip> : null}
      </div>

      {parsed.note ? (
        <p className="mt-4 text-sm leading-6 text-slate-700">“{parsed.note}”</p>
      ) : null}

      {gig?.id ? (
        <Link
          href={`/browse/${gig.id}`}
          className="mt-5 inline-flex w-full justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Avaa
        </Link>
      ) : null}
    </article>
  );
}

function CompactGigCard({ gig }: { gig: Gig }) {
  return (
    <article className="rounded-[1.75rem] border border-orange-100 bg-[#fffaf3] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
        Valmis
      </p>

      <h3 className="mt-2 text-lg font-semibold tracking-tight text-slate-950">
        {gig.title}
      </h3>

      <div className="mt-4 flex flex-wrap gap-2">
        <GigMetaChips gig={gig} />
      </div>
    </article>
  );
}

function GigMetaChips({ gig }: { gig: Gig }) {
  const isUrgency = URGENCY_OPTIONS.includes(gig.date_time as Urgency);
  const urgency = isUrgency ? (gig.date_time as Urgency) : null;

  return (
    <>
      <Chip>{gig.category}</Chip>
      <Chip>📍 {gig.location || 'Alue puuttuu'}</Chip>
      <Chip>💶 {gig.budget || 'Sovitaan'}</Chip>
      <Chip>
        {urgency ? `${getUrgencyEmoji(urgency)} ${getUrgencyLabel(urgency)}` : gig.date_time || 'Aika avoin'}
      </Chip>
    </>
  );
}

function SoftPulse({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full bg-[#fffaf3] px-3 py-2 text-xs font-semibold text-slate-700 ring-1 ring-orange-100">
      {children}
    </span>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
        active
          ? 'bg-slate-950 text-white'
          : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
      }`}
    >
      {children}
    </button>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700">
      {children}
    </span>
  );
}

function EmptyState({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-[2rem] border border-orange-100 bg-[#fffaf3] p-8 text-center">
      <p className="text-lg font-semibold text-slate-950">{title}</p>
      <p className="mt-2 text-sm text-slate-600">{text}</p>
      <Link
        href="/create"
        className="mt-6 inline-flex rounded-full bg-slate-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Kerro mitä tarvitset
      </Link>
    </div>
  );
}

function parseStructuredMessage(message: string) {
  const lines = message.split('\n').map((line) => line.trim()).filter(Boolean);

  const intro = lines.find(
    (line) =>
      line.includes('Vastaus tähän tarpeeseen') ||
      line.includes('Pyyntö tähän tarjontaan'),
  );

  const timing = lines
    .find((line) => line.startsWith('Aikataulu:'))
    ?.replace('Aikataulu:', '')
    .trim();

  const compensation = lines
    .find((line) => line.startsWith('Korvaus:'))
    ?.replace('Korvaus:', '')
    .trim();

  const note = lines
    .find((line) => line.startsWith('Viesti:'))
    ?.replace('Viesti:', '')
    .trim();

  return { intro, timing, compensation, note };
}

function getDemoResponderName(index: number) {
  const names = ['Anna', 'Mikko', 'Sara', 'Ville', 'Emilia'];
  return names[index % names.length];
}

function getDemoTimeAgo(index: number) {
  const times = ['12 min sitten', 'tänään', 'eilen', '2 pv sitten'];
  return times[index % times.length];
}