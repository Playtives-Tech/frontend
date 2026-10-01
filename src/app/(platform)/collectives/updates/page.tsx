'use client';

import { useEffect, useState } from 'react';
import { CollectiveUpdates } from '@/components/collectives/collective-updates';
import { CollectiveDetailLayout } from '@/components/collectives/collective-ui';
import {
  getCollectiveDashboard,
  type CollectiveDashboard,
} from '@/lib/services/collectives-service';

export default function CollectiveUpdatesPage(): React.JSX.Element {
  const [data, setData] = useState<CollectiveDashboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    void getCollectiveDashboard()
      .then(setData)
      .catch((cause: unknown) =>
        setError(cause instanceof Error ? cause.message : 'Unable to load updates.'),
      );
  }, []);
  return (
    <CollectiveDetailLayout
      description="Deployment dates, confirmed results, and announcements from the Playtives team."
      title="Collective updates"
    >
      {error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : !data ? (
        <p className="text-sm text-muted-foreground">Loading updates…</p>
      ) : (
        <section className="bg-card rounded-2xl border px-5 sm:px-7">
          <CollectiveUpdates cycles={data.cycles} updates={data.updates} />
        </section>
      )}
    </CollectiveDetailLayout>
  );
}
