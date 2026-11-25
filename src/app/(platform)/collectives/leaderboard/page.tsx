'use client';

import { useEffect, useState } from 'react';
import { CollectiveLeaderboardList } from '@/components/collectives/collective-leaderboard-list';
import { CollectiveDetailLayout } from '@/components/collectives/collective-ui';
import { getCollectiveLeaderboard, type CollectiveLeaderboard } from '@/lib/services/collectives-service';
import { trackEvent } from '@/lib/product-analytics';

export default function CollectiveLeaderboardPage(): React.JSX.Element {
  useEffect(() => { trackEvent('leaderboard_viewed'); }, []);
  const [page, setPage] = useState(1);
  const [leaderboard, setLeaderboard] = useState<CollectiveLeaderboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCollectiveLeaderboard(page)
      .then((result) => {
        if (!active) return;
        setLeaderboard(result);
        setError(null);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : 'Unable to load leaderboard.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [page]);

  const totalPages = Math.max(1, Math.ceil((leaderboard?.total ?? 0) / (leaderboard?.pageSize ?? 10)));

  return (
    <CollectiveDetailLayout
      title="Monthly consistency leaderboard"
      description="Ranked by distinct days with accepted contributions this month, not by amount. Joining is optional; balances and returns stay private."
    >
      <section className="rounded-2xl border bg-card p-5 sm:p-7">
        {error ? (
          <p className="text-sm text-red-600" role="alert">{error}</p>
        ) : loading && !leaderboard ? (
          <p className="text-sm text-muted-foreground">Loading leaderboard…</p>
        ) : leaderboard?.entries.length ? (
          <CollectiveLeaderboardList entries={leaderboard.entries} />
        ) : (
          <p className="text-sm text-muted-foreground">No opted-in members have earned points this month yet.</p>
        )}
        {leaderboard && leaderboard.total > leaderboard.pageSize && (
          <nav aria-label="Leaderboard pages" className="mt-6 flex items-center justify-between gap-3 border-t pt-5">
            <button type="button" disabled={loading || page === 1} onClick={() => { setLoading(true); setPage((current) => current - 1); }} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Previous</button>
            <span className="text-sm text-muted-foreground">Page {page} of {totalPages}</span>
            <button type="button" disabled={loading || page >= totalPages} onClick={() => { setLoading(true); setPage((current) => current + 1); }} className="rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50">Next</button>
          </nav>
        )}
      </section>
    </CollectiveDetailLayout>
  );
}
