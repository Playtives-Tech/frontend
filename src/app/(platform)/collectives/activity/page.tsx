'use client';

import { Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CollectiveDetailLayout,
  formatCollectiveDateTime,
  formatCollectiveActivityAmount,
  formatCollectiveMoney,
} from '@/components/collectives/collective-ui';
import {
  getCollectiveActivity,
  type CollectiveTransaction,
} from '@/lib/services/collectives-service';

type ActivityRow = Readonly<{
  id: string;
  note: string;
  detail?: string;
  amount: string;
  createdAt: string;
}>;

const monthlyResultTypes = new Set([
  'CYCLE_PROFIT_ATTRIBUTED',
  'CYCLE_LOSS_ATTRIBUTED',
  'CYCLE_ROLLOVER',
  'CYCLE_RETURN',
]);

function toActivityRows(transactions: CollectiveTransaction[]): ActivityRow[] {
  const monthly = new Map<
    string,
    {
      cycleNumber: number;
      nextCycleNumber: number | null;
      profit: number;
      loss: number;
      rollover: number;
      maturityPayout: number;
      createdAt: string;
    }
  >();
  const rows: ActivityRow[] = [];

  for (const transaction of transactions) {
    if (
      !monthlyResultTypes.has(transaction.type) ||
      !transaction.sourceCycleId ||
      !transaction.cycleNumber
    ) {
      rows.push({
        id: transaction._id,
        note: transaction.note,
        amount: formatCollectiveActivityAmount(transaction),
        createdAt: transaction.createdAt,
      });
      continue;
    }

    const key = transaction.sourceCycleId;
    const summary = monthly.get(key) ?? {
      cycleNumber: transaction.cycleNumber,
      nextCycleNumber: null,
      profit: 0,
      loss: 0,
      rollover: 0,
      maturityPayout: 0,
      createdAt: transaction.createdAt,
    };
    if (transaction.type === 'CYCLE_PROFIT_ATTRIBUTED')
      summary.profit += transaction.amountMinorUnits;
    if (transaction.type === 'CYCLE_LOSS_ATTRIBUTED') summary.loss += transaction.amountMinorUnits;
    if (transaction.type === 'CYCLE_ROLLOVER') {
      summary.rollover += transaction.amountMinorUnits;
      summary.nextCycleNumber = transaction.nextCycleNumber ?? summary.nextCycleNumber;
    }
    if (transaction.type === 'CYCLE_RETURN') summary.maturityPayout += transaction.amountMinorUnits;
    if (new Date(transaction.createdAt) > new Date(summary.createdAt))
      summary.createdAt = transaction.createdAt;
    monthly.set(key, summary);
  }

  for (const [cycleId, summary] of monthly) {
    const result = summary.profit - summary.loss;
    const detailParts = [
      summary.profit > 0 ? `Profit +${formatCollectiveMoney(summary.profit)}` : '',
      summary.loss > 0 ? `Loss −${formatCollectiveMoney(summary.loss)}` : '',
      summary.rollover > 0
        ? `Compounded into Month ${summary.nextCycleNumber ?? summary.cycleNumber + 1}: ${formatCollectiveMoney(summary.rollover)} (not a wallet payout)`
        : '',
      summary.maturityPayout > 0
        ? `Maturity payout: ${formatCollectiveMoney(summary.maturityPayout)}`
        : '',
    ].filter(Boolean);
    const amount =
      summary.rollover > 0
        ? `${formatCollectiveMoney(summary.rollover)} rolled over`
        : summary.maturityPayout > 0
          ? `${formatCollectiveMoney(summary.maturityPayout)} maturity payout`
          : `${result < 0 ? '−' : '+'}${formatCollectiveMoney(Math.abs(result))} net result`;
    rows.push({
      id: `month-result-${cycleId}`,
      note: `Month ${summary.cycleNumber} result`,
      detail: detailParts.join(' · '),
      amount,
      createdAt: summary.createdAt,
    });
  }

  return rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export default function CollectiveActivityPage(): React.JSX.Element {
  const [items, setItems] = useState<CollectiveTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const rows = items ? toActivityRows(items) : [];
  useEffect(() => {
    void getCollectiveActivity()
      .then(setItems)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load activity.'),
      );
  }, []);
  return (
    <CollectiveDetailLayout
      description="Every contribution, deployment, monthly result, and settlement."
      title="Collective activity"
    >
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : items === null ? (
        <p className="text-sm text-muted-foreground">Loading activity…</p>
      ) : (
        <section className="bg-card rounded-2xl border p-5 sm:p-7">
          {rows.length ? (
            <div className="divide-y">
              {rows.map((item) => (
                <div className="flex items-center justify-between gap-4 py-4" key={item.id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                      <Coins className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-[.85rem] font-semibold">{item.note}</p>
                      {item.detail && (
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          {item.detail}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCollectiveDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 text-[.9rem] font-semibold text-brand">{item.amount}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No activity has been recorded yet.</p>
          )}
        </section>
      )}
    </CollectiveDetailLayout>
  );
}
