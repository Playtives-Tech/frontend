'use client';

import { ArrowLeft, ArrowRight, Archive, CalendarDays } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { getLegacyOwnerships, type LegacyOwnership } from '@/lib/services/legacy-ownership-service';
import { formatNaira } from './formatters';

function money(minorUnits: number): React.JSX.Element {
  return <BalanceAmount value={formatNaira(minorUnits / 100)} />;
}

function date(value: string | null): string {
  if (!value) return 'Not recorded';
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? 'Not recorded'
    : new Intl.DateTimeFormat('en-NG', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Africa/Lagos' }).format(parsed);
}

function paidExternally(position: LegacyOwnership): number {
  return position.periods.reduce((total, period) => total + period.paidMinorUnits, 0);
}

function rolledOver(position: LegacyOwnership): number {
  return position.periods.reduce((total, period) => total + period.rolledOverMinorUnits, 0);
}

function statusLabel(position: LegacyOwnership): string {
  if (position.status === 'EXITED') return 'Exited';
  if (position.status === 'COMPLETED') return 'Completed';
  return 'Active';
}

function useLegacyOwnerships(): { positions: LegacyOwnership[]; loading: boolean; error: string } {
  const [positions, setPositions] = useState<LegacyOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    void getLegacyOwnerships()
      .then(setPositions)
      .catch((value: unknown) => setError(value instanceof Error ? value.message : 'Could not load historical ownerships'))
      .finally(() => setLoading(false));
  }, []);

  return { positions, loading, error };
}

function LegacyPositionCard({ position }: Readonly<{ position: LegacyOwnership }>): React.JSX.Element {
  return (
    <Link href={`/ownership/legacy/${position._id}`} className="group grid overflow-hidden rounded-2xl border bg-background transition-colors hover:border-brand/40 sm:grid-cols-[9rem_1fr]">
      <div className="relative aspect-video bg-surface sm:aspect-auto sm:min-h-44">
        {position.opportunity.imageUrl ? (
          <Image src={position.opportunity.imageUrl} alt={position.opportunity.imageAlt || position.opportunity.title} fill unoptimized sizes="(max-width: 640px) 100vw, 144px" className="object-cover" />
        ) : (
          <div className="grid h-full min-h-32 place-items-center text-brand"><Archive className="size-10" aria-hidden="true" /></div>
        )}
      </div>
      <div className="min-w-0 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand">Historical · {statusLabel(position)}</p>
            <h2 className="mt-1 font-sans text-lg font-semibold">{position.opportunity.title}</h2>
          </div>
          <ArrowRight className="mt-2 size-5 shrink-0 text-brand transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{position.units} {position.units === 1 ? 'unit' : 'units'} · Months {position.firstCycle}–{position.lastCycle}{position.remainingCycles > 0 ? ` · ${position.remainingCycles} remaining` : ''}</p>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div><p className="text-muted-foreground">Original capital</p><p className="font-semibold">{money(position.principalMinorUnits)}</p></div>
          <div><p className="text-muted-foreground">Paid outside Playtives</p><p className="font-semibold">{money(paidExternally(position))}</p></div>
        </div>
      </div>
    </Link>
  );
}

export function LegacyOwnershipsPage(): React.JSX.Element {
  const { positions, loading, error } = useLegacyOwnerships();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'PAST'>('ALL');
  const visible = positions.filter((position) => filter === 'ALL' || (filter === 'ACTIVE' ? position.status === 'ACTIVE' : position.status !== 'ACTIVE'));

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <Link href="/ownership" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="size-4" /> Back to portfolio</Link>
      <header className="mt-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Your historical records</p>
        <h1 className="mt-2 font-sans text-2xl font-semibold tracking-tight sm:text-3xl">Legacy opportunities</h1>
        <p className="mt-2 max-w-3xl text-sm text-muted-foreground">See the opportunities you joined before Playtives launched, including earlier payments and remaining months.</p>
      </header>
      <div className="mt-6 rounded-2xl border border-brand/20 bg-brand/[0.04] p-4 text-sm text-muted-foreground sm:p-5">
        Historical payments were made outside Playtives and are shown for your records only. They are not wallet credits or part of your current portfolio value. Future distributions, where applicable, follow the normal admin-approved payout process.
      </div>
      {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading your historical opportunities…</p> : null}
      {error ? <p role="alert" className="mt-8 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{error}</p> : null}
      {!loading && !error && positions.length === 0 ? (
        <div className="mt-8 rounded-2xl border bg-background p-8 text-center"><Archive className="mx-auto size-8 text-brand" /><h2 className="mt-3 font-semibold">No historical opportunities</h2><p className="mt-1 text-sm text-muted-foreground">Any historical positions assigned to your account will appear here.</p></div>
      ) : null}
      {!loading && !error && positions.length > 0 ? (
        <>
          <div className="mt-8 flex flex-wrap gap-2" role="group" aria-label="Filter historical opportunities">
            {([{ value: 'ALL', label: 'All' }, { value: 'ACTIVE', label: 'Active' }, { value: 'PAST', label: 'Completed & exited' }] as const).map((tab) => (
              <button key={tab.value} type="button" onClick={() => setFilter(tab.value)} aria-pressed={filter === tab.value} className={`rounded-full px-5 py-2 text-xs font-semibold ${filter === tab.value ? 'bg-brand text-brand-foreground' : 'bg-surface text-muted-foreground'}`}>{tab.label}</button>
            ))}
          </div>
          <div className="mt-5 grid gap-4">{visible.map((position) => <LegacyPositionCard key={position._id} position={position} />)}</div>
          {visible.length === 0 ? <p className="mt-5 rounded-xl border p-6 text-center text-sm text-muted-foreground">No positions in this category.</p> : null}
        </>
      ) : null}
    </main>
  );
}

