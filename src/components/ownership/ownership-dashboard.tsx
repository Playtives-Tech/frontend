'use client';

import { ChevronDown, ChevronRight, SlidersHorizontal } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getOwnershipProjection, getOwnerships, type Ownership } from '@/lib/services/ownership-service';
import { cn } from '@/lib/utils';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { formatReturnSchedule } from '@/lib/opportunities';
import { opportunityInterestService, type OpportunityInterest } from '@/lib/opportunities';
import { formatNaira } from './formatters';

type OwnershipTab = 'active' | 'completed';
type OwnershipStructureFilter = 'ALL' | 'CO_FUNDING' | 'CO_OWNERSHIP';
const tabs = [
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
] as const;

function ownershipStructure(ownership: Ownership): Ownership['opportunityStructure'] {
  return ownership.opportunityId.opportunityStructure ?? ownership.opportunityStructure;
}

function OwnershipCard({ ownership }: Readonly<{ ownership: Ownership }>): React.JSX.Element {
  const opportunity = ownership.opportunityId;
  const projection = getOwnershipProjection(ownership);
  return (
    <Link
      href={`/ownership/${ownership._id}`}
      className="group grid overflow-hidden rounded-2xl border bg-background transition-colors hover:border-brand/30 sm:gap-4 sm:px-3 sm:py-2 sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center"
    >
      <div className="relative aspect-video overflow-hidden bg-muted sm:aspect-square sm:rounded-xl">
        {opportunity.imageUrl && (
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt || opportunity.title}
            fill
            sizes="160px"
            className="object-cover"
          />
        )}
      </div>
      <div className="px-4 py-3 sm:px-0 sm:py-0">
        <h2 className="font-sans text-[14px] font-bold">{opportunity.title}</h2>
        <p className="text-[12px] text-muted-foreground">
          {ownership.units} {ownership.units === 1 ? 'unit' : 'units'} · {ownership.status === 'COMPLETED' ? 'Cycle completed' : 'Cycle in progress'}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Your contribution</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              <BalanceAmount value={formatNaira(ownership.amountMinorUnits / 100)} />
            </p>
          </div>

          <div className="rounded-xl bg-surface px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              Projected {formatReturnSchedule(ownership.returnSchedule).toLowerCase()} distribution
            </p>
            <div className="mt-0.5 text-sm font-semibold text-brand">
              <BalanceAmount value={projection.amount} />
            </div>
          </div>
        </div>
      </div>
      <ChevronRight className="hidden size-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-brand sm:block" />
    </Link>
  );
}

export function OwnershipDashboard(): React.JSX.Element {
  const [tab, setTab] = useState<OwnershipTab>('active');
  const [structureFilter, setStructureFilter] = useState<OwnershipStructureFilter>('ALL');
  const [ownerships, setOwnerships] = useState<Ownership[]>([]);
  const [interests, setInterests] = useState<Array<OpportunityInterest & { opportunityId: { title: string; slug: string } }>>([]);
  const [error, setError] = useState('');
  useEffect(() => {
    void getOwnerships()
      .then(setOwnerships)
      .catch((value: unknown) =>
        setError(value instanceof Error ? value.message : 'Could not load ownerships'),
      );
    void opportunityInterestService.listMine().then(setInterests).catch(() => setInterests([]));
  }, []);
  const active = useMemo(() => ownerships.filter((item) => item.status === 'ACTIVE'), [ownerships]);
  const visible = ownerships.filter(
    (item) =>
      item.status === tab.toUpperCase() &&
      (structureFilter === 'ALL' || ownershipStructure(item) === structureFilter),
  );
  const activeTotal = active.reduce((total, item) => total + item.amountMinorUnits, 0);
  const activeMonthlyProjection = getTotalMonthlyProjection(active);
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="sm:text-2.5xl font-sans text-2xl font-semibold tracking-tight">
          My ownership
        </h1>
        <p className="font-sans text-[14px] text-muted-foreground">
          Co-own/co-fund and share profit monthly
        </p>
      </header>
      <section className="playtives-gold-card mt-6 rounded-2xl p-5 text-white sm:p-6">
        <p className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
          Total active ownership
        </p>
        <div className="mt-3 font-sans text-2xl font-semibold sm:text-3xl">
          <BalanceAmount value={formatNaira(activeTotal / 100)} toggle />
        </div>
        <p className="mt-3 text-[13px] text-brand-foreground/75">
          Across {active.length} active {active.length === 1 ? 'ownership' : 'ownerships'}
        </p>
        <div className="mt-4 border-t border-white/15 pt-4 align-baseline justify-end">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-foreground/65">
            Total projected monthly return
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-foreground sm:text-xl">
            <BalanceAmount value={activeMonthlyProjection} />
          </p>
        </div>
      </section>
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {tabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'shrink-0 rounded-full px-7 py-2 text-[12px] font-semibold transition',
                tab === value ? 'bg-brand text-brand-foreground' : 'bg-surface text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-2 rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground sm:px-4">
          <SlidersHorizontal className="size-3.5 text-brand" aria-hidden="true" />
          <span>Type</span>
          <span className="relative">
            <select
              value={structureFilter}
              onChange={(event) => setStructureFilter(event.target.value as OwnershipStructureFilter)}
              className="appearance-none rounded-full border bg-background px-4 py-2 pr-11 text-xs font-semibold text-foreground outline-none focus:border-brand"
              aria-label="Filter ownerships by type"
            >
              <option value="ALL">All</option>
              <option value="CO_FUNDING">Co-funded</option>
              <option value="CO_OWNERSHIP">Co-owned</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          </span>
        </label>
      </div>
      <section className="mt-6 grid gap-4">
        {error && (
          <p className="border-destructive/30 text-destructive rounded-xl border p-4 text-sm">
            {error}
          </p>
        )}
        {!error && visible.length === 0 && (
          <p className="rounded-2xl border bg-background p-8 text-center text-[13px] text-muted-foreground">
            No {tab} {structureFilter === 'ALL' ? '' : structureFilter === 'CO_FUNDING' ? 'co-funded ' : 'co-owned '}ownership units yet.
          </p>
        )}
        {visible.map((ownership) => (
          <OwnershipCard key={ownership._id} ownership={ownership} />
        ))}
      </section>
      {interests.length > 0 ? <section className="mt-10"><div><h2 className="text-lg font-semibold">Interests / Coming soon</h2><p className="mt-1 text-sm text-muted-foreground">These are expressions of interest only and are not part of your portfolio value.</p></div><div className="mt-4 grid gap-3">{interests.map((interest) => <InterestCard key={interest._id} interest={interest} />)}</div></section> : null}
    </div>
  );
}

