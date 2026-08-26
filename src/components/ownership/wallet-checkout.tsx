import { ArrowLeft, ArrowRight, Check, Copy, WalletCards } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { ButtonLoadingContent } from '@/components/ui/loading-indicator';
import { BalanceAmount } from '@/components/ui/balance-amount';
import {
  formatCapitalReturn,
  formatProjectedDistribution,
  formatProjectedReturnRate,
  formatReturnSchedule,
  isVariableDistribution,
  type Opportunity,
} from '@/lib/opportunities';
import {
  acquireOpportunity,
  createOwnershipPaymentNarration,
} from '@/lib/services/ownership-service';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';
import { formatNaira } from './formatters';

type WalletCheckoutProps = Readonly<{
  opportunity: Opportunity;
  quantity: number;
  agreementAccepted: boolean;
  onBack: () => void;
}>;

export function WalletCheckout({
  opportunity,
  quantity,
  agreementAccepted,
  onBack,
}: WalletCheckoutProps): React.JSX.Element {
  const [wallet, setWallet] = useState<WalletSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [narrationCopied, setNarrationCopied] = useState(false);
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
  const narration = createOwnershipPaymentNarration(opportunity.slug, quantity);
  const copyNarration = async () => {
    await navigator.clipboard.writeText(narration);
    setNarrationCopied(true);
  };
  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const ownership = await acquireOpportunity(
        opportunity,
        quantity,
        narration,
        opportunity.agreementVersion ?? '1.0',
        idempotencyKey.current,
      );
      router.replace(`/ownership/${ownership._id}`);
      router.refresh();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'The acquisition could not be completed');
      setSubmitting(false);
    }
  };
  return (
    <div className="mx-auto max-w-3xl px-5 py-7 sm:px-8 lg:px-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition hover:bg-muted"
        aria-label="Back to unit selection"
      >
        <ArrowLeft className="size-5" />
      </button>
      <h1 className="mt-7 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">
        Complete your ownership contribution
      </h1>
      <p className="mt-1.5 text-sm text-muted-foreground">
        Review your units and confirm payment from your wallet.
      </p>
      <section className="mt-6 rounded-xl border bg-background p-4 sm:p-5">
        <dl className="grid divide-y">
          <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <dt>
              <p className="text-sm font-semibold">Ownership model</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your selected participation type
              </p>
            </dt>
            <dd className="text-sm font-semibold">
              {opportunity.ownershipModel.replace('_', ' ')}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold">Units</dt>
            <dd className="text-sm font-semibold">{quantity}</dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold">Projected distribution rate</dt>
            <dd className="text-sm font-semibold text-brand">
              {formatProjectedReturnRate(opportunity)} · {formatReturnSchedule(opportunity.returnSchedule)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold">
              Projected {formatReturnSchedule(opportunity.returnSchedule).toLowerCase()} distribution
            </dt>
            <dd className="text-sm font-semibold">
              {formatProjectedDistribution(opportunity, quantity)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold">Capital return</dt>
            <dd className="max-w-[55%] text-right text-sm font-semibold leading-5">
              {formatCapitalReturn(opportunity)}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 pt-3">
            <dt className="text-sm font-semibold">Total contribution</dt>
            <dd className="text-lg font-semibold">{formatNaira(total)}</dd>
          </div>
        </dl>
      </section>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">
        {isVariableDistribution(opportunity)
          ? 'The displayed amount is the projected monthly distribution for your selected units.'
          : 'The displayed amount is the projected return for your selected units.'}
      </p>
      <section className="mt-5 rounded-xl border border-amber-500/25 bg-amber-500/5 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="font-sans text-sm font-semibold">Payment narration</h2>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Required for this offer. This narration is generated from your selected units and
              recorded with your payment.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void copyNarration()}
            className="inline-flex h-8 items-center gap-1.5 rounded-lg border bg-background px-2.5 text-xs font-semibold text-brand transition hover:bg-muted"
          >
            {narrationCopied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            {narrationCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <code className="mt-3 block rounded-lg border border-amber-500/15 bg-background px-3 py-2 text-xs font-semibold tracking-wide text-foreground">
          {narration}
        </code>
      </section>
      <section className="mt-6">
        <h2 className="font-sans text-lg font-semibold">Pay from wallet</h2>
        <div className="mt-3 rounded-xl border border-brand/30 bg-brand/5 p-4">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-lg bg-brand/10 text-brand">
              <WalletCards className="size-5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Wallet balance</p>
              <div className="mt-0.5 text-xl text-muted-foreground">
                <BalanceAmount value={formatNaira(walletBalance)} toggle />
              </div>
            </div>
          </div>
          {!hasFunds && (
            <div className="mt-4 border-t border-brand/15 pt-4">
              <p className="text-xs leading-5 text-muted-foreground">
                Your wallet balance is below the contribution amount. Add funds before you continue.
              </p>
              <Link
                href="/wallet"
                className="mt-3 inline-flex items-center gap-2 rounded-lg border border-brand/30 bg-background px-3 py-2 text-xs font-semibold text-brand transition hover:bg-brand/5"
              >
                Top up wallet <ArrowRight className="size-4" />
              </Link>
            </div>
          )}
        </div>
      </section>
      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-6 rounded-xl border p-4 text-sm">
          {error}
        </p>
      )}
      <div className="sticky bottom-0 z-10 -mx-5 mt-8 border-t bg-background/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <button
          type="button"
          disabled={!hasFunds || !agreementAccepted || submitting}
          onClick={() => void confirm()}
          className="mx-auto flex h-12 w-full max-w-3xl items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ButtonLoadingContent
            loading={submitting}
            loadingLabel="Securing units"
            icon={<ArrowRight className="size-5" />}
          >
            Confirm {formatNaira(total)}
          </ButtonLoadingContent>
        </button>
      </div>
    </div>
  );
}
