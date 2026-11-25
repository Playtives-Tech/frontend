'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { IconActivity, IconArrowUpRight, IconBriefcase, IconChartBar, IconChartLine, IconChartPie, IconChevronDown, IconCircleCheck, IconClock, IconInfoCircle, IconLayoutGrid, IconListDetails, IconTrendingUp, IconX } from '@tabler/icons-react';
import { trackEvent } from '@/lib/product-analytics';
import { getPortfolio, type PortfolioPosition } from '@/lib/services/portfolio-service';
import { getWealthGoal } from '@/lib/services/wealth-goal-service';
import { formatCompactNairaMinorUnits, formatNaira } from './formatters';

const money = (value: number): string => formatNaira(value / 100);
const compactMoney = formatCompactNairaMinorUnits;
const names: Record<PortfolioPosition['kind'], string> = {
  CO_FUNDING: 'Co-Funding',
  CO_OWNERSHIP: 'Co-Ownership',
  FULL_OWNERSHIP: 'Full Ownership',
  COLLECTIVE: 'Wealth Collective',
};
const returns: Record<PortfolioPosition['returnType'], string> = {
  MONTHLY_INCOME: 'Monthly income',
  YEARLY_INCOME: 'Yearly income',
  AT_MATURITY: 'At-maturity return',
  VARIABLE_PROFIT_SHARE: 'Variable profit share',
  COMPOUNDED: 'Compounded return',
  NO_CURRENT_INCOME: 'No current income',
};
type Tab = 'ACTIVE' | 'PENDING' | 'COMPLETED' | 'ALL';

