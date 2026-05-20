'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setErrorMessage(null);

    const credentials = { email, password };

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword(credentials);
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }
    } else {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) {
        setErrorMessage(error.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
    router.push('/profile');
  };

  return (
    <PageContainer contentClassName="max-w-3xl">
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            {mode === 'login' ? 'Kirjaudu sisään' : 'Luo tili'}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {mode === 'login' ? 'Kirjaudu omalla sähköpostilla' : 'Rekisteröidy palveluun'}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            {mode === 'login'
              ? 'Kirjaudu sisään sähköpostilla ja salasanalla päästäksesi profiiliin ja luodaksesi keikkoja.'
              : 'Luo uusi tili käyttämällä sähköpostia ja salasanaa. Tämän jälkeen pääset profiiliin.'}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Sähköposti</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="esimerkki@domain.fi"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">Salasana</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Salasana"
              className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
            />
          </label>

          {errorMessage ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading ? 'Odota...' : mode === 'login' ? 'Kirjaudu sisään' : 'Rekisteröidy'}
          </button>

          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="inline-flex w-full justify-center rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            {mode === 'login' ? 'Luo uusi tili' : 'Siirry kirjautumaan'}
          </button>
        </div>
      </div>
    </PageContainer>
  );
}
