'use client';

import { AlertCircle, CheckCircle2, LoaderCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ApiError } from '@/lib/api';
import { verifyEmail } from '@/lib/services/registration-service';

type VerificationState = 'verifying' | 'verified' | 'failed';

export function VerifyEmailResult({
  token,
}: Readonly<{ token: string | null }>): React.JSX.Element {
  const [state, setState] = useState<VerificationState>(token ? 'verifying' : 'failed');
  const [message, setMessage] = useState(
    token ? 'Verifying your email…' : 'This verification link is incomplete.',
  );

  useEffect(() => {
    if (!token) return;
    let active = true;
    void verifyEmail(token)
      .then((response) => {
        if (!active) return;
        setState('verified');
        setMessage(response.message);
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState('failed');
        setMessage(error instanceof ApiError ? error.message : 'We could not verify this email.');
      });
    return () => {
      active = false;
    };
  }, [token]);

  const Icon =
    state === 'verifying' ? LoaderCircle : state === 'verified' ? CheckCircle2 : AlertCircle;

  return (
    <main className="grid min-h-dvh place-items-center bg-muted/20 px-5 py-10">
      <section className="w-full max-w-xl rounded-3xl border bg-background p-8 text-center shadow-sm">
        <span className="mx-auto grid size-16 place-items-center rounded-2xl bg-brand/10 text-brand">
          <Icon className={`size-8 ${state === 'verifying' ? 'animate-spin' : ''}`} />
        </span>
        <h1 className="mt-5 font-heading text-3xl font-semibold">
          {state === 'verifying'
            ? 'Verifying email'
            : state === 'verified'
              ? 'Email verified'
              : 'Verification failed'}
        </h1>
        <p className="mt-3 text-muted-foreground">{message}</p>
        {state !== 'verifying' && (
          <Link
            href="/profile"
            className="mt-7 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-6 font-semibold text-brand-foreground"
          >
            {state === 'verified' ? 'Continue to sign in' : 'Return to account access'}
          </Link>
        )}
      </section>
    </main>
  );
}
