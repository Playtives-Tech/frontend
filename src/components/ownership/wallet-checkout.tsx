import { ArrowLeft, ArrowRight, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import type { Opportunity } from '@/lib/opportunities';
import { acquireOpportunity } from '@/lib/services/ownership-service';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';
import { formatNaira } from './formatters';

type WalletCheckoutProps = Readonly<{
  opportunity: Opportunity;
  quantity: number;
  onBack: () => void;
}>;

export function WalletCheckout({
  opportunity,
  quantity,
  onBack,
}: WalletCheckoutProps): React.JSX.Element {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const idempotencyKey = useRef(crypto.randomUUID());
  const router = useRouter();
  useEffect(() => {
    void getWallet()
      .then(setWallet)
      .catch(() => undefined);
  }, []);
  const walletBalance = (wallet?.totalAvailableBalanceMinorUnits ?? 0) / 100;
  const total = (opportunity.pricePerUnitMinorUnits / 100) * quantity;
  const hasFunds = walletBalance >= total;
  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const ownership = await acquireOpportunity(opportunity, quantity, idempotencyKey.current);
      router.replace(`/ownership/${ownership._id}`);
      router.refresh();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'The acquisition could not be completed');
      setSubmitting(false);
    }
  };
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex size-11 items-center justify-center rounded-xl border bg-background text-muted-foreground transition hover:bg-muted"
        aria-label="Back to position selection"
      >
        <ArrowLeft className="size-5" />
      </button>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        Secure checkout
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">
        Complete your ownership contribution
      </h1>
      <section className="mt-8 rounded-2xl border bg-background p-5 sm:p-6">
        <dl className="grid divide-y">
          <div className="flex items-center justify-between gap-4 py-4 first:pt-0">
            <dt>
              <p className="font-semibold">Ownership model</p>
              <p className="mt-1 text-sm text-muted-foreground">{opportunity.ownershipModel}</p>
            </dt>
            <dd className="font-semibold">{opportunity.ownershipModel}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-4">
            <dt className="font-semibold">Positions</dt>
            <dd className="font-semibold">{quantity}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-4">
            <dt className="font-semibold">Total contribution</dt>
            <dd className="text-xl font-semibold">{formatNaira(total)}</dd>
          </div>
        </dl>
      </section>
      <section className="mt-8">
        <h2 className="font-heading text-2xl font-semibold">Pay from wallet</h2>
        <div className="mt-4 rounded-2xl border border-brand/30 bg-brand/5 p-5">
          <div className="flex items-center gap-4">
            <span className="grid size-12 place-items-center rounded-xl bg-brand/10 text-brand">
              <WalletCards className="size-6" />
            </span>
            <div>
              <p className="font-semibold">Wallet balance</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {formatNaira(walletBalance)} available
              </p>
            </div>
          </div>
          {!hasFunds && (
            <div className="mt-5 border-t border-brand/15 pt-5">
              <p className="text-sm leading-6 text-muted-foreground">
                Your wallet balance is below the contribution amount. Add funds before you continue.
              </p>
              <Link
                href="/wallet"
                className="mt-4 inline-flex items-center gap-2 rounded-xl border border-brand/30 bg-background px-4 py-2.5 text-sm font-semibold text-brand transition hover:bg-brand/5"
              >
                Top up wallet <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
      {error && <p className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}
      <div className="sticky bottom-0 z-10 -mx-5 mt-8 border-t bg-background/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <button
          type="button"
          disabled={!hasFunds || submitting}
          onClick={() => void confirm()}
          className="mx-auto flex h-12 w-full max-w-3xl items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
        >
          {submitting ? 'Securing positions…' : `Confirm ${formatNaira(total)}`} <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
