import Link from 'next/link';
import PageContainer from '../../../components/PageContainer';

export default function BrowseGigNotFound() {
  return (
    <PageContainer>
      <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center">
        <p className="text-lg font-semibold text-slate-900">Keikkaa ei löytynyt</p>
        <p className="mt-2 text-sm text-slate-600">Valitettavasti tätä keikkaa ei ole saatavilla tai se on poistettu.</p>
        <Link
          href="/browse"
          className="mt-6 inline-flex rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
        >
          Palaa selaamaan keikkoja
        </Link>
      </div>
    </PageContainer>
  );
}
