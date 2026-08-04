'use client';

import { Check, Copy, FileUp } from 'lucide-react';
import { useState } from 'react';
import { notify } from '@/lib/notify';

const accountNumber = '0123456789';

export function DepositRequest(): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [receiptName, setReceiptName] = useState('');
  async function copyAccountNumber(): Promise<void> {
    await navigator.clipboard.writeText(accountNumber);
    setCopied(true);
    notify.success('Account number copied');
  }
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand">Wallet funding</p>
      <h1 className="mt-2 font-heading text-3xl font-semibold">Fund your wallet</h1>
      <p className="mt-3 text-muted-foreground">
        Make a transfer to the account below, then submit your receipt for admin approval.
      </p>
      <section className="mt-8 rounded-2xl border bg-background p-6">
        <p className="text-sm text-muted-foreground">Account number</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="font-heading text-3xl font-semibold tracking-wider">{accountNumber}</p>
          <button
            type="button"
            onClick={copyAccountNumber}
            className="grid size-11 place-items-center rounded-xl border text-brand transition hover:bg-muted"
            aria-label="Copy account number"
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
          </button>
        </div>
        <div className="mt-6 grid gap-4 border-t pt-5 sm:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">Bank</p>
            <p className="mt-1 font-semibold">GTBank</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Account name</p>
            <p className="mt-1 font-semibold">Playtives Technologies Ltd</p>
          </div>
        </div>
      </section>
      <section className="mt-6 rounded-2xl border bg-background p-6">
        <h2 className="font-heading text-xl font-semibold">Submit proof of payment</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Receipt submissions are reviewed by an administrator before your wallet is credited.
        </p>
        <label className="mt-5 flex cursor-pointer items-center gap-3 rounded-xl border border-dashed p-4 transition hover:bg-muted">
          <FileUp className="size-5 text-brand" />
          <span className="min-w-0 flex-1 text-sm font-medium">
            {receiptName || 'Upload transfer receipt'}
          </span>
          <input
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={(event) => setReceiptName(event.target.files?.[0]?.name ?? '')}
          />
        </label>
        <button
          type="button"
          disabled={!receiptName}
          onClick={() =>
            notify.success('Deposit request submitted', {
              description: 'Your receipt is awaiting admin review.',
            })
          }
          className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          Submit deposit request
        </button>
      </section>
      <p className="mt-5 text-sm leading-6 text-muted-foreground">
        Wallet balances are only credited after the server validates an approved deposit request.
      </p>
    </div>
  );
}
