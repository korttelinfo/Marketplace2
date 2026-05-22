'use client';

import { useState } from 'react';
import Link from 'next/link';
import PageContainer from '../../components/PageContainer';

import {
  Bell,
  CheckCircle2,
  ChevronRight,
  Clock3,
  HeartHandshake,
  MessageCircle,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

type NotificationItem = {
  id: string;
  type:
    | 'message'
    | 'agreement'
    | 'completed'
    | 'feedback'
    | 'trust'
    | 'system';
  title: string;
  text: string;
  time: string;
  href?: string;
  cta?: string;
  unread?: boolean;
};

const NEW_ITEMS: NotificationItem[] = [
  {
    id: '1',
    type: 'message',
    title: 'Maria vastasi pyyntöösi',
    text: 'Keskustelu voi nyt jatkua viesteissä.',
    time: '2 min sitten',
    href: '/inbox',
    cta: 'Avaa keskustelu',
    unread: true,
  },

  {
    id: '2',
    type: 'agreement',
    title: 'Yhteenveto odottaa vahvistusta',
    text: 'Molemmat osapuolet ovat jatkamassa keskustelua.',
    time: '1 h sitten',
    href: '/agreements',
    cta: 'Tarkista',
    unread: true,
  },

  {
    id: '3',
    type: 'trust',
    title: 'Profiilisi näyttää hyvältä',
    text: 'Lisää vielä muutama merkki tai kuvaus vahvistaaksesi ensivaikutelmaa.',
    time: '3 h sitten',
    href: '/profile/edit',
    cta: 'Täydennä profiilia',
  },
];

const EARLIER_ITEMS: NotificationItem[] = [
  {
    id: '4',
    type: 'completed',
    title: 'Kohtaaminen merkittiin valmiiksi',
    text: 'Voit halutessasi jättää palautteen myöhemmin.',
    time: 'Eilen',
    href: '/activity',
    cta: 'Katso tapahtumat',
  },

  {
    id: '5',
    type: 'feedback',
    title: 'Sait uutta palautetta',
    text: 'Toinen osapuoli kuvaili yhteistyötä helpoksi ja sujuvaksi.',
    time: '2 päivää sitten',
    href: '/profile',
    cta: 'Näytä profiili',
  },

  {
    id: '6',
    type: 'system',
    title: 'Sähköposti vahvistettu',
    text: 'Tilisi turvallisuus näyttää hyvältä.',
    time: '4 päivää sitten',
  },
];

export default function NotificationsPage() {
  const [readNotificationIds, setReadNotificationIds] = useState<Set<string>>(new Set());

  const handleMarkAllAsRead = () => {
    const allIds = new Set([
      ...NEW_ITEMS.map((i) => i.id),
      ...EARLIER_ITEMS.map((i) => i.id),
    ]);
    setReadNotificationIds(allIds);
  };

  return (
    <PageContainer contentClassName="max-w-4xl">
      <div className="space-y-8 pb-10">

        <section className="relative overflow-hidden rounded-[2.5rem] bg-[#fbf8f2] p-6 shadow-sm ring-1 ring-stone-200/70 sm:p-8 lg:p-10">

          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-amber-200/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-emerald-200/25 blur-3xl" />

          <div className="relative">

            <div className="inline-flex items-center gap-2 rounded-full bg-white/70 px-4 py-2 text-sm font-medium text-stone-700 ring-1 ring-stone-200/80">
              <Bell size={16} />
              Tapahtumat
            </div>

            <h1 className="mt-5 text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl">
              Ajankohtaista Korttelissa
            </h1>

            <p className="mt-5 max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
              Täältä löydät tärkeät tapahtumat, keskustelut ja päivitykset ilman jatkuvaa hälyä tai kiireen tunnetta.
            </p>

            <button
              onClick={handleMarkAllAsRead}
              className="mt-6 inline-flex items-center justify-center rounded-full bg-[#4a3b2f] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3f3227]"
            >
              Merkitse luetuksi
            </button>

          </div>

        </section>

        <section>

          <div className="mb-4 flex items-center gap-2">

            <div className="h-2 w-2 rounded-full bg-emerald-600" />

            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              Uudet
            </h2>

          </div>

          <div className="space-y-3">

            {NEW_ITEMS.filter((item) => !readNotificationIds.has(item.id)).map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
              />
            ))}

          </div>

        </section>

        <section>

          <div className="mb-4 flex items-center gap-2">

            <Clock3
              size={18}
              className="text-stone-500"
            />

            <h2 className="text-xl font-semibold tracking-tight text-stone-950">
              Aiemmat
            </h2>

          </div>

          <div className="space-y-3">

            {EARLIER_ITEMS.filter((item) => !readNotificationIds.has(item.id)).map((item) => (
              <NotificationCard
                key={item.id}
                item={item}
              />
            ))}

          </div>

        </section>

      </div>
    </PageContainer>
  );
}

function NotificationCard({
  item,
}: {
  item: NotificationItem;
}) {
  const icon = getNotificationIcon(item.type);

  return (
    <div
      className={`rounded-[1.75rem] bg-white p-5 shadow-sm ring-1 transition ${
        item.unread
          ? 'ring-emerald-200'
          : 'ring-stone-200/70'
      }`}
    >

      <div className="flex items-start gap-4">

        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            item.unread
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-[#fbf8f2] text-stone-600'
          }`}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="text-base font-semibold text-stone-950">
              {item.title}
            </h3>

            {item.unread ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                Uusi
              </span>
            ) : null}

          </div>

          <p className="mt-2 text-sm leading-7 text-stone-600">
            {item.text}
          </p>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">

            <span className="text-xs font-medium text-stone-400">
              {item.time}
            </span>

            {item.href && item.cta ? (
              <Link
                href={item.href}
                className="inline-flex items-center gap-1 text-sm font-semibold text-stone-800 transition hover:text-stone-950"
              >
                {item.cta}
                <ChevronRight size={15} />
              </Link>
            ) : null}

          </div>

        </div>

      </div>

    </div>
  );
}

function getNotificationIcon(
  type: NotificationItem['type'],
) {
  switch (type) {
    case 'message':
      return <MessageCircle size={18} />;

    case 'agreement':
      return <HeartHandshake size={18} />;

    case 'completed':
      return <CheckCircle2 size={18} />;

    case 'feedback':
      return <Sparkles size={18} />;

    case 'trust':
      return <ShieldCheck size={18} />;

    default:
      return <Bell size={18} />;
  }
}