function getTotalMonthlyProjection(ownerships: Ownership[]): string {
  const monthlyOwnerships = ownerships.filter((ownership) => ownership.returnSchedule === 'MONTHLY');
  const projection = monthlyOwnerships.reduce(
    (total, ownership) => {
      const opportunity = ownership.opportunityId;
      const minimum =
        ownership.projectedDistributionMinimumMinorUnits ??
        (opportunity.projectedDistributionPerUnitMinimumMinorUnits == null
          ? null
          : opportunity.projectedDistributionPerUnitMinimumMinorUnits * ownership.units);
      const maximum =
        ownership.projectedDistributionMaximumMinorUnits ??
        (opportunity.projectedDistributionPerUnitMaximumMinorUnits == null
          ? null
          : opportunity.projectedDistributionPerUnitMaximumMinorUnits * ownership.units);
      const amount =
        ownership.projectedReturnMinorUnits ??
        Math.round((ownership.amountMinorUnits * ownership.projectedReturnRatePercent) / 100);

      return {
        minimum: total.minimum + (minimum ?? amount),
        maximum: total.maximum + (maximum ?? amount),
      };
    },
    { minimum: 0, maximum: 0 },
  );

  return projection.minimum === projection.maximum
    ? formatNaira(projection.minimum / 100)
    : `${formatNaira(projection.minimum / 100)}–${formatNaira(projection.maximum / 100)}`;
}

function InterestCard({ interest }: Readonly<{ interest: OpportunityInterest & { opportunityId: { title: string; slug: string } } }>): React.JSX.Element { const readiness = interest.capitalReadiness === 'available_now' ? 'Available now' : interest.capitalReadiness === 'within_7_days' ? 'Within 7 days' : 'Not sure yet'; const money = (amount: number | null) => new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(amount ?? 0); return <div className="rounded-2xl border border-brand/20 bg-brand/[.04] p-5"><p className="text-xs font-bold uppercase tracking-wide text-brand">Interest registered</p><h3 className="mt-1 text-lg font-semibold">{interest.opportunityId.title}</h3><div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Opening capital</p><p className="mt-1 font-semibold">{money(interest.openingCapital)}</p></div><div><p className="text-xs text-muted-foreground">Monthly commitment</p><p className="mt-1 font-semibold">{money(interest.recurringAmount)}</p></div><div><p className="text-xs text-muted-foreground">Capital readiness</p><p className="mt-1 font-semibold">{readiness}</p></div></div><p className="mt-4 text-sm text-muted-foreground">No payment required yet.</p><Link href={`/discover/${interest.opportunityId.slug}`} className="mt-4 inline-flex rounded-xl border border-brand/30 px-4 py-2 text-sm font-semibold text-brand">View / Edit interest</Link></div>; }
