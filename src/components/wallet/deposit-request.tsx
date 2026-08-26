'use client';

import { Check, CircleAlert, Copy, ShieldCheck, Upload } from 'lucide-react';
import { type FormEvent, useEffect, useState } from 'react';
import { BackButton } from '@/components/ui/back-button';
import { ButtonLoadingContent } from '@/components/ui/loading-indicator';
import { notify } from '@/lib/notify';
import {
  createDepositRequest,
  getDepositRequests,
  getWalletFundingDetails,
  initializePaystackWalletFunding,
  type DepositRequestRecord,
  type WalletFundingDetails,
} from '@/lib/services/wallet-service';

export function DepositRequest(): React.JSX.Element {
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<File | null>(null);
  const [amount, setAmount] = useState('');
  const [narration, setNarration] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cardAmount, setCardAmount] = useState('');
  const [isStartingCardPayment, setIsStartingCardPayment] = useState(false);
  const [requests, setRequests] = useState<DepositRequestRecord[]>([]);
  const [fundingDetails, setFundingDetails] = useState<WalletFundingDetails | null>(null);
  useEffect(() => {
    void getDepositRequests()
      .then(setRequests)
      .catch(() => undefined);
    void getWalletFundingDetails()
      .then(setFundingDetails)
      .catch(() => notify.error('Wallet funding details could not be loaded.'));
  }, []);
  async function copyAccountNumber(): Promise<void> {
    if (!fundingDetails) return;
    await navigator.clipboard.writeText(fundingDetails.accountNumber);
    setCopied(true);
    notify.success('Account number copied');
  }
  async function submit(event: FormEvent): Promise<void> {
    event.preventDefault();
    const amountInNaira = Number(amount.replace(/,/g, ''));
    if (!Number.isInteger(amountInNaira) || amountInNaira < 1) {
      notify.error('Enter a valid whole-naira deposit amount.');
      return;
    }
    if (!narration.trim()) {
      notify.error('Enter the payment narration used for this transfer.');
      return;
    }
    setIsSubmitting(true);
    try {
      const request = await createDepositRequest({
        amountMinorUnits: amountInNaira * 100,
        narration: narration.trim(),
        receipt: receipt!,
      });
      setAmount('');
      setNarration('');
      setReceipt(null);
      setRequests((current) => [request, ...current]);
      notify.success('Deposit request submitted', {
        description: 'Your receipt is awaiting admin review.',
      });
    } catch (error: unknown) {
      notify.error(
        error instanceof Error ? error.message : 'Deposit request could not be submitted.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }
  async function startCardPayment(event: FormEvent): Promise<void> {
    event.preventDefault();
    const amountInNaira = Number(cardAmount.replace(/,/g, ''));
    if (!Number.isInteger(amountInNaira) || amountInNaira < 1) {
      notify.error('Enter a valid whole-naira amount.');
      return;
    }
    setIsStartingCardPayment(true);
    try {
      const checkout = await initializePaystackWalletFunding(amountInNaira * 100);
      window.location.assign(checkout.authorizationUrl);
    } catch (error: unknown) {
      notify.error(error instanceof Error ? error.message : 'Card checkout could not be started.');
      setIsStartingCardPayment(false);
    }
  }
  return (
    <div className="mx-auto max-w-2xl px-5 py-6 sm:px-8 lg:px-10">
      <BackButton label="Wallet" />
      <h1 className="mt-6 font-sans text-[18px] font-semibold">Fund your wallet</h1>
      <p className="text-sm leading-6 text-muted-foreground">
        Make an instant online deposit, or use a bank transfer and submit your receipt.
      </p>
      <form onSubmit={(event) => void startCardPayment(event)} className="mt-6 overflow-hidden rounded-2xl border border-brand/20 bg-background shadow-sm">
        <div className="border-b border-brand/10 bg-brand/[0.045] px-5 py-6 sm:px-6">
          <div className="flex flex-col ">
            {/* <span className="grid size-11 place-items-center rounded-xl bg-brand text-white shadow-sm">
              <ShieldCheck className="size-5" />
            </span> */}
            <h2 className="font-sans text-lg font-semibold">Deposit online</h2>
            <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">
              Enter an amount to deposit securely. Your balance updates after verification.
            </p>
          </div>
        </div>
        <div className="p-5 sm:p-6">
          <label className="block text-sm font-medium">
            Deposit amount (NGN)
            <input
              inputMode="numeric"
              value={cardAmount}
              onChange={(event) => setCardAmount(event.target.value.replace(/[^0-9,]/g, ''))}
              placeholder="250,000"
              className="mt-2 h-12 w-full rounded-xl border bg-background px-4 text-base outline-none transition focus:ring-2 focus:ring-brand"
            />
          </label>
          <div className="mt-3 flex gap-2.5 rounded-xl border border-amber-500/20 bg-amber-500/[0.06] p-3 text-xs leading-5 text-muted-foreground">
            <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-700" />
            <p>
              Enter the exact amount you intend to deposit. Confirm any applicable charge shown by
              Paystack before continuing, and complete transfers for the exact checkout amount to
              avoid a delay or reversal.
            </p>
          </div>
          <button
            type="submit"
            disabled={!cardAmount || isStartingCardPayment}
            className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            <ButtonLoadingContent loading={isStartingCardPayment} loadingLabel="Opening deposit">
              Continue to deposit
            </ButtonLoadingContent>
          </button>
        </div>
      </form>
      <div className="my-6 flex items-center gap-3 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
        Or fund by transfer
      </div>
      <section className="mt-6 rounded-xl border bg-background p-5">
        <p className="text-xs text-muted-foreground">Account number</p>
        <div className="mt-2 flex items-center justify-between gap-4">
          <p className="font-sans text-2xl font-semibold tracking-wider">
            {fundingDetails?.accountNumber ?? 'Loading…'}
          </p>
          <button
            type="button"
            onClick={() => void copyAccountNumber()}
            disabled={!fundingDetails}
            className="grid size-11 place-items-center rounded-xl border text-brand transition hover:bg-muted"
            aria-label="Copy account number"
          >
            {copied ? <Check className="size-5" /> : <Copy className="size-5" />}
          </button>
        </div>
        <div className="mt-5 grid gap-4 border-t pt-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Bank</p>
            <p className="mt-1 text-sm font-semibold">{fundingDetails?.bankName ?? '—'}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Account name</p>
            <p className="mt-1 text-sm font-semibold">{fundingDetails?.accountName ?? '—'}</p>
          </div>
        </div>
      </section>
      <form
        onSubmit={(event) => void submit(event)}
        className="mt-5 rounded-xl border bg-background p-5"
      >
        <h2 className="font-sans text-lg font-semibold">Submit payment receipt</h2>
        <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
          Upload the receipt generated by your bank. An administrator will verify it before
          crediting your wallet.
        </p>
        <label className="mt-4 block text-sm font-medium">
          Amount (NGN)
          <input
            inputMode="numeric"
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/[^0-9,]/g, ''))}
            placeholder="250,000"
            className="mt-2 h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
        </label>
        <label className="mt-4 block text-sm font-medium">
          Transfer narration
          <input
            value={narration}
            onChange={(event) => setNarration(event.target.value.toUpperCase())}
            placeholder="e.g. PLAYTIVES-WALLET-FUNDING"
            maxLength={160}
            className="mt-2 h-11 w-full rounded-xl border bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-brand"
          />
          <span className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
            Required. Enter the narration you used when making this wallet funding transfer.
          </span>
        </label>
        <label className="mt-4 block text-sm font-medium">
          Payment receipt
          <span className="mt-2 flex min-h-20 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-background p-4 text-center text-sm text-muted-foreground hover:border-brand">
            <Upload className="mb-2 size-5 text-brand" />
            {receipt ? receipt.name : 'Choose a JPEG, PNG, WebP, or PDF receipt'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp,application/pdf,.pdf"
              className="sr-only"
              onChange={(event) => setReceipt(event.target.files?.[0] ?? null)}
            />
          </span>
        </label>
        <button
          type="submit"
          disabled={!receipt || !amount || !narration.trim() || isSubmitting}
          className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ButtonLoadingContent loading={isSubmitting} loadingLabel="Submitting">
            Submit deposit request
          </ButtonLoadingContent>
        </button>
      </form>
      <section className="mt-6 rounded-xl border bg-background p-4">
        <h2 className="font-sans text-[16px] font-semibold">Deposit history</h2>
        <div className="mt-3 divide-y">
          {requests.map((request) => (
            <div key={request._id} className="flex items-center justify-between gap-4 py-3 text-sm">
              <div>
                <p className="font-semibold">
                  ₦{(request.amountMinorUnits / 100).toLocaleString('en-NG')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(request.createdAt).toLocaleString('en-NG')}
                </p>
                <p className="mt-1 max-w-56 truncate font-mono text-[11px] text-muted-foreground" title={request.narration}>
                  {request.narration}
                </p>
              </div>
              <span className="rounded-full bg-muted px-5 py-1 text-[11px] font-semibold uppercase">
                {request.status}
              </span>
            </div>
          ))}
          {requests.length === 0 ? (
            <p className="py-4 text-sm text-muted-foreground">No deposit requests yet.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}
