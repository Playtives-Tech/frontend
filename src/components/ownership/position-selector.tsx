import { ArrowLeft, Minus, Plus } from 'lucide-react';
import type { Opportunity } from '@/lib/opportunities';
import { formatNaira } from './formatters';

type PositionSelectorProps = Readonly<{
  opportunity: Opportunity;
  quantity: number;
  onQuantityChange: (quantity: number) => void;
  onContinue: () => void;
  onBack: () => void;
}>;

export function PositionSelector({
  opportunity,
  quantity,
  onQuantityChange,
  onContinue,
  onBack,
}: PositionSelectorProps): React.JSX.Element {
  const maximum = opportunity.availableUnits;
  const positionPrice = opportunity.pricePerUnitMinorUnits / 100;
  const total = positionPrice * quantity;
  const filledPositions = opportunity.totalUnits - opportunity.availableUnits;
  return (
    <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 lg:px-10">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex size-11 items-center justify-center rounded-xl border bg-background text-muted-foreground transition hover:bg-muted"
        aria-label="Back to opportunity"
      >
        <ArrowLeft className="size-5" />
      </button>
      <p className="mt-8 text-sm font-semibold uppercase tracking-[0.16em] text-brand">
        Select units
      </p>
      <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">
        Choose your ownership units
      </h1>
      <p className="mt-4 text-lg leading-8 text-muted-foreground">
        Select the number of units you would like to co-own in {opportunity.title}.
      </p>
      <section className="mt-8 rounded-2xl border bg-background p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Price per unit</p>
            <p className="mt-2 text-xl font-semibold">{formatNaira(positionPrice)}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Available now</p>
            <p className="mt-2 text-xl font-semibold">{opportunity.availableUnits}</p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Duration</p>
            <p className="mt-2 text-xl font-semibold">
              {opportunity.durationMonths
                ? `${opportunity.durationMonths} months`
                : 'Not specified'}
            </p>
          </div>
          <div className="rounded-xl bg-surface p-4">
            <p className="text-sm text-muted-foreground">Maximum per member</p>
            <p className="mt-2 text-xl font-semibold">{maximum}</p>
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between gap-4 text-sm">
          <span className="text-muted-foreground">
            {filledPositions} of {opportunity.totalUnits} already selected
          </span>
          <span className="font-semibold text-brand">{opportunity.availableUnits} left</span>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-brand"
            style={{
              width: `${opportunity.totalUnits > 0 ? (filledPositions / opportunity.totalUnits) * 100 : 0}%`,
            }}
          />
        </div>
      </section>
      <section className="mt-5 rounded-2xl border bg-background p-5 sm:p-6">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Number of units</p>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                className="grid size-12 place-items-center rounded-xl border bg-surface text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Minus className="size-5" />
              </button>
              <span className="w-8 text-center text-3xl font-semibold">{quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(Math.min(maximum, quantity + 1))}
                disabled={quantity === maximum}
                className="grid size-12 place-items-center rounded-xl border bg-surface text-brand disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus className="size-5" />
              </button>
            </div>
          </div>
          <div className="sm:text-right">
            <p className="text-sm text-muted-foreground">Total ownership contribution</p>
            <p className="mt-2 font-heading text-3xl font-semibold text-brand">
              {formatNaira(total)}
            </p>
          </div>
        </div>
      </section>
      <div className="sticky bottom-0 z-10 -mx-5 mt-6 border-t bg-background/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <button
          type="button"
          onClick={onContinue}
          className="mx-auto flex h-12 w-full max-w-3xl items-center justify-center rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110"
        >
          Continue to payment →
        </button>
      </div>
    </div>
  );
}
