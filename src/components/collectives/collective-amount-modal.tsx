'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { notify } from '@/lib/notify';
import { formatCollectiveMoney } from './collective-ui';

export type CollectiveAmountAction = 'monthlyPlan';

export function CollectiveAmountModal({
  action,
  availableMinorUnits,
  initialAmountMinorUnits,
  onClose,
  onSubmit,
}: Readonly<{
  action: CollectiveAmountAction;
  availableMinorUnits: number | null;
  initialAmountMinorUnits?: number | null;
  onClose: () => void;
  onSubmit: (amountMinorUnits: number) => Promise<boolean>;
}>): React.JSX.Element {
  const [amount, setAmount] = useState(
    initialAmountMinorUnits ? String(initialAmountMinorUnits / 100) : '',
  );
  const [submitting, setSubmitting] = useState(false);
  const labels = {
    monthlyPlan: {
      title: 'Set Monthly Commitment',
      source: 'Your monthly commitment',
      note: 'This is a personal plan only. No money is deducted automatically.',
      button: 'Save commitment',
    },
  }[action];
  const amountMinorUnits = Math.round(Number(amount) * 100);
  const valid =
    amount.trim() !== '' &&
    Number.isSafeInteger(amountMinorUnits) &&
    amountMinorUnits > 0 &&
    (availableMinorUnits === null || amountMinorUnits <= availableMinorUnits);
  const submit = async (): Promise<void> => {
    if (!valid) {
      notify.error(
        availableMinorUnits !== null && amountMinorUnits > availableMinorUnits
          ? 'Amount exceeds your available balance.'
          : 'Enter a valid amount.',
      );
      return;
    }
    setSubmitting(true);
    try {
      if (await onSubmit(amountMinorUnits)) onClose();
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <div
      aria-labelledby="collective-amount-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-end bg-black/45 backdrop-blur-sm sm:place-items-center sm:p-4"
      role="dialog"
    >
      <section className="max-h-[100dvh] w-full overflow-y-auto rounded-t-2xl border bg-background p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:w-1/2 sm:max-w-none sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            {/* <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Wealth Collective
            </p> */}
            <h2 className="mt-1 text-xl font-semibold" id="collective-amount-title">
              {labels.title}
            </h2>
          </div>
          <button
            aria-label="Close"
            className="grid size-9 place-items-center rounded-lg border"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            <X className="size-4" />
          </button>
        </div>
        {availableMinorUnits !== null && (
          <div className="mt-5 rounded-xl bg-muted/60 p-4">
            <p className="text-sm text-muted-foreground">{labels.source}</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatCollectiveMoney(availableMinorUnits)}
            </p>
          </div>
        )}
        <label className="mt-5 block text-sm font-semibold">
          Amount (₦)
          <input
            autoFocus
            className="mt-2 h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus:border-brand focus:ring-2 focus:ring-brand/20"
            inputMode="decimal"
            min="0.01"
            onChange={(event) => setAmount(event.target.value)}
            placeholder="0.00"
            step="0.01"
            type="number"
            value={amount}
          />
        </label>
        <p className="mt-3 text-[.8rem] leading-4 text-muted-foreground">{labels.note}</p>
        <div className="mt-6 flex gap-3">
          <button
            className="h-11 flex-1 rounded-lg border text-sm font-semibold"
            disabled={submitting}
            onClick={onClose}
            type="button"
          >
            Cancel
          </button>
          <button
            className="h-11 flex-1 rounded-lg bg-brand text-sm font-semibold text-white disabled:opacity-50"
            disabled={!valid || submitting}
            onClick={() => void submit()}
            type="button"
          >
            {submitting ? 'Processing…' : labels.button}
          </button>
        </div>
      </section>
    </div>
  );
}
