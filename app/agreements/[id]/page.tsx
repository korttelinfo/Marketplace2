'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import PageContainer from '../../../components/PageContainer';

type AgreementStatus = 'Sovittavana' | 'Sovittu' | 'Valmis';

export default function AgreementPage() {
  const params = useParams();

  const [status, setStatus] = useState<AgreementStatus>('Sovittavana');
  const [phoneShared, setPhoneShared] = useState(false);
  const [locationShared, setLocationShared] = useState(false);
  const [socialShared, setSocialShared] = useState(false);
  const [showContactDetails, setShowContactDetails] = useState(false);
  const [message, setMessage] = useState('');

  const agreement = useMemo(() => {
    return {
      id: params.id,
      title: 'Porakone illaksi',
      area: 'Kallio',
      time: 'Tänään',
      compensation: '10 €',
      category: 'Työkalut',
      me: {
        name: 'Sinä',
        rating: '4.9',
        completed: 17,
      },
      other: {
        name: 'Anna',
        fullName: 'Anna Virtanen',
        rating: '5.0',
        completed: 6,
        trust: ['✓ Puhelin', '✓ Instagram', '6 juttua'],
      },
    };
  }, [params.id]);

  return (
    <PageContainer contentClassName="max-w-5xl">
      <div className="space-y-5">
        <Link
          href="/activity"
          className="inline-flex text-sm font-semibold text-slate-500 transition hover:text-slate-900"
        >
          ← Takaisin omiin juttuihin
        </Link>

        <section className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-sm">
          <div className="bg-[#fffaf3] p-6 sm:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-700">
              Yhteinen tilanne
            </p>

            <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h1 className="text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {agreement.title}
                </h1>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Pill>📍 {agreement.area}</Pill>
                  <Pill>🌤 {agreement.time}</Pill>
                  <Pill>💶 {agreement.compensation}</Pill>
                  <Pill>{agreement.category}</Pill>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-orange-100 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-700">
                  Tilanne
                </p>
                <p className="mt-1 text-xl font-semibold text-slate-950">{status}</p>

                <div className="mt-3">
                  {status === 'Sovittavana' ? (
                    <button
                      type="button"
                      onClick={() => setStatus('Sovittu')}
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Merkitse sovituksi
                    </button>
                  ) : status === 'Sovittu' ? (
                    <button
                      type="button"
                      onClick={() => setStatus('Valmis')}
                      className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Merkitse valmiiksi
                    </button>
                  ) : (
                    <span className="inline-flex rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700">
                      ✓ Hoidettu
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-orange-100 p-6 sm:p-8">
            <div className="rounded-[1.75rem] border border-orange-100 bg-[#fffaf3] p-5">
              <h2 className="text-2xl font-semibold tracking-tight text-slate-950">
                Mitä sovittiin?
              </h2>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <AgreementItem icon="🕒" label="Aika" value="Tänään noin klo 18" />
                <AgreementItem icon="📍" label="Tapa" value="Nouto lähialueelta" />
                <AgreementItem icon="💶" label="Korvaus" value="10 €" />
                <AgreementItem icon="📌" label="Muuta" value="Palautus huomenna" />
              </div>
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-orange-100 bg-white p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <PersonSummary
                  name={agreement.me.name}
                  rating={agreement.me.rating}
                  completed={agreement.me.completed}
                />

                <div className="hidden text-slate-300 sm:block">↔</div>

                <PersonSummary
                  name={agreement.other.name}
                  rating={agreement.other.rating}
                  completed={agreement.other.completed}
                  trust={agreement.other.trust}
                />
              </div>
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-orange-100 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                    Yhteystiedot
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Jaa vain ne tiedot, jotka tuntuvat tässä tilanteessa tarpeellisilta.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowContactDetails(!showContactDetails)}
                  className="rounded-full border border-orange-100 bg-[#fffaf3] px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-orange-50"
                >
                  {showContactDetails ? 'Piilota tiedot' : 'Näytä tiedot'}
                </button>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <ShareButton active={phoneShared} onClick={() => setPhoneShared(!phoneShared)}>
                  📞 Puhelimet
                </ShareButton>

                <ShareButton active={locationShared} onClick={() => setLocationShared(!locationShared)}>
                  📍 Sijainnit
                </ShareButton>

                <ShareButton active={socialShared} onClick={() => setSocialShared(!socialShared)}>
                  🔗 Some
                </ShareButton>
              </div>

              {showContactDetails ? (
                <div className="mt-5 rounded-[1.5rem] bg-[#fffaf3] p-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <ContactBlock
                      name="Sinä"
                      phone={phoneShared ? '040 123 4567' : 'Ei jaettu'}
                      location={locationShared ? 'Kallio, tarkempi paikka jaettu' : 'Vain alue näkyy'}
                      social={socialShared ? '@juhana' : 'Ei jaettu'}
                    />

                    <ContactBlock
                      name={agreement.other.fullName}
                      phone={phoneShared ? '050 987 6543' : 'Ei jaettu'}
                      location={locationShared ? 'Kallio, tarkempi paikka jaettu' : 'Vain alue näkyy'}
                      social={socialShared ? '@anna' : 'Ei jaettu'}
                    />
                  </div>
                </div>
              ) : null}
            </div>

            <div className="mt-5 rounded-[1.75rem] border border-orange-100 bg-white p-5">
              <h2 className="text-xl font-semibold tracking-tight text-slate-950">
                Viestit
              </h2>

              <div className="mt-5 space-y-4">
                <ChatBubble name="Anna" message="Voin tuoda porakoneen noin klo 18 jälkeen." />
                <ChatBubble name="Sinä" message="Kuulostaa hyvältä 👍" own />
              </div>

              <div className="mt-5 rounded-[1.5rem] border border-orange-100 bg-[#fffaf3] p-4">
                <textarea
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  rows={3}
                  placeholder="Kirjoita lyhyt viesti..."
                  className="w-full resize-none border-0 bg-transparent text-sm leading-6 text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Lähetä
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-orange-100 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700">
      {children}
    </span>
  );
}

function AgreementItem({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.35rem] bg-white p-4 ring-1 ring-orange-100">
      <p className="text-sm font-semibold text-slate-950">
        {icon} {label}
      </p>
      <p className="mt-1 text-sm text-slate-600">{value}</p>
    </div>
  );
}

