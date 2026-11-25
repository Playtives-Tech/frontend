import type { CollectiveLeaderboard } from '@/lib/services/collectives-service';

export function CollectiveLeaderboardList({ entries }: { entries: CollectiveLeaderboard['entries'] }): React.JSX.Element {
  return (
    <ol className="mt-5 space-y-2.5" aria-label="Monthly consistency rankings">
      {entries.map((entry) => (
        <li
          key={entry.rank}
          className={`flex items-center gap-3 rounded-xl border px-3 py-3 sm:gap-4 sm:px-4 ${entry.isYou ? 'border-brand/40 bg-brand/5' : 'border-border bg-card'}`}
        >
          <span
            className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold tabular-nums ${entry.rank === 1 ? 'bg-amber-100 text-amber-800' : 'bg-muted text-muted-foreground'}`}
            aria-label={`Rank ${entry.rank}`}
          >
            {entry.rank}
          </span>
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-sm font-semibold text-brand" aria-hidden="true">
            {entry.name.trim().charAt(0).toUpperCase() || '?'}
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">
            {entry.name}
            {entry.isYou && <span className="ml-2 rounded-full bg-brand/10 px-2 py-0.5 text-xs font-medium text-brand">You</span>}
          </span>
          <span className="shrink-0 rounded-full bg-muted px-3 py-1.5 text-sm font-bold tabular-nums text-foreground">
            {entry.points} <span className="text-xs font-medium text-muted-foreground">pts</span>
          </span>
        </li>
      ))}
    </ol>
  );
}
