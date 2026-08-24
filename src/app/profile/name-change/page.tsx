'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { CheckCircle2, FilePenLine } from 'lucide-react';
import { completeNameChange } from '@/lib/services/profile-service';

export default function NameChangePage(): React.JSX.Element {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [name, setName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [complete, setComplete] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    const fullName = name.trim().replace(/\s+/g, ' ');
    if (fullName.length < 2) return setError('Enter your full name.');
    if (!token) return setError('This name change link is invalid.');

    setError(null);
    setIsSubmitting(true);
    try {
      await completeNameChange(token, fullName);
      setComplete(true);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Could not update your name.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="app-background grid min-h-dvh place-items-center px-5 py-10">
      <section className="w-full max-w-md rounded-2xl border bg-background p-6 sm:p-8">
        {complete ? (
          <div className="text-center">
            <span className="mx-auto grid size-12 place-items-center rounded-full bg-brand/10 text-brand">
              <CheckCircle2 className="size-6" />
            </span>
            <h1 className="mt-4 font-sans text-xl font-semibold">Your name has been updated</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Sign in again to refresh your Playtives profile.
            </p>
            <Link href="/sign-in" className="mt-6 inline-flex h-10 items-center rounded-lg bg-brand px-4 text-sm font-semibold text-white">
              Go to sign in
            </Link>
          </div>
        ) : (
          <>
            <span className="grid size-11 place-items-center rounded-xl bg-brand/10 text-brand">
              <FilePenLine className="size-5" />
            </span>
            <h1 className="mt-4 font-sans text-xl font-semibold">Update your full name</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This secure link was sent after your request was reviewed by Playtives support.
            </p>
            <form className="mt-6" onSubmit={(event) => void submit(event)}>
              <label htmlFor="full-name" className="text-xs font-semibold">Full name</label>
              <input
                id="full-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                maxLength={100}
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3 text-sm outline-none transition focus:border-brand"
                placeholder="Enter your correct full name"
              />
              {error ? <p className="mt-2 text-xs text-red-600">{error}</p> : null}
              <button disabled={isSubmitting || !token} className="mt-5 h-11 w-full rounded-lg bg-brand text-sm font-semibold text-white disabled:opacity-60">
                {isSubmitting ? 'Updating name…' : 'Update full name'}
              </button>
            </form>
          </>
        )}
      </section>
    </main>
  );
}