export function PortfolioV2(): React.JSX.Element {
  useEffect(() => { trackEvent('portfolio_viewed'); }, []);
  const portfolio = useQuery({ queryKey: ['portfolio'], queryFn: getPortfolio });
  const goal = useQuery({ queryKey: ['wealth-goal'], queryFn: getWealthGoal });
  const [tab, setTab] = useState<Tab>('ACTIVE');
  const [kind, setKind] = useState<'ALL' | PortfolioPosition['kind']>('ALL');
  const [positionPage, setPositionPage] = useState(1);
  const [exactGoalOpen, setExactGoalOpen] = useState(false);
  const [scoreDetailsOpen, setScoreDetailsOpen] = useState(false);
  const data = portfolio.data;
  const scoreCard = useRef<HTMLElement | null>(null);
  useEffect(() => {
    if (!data?.wealthBuilderScore || !scoreCard.current || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      trackEvent('wealth_builder_score_viewed', { score_band: data.wealthBuilderScore.band });
      observer.disconnect();
    }, { threshold: 0.5 });
    observer.observe(scoreCard.current);
    return () => observer.disconnect();
  }, [data?.wealthBuilderScore]);
  const target = goal.data?.targetPortfolioMinorUnits ?? null;
  const rawProgress = data && target ? (data.productivePortfolioMinorUnits / target) * 100 : 0;
  const progressLabel = `${rawProgress.toFixed(2)}%`;
  useEffect(() => {
    if (!exactGoalOpen && !scoreDetailsOpen) return;
    const onEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') { setExactGoalOpen(false); setScoreDetailsOpen(false); } };
    window.addEventListener('keydown', onEscape);
    return () => window.removeEventListener('keydown', onEscape);
  }, [exactGoalOpen, scoreDetailsOpen]);
  const visible =
    data?.positions.filter(
      (item) => (tab === 'ALL' || item.status === tab) && (kind === 'ALL' || item.kind === kind),
    ) ?? [];
  const positionPageSize = 6;
  const positionPageCount = Math.ceil(visible.length / positionPageSize);
  const currentPositionPage = Math.min(positionPage, Math.max(1, positionPageCount));
  const pagedPositions = visible.slice((currentPositionPage - 1) * positionPageSize, currentPositionPage * positionPageSize);
  const sectorTotal = data?.sectors.reduce((sum, item) => sum + item.amountMinorUnits, 0) ?? 0;
  const largestSector =
    data?.sectors.reduce<(typeof data.sectors)[number] | null>(
      (largest, item) =>
        !largest || item.amountMinorUnits > largest.amountMinorUnits ? item : largest,
      null,
    ) ?? null;
  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-7 sm:px-8 lg:py-10">
      <header>
        <h1 className="text-2xl font-semibold">My Portfolio</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your Playtives positions and progress.</p>
      </header>
      {portfolio.isPending ? (
        <p role="status" className="rounded-2xl border p-6">
          Loading your portfolio…
        </p>
      ) : null}
      {portfolio.isError ? (
        <section className="rounded-2xl border p-6">
          <h2 className="font-semibold">Portfolio unavailable</h2>
          <p className="mt-1 text-sm">We couldn’t load your portfolio right now.</p>
          <button
            onClick={() => void portfolio.refetch()}
            className="mt-4 rounded-lg bg-brand px-4 py-2 text-white"
          >
            Try again
          </button>
        </section>
      ) : null}
      {data ? (
        <>
          <section className="rounded-2xl border border-brand/20 bg-background p-5 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <IconChartLine className="size-5 text-brand" stroke={1.8} aria-hidden="true" />
                <h2 className="text-base font-semibold">Wealth goal</h2>
              </div>
              {!goal.isPending && !goal.isError ? (
                <Link href="/#wealth-goal" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand/20 bg-brand/10 px-3 text-xs font-semibold text-brand transition hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                  {target ? 'Edit goal' : 'Set goal'} <IconArrowUpRight className="size-4" stroke={1.8} aria-hidden="true" />
                </Link>
              ) : null}
            </div>
            {goal.isPending ? <p className="mt-4 text-xs text-muted-foreground">Loading your goal…</p> : null}
            {goal.isError ? (
              <p className="mt-4 text-xs text-muted-foreground">Goal unavailable. <button type="button" onClick={() => void goal.refetch()} className="font-semibold text-brand underline">Try again</button></p>
            ) : null}
            {target ? (
              <>
                <div className="mt-5">
                  <p className="text-xs text-muted-foreground">Monthly income target</p>
                  <p className="mt-1 break-words text-lg font-bold tabular-nums text-foreground sm:text-xl">{money(goal.data?.monthlyTargetMinorUnits ?? 0)}</p>
                </div>
                <div className="mt-4 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Portfolio progress</p>
                    <p className="mt-1 text-xs font-semibold tabular-nums">{compactMoney(data.productivePortfolioMinorUnits)} <span className="font-normal text-muted-foreground">of {compactMoney(target)}</span></p>
                  </div>
                  <span className="text-sm font-bold tabular-nums text-brand">{progressLabel}</span>
                </div>
                <div role="progressbar" aria-label="Wealth goal progress" aria-valuenow={Math.min(100, Math.max(0, rawProgress))} aria-valuetext={progressLabel} aria-valuemin={0} aria-valuemax={100} className="mt-3 h-2 overflow-hidden rounded-full bg-brand/10">
                  <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(0, rawProgress))}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <button type="button" onClick={() => setExactGoalOpen(true)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-brand/25 bg-brand/5 px-3 text-xs font-semibold text-brand transition hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><IconListDetails className="size-4" stroke={1.8} aria-hidden="true" />See exact amounts</button>
                  <p className="inline-flex items-center gap-1 text-[11px] text-muted-foreground"><IconInfoCircle className="size-3.5" stroke={1.8} aria-hidden="true" />Planning estimate; returns aren’t guaranteed.</p>
                </div>
              </>
            ) : !goal.isPending && !goal.isError ? <p className="mt-4 text-xs text-muted-foreground">Set a goal to track your progress.</p> : null}
          </section>
          {exactGoalOpen && target ? (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setExactGoalOpen(false); }}>
              <section role="dialog" aria-modal="true" aria-labelledby="exact-goal-title" className="w-full max-w-md rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="exact-goal-title" className="text-base font-semibold">Exact goal amounts</h2>
                  <button type="button" aria-label="Close goal amounts" onClick={() => setExactGoalOpen(false)} className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"><IconX className="size-4" /></button>
                </div>
                <dl className="mt-4 divide-y divide-border rounded-xl border border-border px-4">
                  {[
                    ['Monthly income target', goal.data?.monthlyTargetMinorUnits ?? 0],
                    ['Target portfolio', target],
                    ['Productive portfolio', data.productivePortfolioMinorUnits],
                    ['Remaining', Math.max(0, target - data.productivePortfolioMinorUnits)],
                  ].map(([label, value]) => (
                    <div key={label} className="flex flex-wrap justify-between gap-2 py-3 text-xs"><dt className="text-muted-foreground">{label}</dt><dd className="break-all font-semibold tabular-nums">{money(Number(value))}</dd></div>
                  ))}
                </dl>
              </section>
            </div>
          ) : null}
          <section
            aria-label="Portfolio summary"
            className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          >
            <Summary
              label="Productive Portfolio"
              amount={data.productivePortfolioMinorUnits}
              hint="Capital currently working"
              tone="primary"
            />
            <Summary
              label="Confirmed Returns"
              amount={data.confirmedReturnsMinorUnits}
              hint="Recorded profit and distributions"
            />
            <Summary
              label="Pending Deployment"
              amount={data.pendingDeploymentMinorUnits}
              hint="Allocated, awaiting deployment"
              tone="pending"
            />
            <Summary
              label="Available Wallet"
              amount={data.availableWalletMinorUnits}
              hint="Separate from productive capital"
              tone="wallet"
            />
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="flex flex-col rounded-2xl border border-brand/15 bg-brand/[0.035] p-5">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><IconChartPie className="size-4 text-brand" stroke={1.8} aria-hidden="true" />Portfolio allocation</h2>
              {data.allocation.length ? (
                <div className="mt-4 flex flex-1 flex-col justify-center gap-4">
                  {data.allocation.map((item) => (
                    <div key={item.kind}>
                      <p className="text-xs font-medium">{names[item.kind]}</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-brand/10">
                        <div
                          className="h-full rounded-full bg-brand"
                          style={{
                            width: `${(item.amountMinorUnits / data.productivePortfolioMinorUnits) * 100}%`,
                          }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between gap-3 text-xs font-semibold tabular-nums text-brand">
                        <span title={money(item.amountMinorUnits)}>{compactMoney(item.amountMinorUnits)}</span>
                        <span>{Math.round((item.amountMinorUnits / data.productivePortfolioMinorUnits) * 100)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-xs text-muted-foreground">
                  Allocation appears when capital is deployed.
                </p>
              )}
            </section>
            <section className="rounded-2xl border border-slate-200 bg-slate-50/60 p-5 dark:border-slate-700 dark:bg-slate-900/20">
              <h2 className="flex items-center gap-2 text-sm font-semibold"><IconChartBar className="size-4 text-brand" stroke={1.8} aria-hidden="true" />At a glance</h2>
              <dl className="mt-4 grid gap-x-5 gap-y-4 sm:grid-cols-2">
                <div><dt className="text-xs text-muted-foreground">Active positions</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{data.activePositionCount}</dd></div>
                {sectorTotal > 0 ? <div><dt className="text-xs text-muted-foreground">Known sectors</dt><dd className="mt-1 text-sm font-semibold tabular-nums">{data.sectors.length}</dd></div> : null}
                {data.pendingDeploymentMinorUnits > 0 ? <div><dt className="text-xs text-muted-foreground">Awaiting deployment</dt><dd className="mt-1 break-words text-sm font-semibold tabular-nums" title={money(data.pendingDeploymentMinorUnits)}>{compactMoney(data.pendingDeploymentMinorUnits)}</dd></div> : null}
                {data.pendingSettlementMinorUnits > 0 ? <div><dt className="text-xs text-muted-foreground">Awaiting settlement</dt><dd className="mt-1 break-words text-sm font-semibold tabular-nums" title={money(data.pendingSettlementMinorUnits)}>{compactMoney(data.pendingSettlementMinorUnits)}</dd></div> : null}
              </dl>
              {largestSector && largestSector.amountMinorUnits / sectorTotal >= 0.6 ? (
                <p className="mt-4 border-t border-slate-200 pt-3 text-[11px] text-muted-foreground dark:border-slate-700">Largest known sector: {largestSector.sector} ({Math.round((largestSector.amountMinorUnits / sectorTotal) * 100)}%). Factual allocation, not investment advice.</p>
              ) : null}
              {sectorTotal > 0 && sectorTotal < data.productivePortfolioMinorUnits ? (
                <p className="mt-2 text-[11px] text-muted-foreground">Sector figures exclude Collective and uncategorized capital.</p>
              ) : null}
            </section>
          </div>
          <section ref={scoreCard} className="rounded-2xl border border-brand/15 bg-brand/[0.025] p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <h2 className="flex items-center gap-2 text-sm font-semibold sm:text-base"><IconTrendingUp className="size-5 text-brand" stroke={1.8} aria-hidden="true" />Wealth Builder Score</h2>
              <span className="rounded-full border border-brand/20 bg-brand/5 px-3 py-1 text-xs font-semibold text-brand">{data.wealthBuilderScore.band}</span>
            </div>
            <p className="mt-5 text-2xl font-semibold tabular-nums tracking-tight">
              {data.wealthBuilderScore.score}<span className="ml-1 text-sm font-medium text-muted-foreground">/ {data.wealthBuilderScore.maximum}</span>
            </p>
            <div
              role="progressbar"
              aria-label="Wealth Builder Score"
              aria-valuenow={data.wealthBuilderScore.score}
              aria-valuemin={0}
              aria-valuemax={data.wealthBuilderScore.maximum}
              className="mt-3 h-2 overflow-hidden rounded-full bg-brand/15"
            >
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${Math.min(100, Math.max(0, (data.wealthBuilderScore.score / data.wealthBuilderScore.maximum) * 100))}%` }}
              />
            </div>
            <button type="button" onClick={() => setScoreDetailsOpen(true)} className="mt-4 inline-flex min-h-9 items-center gap-2 rounded-lg border border-brand/25 bg-background px-3 text-xs font-semibold text-brand transition hover:bg-brand/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"><IconListDetails className="size-4" stroke={1.8} aria-hidden="true" />How your score is calculated</button>
            {data.returnTypes.length ? (
              <div className="mt-5 flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-t border-brand/10 pt-4">
                <div className="flex shrink-0 items-center gap-2">
                  <IconChartLine className="size-4 text-brand" stroke={1.8} aria-hidden="true" />
                  <h3 className="text-sm font-semibold">Return structures</h3>
                  <span title="Projected schedules and confirmed returns are shown separately." aria-label="Projected schedules and confirmed returns are shown separately."><IconInfoCircle className="size-4 text-muted-foreground" stroke={1.8} aria-hidden="true" /></span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.returnTypes.map((item) => (
                    <span key={item.type} className="inline-flex items-center gap-2 rounded-lg border border-brand/15 bg-background px-3 py-2 text-xs font-medium">
                      {returns[item.type]} <span className="rounded-md bg-brand/10 px-1.5 py-0.5 font-semibold tabular-nums text-brand">{item.activePositions}</span>
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </section>
          {scoreDetailsOpen ? (
            <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setScoreDetailsOpen(false); }}>
              <section role="dialog" aria-modal="true" aria-labelledby="score-details-title" className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-background p-5 shadow-2xl sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <h2 id="score-details-title" className="text-base font-semibold">How your score is calculated</h2>
                  <button type="button" aria-label="Close score details" onClick={() => setScoreDetailsOpen(false)} className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground hover:text-foreground"><IconX className="size-4" /></button>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">{data.wealthBuilderScore.explanation}</p>
                <ul className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                  {Object.entries(data.wealthBuilderScore.components).map(([label, component]) => (
                    <li key={label} className="flex justify-between gap-3 rounded-lg border bg-muted/30 px-3 py-2">
                      <span className="capitalize">{label}</span><span className="font-semibold tabular-nums">{component.points} / {component.maximum}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-xs text-muted-foreground">This is a progress indicator, not a credit score, risk rating, or forecast of returns.</p>
              </section>
            </div>
          ) : null}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold"><IconBriefcase className="size-5 text-brand" stroke={1.8} aria-hidden="true" />Positions</h2>
              <label className="text-xs font-medium text-muted-foreground">
                Type{' '}
                <span className="relative ml-2 inline-block">
                  <select
                    value={kind}
                    onChange={(event) => { setKind(event.target.value as typeof kind); setPositionPage(1); trackEvent('portfolio_filter_used', { filter: `type:${event.target.value}` }); }}
                    className="min-w-36 appearance-none rounded-lg border bg-background py-2 pl-3 pr-10 text-sm text-foreground"
                  >
                    <option value="ALL">All</option>
                    {Object.entries(names).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <IconChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" stroke={1.8} aria-hidden="true" />
                </span>
              </label>
            </div>
            <div
              className="mt-4 flex gap-1 overflow-x-auto rounded-xl bg-muted/70 p-1"
              role="tablist"
              aria-label="Position status"
            >
              {(['ACTIVE', 'PENDING', 'COMPLETED', 'ALL'] as const).map((value) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => { setTab(value); setPositionPage(1); trackEvent('portfolio_filter_used', { filter: `status:${value}` }); }}
                  className={`inline-flex min-w-20 shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${tab === value ? 'bg-brand text-white shadow-sm' : 'text-muted-foreground hover:bg-background hover:text-foreground'}`}
                >
                  {value === 'ACTIVE' ? <IconActivity className="size-4" stroke={1.8} aria-hidden="true" /> : value === 'PENDING' ? <IconClock className="size-4" stroke={1.8} aria-hidden="true" /> : value === 'COMPLETED' ? <IconCircleCheck className="size-4" stroke={1.8} aria-hidden="true" /> : <IconLayoutGrid className="size-4" stroke={1.8} aria-hidden="true" />}
                  {value[0] + value.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {visible.length ? (
              <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
                {pagedPositions.map((item) => (
                  <PositionCard key={item.id} position={item} />
                ))}
                {positionPageCount > 1 ? (
                  <nav aria-label="Position pages" className="col-span-full mt-2 flex items-center justify-between gap-3">
                    <p className="text-xs text-muted-foreground">{(currentPositionPage - 1) * positionPageSize + 1}–{Math.min(currentPositionPage * positionPageSize, visible.length)} of {visible.length}</p>
                    <div className="flex items-center gap-2">
                      <button type="button" disabled={currentPositionPage === 1} onClick={() => setPositionPage(currentPositionPage - 1)} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40">Previous</button>
                      <span className="text-xs tabular-nums text-muted-foreground">{currentPositionPage} / {positionPageCount}</span>
                      <button type="button" disabled={currentPositionPage === positionPageCount} onClick={() => setPositionPage(currentPositionPage + 1)} className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-40">Next</button>
                    </div>
                  </nav>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 rounded-2xl border p-6">
                <h3 className="font-semibold">
                  {data.positions.length
                    ? 'No matching positions yet'
                    : 'Your Portfolio Starts Here'}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {data.availableWalletMinorUnits > 0 && !data.positions.length
                    ? `You have ${money(data.availableWalletMinorUnits)} in your Wallet ready to put to work.`
                    : 'Build through co-funding, co-ownership, and Wealth Collective.'}
                </p>
                {!data.positions.length ? (
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href="/discover"
                      className="rounded-lg bg-brand px-4 py-2 text-sm text-white"
                    >
                      Explore Opportunities
                    </Link>
                    <Link href="/collectives" className="rounded-lg border px-4 py-2 text-sm">
                      Explore Wealth Collective
                    </Link>
                  </div>
                ) : null}
              </div>
            )}
          </section>
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="min-w-0 rounded-2xl border bg-background p-5">
              <h2 className="text-sm font-semibold">Confirmed returns</h2>
              {data.returnsHistory.length ? (
                <ul className="mt-3 divide-y">
                  {data.returnsHistory.map((event, index) => (
                    <li
                      key={`${event.title}-${event.occurredAt}-${index}`}
                      className="flex min-w-0 items-center justify-between gap-3 py-3 text-xs"
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium" title={event.title}>{event.title}</span>
                        <span className="mt-0.5 block text-[11px] text-muted-foreground">
                          {event.kind === 'MATURITY'
                            ? 'Maturity profit'
                            : event.kind === 'ROLLOVER'
                              ? 'Profit rolled over'
                              : 'Distribution paid'}{' '}
                          · {new Date(event.occurredAt).toLocaleDateString()}
                        </span>
                      </span>
                      <strong className="shrink-0 rounded-full bg-brand/5 px-2 py-1 text-xs tabular-nums text-brand" title={money(event.amountMinorUnits)}>{compactMoney(event.amountMinorUnits)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No confirmed opportunity returns recorded yet.
                </p>
              )}
            </section>
            <section className="min-w-0 rounded-2xl border bg-background p-5">
              <h2 className="text-sm font-semibold">Upcoming</h2>
              {data.upcoming.length ? (
                <ul className="mt-3 divide-y">
                  {data.upcoming.map((event) => (
                    <li key={`${event.href}-${event.expectedAt}`} className="py-3 text-xs">
                      <Link href={event.href} className="block truncate font-medium text-foreground hover:text-brand" title={event.title}>
                        {event.title}
                      </Link>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {event.label}: {new Date(event.expectedAt).toLocaleDateString()}
                      </p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No dated upcoming events recorded.
                </p>
              )}
            </section>
          </div>
        </>
      ) : null}
    </main>
  );
}

function Summary({
  label,
  amount,
  hint,
  tone,
}: Readonly<{
  label: string;
  amount: number;
  hint: string;
  tone?: 'primary' | 'pending' | 'wallet';
}>): React.JSX.Element {
  return (
    <div
      className={`flex h-28 min-w-0 flex-col rounded-2xl border p-4 ${tone === 'primary' ? 'border-brand/30 bg-brand/5' : tone === 'pending' ? 'border-amber-400/30 bg-amber-50/40 dark:bg-amber-500/5' : tone === 'wallet' ? 'border-dashed bg-muted/30' : 'bg-background'}`}
    >
      <div className="flex min-h-8 items-start justify-between gap-2">
        <p className="text-xs font-semibold leading-4 text-muted-foreground">{label}</p>
        <details className="group relative shrink-0">
          <summary aria-label={`About ${label}`} className="cursor-pointer list-none rounded-full text-muted-foreground hover:text-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand [&::-webkit-details-marker]:hidden"><IconInfoCircle className="size-4" stroke={1.8} aria-hidden="true" /></summary>
          <div className="absolute right-0 top-6 z-20 w-52 rounded-lg border border-border bg-background p-3 text-xs normal-case font-normal leading-5 text-foreground shadow-lg">
            <p>{hint}</p>
            <p className="mt-1 break-all font-semibold tabular-nums">{money(amount)}</p>
          </div>
        </details>
      </div>
      <p
        className="mt-auto min-w-0 overflow-hidden text-ellipsis whitespace-nowrap text-base font-semibold tabular-nums leading-tight sm:text-lg xl:text-[15px]"
        title={money(amount)}
        aria-label={`${label}: ${money(amount)}`}
      >
        {compactMoney(amount)}
      </p>
    </div>
  );
}

function PositionCard({ position }: Readonly<{ position: PortfolioPosition }>): React.JSX.Element {
  const amount =
    position.status === 'PENDING'
      ? position.pendingMinorUnits
      : position.status === 'COMPLETED'
        ? position.originalCapitalMinorUnits
        : position.capitalMinorUnits;
  return (
    <Link
      href={position.href}
      onClick={() => trackEvent('portfolio_position_viewed', { product_type: position.kind })}
      className="group flex h-full min-w-0 flex-col rounded-2xl border bg-background p-4 transition hover:border-brand/40 hover:shadow-sm"
    >
      <div className="flex min-w-0 items-start gap-3">
        {position.imageUrl ? (
          <div className="relative size-14 shrink-0 overflow-hidden rounded-xl sm:size-16">
            <Image src={position.imageUrl} alt="" fill unoptimized sizes="64px" className="object-cover" />
          </div>
        ) : null}
        <div className="min-w-0 flex-1">
          <h3 className="break-words text-sm font-semibold leading-snug">{position.title}</h3>
          <p className="mt-1 text-xs text-muted-foreground">{names[position.kind]} · {returns[position.returnType]}</p>
        </div>
      </div>
      <div className="mt-auto flex flex-wrap items-end justify-between gap-x-4 gap-y-3 pt-4">
        <div className="min-w-0">
          <span className="inline-flex max-w-full rounded-full bg-brand/10 px-2.5 py-1 text-[11px] font-semibold text-brand">{position.statusLabel}</span>
          <p className="mt-2 text-[11px] text-muted-foreground">{position.status === 'COMPLETED' ? 'Original capital' : position.status === 'PENDING' ? 'Pending capital' : 'Deployed capital'}</p>
          <p className="mt-0.5 break-words text-sm font-semibold tabular-nums" title={money(amount)}>{compactMoney(amount)}</p>
        </div>
        <span className="inline-flex min-h-8 shrink-0 items-center gap-1 rounded-lg border border-brand/20 bg-brand/5 px-3 text-xs font-semibold text-brand transition group-hover:bg-brand group-hover:text-white">
          View {position.kind === 'COLLECTIVE' ? 'Collective' : 'position'} <IconArrowUpRight className="size-3.5" stroke={1.8} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
