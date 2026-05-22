import Link from 'next/link';
import type { BrowseGig } from '../lib/mockGigs';
import {
  URGENCY_OPTIONS,
  getUrgencyEmoji,
  getUrgencyLabel,
  type Urgency,
} from '../lib/helpCategories';

type GigCardProps = {
  gig: BrowseGig;
};

export default function GigCard({ gig }: GigCardProps) {
  const isUrgency = URGENCY_OPTIONS.includes(gig.date_time as Urgency);
  const urgency = isUrgency ? (gig.date_time as Urgency) : null;

  const listingType = (gig as any).listing_type || 'Tarvitsen apua';
  const isOffer = listingType === 'Tarjoan apua';

  const typeLabel = isOffer ? 'Tarjolla lähistöllä' : 'Tarve lähistöllä';
  const intentLabel = isOffer ? 'Tarjoan' : 'Tarvitsen';
  const actionLabel = isOffer ? 'Pyydä tätä' : 'Voin auttaa';

  const description =
    gig.description?.trim() ||
    (isOffer
      ? 'Tarkemmat tiedot sovitaan, jos tämä sopii tarpeeseesi.'
      : 'Tarkemmat yksityiskohdat voidaan sopia, kun sopiva henkilö löytyy.');

  return (
    <article className="group rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
            {typeLabel}
          </p>

          <h2 className="mt-2 text-xl font-semibold leading-tight tracking-tight text-slate-950">
            {gig.title}
          </h2>
        </div>

        <span
          className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
            isOffer
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-orange-50 text-orange-700'
          }`}
        >
          {intentLabel}
        </span>
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-slate-600">
        {description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {urgency ? (
          <span className="rounded-full bg-[#fffaf3] px-3 py-1.5 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
            {getUrgencyEmoji(urgency)} {getUrgencyLabel(urgency)}
          </span>
        ) : (
          <span className="rounded-full bg-[#fffaf3] px-3 py-1.5 text-xs font-semibold text-orange-800 ring-1 ring-orange-100">
            {gig.date_time}
          </span>
        )}

        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {gig.category}
        </span>

        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {gig.location}
        </span>

        <span className="rounded-full bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
          {gig.budget || 'Sovitaan'}
        </span>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <Link
          href={`/browse/${gig.id}`}
          className="inline-flex flex-1 items-center justify-center rounded-full bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition group-hover:bg-slate-800"
        >
          {actionLabel}
        </Link>

        <Link
          href={`/browse/${gig.id}`}
          className="hidden rounded-full border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 sm:inline-flex"
        >
          Avaa
        </Link>
      </div>
    </article>
  );
}