'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import PageContainer from '../../components/PageContainer';
import { supabase } from '../../lib/supabase';

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [recoveryMode, setRecoveryMode] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [hasSession, setHasSession] = useState(false);

useEffect(() => {
  const checkSession = async () => {
    const hash = window.location.hash;
    const queryType = searchParams?.get('type');

    setRecoveryMode(
      queryType === 'recovery' ||
      hash.includes('type=recovery')
    );

    const { data } = await supabase.auth.getSession();

    setHasSession(!!data.session);
    setSessionChecked(true);
  };

  checkSession();
}, [searchParams]);

  const handleSendReset = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const redirectTo = `${window.location.origin}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo,
      });

      if (error) {
        setErrorMessage(error.message);
      } else {
        setSuccessMessage(
          'Sähköpostiin on lähetetty ohjeet salasanan palauttamiseen. Tarkista sähköpostisi.'
        );
      }
    } catch (error) {
      setErrorMessage('Salasanan palautus epäonnistui. Yritä uudelleen.');
      console.error('Reset password error:', error);
    }

    setLoading(false);
  };

  const handleSetPassword = async () => {
    if (password.trim().length < 6) {
      setErrorMessage('Salasanan tulee olla vähintään 6 merkkiä pitkä.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Salasanat eivät täsmää.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setErrorMessage(error.message || 'Salasanan vaihto epäonnistui.');
      setLoading(false);
      return;
    }

    setSuccessMessage('Salasana on vaihdettu. Voit nyt kirjautua sisään uudella salasanalla.');
    setPassword('');
    setConfirmPassword('');
    setLoading(false);

    setTimeout(() => {
      router.push('/login?reset_success=1');
    }, 2500);
  };

  if (!sessionChecked) {
  return (
    <PageContainer contentClassName="max-w-3xl">
      <p className="text-slate-600">
        Tarkistetaan palautuslinkkiä...
      </p>
    </PageContainer>
  );
}

  const canShowRecoveryForm = recoveryMode || hasSession;

  return (
    <PageContainer contentClassName="max-w-3xl">
      <div className="rounded-[2rem] bg-white/90 p-6 shadow-lg shadow-slate-200/60 ring-1 ring-slate-200 sm:p-8">
        <div className="space-y-4 text-center sm:text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">
            {canShowRecoveryForm ? 'Palauta salasana' : 'Unohditko salasanan?'}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {canShowRecoveryForm
              ? 'Aseta uusi salasana'
              : 'Lähetä salasanan palautuslinkki'}
          </h1>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 sm:mx-0">
            {canShowRecoveryForm
              ? 'Syötä uusi salasana alla ja vahvista se. Tämän jälkeen voit kirjautua sisään normaalisti.'
              : 'Anna sähköpostiosoitteesi, niin lähetämme sinulle linkin salasanan palauttamiseen.'}
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {successMessage ? (
            <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {successMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="rounded-3xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {errorMessage}
            </div>
          ) : null}

          {!canShowRecoveryForm ? (
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
          ) : (
            <>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Uusi salasana</span>
                <input
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Uusi salasana"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">Vahvista salasana</span>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Vahvista uusi salasana"
                  className="w-full rounded-3xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-200"
                />
              </label>
            </>
          )}

          <button
            type="button"
            onClick={canShowRecoveryForm ? handleSetPassword : handleSendReset}
            disabled={loading || (!canShowRecoveryForm && !email.trim())}
            className="inline-flex w-full justify-center rounded-full bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {loading
              ? 'Odota...'
              : canShowRecoveryForm
              ? 'Vaihda salasana'
              : 'Lähetä palautuslinkki'}
          </button>

          {!canShowRecoveryForm ? (
            <div className="text-center text-sm text-slate-600">
              <Link href="/login" className="font-semibold text-slate-900 hover:text-slate-700">
                Palaa kirjautumissivulle
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
