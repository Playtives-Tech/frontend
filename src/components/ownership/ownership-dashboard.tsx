'use client';

import { Archive, ChevronDown, ChevronRight, SlidersHorizontal, Sprout } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  getOwnershipProjection,
  getOwnerships,
  type Ownership,
} from '@/lib/services/ownership-service';
import { cn } from '@/lib/utils';
import { BalanceAmount } from '@/components/ui/balance-amount';
import { formatReturnSchedule } from '@/lib/opportunities';
import { opportunityInterestService, type OpportunityInterest } from '@/lib/opportunities';
import { formatNaira } from './formatters';
import { getLegacyOwnerships, type LegacyOwnership } from '@/lib/services/legacy-ownership-service';
import {
  getCollectiveDashboard,
  getCollectivePortfolioPosition,
  type CollectivePortfolioPosition,
} from '@/lib/services/collectives-service';

type OwnershipTab = 'active' | 'awaiting' | 'completed';
type OwnershipStructureFilter = 'ALL' | 'CO_FUNDING' | 'CO_OWNERSHIP' | 'COLLECTIVE';
const tabs = [
  { value: 'active', label: 'Active' },
  { value: 'awaiting', label: 'Awaiting' },
  { value: 'completed', label: 'Completed' },
] as const;

function ownershipStructure(ownership: Ownership): Ownership['opportunityStructure'] {
  return ownership.opportunityId.opportunityStructure ?? ownership.opportunityStructure;
}

function legacySummary(position: LegacyOwnership) {
  const paid = position.periods.reduce((total, period) => total + period.paidMinorUnits, 0);
  const rolled = position.periods.reduce((total, period) => total + period.rolledOverMinorUnits, 0);
  const expected = position.periods.reduce(
    (total, period) => total + (period.expectedReturnMinorUnits ?? 0),
    0,
  );
  return { paid, rolled, expected, capital: Math.max(0, position.principalMinorUnits + rolled - position.capitalReturnedMinorUnits) };
}