function DetailStat({ label, value }: Readonly<{ label: string; value: React.ReactNode }>): React.JSX.Element {
  return <div className="rounded-xl bg-surface p-4"><p className="text-xs text-muted-foreground">{label}</p><div className="mt-1 font-semibold">{value}</div></div>;
}

export function LegacyOwnershipDetailPage({ id }: Readonly<{ id: string }>): React.JSX.Element {
  const { positions, loading, error } = useLegacyOwnerships();
  const position = positions.find((item) => item._id === id);

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <Link href="/ownership/legacy" className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"><ArrowLeft className="size-4" /> All legacy opportunities</Link>
      {loading ? <p className="mt-8 text-sm text-muted-foreground">Loading your historical position…</p> : null}
      {error ? <p role="alert" className="mt-8 rounded-xl border border-destructive/30 p-4 text-sm text-destructive">{error}</p> : null}
      {!loading && !error && !position ? <div className="mt-8 rounded-2xl border p-8"><h1 className="font-semibold">Position not found</h1><p className="mt-2 text-sm text-muted-foreground">This historical position is not available to your account.</p></div> : null}
      {position ? (
        <>
          <header className="mt-6 overflow-hidden rounded-2xl border bg-background">
            {position.opportunity.imageUrl ? <div className="relative aspect-[3/1] min-h-44"><Image src={position.opportunity.imageUrl} alt={position.opportunity.imageAlt || position.opportunity.title} fill unoptimized sizes="(max-width: 1024px) 100vw, 900px" className="object-cover" /></div> : null}
            <div className="p-5 sm:p-7"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand">Historical opportunity · {statusLabel(position)}</p><h1 className="mt-2 font-sans text-2xl font-semibold sm:text-3xl">{position.opportunity.title}</h1>{position.opportunity.summary ? <p className="mt-2 text-sm text-muted-foreground">{position.opportunity.summary}</p> : null}</div>
          </header>
          <div className="mt-5 rounded-2xl border border-brand/20 bg-brand/[0.04] p-4 text-sm text-muted-foreground sm:p-5">Past payments shown here were made outside Playtives. They are records, not wallet credits. Any remaining distributions require admin approval before crediting your wallet.</div>
          <section className="mt-8" aria-labelledby="legacy-position-heading"><h2 id="legacy-position-heading" className="text-lg font-semibold">Your position</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <DetailStat label="Original capital" value={money(position.principalMinorUnits)} />
            <DetailStat label="Units owned" value={position.units} />
            <DetailStat label="Participating months" value={`Month ${position.firstCycle}–${position.lastCycle}`} />
            <DetailStat label="Started" value={date(position.participationStartAt)} />
            <DetailStat label="Scheduled end" value={date(position.endAt)} />
            <DetailStat label="Remaining months" value={position.remainingCycles} />
          </div></section>
          <section className="mt-8" aria-labelledby="legacy-payments-heading"><h2 id="legacy-payments-heading" className="text-lg font-semibold">Earlier payment records</h2><p className="mt-1 text-sm text-muted-foreground">These amounts were settled outside Playtives.</p><div className="mt-4 grid gap-3 sm:grid-cols-3">
            <DetailStat label="Paid externally" value={money(paidExternally(position))} />
            <DetailStat label="Rolled over" value={money(rolledOver(position))} />
            <DetailStat label="Capital returned" value={money(position.capitalReturnedMinorUnits)} />
          </div></section>
          <section className="mt-8" aria-labelledby="legacy-months-heading"><h2 id="legacy-months-heading" className="text-lg font-semibold">Monthly record</h2><div className="mt-4 overflow-hidden rounded-2xl border bg-background">
            {position.periods.length === 0 ? <p className="p-5 text-sm text-muted-foreground">No earlier monthly payments have been recorded.</p> : null}
            {position.periods.filter((period) => period.cycleNumber >= position.firstCycle && period.cycleNumber <= position.lastCycle).map((period) => (
              <div key={period.cycleNumber} className="border-b p-4 last:border-b-0 sm:p-5"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold">Month {period.cycleNumber}</h3><p className="flex items-center gap-1 text-xs text-muted-foreground"><CalendarDays className="size-3" aria-hidden="true" /> {date(period.dueAt)}</p></div><span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-brand">{period.status.replaceAll('_', ' ').toLowerCase()}</span></div><div className="mt-3 grid gap-2 text-sm sm:grid-cols-2"><p>Paid externally: <span className="font-semibold">{money(period.paidMinorUnits)}</span></p><p>Rolled over: <span className="font-semibold">{money(period.rolledOverMinorUnits)}</span></p></div></div>
            ))}
          </div></section>
          {position.hasLiveOwnership && position.ownershipId ? <Link href={`/ownership/${position.ownershipId}`} className="mt-8 inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-3 text-sm font-semibold text-brand-foreground hover:opacity-90">View current ownership and payouts <ArrowRight className="size-4" /></Link> : null}
          {(position.opportunity.about || position.opportunity.agreement) ? <section className="mt-8 space-y-5 rounded-2xl border bg-background p-5 sm:p-7">{position.opportunity.about ? <div><h2 className="font-semibold">About this opportunity</h2><p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{position.opportunity.about}</p></div> : null}{position.opportunity.agreement ? <div><h2 className="font-semibold">Agreement</h2><p className="mt-2 whitespace-pre-line text-sm text-muted-foreground">{position.opportunity.agreement}</p></div> : null}</section> : null}
        </>
      ) : null}
    </main>
  );
}