function PersonSummary({
  name,
  rating,
  completed,
  trust = [],
}: {
  name: string;
  rating: string;
  completed: number;
  trust?: string[];
}) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-lg font-semibold text-slate-950">{name}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>⭐ {rating}</Pill>
        <Pill>{completed} juttua</Pill>
        {trust.map((item) => (
          <Pill key={item}>{item}</Pill>
        ))}
      </div>
    </div>
  );
}

function ShareButton({
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
          ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200'
          : 'bg-[#fffaf3] text-slate-700 ring-1 ring-orange-100 hover:bg-orange-50'
      }`}
    >
      {active ? '✓ ' : ''}
      {children}
    </button>
  );
}

function ContactBlock({
  name,
  phone,
  location,
  social,
}: {
  name: string;
  phone: string;
  location: string;
  social: string;
}) {
  return (
    <div className="rounded-[1.35rem] bg-white p-4 ring-1 ring-orange-100">
      <p className="font-semibold text-slate-950">{name}</p>
      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p>📞 {phone}</p>
        <p>📍 {location}</p>
        <p>🔗 {social}</p>
      </div>
    </div>
  );
}

function ChatBubble({
  name,
  message,
  own,
}: {
  name: string;
  message: string;
  own?: boolean;
}) {
  return (
    <div className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[85%] rounded-[1.5rem] px-4 py-3 ${
          own
            ? 'bg-slate-950 text-white'
            : 'bg-[#fffaf3] text-slate-800 ring-1 ring-orange-100'
        }`}
      >
        <p className={`text-xs font-semibold ${own ? 'text-white/70' : 'text-orange-700'}`}>
          {name}
        </p>
        <p className="mt-1 text-sm leading-6">{message}</p>
      </div>
    </div>
  );
}