function OwnershipCard({ ownership }: Readonly<{ ownership: Ownership }>): React.JSX.Element {
  const opportunity = ownership.opportunityId;
  const projection = getOwnershipProjection(ownership);
  const lifecycleLabel =
    ownership.status === 'COMPLETED'
      ? 'Cycle completed'
      : opportunity.executionProgress?.stage !== 'DEAL_ACTIVE' && opportunity.executionProgress
        ? opportunity.executionProgress.label
        : 'Cycle in progress';
  return (
    <Link
      href={`/ownership/${ownership._id}`}
      className="group grid overflow-hidden rounded-2xl border bg-background transition-colors hover:border-brand/30 sm:grid-cols-[5rem_1fr_auto_auto] sm:items-center sm:gap-4 sm:px-3 sm:py-2"
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
          {ownership.units} {ownership.units === 1 ? 'unit' : 'units'} · {lifecycleLabel}
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

function CollectivePositionCard({
  position,
}: Readonly<{ position: CollectivePortfolioPosition }>): React.JSX.Element {
  const statusLabel =
    position.status === 'COMPLETED'
      ? 'Collective completed'
      : position.activeCapitalMinorUnits > 0 && position.awaitingDeploymentMinorUnits > 0
        ? 'In progress · funds awaiting deployment'
        : position.status === 'ACTIVE'
          ? 'In progress'
          : 'Awaiting deployment';
  const cycleLabel = position.cycleNumber
    ? `Month ${position.cycleNumber} of ${position.totalCycles}`
    : '12-month Collective';
  const projectedTarget =
    position.projectedTargetRateBps === null
      ? null
      : `~${(position.projectedTargetRateBps / 100).toFixed(2).replace(/\.00$/, '')}% monthly`;

  return (
    <Link
      href="/collectives"
      className="group grid overflow-hidden rounded-2xl border border-brand/20 bg-brand/[0.035] transition-colors hover:border-brand/45 sm:grid-cols-[5rem_1fr_auto] sm:items-center sm:gap-4 sm:px-3 sm:py-2"
    >
      <div className="grid aspect-video place-items-center bg-brand/10 text-brand sm:aspect-square sm:rounded-xl">
        <Sprout className="size-12 stroke-[2.2]" aria-hidden="true" />
      </div>
      <div className="px-4 py-3 sm:px-0 sm:py-0">
        <h2 className="font-sans text-[14px] font-bold">{position.title}</h2>
        <p className="text-[12px] text-muted-foreground">
          {cycleLabel} · {statusLabel}
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-xl bg-background px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">
              {position.status === 'COMPLETED' ? 'Completed value' : 'Your active contribution'}
            </p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              <BalanceAmount
                value={formatNaira(
                  (position.status === 'COMPLETED'
                    ? position.displayValueMinorUnits
                    : position.activeCapitalMinorUnits) / 100,
                )}
              />
            </p>
          </div>
          <div className="rounded-xl bg-background px-3 py-2.5">
            <p className="text-xs font-medium text-muted-foreground">Awaiting deployment</p>
            <p className="mt-0.5 text-sm font-semibold text-foreground">
              <BalanceAmount value={formatNaira(position.awaitingDeploymentMinorUnits / 100)} />
            </p>
          </div>
          <div className="min-w-0 rounded-xl bg-background px-2.5 py-2.5 sm:col-span-2 sm:px-3 lg:col-span-1 lg:px-2.5 xl:px-3">
            <p className="whitespace-nowrap text-[11px] font-medium text-muted-foreground xl:text-xs">
              Projected monthly return
            </p>
            {projectedTarget ? (
              <p className="mt-0.5 whitespace-nowrap text-[13px] font-semibold text-brand xl:text-sm">
                {projectedTarget}
              </p>
            ) : (
              <p className="mt-0.5 text-sm font-semibold text-muted-foreground">Not available</p>
            )}
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
  const [legacyOwnerships, setLegacyOwnerships] = useState<LegacyOwnership[]>([]);
  const [legacyLoading, setLegacyLoading] = useState(true);
  const [legacyError, setLegacyError] = useState('');
  const [collectivePosition, setCollectivePosition] = useState<CollectivePortfolioPosition | null>(
    null,
  );
  const [interests, setInterests] = useState<
    Array<OpportunityInterest & { opportunityId: { title: string; slug: string } }>
  >([]);
  const [error, setError] = useState('');
  useEffect(() => {
    void getOwnerships()
      .then(setOwnerships)
      .catch((value: unknown) =>
        setError(value instanceof Error ? value.message : 'Could not load ownerships'),
      );
    void getLegacyOwnerships()
      .then(setLegacyOwnerships)
      .catch((value: unknown) => {
        setLegacyOwnerships([]);
        setLegacyError(value instanceof Error ? value.message : 'Could not load legacy opportunities');
      })
      .finally(() => setLegacyLoading(false));
    void opportunityInterestService
      .listMine()
      .then(setInterests)
      .catch(() => setInterests([]));
    void getCollectiveDashboard()
      .then((dashboard) => setCollectivePosition(getCollectivePortfolioPosition(dashboard)))
      .catch(() => setCollectivePosition(null));
  }, []);
  const active = useMemo(() => ownerships.filter((item) => item.status === 'ACTIVE' && !item.opportunityId.historicalOnly), [ownerships]);
  const visible = ownerships.filter(
    (item) =>
      tab !== 'awaiting' &&
      item.status === tab.toUpperCase() &&
      !item.opportunityId.historicalOnly &&
      structureFilter !== 'COLLECTIVE' &&
      (structureFilter === 'ALL' || ownershipStructure(item) === structureFilter),
  );
  const collectiveMatchesTab =
    collectivePosition !== null &&
    ((tab === 'completed' && collectivePosition.status === 'COMPLETED') ||
      (tab === 'active' &&
        collectivePosition.status !== 'COMPLETED' &&
        collectivePosition.activeCapitalMinorUnits > 0) ||
      (tab === 'awaiting' &&
        collectivePosition.status !== 'COMPLETED' &&
        collectivePosition.awaitingDeploymentMinorUnits > 0)) &&
    (structureFilter === 'ALL' || structureFilter === 'COLLECTIVE');
  const currentCollectiveValue =
    collectivePosition?.status === 'COMPLETED'
      ? 0
      : (collectivePosition?.displayValueMinorUnits ?? 0);
  const currentTotal =
    active.reduce((total, item) => total + item.amountMinorUnits, 0) + currentCollectiveValue;
  const currentPositionCount = active.length + (currentCollectiveValue > 0 ? 1 : 0);
  const activeMonthlyProjection = getTotalMonthlyProjection(active);
  return (
    <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
      <header>
        <h1 className="sm:text-2.5xl font-sans text-2xl font-semibold tracking-tight">
          My portfolio
        </h1>
        <p className="font-sans text-[14px] text-muted-foreground">
          Track your active ownership and Wealth Collective positions.
        </p>
      </header>
      <section className="playtives-gold-card mt-6 rounded-2xl p-5 text-white sm:p-6">
        <p className="font-sans text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
          Total portfolio value
        </p>
        <div className="mt-3 font-sans text-2xl font-semibold sm:text-3xl">
          <BalanceAmount value={formatNaira(currentTotal / 100)} toggle />
        </div>
        <p className="mt-3 text-[13px] text-brand-foreground/75">
          Across {currentPositionCount} current{' '}
          {currentPositionCount === 1 ? 'position' : 'positions'}, including committed funds
        </p>
        <div className="mt-4 justify-end border-t border-white/15 pt-4 align-baseline">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-foreground/65">
            Total projected monthly return
          </p>
          <p className="mt-1 text-lg font-semibold text-brand-foreground sm:text-xl">
            <BalanceAmount value={activeMonthlyProjection} />
          </p>
        </div>
      </section>
      {(legacyLoading || legacyError || legacyOwnerships.length > 0) ? <section className="mt-10 rounded-2xl border bg-background p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-brand"><Archive className="size-4" aria-hidden="true" /> Your legacy positions</p>
              <h2 className="mt-2 text-lg font-semibold">Legacy opportunities</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Ongoing and completed opportunities linked to your account. Open any position for its month-by-month history and recorded outcomes. Historical payments were made outside Playtives and are not wallet credits.</p>
            </div>
            {legacyOwnerships.length > 0 ? <Link href="/ownership/legacy" className="inline-flex items-center gap-2 rounded-xl border border-brand/25 px-4 py-2.5 text-sm font-semibold text-brand hover:bg-brand/5">View all {legacyOwnerships.length} <ChevronRight className="size-4" aria-hidden="true" /></Link> : null}
          </div>
          {legacyError ? <p role="alert" className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">Legacy opportunities could not be loaded. Refresh this page or sign out and back in; if it continues, contact support.</p> : null}
          {legacyLoading && !legacyError ? <p className="mt-4 text-sm text-muted-foreground">Loading positions linked to your account…</p> : null}
          <div className="mt-5 grid gap-3">
            {legacyOwnerships.map((position) => {
              const summary = legacySummary(position);
              const liveOwnership = ownerships.find((item) => item._id === position.ownershipId);
              return (
                <Link key={position._id} href={`/ownership/legacy/${position._id}`} className="group rounded-xl bg-surface p-4 transition hover:bg-brand/5 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{position.opportunity.title}</span>
                      <span className="mt-1 block text-xs text-muted-foreground">{position.status === 'ACTIVE' ? 'Ongoing' : position.status === 'COMPLETED' ? 'Completed' : 'Exited'} · Months {position.firstCycle}–{position.lastCycle} · {position.remainingCycles} {position.remainingCycles === 1 ? 'month' : 'months'} remaining</span>
                    </span>
                    <ChevronRight className="mt-1 size-4 shrink-0 text-brand transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </div>
                  <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
                    <div><p className="text-xs text-muted-foreground">Capital still in position*</p><p className="mt-1 font-semibold"><BalanceAmount value={formatNaira(summary.capital / 100)} /></p></div>
                    <div><p className="text-xs text-muted-foreground">Paid outside Playtives</p><p className="mt-1 font-semibold"><BalanceAmount value={formatNaira(summary.paid / 100)} /></p></div>
                    <div><p className="text-xs text-muted-foreground">Recorded as rolled over</p><p className="mt-1 font-semibold"><BalanceAmount value={formatNaira(summary.rolled / 100)} /></p></div>
                    <div><p className="text-xs text-muted-foreground">Projected return**</p><p className="mt-1 font-semibold">{liveOwnership?.projectedReturnMinorUnits != null ? <BalanceAmount value={formatNaira(liveOwnership.projectedReturnMinorUnits / 100)} /> : summary.expected > 0 ? <BalanceAmount value={formatNaira(summary.expected / 100)} /> : 'Not available'}</p></div>
                  </div>
                  <p className="mt-3 text-[11px] leading-5 text-muted-foreground">*Based on documented principal, rollovers and capital returned; not a wallet balance. **Projection is not a guaranteed payout. Tap to view monthly records and resolved amounts.</p>
                </Link>
              );
            })}
          </div>
      </section> : null}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="scrollbar-none flex gap-2 overflow-x-auto pb-1">
          {tabs.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value)}
              className={cn(
                'shrink-0 rounded-full px-7 py-2 text-[12px] font-semibold transition',
                tab === value
                  ? 'bg-brand text-brand-foreground'
                  : 'bg-surface text-muted-foreground',
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
              onChange={(event) =>
                setStructureFilter(event.target.value as OwnershipStructureFilter)
              }
              className="appearance-none rounded-full border bg-background px-4 py-2 pr-11 text-xs font-semibold text-foreground outline-none focus:border-brand"
              aria-label="Filter ownerships by type"
            >
              <option value="ALL">All</option>
              <option value="CO_FUNDING">Co-funded</option>
              <option value="CO_OWNERSHIP">Co-owned</option>
              <option value="COLLECTIVE">Wealth Collective</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
          </span>
        </label>
      </div>
      <section className="mt-6 grid gap-4">
        {error && (
          <p className="border-destructive/30 text-destructive rounded-xl border p-4 text-sm">
            {error}
          </p>
        )}
        {!error && visible.length === 0 && !collectiveMatchesTab && (
          <p className="rounded-2xl border bg-background p-8 text-center text-[13px] text-muted-foreground">
            No {tab} {portfolioFilterLabel(structureFilter)}portfolio positions yet.
          </p>
        )}
        {collectiveMatchesTab && collectivePosition ? (
          <CollectivePositionCard position={collectivePosition} />
        ) : null}
        {visible.map((ownership) => (
          <OwnershipCard key={ownership._id} ownership={ownership} />
        ))}
      </section>
      {/* {interests.length > 0 ? (
        <section className="mt-10">
          <div>
            <h2 className="text-lg font-semibold">Interests / Coming soon</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              These are expressions of interest only and are not part of your portfolio value.
            </p>
          </div>
          <div className="mt-4 grid gap-3">
            {interests.map((interest) => (
              <InterestCard key={interest._id} interest={interest} />
            ))}
          </div>
        </section>
      ) : null} */}
    </div>
  );
}

function portfolioFilterLabel(filter: OwnershipStructureFilter): string {
  if (filter === 'CO_FUNDING') return 'co-funded ';
  if (filter === 'CO_OWNERSHIP') return 'co-owned ';
  if (filter === 'COLLECTIVE') return 'Wealth Collective ';
  return '';
}

function getTotalMonthlyProjection(ownerships: Ownership[]): string {
  const monthlyOwnerships = ownerships.filter(
    (ownership) => ownership.returnSchedule === 'MONTHLY',
  );
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

function InterestCard({
  interest,
}: Readonly<{
  interest: OpportunityInterest & { opportunityId: { title: string; slug: string } };
}>): React.JSX.Element {
  const readiness =
    interest.capitalReadiness === 'available_now'
      ? 'Available now'
      : interest.capitalReadiness === 'within_7_days'
        ? 'Within 7 days'
        : 'Not sure yet';
  const money = (amount: number | null) =>
    new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: interest.currency ?? 'NGN',
      maximumFractionDigits: 0,
    }).format(amount ?? 0);
  return (
    <div className="rounded-2xl border border-brand/20 bg-brand/[.04] p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-brand">Interest registered</p>
      <h3 className="mt-1 text-lg font-semibold">{interest.opportunityId.title}</h3>
      <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
        <div>
          <p className="text-xs text-muted-foreground">Opening capital</p>
          <p className="mt-1 font-semibold">{money(interest.openingCapital)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Monthly commitment</p>
          <p className="mt-1 font-semibold">{money(interest.recurringAmount)}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Capital readiness</p>
          <p className="mt-1 font-semibold">{readiness}</p>
        </div>
      </div>
      <p className="mt-4 text-sm text-muted-foreground">No payment required yet.</p>
      <Link
        href={`/discover/${interest.opportunityId.slug}`}
        className="mt-4 inline-flex rounded-xl border border-brand/30 px-4 py-2 text-sm font-semibold text-brand"
      >
        View / Edit interest
      </Link>
    </div>
  );
}
