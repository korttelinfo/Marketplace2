import Link from 'next/link';
import PageContainer from '../components/PageContainer';
import { landingCategories, landingGigs } from '../lib/mockGigs';

export default function Home() {
  return (
    <PageContainer>
      <section className="space-y-10 rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-10">
        <div className="space-y-6 text-center sm:text-left">
          <p className="inline-flex rounded-full bg-amber-50 px-4 py-1 text-sm font-semibold text-amber-800 ring-1 ring-amber-100">
            Korttelin arjen apu
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
            Apua arkeen läheltäsi.
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-8 text-slate-600 sm:mx-0 sm:text-lg">
            Löydä ja tarjoa arkiapua omassa korttelissasi. Kortteli yhdistää naapuruston ihmiset helposti, turvallisesti ja ilman turhaa byrokratiaa.
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="/browse"
              className="inline-flex justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
            >
              Selaa keikkoja
            </a>
            <a
              href="/create"
              className="inline-flex justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
            >
              Julkaise keikka
            </a>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {landingCategories.map((category) => (
            <article
              key={category.title}
              className="rounded-[1.75rem] border border-slate-200 bg-slate-50 p-5 shadow-sm"
            >
              <div className="mb-4 h-12 w-12 rounded-2xl bg-slate-200" />
              <h2 className="text-lg font-semibold text-slate-900">{category.title}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{category.description}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 rounded-[1.75rem] border border-slate-200 bg-slate-50 p-6 sm:grid-cols-3">
          <article className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">1. Kerro tarpeestasi</p>
            <h3 className="text-xl font-semibold text-slate-900">Lisää keikka nopeasti</h3>
            <p className="text-sm leading-6 text-slate-600">Kirjoita lyhyt kuvaus ja sijainti, niin naapurit näkevät helposti mistä on kyse.</p>
          </article>
          <article className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">2. Yhdistä naapurien kanssa</p>
            <h3 className="text-xl font-semibold text-slate-900">Lähelläsi oleva apu</h3>
            <p className="text-sm leading-6 text-slate-600">Löydä lähialueella asuvat ihmiset, jotka voivat auttaa sinua arjen askareissa.</p>
          </article>
          <article className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">3. Hoida yhdessä</p>
            <h3 className="text-xl font-semibold text-slate-900">Helppo ja luotettava</h3>
            <p className="text-sm leading-6 text-slate-600">Sovi aikataulu, hinta ja toteutus yhdessä. Kortteli pitää yhteydenoton yksinkertaisena.</p>
          </article>
        </div>

        <div className="rounded-[1.75rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.32em] text-amber-200">Luotettava kortteliyhteisö</p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Yksinkertaista paikallista apua.</h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
              Kortteli pitää askeleet selkeinä ja yhteydenoton läpinäkyvänä. Voit luottaa siihen, että apu löytyy läheltä ja yhteisö toimii rehdisti.
            </p>
          </div>
        </div>
      </section>

      <section id="gigs" className="mt-10 space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">Esimerkkikeikat</p>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Löydä sopiva pieni työ heti.</h2>
          </div>
          <a
            href="/create"
            className="inline-flex items-center rounded-full border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Luo oma keikka
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {landingGigs.map((gig) => (
            <article
              key={gig.title}
              className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-slate-600">
                  Paikallinen
                </span>
                <span className="text-sm font-medium text-slate-500">{gig.meta}</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-900">{gig.title}</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">{gig.details}</p>
              <div className="mt-6">
                <Link
                  href="/browse"
                  className="inline-flex w-full items-center justify-center rounded-full bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-700"
                >
                  Katso keikka
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="create" className="mt-10 rounded-[2rem] border border-slate-200 bg-slate-950 px-6 py-8 text-white sm:px-8 lg:px-10">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.32em] text-slate-400">Helppo aloitus</p>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">Julkaise keikka muutamassa minuutissa.</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
            Lisää keikan tiedot, aikataulu ja palkkio. Naapurit löytävät keikkasi nopeasti ja yhteydenotto pysyy yksinkertaisena.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <a
              href="/create"
              className="inline-flex justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
            >
              Luo keikka
            </a>
            <a
              href="/browse"
              className="inline-flex justify-center rounded-full border border-white/20 bg-transparent px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Tutustu keikkoihin
            </a>
          </div>
        </div>
      </section>
    </PageContainer>
  );
}
