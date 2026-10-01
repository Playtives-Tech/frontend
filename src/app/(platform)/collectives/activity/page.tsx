'use client';

import { Coins } from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  CollectiveDetailLayout,
  formatCollectiveDateTime,
  formatCollectiveActivityAmount,
} from '@/components/collectives/collective-ui';
import {
  getCollectiveActivity,
  type CollectiveTransaction,
} from '@/lib/services/collectives-service';

export default function CollectiveActivityPage(): React.JSX.Element {
  const [items, setItems] = useState<CollectiveTransaction[] | null>(null);
  const [error, setError] = useState<string | null>(null);
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
          {items.length ? (
            <div className="divide-y">
              {items.map((item) => (
                <div className="flex items-center justify-between gap-4 py-4" key={item._id}>
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                      <Coins className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-[.85rem]">{item.note}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatCollectiveDateTime(item.createdAt)}
                      </p>
                    </div>
                  </div>
                  <p className="shrink-0 font-semibold text-brand text-[.9rem]">
                    {formatCollectiveActivityAmount(item)}
                  </p>
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
