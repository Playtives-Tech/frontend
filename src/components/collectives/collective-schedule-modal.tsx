'use client';

import { ArrowRight, CalendarClock, X } from 'lucide-react';
import { useState } from 'react';
import { notify } from '@/lib/notify';
import { formatCollectiveDeploymentDate, formatCollectiveMoney } from './collective-ui';

export function CollectiveScheduleModal({
  balanceMinorUnits,
  deploymentAt,
  monthNumber,
  currentMonthNumber,
  isFirstContribution,
  onClose,
  onSubmit,
}: Readonly<{
  balanceMinorUnits: number;
  deploymentAt: string;
  monthNumber: number;
  currentMonthNumber: number;
  isFirstContribution: boolean;
  onClose: () => void;
  onSubmit: (amountMinorUnits: number) => Promise<boolean>;
}>): React.JSX.Element {
  const [amount, setAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const amountMinorUnits = Math.round(Number(amount) * 100);
  const deploymentOpen = new Date(deploymentAt).getTime() <= Date.now();
  const valid =
    amount.trim() !== '' &&
    Number.isSafeInteger(amountMinorUnits) &&
    amountMinorUnits > 0 &&
    amountMinorUnits <= balanceMinorUnits;

  const submit = async (): Promise<void> => {
    if (!valid) {
      notify.error('Enter an amount within your available Playtives Wallet balance.');
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
      aria-labelledby="collective-schedule-title"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-end bg-black/45 backdrop-blur-sm sm:place-items-center sm:p-4"
      role="dialog"
    >
      <section className="max-h-[100dvh] w-full overflow-y-auto rounded-t-2xl border bg-background p-5 shadow-2xl sm:max-h-[calc(100dvh-2rem)] sm:w-1/2 sm:rounded-2xl sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
              Wealth Collective
            </p>
            <h2 className="mt-1 text-xl font-semibold" id="collective-schedule-title">
              {isFirstContribution ? 'Join & Fund Collective' : 'Add to Collective'}
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
        <div className="mt-5 flex items-center gap-3 rounded-xl bg-muted/60 p-4">
          <CalendarClock aria-hidden="true" className="size-5 shrink-0 text-brand" />
          <div>
            <p className="text-sm text-muted-foreground">Next expected deployment</p>
            <p className="font-semibold">{formatCollectiveDeploymentDate(deploymentAt)}</p>
          </div>
        </div>
        <div className="mt-4 rounded-xl border p-4">
          <p className="text-sm text-muted-foreground">Available Playtives Wallet Balance</p>
          <p className="mt-1 text-xl font-semibold">{formatCollectiveMoney(balanceMinorUnits)}</p>
        </div>
        <label className="mt-5 block text-sm font-semibold">
          How much would you like to add? (₦)
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
        {amountMinorUnits > 0 && Number.isSafeInteger(amountMinorUnits) && (
          <div className="mt-4 rounded-xl border border-brand/20 bg-brand/5 p-4">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Amount</span>
              <strong>{formatCollectiveMoney(amountMinorUnits)}</strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Funding source</span>
              <strong>Playtives Wallet</strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Wallet balance after funding</span>
              <strong>{formatCollectiveMoney(Math.max(0, balanceMinorUnits - amountMinorUnits))}</strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Current Collective month</span>
              <strong>Month {currentMonthNumber} of 12</strong>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3 text-sm">
              <span className="text-muted-foreground">Position month</span>
              <strong>Month {monthNumber} of 12</strong>
            </div>
          </div>
        )}
        {amountMinorUnits > 0 && Number.isSafeInteger(amountMinorUnits) && (
          <p className="mt-3 text-sm leading-5 text-muted-foreground">
            Once confirmed, these funds leave your Playtives Wallet immediately.{' '}
            {deploymentOpen
              ? 'The deployment window is open today, so they become active now and eligible for actual returns from today.'
              : 'They remain Awaiting Deployment until the next window opens and become eligible for actual returns from their deployment date.'}
          </p>
        )}
        {balanceMinorUnits <= 0 && (
          <p className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Your Playtives Wallet has no available funds to add.
          </p>
        )}
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
            className="h-11 flex-1 rounded-lg bg-brand px-4 text-sm font-semibold text-white disabled:opacity-50"
            disabled={!valid || submitting}
            onClick={() => void submit()}
            type="button"
          >
            {submitting ? 'Adding…' : <>Confirm &amp; Add to Collective <ArrowRight aria-hidden="true" className="ml-1 inline size-4" /></>}
          </button>
        </div>
      </section>
    </div>
  );
}
