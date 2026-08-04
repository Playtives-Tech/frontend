'use client';
import Link from 'next/link';
import { useState } from 'react';
import { notify } from '@/lib/notify';
export default function BankAccountPage(): React.JSX.Element {
  const [number, setNumber] = useState('');
  const [linked, setLinked] = useState(false);
  const verified = number.length === 10;
  return (
    <div className="mx-auto max-w-3xl px-5 py-8">
      <Link href="/profile" className="rounded-lg border px-3 py-2 text-sm font-semibold">
        ← Back to profile
      </Link>
      <h1 className="mt-8 font-heading text-3xl font-semibold">Linked bank account</h1>
      <p className="mt-3 text-muted-foreground">
        Add an account only after its holder name has been verified.
      </p>
      <section className="mt-7 rounded-2xl border bg-background p-6">
        <label className="grid gap-2 text-sm font-semibold">
          Account number
          <input
            value={number}
            onChange={(event) => setNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
            inputMode="numeric"
            className="h-12 rounded-xl border bg-background px-4"
            placeholder="10-digit account number"
          />
        </label>
        {verified && (
          <div className="mt-5 rounded-xl bg-brand/5 p-4">
            <p className="text-sm text-muted-foreground">Verified account name</p>
            <p className="mt-1 font-semibold">Gabriel Ola</p>
          </div>
        )}
        <button
          type="button"
          disabled={!verified}
          onClick={() => {
            setLinked(true);
            notify.success('Bank account linked');
          }}
          className="mt-5 h-11 w-full rounded-xl bg-brand font-semibold text-brand-foreground disabled:opacity-40"
        >
          Add verified account
        </button>
        {linked && (
          <button
            type="button"
            onClick={() => {
              setLinked(false);
              notify.info('Bank account removed');
            }}
            className="mt-4 w-full rounded-xl border py-3 text-sm font-semibold text-red-600"
          >
            Remove linked account
          </button>
        )}
      </section>
    </div>
  );
}
