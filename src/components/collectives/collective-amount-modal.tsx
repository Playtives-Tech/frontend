'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import { notify } from '@/lib/notify';
import type { CollectiveContributionPlanInput } from '@/lib/services/collectives-service';

export type CollectiveAmountAction = 'monthlyPlan';

const helper =
  'This is your planned monthly amount, not a fixed obligation. You can contribute more, contribute less, skip a month, or add funds multiple times whenever you choose.';

export function CollectiveAmountModal({
  initialAmountMinorUnits,
  initialMethod,
  initialPreferredDebitDay,
  initialPreferredReminderDay,
  onClose,
  onSubmit,
}: Readonly<{
  action: CollectiveAmountAction;
  availableMinorUnits: number | null;
  initialAmountMinorUnits?: number | null;
  initialMethod?: 'MANUAL' | 'AUTOMATIC';
  initialPreferredDebitDay?: number | null;
  initialPreferredReminderDay?: number | null;
  onClose: () => void;
  onSubmit: (input: CollectiveContributionPlanInput) => Promise<boolean>;
}>): React.JSX.Element {
  const [amount, setAmount] = useState(
    initialAmountMinorUnits ? String(initialAmountMinorUnits / 100) : '',
  );
  const [method, setMethod] = useState<'MANUAL' | 'AUTOMATIC'>(initialMethod ?? 'MANUAL');
  const [preferredDebitDay, setPreferredDebitDay] = useState(String(initialPreferredDebitDay ?? 1));
  const [preferredReminderDay, setPreferredReminderDay] = useState(
    String(initialPreferredReminderDay ?? 1),
  );
  const [authorized, setAuthorized] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const existingMethod = initialAmountMinorUnits ? (initialMethod ?? 'MANUAL') : null;
  const amountMinorUnits = Math.round(Number(amount) * 100);
  const debitDay = Number(preferredDebitDay);
  const reminderDay = Number(preferredReminderDay);
  const validAmount =
    amount.trim() !== '' && Number.isSafeInteger(amountMinorUnits) && amountMinorUnits > 0;
  const valid =
    validAmount &&
    ((method === 'MANUAL' &&
      Number.isSafeInteger(reminderDay) &&
      reminderDay >= 1 &&
      reminderDay <= 31) ||
      (Number.isSafeInteger(debitDay) && debitDay >= 1 && debitDay <= 31 && authorized));

  const submit = async (): Promise<void> => {
    if (!valid) {
      notify.error(
        method === 'AUTOMATIC' && !authorized
          ? 'Authorise automatic Playtives Wallet debits to continue.'
          : 'Enter a valid planned amount and debit date.',
      );
      return;
    }
    setSubmitting(true);
    try {
      const saved = await onSubmit({
        amountMinorUnits,
        method,
        ...(method === 'AUTOMATIC'
          ? { preferredDebitDay: debitDay, automaticDebitAuthorized: true as const }
          : { preferredReminderDay: reminderDay }),
      });
      if (saved) onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const clear = async (): Promise<void> => {
    setSubmitting(true);
    try {
      if (await onSubmit({ amountMinorUnits: null, method: 'MANUAL' })) onClose();
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
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Wealth Collective
            </p>
            <h2 className="mt-1 text-xl font-semibold" id="collective-amount-title">
              {initialAmountMinorUnits
                ? 'Edit Monthly Contribution Plan'
                : 'Set Monthly Contribution Plan'}
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
        <p className="mt-4 text-sm leading-6 text-muted-foreground">{helper}</p>
        <label className="mt-5 block text-sm font-semibold">
          Planned monthly contribution (₦)
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
        <fieldset className="mt-5">
          <legend className="text-sm font-semibold">Contribution method</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {(
              [
                ['MANUAL', 'Manual', 'Add any amount whenever you choose.'],
                [
                  'AUTOMATIC',
                  'Automatic from Playtives Wallet',
                  'We attempt your plan on your preferred date.',
                ],
              ] as const
            ).map(([value, title, description]) => (
              <label
                className={`cursor-pointer rounded-xl border p-4 ${method === value ? 'border-brand bg-brand/5 ring-1 ring-brand' : ''}`}
                key={value}
              >
                <span className="flex items-start gap-3">
                  <input
                    checked={method === value}
                    className="mt-1 accent-[var(--brand)]"
                    name="monthly-plan-method"
                    onChange={() => {
                      if (existingMethod && value !== existingMethod) {
                        notify.info(
                          `You already have ${existingMethod === 'AUTOMATIC' ? 'an automatic' : 'a manual'} monthly contribution plan. Remove it before creating a different plan.`,
                        );
                        return;
                      }
                      setMethod(value);
                      setAuthorized(false);
                    }}
                    type="radio"
                  />
                  <span>
                    <strong className="block text-sm">{title}</strong>
                    <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                      {description}
                    </span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        {method === 'AUTOMATIC' && (
          <div className="mt-5 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <label className="block text-sm font-semibold">
              Preferred monthly debit date
              <select
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3"
                onChange={(event) => setPreferredDebitDay(event.target.value)}
                value={preferredDebitDay}
              >
                {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                    {day > 28 ? ' (or the last day of shorter months)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className="mt-4 flex cursor-pointer items-start gap-3 text-sm leading-5">
              <input
                checked={authorized}
                className="mt-1 size-4 accent-[var(--brand)]"
                onChange={(event) => setAuthorized(event.target.checked)}
                type="checkbox"
              />
              <span>
                I authorise Playtives to attempt this monthly debit from my available Playtives
                Wallet balance. My wallet will never be taken below zero.
              </span>
            </label>
          </div>
        )}
        {method === 'MANUAL' && (
          <div className="mt-5 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <label className="block text-sm font-semibold">
              Monthly reminder day
              <select
                className="mt-2 h-11 w-full rounded-lg border bg-background px-3"
                onChange={(event) => setPreferredReminderDay(event.target.value)}
                value={preferredReminderDay}
              >
                {Array.from({ length: 31 }, (_, index) => index + 1).map((day) => (
                  <option key={day} value={day}>
                    Day {day}
                    {day > 28 ? ' (or the last day of shorter months)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <p className="mt-3 text-xs leading-5 text-muted-foreground">
              We’ll email you on this day each month. No debit will be made from your Playtives
              Wallet.
            </p>
          </div>
        )}
        <div className="mt-6 flex flex-wrap gap-3">
          {initialAmountMinorUnits && (
            <button
              className="h-11 rounded-lg border border-red-200 px-4 text-sm font-semibold text-red-700"
              disabled={submitting}
              onClick={() => void clear()}
              type="button"
            >
              Remove plan
            </button>
          )}
          <div className="ml-auto flex min-w-0 flex-1 justify-end gap-3">
            <button
              className="h-11 rounded-lg border px-4 text-sm font-semibold"
              disabled={submitting}
              onClick={onClose}
              type="button"
            >
              Cancel
            </button>
            <button
              className="h-11 rounded-lg bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
              disabled={!valid || submitting}
              onClick={() => void submit()}
              type="button"
            >
              {submitting ? 'Saving…' : 'Save plan'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
