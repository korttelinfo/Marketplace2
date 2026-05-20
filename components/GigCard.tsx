import Link from 'next/link';
import type { BrowseGig } from '../lib/mockGigs';

type GigCardProps = {
  gig: BrowseGig;
};

export default function GigCard({ gig }: GigCardProps) {
  return (
    <article className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
          {gig.status}
        </span>
        <span className="text-sm text-slate-500">{gig.date}</span>
      </div>
      <h2 className="mt-5 text-xl font-semibold text-slate-900">{gig.title}</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600">{gig.description}</p>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm">
        <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">{gig.category}</span>
        <span className="font-semibold text-slate-900">{gig.price}</span>
        <span className="text-slate-500">{gig.location}</span>
      </div>
      <div className="mt-6">
        <Link
          href={`/browse/${gig.id}`}
          className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Katso keikka
        </Link>
      </div>
    </article>
  );
}
