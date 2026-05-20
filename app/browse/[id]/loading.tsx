import PageContainer from '../../../components/PageContainer';

export default function BrowseGigLoading() {
  return (
    <PageContainer>
      <div className="rounded-[2rem] bg-white/90 p-8 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 text-center text-slate-500">
        Ladataan keikkaa...
      </div>
    </PageContainer>
  );
}
