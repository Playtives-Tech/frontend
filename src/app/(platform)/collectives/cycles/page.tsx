'use client';

import { useEffect, useState } from 'react';
import {
  CollectiveDetailLayout,
  formatCollectiveDate,
  formatCollectiveMoney,
} from '@/components/collectives/collective-ui';
import {
  getCollectiveDashboard,
  type CollectiveDashboard,
} from '@/lib/services/collectives-service';

export default function CollectiveCyclesPage(): React.JSX.Element {
  const [data, setData] = useState<CollectiveDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void getCollectiveDashboard()
      .then(setData)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load months.'),
      );
  }, []);
  return (
    <CollectiveDetailLayout
      description="Your capital and actual result for each Collective month."
      title="Month history"
    >
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Loading months…</p>
      ) : (
        <section className="space-y-3">
          {data.cycles.map((cycle) => {
            const position = data.positions.find((item) => item.cycleId === cycle._id);
            return (
              <article className="bg-card rounded-2xl border p-5 sm:p-6" key={cycle._id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h2 className="text-[.85rem] font-semibold">
                      Month {String(cycle.number).padStart(2, '0')}
                    </h2>
                    <p className="mt-1 text-[.8rem] text-muted-foreground">
                      {formatCollectiveDate(cycle.startsAt)} – {formatCollectiveDate(cycle.endsAt)}
                    </p>
                  </div>
                  <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-semibold text-brand">
                    {cycle.actualReturnRateBps == null ? 'Awaiting result' : 'Reconciled'}
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-t pt-5 sm:grid-cols-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Your month capital</p>
                    <p className="mt-1 font-semibold">
                      {formatCollectiveMoney(position?.capitalMinorUnits ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Added this month</p>
                    <p className="mt-1 font-semibold">
                      {formatCollectiveMoney(position?.addedMinorUnits ?? 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit attributed</p>
                    <p className="mt-1 font-semibold text-brand">
                      {cycle.actualReturnRateBps == null
                        ? 'Awaiting result'
                        : formatCollectiveMoney(position?.profitMinorUnits ?? 0)}
                    </p>
                  </div>
                </div>
                {cycle.actualReturnRateBps !== null && (
                  <p className="mt-4 text-xs text-muted-foreground">
                    Actual monthly return: {(cycle.actualReturnRateBps / 100).toFixed(2)}%
                  </p>
                )}
              </article>
            );
          })}
          {!data.cycles.length && (
            <p className="bg-card rounded-2xl border p-6 text-sm text-muted-foreground">
              No Collective months have been configured yet.
            </p>
          )}
        </section>
      )}
    </CollectiveDetailLayout>
  );
}
