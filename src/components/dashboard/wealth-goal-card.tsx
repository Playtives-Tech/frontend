'use client';

import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  IconArrowUpRight as ArrowUpRight,
  IconChartLine as ChartNoAxesCombined,
  IconX as X,
} from '@tabler/icons-react';
import { formatNaira } from '@/components/ownership/formatters';
import { clearWealthGoal, getWealthGoal, saveWealthGoal, type WealthGoal } from '@/lib/services/wealth-goal-service';
import { trackEvent } from '@/lib/product-analytics';

type Props = {
  productivePortfolioMinorUnits: number | null;
  memberId: string;
  isActiveMember: boolean;
};

export function WealthGoalCard({
  productivePortfolioMinorUnits,
  memberId,
  isActiveMember,
}: Props): React.JSX.Element {
  const queryClient = useQueryClient();
  const [goal, setGoal] = useState<WealthGoal | null>(null);
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getWealthGoal()
      .then((value) => {
        if (cancelled) return;
        setGoal(value);
        const skippedThisSession =
          window.sessionStorage.getItem(`playtives-wealth-goal-skipped:${memberId}`) === 'true';
        if (!isActiveMember && !value.monthlyTargetMinorUnits && !skippedThisSession) setOpen(true);
      })
      .catch(() => {
        if (!cancelled) setError('We could not load your wealth goal. Please try again.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [memberId, isActiveMember]);

  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  const target = goal?.targetPortfolioMinorUnits ?? 0;
  const rawProgress =
    target > 0 && productivePortfolioMinorUnits !== null
      ? (productivePortfolioMinorUnits / target) * 100
      : null;
  const progressLabel =
    rawProgress === null
      ? '0.00%'
      : `${new Intl.NumberFormat('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(rawProgress)}%`;
  const monthlyAmount = Number(amount);
  const assumptionPercent = goal?.assumptionMonthlyPercent ?? 0;
  const previewTarget =
    assumptionPercent > 0 && Number.isFinite(monthlyAmount)
      ? (monthlyAmount * 100) / assumptionPercent
      : null;

  function close(): void {
    if (!goal?.monthlyTargetMinorUnits) {
      trackEvent('wealth_goal_skipped');
      window.sessionStorage.setItem(`playtives-wealth-goal-skipped:${memberId}`, 'true');
    }
    setOpen(false);
    setPreview(false);
    setConfirmClear(false);
    setError('');
  }

  async function save(): Promise<void> {
    if (!Number.isFinite(monthlyAmount) || monthlyAmount < 1) {
      setError('Enter a monthly goal of at least ₦1.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const savedGoal = await saveWealthGoal(Math.round(monthlyAmount * 100));
      setGoal(savedGoal);
      queryClient.setQueryData(['wealth-goal'], savedGoal);
      setOpen(false);
      setPreview(false);
    } catch {
      setError('Unable to save your goal. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  async function clearGoal(): Promise<void> {
    setSaving(true);
    setError('');
    try {
      const clearedGoal = await clearWealthGoal();
      setGoal(clearedGoal);
      queryClient.setQueryData(['wealth-goal'], clearedGoal);
      window.sessionStorage.setItem(`playtives-wealth-goal-skipped:${memberId}`, 'true');
      setOpen(false);
      setPreview(false);
      setConfirmClear(false);
    } catch {
      setError('Unable to cancel your goal. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  function startEditing(): void {
    setAmount(goal?.monthlyTargetMinorUnits ? String(goal.monthlyTargetMinorUnits / 100) : '');
    setError('');
    setPreview(false);
    setConfirmClear(false);
    setOpen(true);
    trackEvent('wealth_goal_started');
  }

  return (
    <>
      <section
        id="wealth-goal"
        className="mt-5 rounded-2xl border border-brand/20 bg-background p-5 sm:p-6"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <ChartNoAxesCombined className="size-5 text-brand" stroke={1.8} aria-hidden="true" />
            <h2 className="text-base font-semibold">Wealth goal</h2>
          </div>
          {!loading && goal?.monthlyTargetMinorUnits ? (
            <button
              type="button"
              onClick={startEditing}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand/20 bg-brand/10 px-3 text-[.8rem] font-semibold text-brand transition hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              aria-label="Edit wealth goal"
            >
              Edit goal <ArrowUpRight className="size-4" stroke={1.8} aria-hidden="true" />
            </button>
          ) : null}
        </div>
        {loading ? <p className="mt-4 text-sm text-muted-foreground">Loading your goal…</p> : null}
        {error && !open ? (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {!loading && goal?.monthlyTargetMinorUnits ? (
          <>
            <div className="mt-5">
              <p className="text-xs font-medium text-muted-foreground">Monthly income target</p>
              <p className="mt-1 break-words font-sans text-[clamp(1.4rem,3vw,1.9rem)] font-bold tabular-nums tracking-tight text-foreground">
                {formatNaira(goal.monthlyTargetMinorUnits / 100)}
              </p>
            </div>
            {rawProgress !== null ? (
              <div className="mt-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-medium text-muted-foreground">Portfolio progress</p>
                  <span className="shrink-0 text-sm font-bold tabular-nums text-brand">
                    {progressLabel}
                  </span>
                </div>
                <p className="mt-1 break-words text-sm font-semibold tabular-nums text-foreground">
                  {formatNaira((productivePortfolioMinorUnits ?? 0) / 100)}{' '}
                  <span className="font-normal text-muted-foreground">
                    of {formatNaira(target / 100)}
                  </span>
                </p>
                <div
                  className="mt-3 h-2 overflow-hidden rounded-full bg-brand/10"
                  role="progressbar"
                  aria-label="Portfolio goal progress"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.min(100, Math.max(0, rawProgress ?? 0))}
                  aria-valuetext={progressLabel}
                >
                  <div
                    className="h-full rounded-full bg-brand"
                    style={{ width: `${Math.min(100, Math.max(0, rawProgress ?? 0))}%` }}
                  />
                </div>
              </div>
            ) : null}
          </>
        ) : !loading ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Set a target for your portfolio.</p>
            <button
              type="button"
              onClick={startEditing}
              className="mt-4 rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
            >
              Set wealth goal
            </button>
          </div>
        ) : null}
      </section>
      {open ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/45 p-4 backdrop-blur-sm"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) close();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="wealth-goal-title"
            className="relative w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl sm:p-6"
          >
            <button
              type="button"
              aria-label="Close wealth goal"
              className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 hover:bg-slate-100"
              onClick={close}
            >
              <X className="size-4" />
            </button>
            {confirmClear ? (
              <>
                <h2 id="wealth-goal-title" className="pr-8 text-lg font-semibold">Cancel wealth goal?</h2>
                <p className="mt-2 text-sm text-slate-600">Your saved target and progress will be removed. You can set a new goal anytime.</p>
                <div className="mt-5 flex flex-wrap justify-end gap-2">
                  <button type="button" disabled={saving} onClick={() => setConfirmClear(false)} className="rounded-lg border px-4 py-2 text-sm font-semibold">Keep goal</button>
                  <button type="button" disabled={saving} onClick={() => void clearGoal()} className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Canceling…' : 'Cancel goal'}</button>
                </div>
              </>
            ) : preview ? (
              <>
                <h2 id="wealth-goal-title" className="pr-8 text-lg font-semibold">
                  Here’s the portfolio you’re working towards
                </h2>
                <p className="mt-4 break-words text-2xl font-bold text-brand">
                  {previewTarget === null ? 'Unavailable' : formatNaira(previewTarget)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Your monthly income goal: {formatNaira(monthlyAmount)}
                </p>
                <p className="mt-4 text-xs leading-5 text-slate-500">
                  Illustrative planning target based on a {assumptionPercent}% monthly assumption.
                  Returns vary and are not guaranteed.
                </p>
                <button
                  type="button"
                  disabled={saving || previewTarget === null}
                  className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                  onClick={() => void save()}
                >
                  {saving ? 'Saving…' : 'Make this my goal'}
                </button>
                <button
                  type="button"
                  className="mt-2 w-full rounded-lg border px-4 py-2.5 text-sm font-semibold"
                  onClick={() => setPreview(false)}
                >
                  Adjust goal
                </button>
              </>
            ) : (
              <>
                <h2 id="wealth-goal-title" className="pr-8 text-lg font-semibold">
                  How much would you like to earn monthly?
                </h2>
                <p className="mt-1 text-[.75rem] leading-4 text-slate-600">
                  Enter an amount you would like to regularly earn from your co-funding and co-ownership portfolio. This is for planning purposes only.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[50000, 100000, 250000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="rounded-lg border px-3 py-1.5 text-xs font-semibold hover:border-brand"
                      onClick={() => setAmount(String(preset))}
                    >
                      {formatNaira(preset)}
                    </button>
                  ))}
                </div>
                <label className="mt-4 block text-sm font-medium">
                  Custom monthly amount (₦)
                  <input
                    className="mt-1.5 h-10 w-full rounded-lg border px-3 text-sm"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter amount"
                  />
                </label>
                <button
                  type="button"
                  className="mt-5 w-full rounded-lg bg-brand px-4 py-2.5 text-sm font-semibold text-white"
                  onClick={() => {
                    if (Number.isFinite(monthlyAmount) && monthlyAmount >= 1) {
                      setError('');
                      setPreview(true);
                    } else setError('Enter a monthly goal of at least ₦1.');
                  }}
                >
                  See my target portfolio
                </button>
              </>
            )}
            {error ? (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {error}
              </p>
            ) : null}
            {!confirmClear ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                {goal?.monthlyTargetMinorUnits ? (
                  <button type="button" onClick={() => setConfirmClear(true)} className="rounded-lg px-2 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50">Cancel wealth goal</button>
                ) : <span />}
                <button type="button" className="rounded-lg px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100" onClick={close}>
                  {goal?.monthlyTargetMinorUnits ? 'Close' : 'I’ll do this later'}
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  );
}
