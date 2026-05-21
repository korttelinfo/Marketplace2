import Link from 'next/link';
import type { BrowseGig } from '../lib/mockGigs';
import { getUrgencyEmoji, getUrgencyLabel, type Urgency } from '../lib/helpCategories';

type GigCardProps = {
  gig: BrowseGig;
};

export default function GigCard({ gig }: GigCardProps) {
  const urgencyOptions = ['Tänään', 'Tällä viikolla', 'Ei kiirettä'];

  const isUrgency = urgencyOptions.includes(gig.date_time);
  const urgency = isUrgency ? (gig.date_time as Urgency) : null;

  const listingType = (gig as any).listing_type || 'Tarvitsen apua';

  const isHelping = listingType === 'Tarjoan apua';

  return (
    <article
      className={`rounded-[2rem] border bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md ${
        isHelping
          ? 'border-emerald-200'
          : 'border-orange-200'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isHelping
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-orange-100 text-orange-700'
            }`}
          >
            {listingType}
          </span>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {gig.category}
          </span>
        </div>

        {urgency && (
          <span
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
              urgency === 'Tänään'
                ? 'bg-orange-100 text-orange-700'
                : urgency === 'Tällä viikolla'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <span>{getUrgencyEmoji(urgency)}</span>
            {getUrgencyLabel(urgency)}
          </span>
        )}
      </div>

      <div className="mt-5">
        <h2 className="text-xl font-semibold leading-tight text-slate-900">
          {gig.title}
        </h2>

        <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">
          {gig.description}
        </p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-semibold text-slate-900">
          {gig.budget}
        </span>

        <span className="text-slate-500">
          {gig.location}
        </span>
      </div>

      <div className="mt-6">
        <Link
          href={`/browse/${gig.id}`}
          className={`inline-flex w-full items-center justify-center rounded-full px-4 py-3 text-sm font-semibold text-white transition ${
            isHelping
              ? 'bg-emerald-700 hover:bg-emerald-600'
              : 'bg-slate-900 hover:bg-slate-700'
          }`}
        >
          Katso ilmoitus
        </Link>
      </div>
    </article>
  );
}