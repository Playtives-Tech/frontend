import { ArrowLeft, ArrowRight, Check, CircleAlert, WalletCards } from 'lucide-react';
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
import { acquireOpportunity } from '@/lib/services/ownership-service';
import { getWallet, type WalletSummary } from '@/lib/services/wallet-service';
import { formatNaira } from './formatters';

type WalletCheckoutProps = Readonly<{
  opportunity: Opportunity;
  quantity: number;
  agreementAccepted: boolean;
  onAgreementAcceptedChange: (accepted: boolean) => void;
  rolloverElection: 'PAYOUT' | 'COMPOUND';
  onBack: () => void;
}>;

export function WalletCheckout({
  opportunity,
  quantity,
  agreementAccepted,
  onAgreementAcceptedChange,
  rolloverElection,
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
  const hasFunds = wallet !== null && walletBalance >= total;
  const shortfall = Math.max(0, total - walletBalance);
  const agreementRequired = Boolean(opportunity.agreement.trim());
  const confirm = async () => {
    setSubmitting(true);
    setError('');
    try {
      const ownership = await acquireOpportunity(
        opportunity,
        quantity,
        opportunity.agreementVersion ?? '1.0',
        idempotencyKey.current,
        rolloverElection,
      );
      router.replace(`/ownership/${ownership._id}`);
      router.refresh();
    } catch (value) {
      setError(value instanceof Error ? value.message : 'The acquisition could not be completed');
      setSubmitting(false);
    }
  };
  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-8 sm:py-7 lg:px-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex size-10 items-center justify-center rounded-xl border bg-background text-muted-foreground transition hover:bg-muted"
        aria-label="Back to unit selection"
      >
        <ArrowLeft className="size-5" />
      </button>
      <h1 className="mt-5 font-sans text-[20px] font-semibold tracking-tight sm:mt-7 sm:text-[25px]">
        Complete your ownership contribution
      </h1>
      <p className="text-[14px] text-muted-foreground">
        Review your units and confirm payment from your wallet.
      </p>
      <section className="mt-5 rounded-xl border bg-background p-3.5 sm:mt-6 sm:p-5">
        <dl className="grid divide-y">
          <div className="flex items-center justify-between gap-4 py-3 first:pt-0">
            <dt>
              <p className="text-sm font-semibold">Ownership model</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Your selected participation type
              </p>
            </dt>
            <dd className="text-sm font-semibold">
              {opportunity.opportunityStructure.replaceAll('_', '-')}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold">Units</dt>
            <dd className="text-sm font-semibold">{quantity}</dd>
          </div>
          {opportunity.rolloverAllowed ? (
            <div className="flex items-center justify-between gap-4 py-3">
              <dt className="text-sm font-semibold">Monthly profit preference</dt>
              <dd className="max-w-[55%] text-right text-sm font-semibold leading-5 text-brand">
                {rolloverElection === 'COMPOUND' ? 'Roll into contribution' : 'Pay to wallet'}
              </dd>
            </div>
          ) : null}
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold">Projected distribution rate</dt>
            <dd className="text-sm font-semibold text-brand">
              {formatProjectedReturnRate(opportunity)}{' '}
              {formatReturnSchedule(opportunity.returnSchedule).toLowerCase()}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-sm font-semibold">
              Projected {formatReturnSchedule(opportunity.returnSchedule).toLowerCase()}{' '}
              distribution
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
      <section className="mt-5 sm:mt-6">
        <h2 className="font-sans text-lg font-semibold">Pay from wallet</h2>
        <div className="mt-3 rounded-xl border border-brand/30 bg-brand/5 p-3 sm:p-4">
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
          {wallet !== null && !hasFunds ? (
            <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-3.5">
              <div className="flex items-start gap-3">
                <CircleAlert className="mt-0.5 size-5 shrink-0 text-destructive" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Insufficient wallet balance</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    You need <strong className="text-foreground">{formatNaira(shortfall)} more</strong>{' '}
                    to complete this contribution.
                  </p>
                </div>
              </div>
              <Link
                href="/wallet/deposit"
                className="mt-3 inline-flex items-center gap-2 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-brand-foreground transition hover:brightness-110"
              >
                Add {formatNaira(shortfall)} <ArrowRight className="size-4" />
              </Link>
            </div>
          ) : null}
        </div>
      </section>
      {agreementRequired ? (
        <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl border bg-background p-4 transition hover:border-brand/30 sm:mt-6">
          <input
            type="checkbox"
            checked={agreementAccepted}
            onChange={(event) => onAgreementAcceptedChange(event.target.checked)}
            className="peer sr-only"
          />
          <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md border border-border bg-background text-white transition peer-checked:border-brand peer-checked:bg-brand">
            {agreementAccepted ? <Check className="size-3.5" /> : null}
          </span>
          <span>
            <span className="block text-sm font-semibold text-foreground">
              I have read and agree to the opportunity agreement
            </span>
            <span className="mt-1 block text-xs leading-5 text-muted-foreground">
              I understand the opportunity details, projected returns, and participation terms.
            </span>
          </span>
        </label>
      ) : null}
      {error && (
        <p className="border-destructive/30 bg-destructive/5 text-destructive mt-6 rounded-xl border p-4 text-sm">
          {error}
        </p>
      )}
      <div className="sticky bottom-0 z-10 -mx-4 mt-6 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:mt-8 sm:px-8 sm:py-4 lg:-mx-10 lg:px-10">
        {wallet !== null && !hasFunds ? (
          <p className="mx-auto mb-2 flex max-w-3xl items-center justify-center gap-1.5 text-xs font-semibold text-destructive">
            <CircleAlert className="size-3.5" />
            Add {formatNaira(shortfall)} more to continue
          </p>
        ) : null}
        <button
          type="button"
          disabled={!hasFunds || (agreementRequired && !agreementAccepted) || submitting}
          onClick={() => void confirm()}
          className="mx-auto flex h-12 w-full max-w-3xl items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
        >
          <ButtonLoadingContent
            loading={submitting}
            loadingLabel="Securing units"
            icon={<ArrowRight className="size-5" />}
          >
            {wallet !== null && !hasFunds
              ? `Insufficient balance — ${formatNaira(shortfall)} needed`
              : `Confirm ${formatNaira(total)}`}
          </ButtonLoadingContent>
        </button>
      </div>
    </div>
  );
}
