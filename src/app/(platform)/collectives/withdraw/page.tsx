'use client';

import { LockKeyhole } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CollectiveDetailLayout,
  formatCollectiveDate,
  formatCollectiveMoney,
} from '@/components/collectives/collective-ui';
import {
  getCollectiveDashboard,
  requestCollectiveEarlyExit,
  type CollectiveDashboard,
} from '@/lib/services/collectives-service';
import { notify } from '@/lib/notify';

export default function CollectiveEarlyExitPage(): React.JSX.Element {
  const [data, setData] = useState<CollectiveDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [acknowledged, setAcknowledged] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const load = (): void => {
    void getCollectiveDashboard()
      .then((result) => {
        setData(result);
        setError(null);
      })
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load your position.'),
      );
  };
  useEffect(load, []);
  const capital = data?.earlyExit?.capitalMinorUnits ?? data?.capitalContributedMinorUnits ?? 0;
  const forfeitedProfit =
    data?.earlyExit?.forfeitedProfitMinorUnits ?? Math.max(0, data?.profitToDateMinorUnits ?? 0);
  const eligibleSettlementAt =
    data?.earlyExit?.eligibleSettlementAt ?? data?.currentCycle?.endsAt ?? null;
  const submit = async (): Promise<void> => {
    if (!data || !acknowledged || capital <= 0 || !eligibleSettlementAt) return;
    setSubmitting(true);
    try {
      await requestCollectiveEarlyExit();
      notify.success('Your early exit request has been submitted.');
      setAcknowledged(false);
      load();
    } catch (cause) {
      notify.error(cause instanceof Error ? cause.message : 'Unable to submit your request.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <CollectiveDetailLayout
      description="Review the financial consequences before leaving the programme."
      title="Request Early Exit"
    >
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Loading your position…</p>
      ) : (
        <section className="bg-card rounded-2xl border p-5 sm:p-7">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-red-50 text-red-700">
              <LockKeyhole className="size-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Leaving before maturity</h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Early Exit is a formal request, not a withdrawal. Your position stops earning from
                the request date. All profit and accrued returns are permanently forfeited,
                including confirmed, attributed, pending, estimated, and unreconciled returns. Only
                your personally contributed capital becomes eligible for return at the end of the
                current Collective month.
              </p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Figure label="Your contributed capital" value={capital} />
            <Figure label="Recorded profit forfeited" value={forfeitedProfit} />
            <Figure label="Amount due back to you" value={capital} />
            <div className="rounded-xl border p-4">
              <p className="text-xs text-muted-foreground">Eligible settlement date</p>
              <p className="mt-2 text-sm font-semibold">
                {eligibleSettlementAt
                  ? formatCollectiveDate(eligibleSettlementAt)
                  : 'No active Collective month'}
              </p>
            </div>
          </div>
          {data.earlyExit ? (
            <p className="mt-6 rounded-xl border border-brand/20 bg-brand/5 p-4 text-sm font-medium">
              {data.earlyExit.status === 'COMPLETED'
                ? 'Early Exit completed. Your capital was returned to your Playtives Wallet.'
                : `Early Exit requested. Your position is no longer participating, every return is forfeited, and your contributed capital becomes eligible for settlement${eligibleSettlementAt ? ` on ${formatCollectiveDate(eligibleSettlementAt)}` : ' at month end'}.`}
            </p>
          ) : data.maturity ? (
            <p className="mt-6 text-sm text-muted-foreground">
              This Collective has matured. Its final value follows the maturity settlement process,
              not Early Exit.
            </p>
          ) : (
            <>
              <label className="mt-6 flex items-start gap-3 rounded-xl border p-4 text-sm leading-6">
                <input
                  checked={acknowledged}
                  className="mt-1 size-4 accent-brand"
                  onChange={(event) => setAcknowledged(event.target.checked)}
                  type="checkbox"
                />
                <span>
                  I understand that submitting this Early Exit permanently forfeits all profit and
                  accrued returns associated with my position. I will receive only my personally
                  contributed capital, which becomes eligible for settlement at the end of the
                  current Collective month
                  {eligibleSettlementAt ? ` on ${formatCollectiveDate(eligibleSettlementAt)}` : ''}.
                </span>
              </label>
              <button
                className="mt-5 min-h-11 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                disabled={!acknowledged || submitting || capital <= 0 || !eligibleSettlementAt}
                onClick={() => void submit()}
                type="button"
              >
                {submitting ? 'Submitting…' : 'Submit Early Exit Request'}
              </button>
              {!eligibleSettlementAt && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Early Exit is available only during an active Collective month.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </CollectiveDetailLayout>
  );
}

function Figure({ label, value }: Readonly<{ label: string; value: number }>): React.JSX.Element {
  return (
    <div className="rounded-xl border p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-semibold">{formatCollectiveMoney(value)}</p>
    </div>
  );
}
