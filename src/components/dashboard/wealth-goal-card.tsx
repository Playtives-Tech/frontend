'use client';

import { useEffect, useState } from 'react';
import { ArrowUpRight, ChartNoAxesCombined, X } from 'lucide-react';
import { formatNaira } from '@/components/ownership/formatters';
import { getWealthGoal, saveWealthGoal, type WealthGoal } from '@/lib/services/wealth-goal-service';

type Props = {
  productivePortfolioMinorUnits: number | null;
  memberId: string;
  firstName: string;
  isActiveMember: boolean;
};

export function WealthGoalCard({
  productivePortfolioMinorUnits,
  memberId,
  firstName,
  isActiveMember,
}: Props): React.JSX.Element {
  const [goal, setGoal] = useState<WealthGoal | null>(null);
  const [amount, setAmount] = useState('');
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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
  const progress =
    target > 0 && productivePortfolioMinorUnits !== null
      ? Math.min(100, Math.round((productivePortfolioMinorUnits / target) * 100))
      : null;
  const monthlyAmount = Number(amount);
  const assumptionPercent = goal?.assumptionMonthlyPercent ?? 0;
  const previewTarget =
    assumptionPercent > 0 && Number.isFinite(monthlyAmount)
      ? (monthlyAmount * 100) / assumptionPercent
      : null;

  function close(): void {
    if (!goal?.monthlyTargetMinorUnits)
      window.sessionStorage.setItem(`playtives-wealth-goal-skipped:${memberId}`, 'true');
    setOpen(false);
    setPreview(false);
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
      setGoal(await saveWealthGoal(Math.round(monthlyAmount * 100)));
      setOpen(false);
      setPreview(false);
    } catch {
      setError('Unable to save your goal. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <section className="mt-5 rounded-2xl border border-brand/20 bg-background p-5 sm:p-6">
        <span
          className="mb-4 grid size-11 place-items-center rounded-xl bg-brand/10 text-brand"
          aria-hidden="true"
        >
          <ChartNoAxesCombined className="size-5" strokeWidth={1.8} />
        </span>
        <h2 className="text-lg font-semibold">
          {goal?.monthlyTargetMinorUnits ? 'Your wealth goal' : 'Give your portfolio a destination'}
        </h2>
        {loading ? <p className="mt-2 text-sm text-muted-foreground">Loading your goal…</p> : null}
        {error && !open ? (
          <p role="alert" className="mt-2 text-sm text-red-600">
            {error}
          </p>
        ) : null}
        {!loading && goal?.monthlyTargetMinorUnits ? (
          <>
            <p className="mt-2 text-sm">
              Monthly income goal: {formatNaira(goal.monthlyTargetMinorUnits / 100)}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Productive portfolio:{' '}
              {productivePortfolioMinorUnits === null
                ? 'Unavailable'
                : formatNaira(productivePortfolioMinorUnits / 100)}{' '}
              of {formatNaira(target / 100)}
            </p>
            {progress !== null ? (
              <>
                <div className="mt-3 h-2 rounded-full bg-brand/10">
                  <div className="h-2 rounded-full bg-brand" style={{ width: `${progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {progress}% towards your illustrative target
                </p>
              </>
            ) : null}
          </>
        ) : !loading ? (
          <p className="text-sm text-muted-foreground">
            Set a monthly income goal and track your progress. You can do this later.
          </p>
        ) : null}
        <button
          type="button"
          className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
          onClick={() => {
            setAmount(
              goal?.monthlyTargetMinorUnits ? String(goal.monthlyTargetMinorUnits / 100) : '',
            );
            setError('');
            setPreview(false);
            setOpen(true);
          }}
        >
          {goal?.monthlyTargetMinorUnits ? 'Edit wealth goal' : 'Set my wealth goal'}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </button>
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
            className="relative w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl sm:p-8"
          >
            <button
              type="button"
              aria-label="Close wealth goal"
              className="absolute right-5 top-5 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              onClick={close}
            >
              <X className="size-5" />
            </button>
            {preview ? (
              <>
                <h2 id="wealth-goal-title" className="mt-4 text-2xl font-semibold">
                  Here’s the portfolio you’re working towards
                </h2>
                <p className="mt-6 text-3xl font-bold text-brand">
                  {previewTarget === null ? 'Unavailable' : formatNaira(previewTarget)}
                </p>
                <p className="mt-2 text-sm text-slate-600">
                  Your monthly income goal: {formatNaira(monthlyAmount)}
                </p>
                <p className="mt-5 text-xs leading-5 text-slate-500">
                  Illustrative planning target based on a {assumptionPercent}% monthly assumption.
                  Returns vary and are not guaranteed.
                </p>
                <button
                  type="button"
                  disabled={saving || previewTarget === null}
                  className="mt-7 w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white disabled:opacity-50"
                  onClick={() => void save()}
                >
                  {saving ? 'Saving…' : 'Make this my goal'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full rounded-xl border px-5 py-3 text-sm font-semibold"
                  onClick={() => setPreview(false)}
                >
                  Adjust goal
                </button>
              </>
            ) : (
              <>
                <h2 id="wealth-goal-title" className="mt-6 text-2xl font-semibold">
                  How much would you like earn monthly?
                </h2>
                <p className="mt-1 text-sm text-slate-600">
                  Choose an amount or enter your own. This is a planning goal, not a promised
                  return.
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {[50000, 100000, 250000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      className="rounded-lg border font-semibold px-4 py-2 text-sm hover:border-brand"
                      onClick={() => setAmount(String(preset))}
                    >
                      {formatNaira(preset)}
                    </button>
                  ))}
                </div>
                <label className="mt-5 block text-sm font-medium">
                  Custom monthly amount (₦)
                  <input
                    className="mt-2 h-12 w-full rounded-xl border px-4 text-base"
                    type="number"
                    min="1"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    placeholder="Enter amount"
                  />
                </label>
                <button
                  type="button"
                  className="mt-7 w-full rounded-xl bg-brand px-5 py-3 font-semibold text-white"
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
            <button
              type="button"
              className="mt-3 w-full py-2 text-sm font-medium text-slate-600"
              onClick={close}
            >
              I’ll do this later
            </button>
          </section>
        </div>
      ) : null}
    </>
  );
}
