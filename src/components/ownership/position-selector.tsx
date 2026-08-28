import { ArrowLeft, CheckCircle2, Minus, Plus, TrendingUp, Wallet } from 'lucide-react';
import {
  formatCapitalReturn,
  formatOpportunityTerm,
  formatProjectedDistribution,
  formatReturnSchedule,
  type Opportunity,
} from '@/lib/opportunities';
import { formatNaira } from './formatters';

type PositionSelectorProps = Readonly<{
  opportunity: Opportunity;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  rolloverElection: 'PAYOUT' | 'COMPOUND';
  onRolloverElectionChange: (election: 'PAYOUT' | 'COMPOUND') => void;
  onContinue: () => void;
  onBack: () => void;
}>;

export function PositionSelector({
  opportunity,
  quantity,
  onQuantityChange,
  rolloverElection,
  onRolloverElectionChange,
  onContinue,
  onBack,
}: PositionSelectorProps): React.JSX.Element {
  const maximum = opportunity.availableUnits;
  const unitPrice = opportunity.pricePerUnitMinorUnits / 100;
  const total = unitPrice * quantity;
  const availablePercentage =
    opportunity.totalUnits > 0 ? (opportunity.availableUnits / opportunity.totalUnits) * 100 : 0;
  const filledPercentage = 100 - availablePercentage;
  return (
    <div className="mx-auto max-w-3xl px-4 py-5 sm:px-8 sm:py-8 lg:px-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex size-11 items-center justify-center rounded-xl border bg-background text-muted-foreground transition hover:bg-muted"
        aria-label="Back to opportunity"
      >
        <ArrowLeft className="size-5" />
      </button>
      <h1 className="mt-5 font-sans text-[22px] font-semibold tracking-tight">
        How many units would you like to take?
      </h1>
      <p className="text-[13px] leading-5 text-muted-foreground">
        Choose your units in {opportunity.title}. We will calculate the contribution and projected
        profit automatically.
      </p>
      <section className="mt-6 rounded-xl border bg-background p-4 sm:mt-8 sm:rounded-2xl sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface p-3 sm:p-4">
            <p className="text-sm text-muted-foreground">Price per unit</p>
            <p className="mt-2 text-[15px] font-semibold">{formatNaira(unitPrice)}</p>
          </div>
          <div className="rounded-xl bg-surface p-3 sm:p-4">
            <p className="text-sm text-muted-foreground">Availability</p>
            <p className="mt-2 text-[15px] font-semibold">{Math.round(availablePercentage)}% available</p>
          </div>
          <div className="rounded-xl bg-surface p-3 sm:p-4">
            <p className="text-sm text-muted-foreground">Term</p>
            <p className="mt-2 text-[15px] font-semibold">{formatOpportunityTerm(opportunity)}</p>
          </div>
          <div className="rounded-xl bg-surface p-3 sm:p-4">
            <p className="text-sm text-muted-foreground">Capital return</p>
            <p className="mt-2 text-[15px] font-semibold leading-5">
              {formatCapitalReturn(opportunity)}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-3 sm:p-4">
            <p className="text-sm text-muted-foreground">Projected distribution</p>
            <p className="mt-2 text-[15px] font-semibold leading-5">
              {formatProjectedDistribution(opportunity)} ·{' '}
              {formatReturnSchedule(opportunity.returnSchedule).toLowerCase()}
            </p>
          </div>
          {/* <div className="rounded-xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Maximum per member</p>
            <p className="mt-2 text-xl font-semibold">{maximum}</p>
          </div> */}
        </div>
        <div className="mt-6 flex items-center justify-end text-sm">
          <span className="font-semibold text-brand">{Math.round(availablePercentage)}% available</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand"
            style={{
              width: `${filledPercentage}%`,
            }}
          />
        </div>
      </section>
      <section className="mt-4 rounded-xl border bg-background p-4 sm:mt-5 sm:rounded-2xl sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Number of units</p>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                className="grid size-10 place-items-center rounded-[10px] border bg-surface text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-3" />
              </button>
              <span className="w-8 text-center text-xl font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(Math.min(maximum, quantity + 1))}
                disabled={quantity === maximum}
                className="grid size-10 place-items-center rounded-[10px] border bg-surface text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-3" />
              </button>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-muted-foreground">Total ownership contribution</p>
            <p className="mt-2 font-sans text-xl font-semibold text-brand">{formatNaira(total)}</p>
          </div>
        </div>
      </section>
      {opportunity.rolloverAllowed ? (
        <section className="mt-4 rounded-xl border bg-background p-4 sm:mt-5 sm:rounded-2xl sm:p-6">
          <div className="flex items-start gap-3">
            <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand">
              <TrendingUp className="size-4.5" />
            </span>
            <div>
              <h2 className="font-sans text-base font-semibold">Choose how to receive monthly profit</h2>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">
                Select a monthly cash payout or add approved profit to your contribution for the
                next calculation.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => onRolloverElectionChange('PAYOUT')}
              aria-pressed={rolloverElection === 'PAYOUT'}
              className={`relative rounded-xl border p-4 text-left transition ${rolloverElection === 'PAYOUT' ? 'border-brand bg-brand/5 ring-1 ring-brand/20' : 'hover:border-brand/30 hover:bg-muted/50'}`}
            >
              {rolloverElection === 'PAYOUT' ? (
                <CheckCircle2 className="absolute right-3 top-3 size-4 text-brand" />
              ) : null}
              <span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand">
                <Wallet className="size-4.5" />
              </span>
              <span className="mt-3 block text-sm font-semibold">Pay to wallet</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Receive each approved monthly profit in your earnings wallet.
              </span>
            </button>
            <button
              type="button"
              onClick={() => onRolloverElectionChange('COMPOUND')}
              aria-pressed={rolloverElection === 'COMPOUND'}
              className={`relative rounded-xl border p-4 text-left transition ${rolloverElection === 'COMPOUND' ? 'border-brand bg-brand/5 ring-1 ring-brand/20' : 'hover:border-brand/30 hover:bg-muted/50'}`}
            >
              {rolloverElection === 'COMPOUND' ? (
                <CheckCircle2 className="absolute right-3 top-3 size-4 text-brand" />
              ) : null}
              <span className="grid size-9 place-items-center rounded-lg bg-brand/10 text-brand">
                <TrendingUp className="size-4.5" />
              </span>
              <span className="mt-3 block text-sm font-semibold">Grow my contribution</span>
              <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                Add approved profit to capital for the next monthly calculation.
              </span>
            </button>
          </div>
        </section>
      ) : null}
      <div className="sticky bottom-0 z-10 -mx-4 mt-5 border-t bg-background/95 px-4 py-3 backdrop-blur sm:-mx-8 sm:mt-6 sm:px-8 sm:py-4 lg:-mx-10 lg:px-10">
        <button
          type="button"
          onClick={onContinue}
          className="mx-auto flex h-12 w-full max-w-3xl items-center justify-center rounded-xl bg-brand px-5 text-[14px] font-semibold text-brand-foreground transition hover:brightness-110 sm:h-14"
        >
          Continue to payment →
        </button>
      </div>
    </div>
  );
}
