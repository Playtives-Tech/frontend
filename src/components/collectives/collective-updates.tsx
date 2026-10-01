import { CalendarDays, Megaphone } from 'lucide-react';
import type { CollectiveCycle, CollectiveUpdate } from '@/lib/services/collectives-service';
import { formatCollectiveDate, formatCollectiveDateTime } from './collective-ui';

export function CollectiveUpdates({
  cycles,
  updates,
  limit,
}: Readonly<{
  cycles: CollectiveCycle[];
  updates: CollectiveUpdate[];
  limit?: number;
}>): React.JSX.Element {
  const newsEntries = updates
    .map((update) => ({ kind: 'news' as const, update }))
    .sort(
      (first, second) =>
        new Date(second.update.publishedAt).getTime() -
        new Date(first.update.publishedAt).getTime(),
    );
  const cycleEntries = cycles
    .map((cycle) => ({ kind: 'cycle' as const, cycle }))
    .sort((first, second) => first.cycle.number - second.cycle.number);
  const upcomingCycles = cycleEntries.filter(
    (entry) => new Date(entry.cycle.endsAt).getTime() >= Date.now(),
  );
  const visible = limit
    ? [
        ...newsEntries.slice(0, Math.ceil(limit / 2)),
        ...(upcomingCycles.length ? upcomingCycles : cycleEntries.slice(-2)).slice(
          0,
          Math.ceil(limit / 2),
        ),
      ]
    : [...newsEntries, ...cycleEntries];

  if (!visible.length) {
    return <p className="py-5 text-sm text-muted-foreground">No Collective updates yet.</p>;
  }

  return (
    <div className="divide-y">
      {visible.map((entry) =>
        entry.kind === 'news' ? (
          <article className="flex gap-3 py-5" key={entry.update._id}>
            <Megaphone className="mt-0.5 size-5 shrink-0 text-brand" />
            <div className="min-w-0">
              <h3 className="font-semibold text-[.9rem]">{entry.update.title}</h3>
              <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                {entry.update.body}
              </p>
              <p className="mt-2 text-[.85rem] text-muted-foreground">
                {formatCollectiveDateTime(entry.update.publishedAt)}
              </p>
            </div>
          </article>
        ) : (
          <article className="flex gap-3 py-7" key={entry.cycle._id}>
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-brand" />
            <div className="min-w-0">
              <h3 className="font-semibold text-[.9rem]">
                Month {entry.cycle.number} ·{' '}
                {entry.cycle.actualReturnRateBps == null ? 'Deployment' : 'Return confirmed'}
              </h3>
              <p className="mt-1 text-[.85rem] leading-6 text-muted-foreground">
                {formatCollectiveDate(entry.cycle.startsAt)} –{' '}
                {formatCollectiveDate(entry.cycle.endsAt)} · Deployment windows{' '}
                {entry.cycle.firstWindowClosesAt
                  ? formatCollectiveDateTime(entry.cycle.firstWindowClosesAt)
                  : 'not scheduled'}
                {' · Halfway: '}
                {entry.cycle.secondWindowClosesAt
                  ? formatCollectiveDateTime(entry.cycle.secondWindowClosesAt)
                  : 'off'}.
              </p>
              {entry.cycle.actualReturnRateBps !== null && (
                <p className="mt-2 text-sm font-semibold text-brand">
                  Actual return: {(entry.cycle.actualReturnRateBps / 100).toFixed(2)}%
                </p>
              )}
            </div>
          </article>
        ),
      )}
    </div>
  );
}
