'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { trackEvent } from '@/lib/product-analytics';
import { getPortfolio, type PortfolioPosition } from '@/lib/services/portfolio-service';
import { getWealthGoal } from '@/lib/services/wealth-goal-service';
import { formatCompactNairaMinorUnits, formatNaira } from './formatters';
import { PortfolioBreakdown } from './portfolio-breakdown';

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
  const rawProgress =
    data && target ? Math.min(100, (data.productivePortfolioMinorUnits / target) * 100) : 0;
  const progress = Math.round(rawProgress);
  const visible =
    data?.positions.filter(
      (item) => (tab === 'ALL' || item.status === tab) && (kind === 'ALL' || item.kind === kind),
    ) ?? [];
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
          <section className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
            <div className="flex flex-wrap justify-between gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="font-semibold">Your Wealth Goal</h2>
                {goal.isPending ? <p className="mt-2 text-sm">Loading your goal…</p> : null}
                {goal.isError ? (
                  <p className="mt-2 text-sm">
                    We couldn’t load your goal.{' '}
                    <button
                      onClick={() => void goal.refetch()}
                      className="font-semibold text-brand underline"
                    >
                      Try again
                    </button>
                  </p>
                ) : null}
                {target ? (
                  <>
                    <dl className="mt-3 grid min-w-0 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Target portfolio</dt>
                        <dd className="font-semibold tabular-nums" title={money(target)}>
                          {compactMoney(target)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Productive portfolio</dt>
                        <dd
                          className="font-semibold tabular-nums"
                          title={money(data.productivePortfolioMinorUnits)}
                        >
                          {compactMoney(data.productivePortfolioMinorUnits)}
                        </dd>
                      </div>
                      <div className="min-w-0">
                        <dt className="text-muted-foreground">Remaining</dt>
                        <dd
                          className="font-semibold tabular-nums"
                          title={money(Math.max(0, target - data.productivePortfolioMinorUnits))}
                        >
                          {compactMoney(Math.max(0, target - data.productivePortfolioMinorUnits))}
                        </dd>
                      </div>
                    </dl>
                    {compactMoney(target) !== money(target) ||
                    compactMoney(data.productivePortfolioMinorUnits) !==
                      money(data.productivePortfolioMinorUnits) ? (
                      <details className="mt-2 text-xs text-muted-foreground">
                        <summary className="cursor-pointer text-brand">
                          See exact goal amounts
                        </summary>
                        <p className="mt-1 break-all">Target: {money(target)}</p>
                        <p className="break-all">
                          Productive: {money(data.productivePortfolioMinorUnits)}
                        </p>
                        <p className="break-all">
                          Remaining:{' '}
                          {money(Math.max(0, target - data.productivePortfolioMinorUnits))}
                        </p>
                      </details>
                    ) : null}
                  </>
                ) : !goal.isPending && !goal.isError ? (
                  <p className="mt-2 text-sm">Give your portfolio a destination.</p>
                ) : null}
              </div>
              {!goal.isPending && !goal.isError ? (
                <Link
                  href="/#wealth-goal"
                  className="self-start rounded-lg border px-4 py-2 text-sm"
                >
                  {target ? 'Edit Goal' : 'Set a Goal'}
                </Link>
              ) : null}
            </div>
            {target ? (
              <>
                <div
                  role="progressbar"
                  aria-label="Wealth goal progress"
                  aria-valuenow={rawProgress}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-4 h-2 rounded-full bg-brand/15"
                >
                  <div
                    className="h-2 rounded-full bg-brand"
                    style={{ width: `${rawProgress > 0 ? Math.max(rawProgress, 0.3) : 0}%` }}
                  />
                </div>
                <p className="mt-2 text-sm">
                  {rawProgress > 0 && progress === 0 ? '<1%' : `${progress}%`} to goal
                </p>
              </>
            ) : null}
            <p className="mt-3 text-xs text-muted-foreground">
              Your target portfolio is an illustrative planning estimate. Actual returns vary by
              opportunity and are not guaranteed.
            </p>
          </section>
          <section
            aria-label="Portfolio summary"
            className="grid gap-3 sm:grid-cols-2"
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
          <div className="flex justify-end">
            <PortfolioBreakdown portfolio={data} />
          </div>
          {data.availableWalletMinorUnits > 0 && data.positions.length > 0 ? (
            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand/20 bg-brand/5 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold">Wallet balance available</h2>
                <p className="text-xs text-muted-foreground">
                  This cash is outside your productive portfolio.
                </p>
              </div>
              <Link
                href="/discover"
                className="rounded-lg border border-brand/30 px-3 py-2 text-xs font-semibold text-brand hover:bg-brand/10"
              >
                Explore Opportunities
              </Link>
            </section>
          ) : null}
          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-2xl border p-5">
              <h2 className="font-semibold">Portfolio Allocation</h2>
              {data.allocation.length ? (
                <div className="mt-4 space-y-3">
                  {data.allocation.map((item) => (
                    <div key={item.kind}>
                      <div className="flex justify-between gap-2 text-sm">
                        <span>{names[item.kind]}</span>
                        <span
                          className="shrink-0 tabular-nums"
                          title={money(item.amountMinorUnits)}
                        >
                          {compactMoney(item.amountMinorUnits)} ·{' '}
                          {Math.round(
                            (item.amountMinorUnits / data.productivePortfolioMinorUnits) * 100,
                          )}
                          %
                        </span>
                      </div>
                      <div className="mt-1 h-2 rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-brand"
                          style={{
                            width: `${(item.amountMinorUnits / data.productivePortfolioMinorUnits) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  Allocation appears when capital is deployed.
                </p>
              )}
            </section>
            <section className="rounded-2xl border p-5">
              <h2 className="font-semibold">At a Glance</h2>
              <p className="mt-3 text-sm">
                {data.activePositionCount} active{' '}
                {data.activePositionCount === 1 ? 'position' : 'positions'}
              </p>
              {sectorTotal > 0 ? (
                <>
                  <p className="mt-2 text-sm">
                    Known opportunity capital spans {data.sectors.length}{' '}
                    {data.sectors.length === 1 ? 'sector' : 'sectors'}.
                  </p>
                  {sectorTotal < data.productivePortfolioMinorUnits ? (
                    <p className="mt-1 text-xs text-muted-foreground">
                      Sector percentages exclude Collective capital and positions without sector
                      metadata.
                    </p>
                  ) : null}
                  {data.sectors.map((item) => (
                    <p key={item.sector} className="mt-1 text-sm text-muted-foreground">
                      {item.sector}: {Math.round((item.amountMinorUnits / sectorTotal) * 100)}%
                    </p>
                  ))}
                  {largestSector && largestSector.amountMinorUnits / sectorTotal >= 0.6 ? (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Most categorized opportunity capital is in {largestSector.sector}. This is a
                      factual allocation view, not investment advice.
                    </p>
                  ) : null}
                </>
              ) : null}
              {data.pendingDeploymentMinorUnits > 0 ? (
                <p className="mt-2 text-sm">
                  {money(data.pendingDeploymentMinorUnits)} is awaiting deployment.
                </p>
              ) : null}
              {data.pendingSettlementMinorUnits > 0 ? (
                <p className="mt-2 text-sm">
                  {money(data.pendingSettlementMinorUnits)} is awaiting settlement.
                </p>
              ) : null}
            </section>
          </div>
          <section ref={scoreCard} className="rounded-2xl border p-5">
            <h2 className="font-semibold">Wealth Builder Score</h2>
            <p className="mt-2 text-xl font-semibold">
              {data.wealthBuilderScore.score} / {data.wealthBuilderScore.maximum}
            </p>
            <p className="mt-1 text-sm text-brand">{data.wealthBuilderScore.band}</p>
            <div
              role="progressbar"
              aria-label="Wealth Builder Score"
              aria-valuenow={data.wealthBuilderScore.score}
              aria-valuemin={0}
              aria-valuemax={data.wealthBuilderScore.maximum}
              className="mt-3 h-2 rounded-full bg-brand/15"
            >
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${data.wealthBuilderScore.score / 10}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {data.wealthBuilderScore.explanation}
            </p>
            <details className="mt-3 text-sm">
              <summary className="cursor-pointer font-medium text-brand">
                How your score is calculated
              </summary>
              <ul className="mt-2 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                {Object.entries(data.wealthBuilderScore.components).map(([label, component]) => (
                  <li
                    key={label}
                    className="flex justify-between gap-3 rounded-lg bg-muted/50 px-3 py-2"
                  >
                    <span className="capitalize">{label}</span>
                    <span>
                      {component.points} / {component.maximum}
                    </span>
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs text-muted-foreground">
                This is a progress indicator, not a credit score, risk rating, or forecast of
                returns.
              </p>
            </details>
          </section>
          {data.returnTypes.length ? (
            <section className="rounded-2xl border p-5">
              <h2 className="font-semibold">Return Structures</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Projected schedules and confirmed returns are shown separately.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {data.returnTypes.map((item) => (
                  <span key={item.type} className="rounded-full bg-muted px-3 py-2 text-sm">
                    {returns[item.type]} · {item.activePositions}{' '}
                    {item.activePositions === 1 ? 'position' : 'positions'}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
          <section>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">Positions</h2>
              <label className="text-sm">
                Type{' '}
                <select
                  value={kind}
                  onChange={(event) => { setKind(event.target.value as typeof kind); trackEvent('portfolio_filter_used', { filter: `type:${event.target.value}` }); }}
                  className="ml-2 rounded-lg border bg-background px-3 py-2"
                >
                  <option value="ALL">All</option>
                  {Object.entries(names).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div
              className="mt-3 flex gap-2 overflow-x-auto pb-1"
              role="tablist"
              aria-label="Position status"
            >
              {(['ACTIVE', 'PENDING', 'COMPLETED', 'ALL'] as const).map((value) => (
                <button
                  key={value}
                  role="tab"
                  aria-selected={tab === value}
                  onClick={() => { setTab(value); trackEvent('portfolio_filter_used', { filter: `status:${value}` }); }}
                  className={`rounded-full px-4 py-2 text-sm ${tab === value ? 'bg-brand text-white' : 'bg-muted'}`}
                >
                  {value[0] + value.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            {visible.length ? (
              <div className="mt-4 grid gap-3">
                {visible.map((item) => (
                  <PositionCard key={item.id} position={item} />
                ))}
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
            <section className="rounded-2xl border p-5">
              <h2 className="font-semibold">Confirmed Opportunity Returns</h2>
              {data.returnsHistory.length ? (
                <ul className="mt-3 divide-y">
                  {data.returnsHistory.map((event, index) => (
                    <li
                      key={`${event.title}-${event.occurredAt}-${index}`}
                      className="flex flex-wrap justify-between gap-2 py-3 text-sm"
                    >
                      <span>
                        {event.title}
                        <span className="block text-xs text-muted-foreground">
                          {event.kind === 'MATURITY'
                            ? 'Maturity profit'
                            : event.kind === 'ROLLOVER'
                              ? 'Profit rolled over'
                              : 'Distribution paid'}{' '}
                          · {new Date(event.occurredAt).toLocaleDateString()}
                        </span>
                      </span>
                      <strong>{money(event.amountMinorUnits)}</strong>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-muted-foreground">
                  No confirmed opportunity returns recorded yet.
                </p>
              )}
            </section>
            <section className="rounded-2xl border p-5">
              <h2 className="font-semibold">Upcoming</h2>
              {data.upcoming.length ? (
                <ul className="mt-3 divide-y">
                  {data.upcoming.map((event) => (
                    <li key={`${event.href}-${event.expectedAt}`} className="py-3 text-sm">
                      <Link href={event.href} className="font-medium text-brand hover:underline">
                        {event.title}
                      </Link>
                      <p className="text-xs text-muted-foreground">
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
      className={`min-w-0 rounded-2xl border p-4 sm:p-5 ${tone === 'primary' ? 'border-brand/30 bg-brand/5' : tone === 'pending' ? 'border-amber-400/30 bg-amber-50/40 dark:bg-amber-500/5' : tone === 'wallet' ? 'border-dashed bg-muted/30' : 'bg-background'}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className="mt-3 min-w-0 break-words text-[clamp(1.25rem,2vw,1.8rem)] font-semibold tabular-nums leading-tight"
        title={money(amount)}
        aria-label={`${label}: ${money(amount)}`}
      >
        {compactMoney(amount)}
      </p>
      {compactMoney(amount) !== money(amount) ? (
        <details className="mt-2 text-xs text-muted-foreground">
          <summary className="cursor-pointer text-brand">See exact amount</summary>
          <p className="mt-1 break-all tabular-nums">{money(amount)}</p>
        </details>
      ) : null}
      <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
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
      className="flex min-w-0 gap-4 rounded-2xl border bg-background p-4 transition hover:border-brand/40"
    >
      {position.imageUrl ? (
        <div className="relative hidden h-20 w-20 shrink-0 overflow-hidden rounded-xl sm:block">
          <Image
            src={position.imageUrl}
            alt=""
            fill
            unoptimized
            sizes="80px"
            className="object-cover"
          />
        </div>
      ) : null}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap justify-between gap-2">
          <div className="min-w-0">
            <h3 className="break-words font-semibold">{position.title}</h3>
            <p className="text-xs text-muted-foreground">
              {names[position.kind]} · {returns[position.returnType]}
            </p>
          </div>
          <span className="rounded-full bg-brand/10 px-2 py-1 text-xs font-semibold text-brand">
            {position.statusLabel}
          </span>
        </div>
        <p className="mt-3 text-sm">
          {position.status === 'COMPLETED'
            ? 'Original capital'
            : position.status === 'PENDING'
              ? position.statusLabel
              : position.kind === 'CO_OWNERSHIP'
                ? 'Ownership basis'
                : position.kind === 'COLLECTIVE'
                  ? 'Deployed capital'
                  : 'Capital'}
          :{' '}
          <strong className="break-words tabular-nums" title={money(amount)}>
            {compactMoney(amount)}
          </strong>
        </p>
        {position.kind === 'COLLECTIVE' &&
        position.status === 'ACTIVE' &&
        position.pendingMinorUnits > 0 ? (
          <p className="mt-1 text-sm">
            Pending deployment:{' '}
            <strong className="tabular-nums" title={money(position.pendingMinorUnits)}>
              {compactMoney(position.pendingMinorUnits)}
            </strong>
          </p>
        ) : null}
        {position.kind === 'COLLECTIVE' &&
        position.status === 'ACTIVE' &&
        position.pendingMinorUnits > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Total in Collective:{' '}
            {compactMoney(position.capitalMinorUnits + position.pendingMinorUnits)}
          </p>
        ) : null}
        {position.confirmedReturnMinorUnits > 0 ? (
          <p className="mt-1 text-sm">
            Confirmed return:{' '}
            <span title={money(position.confirmedReturnMinorUnits)}>
              {compactMoney(position.confirmedReturnMinorUnits)}
            </span>
          </p>
        ) : null}
        {position.projectedReturnMinorUnits != null && position.status !== 'COMPLETED' ? (
          <p className="mt-1 text-sm text-muted-foreground">
            Projected return:{' '}
            <span title={money(position.projectedReturnMinorUnits)}>
              {compactMoney(position.projectedReturnMinorUnits)}
            </span>
          </p>
        ) : null}
        {position.maturityAt && position.status !== 'COMPLETED' ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Expected maturity: {new Date(position.maturityAt).toLocaleDateString()}
          </p>
        ) : null}
        <span className="mt-3 inline-block text-xs font-semibold text-brand">
          View {position.kind === 'COLLECTIVE' ? 'Collective' : 'position'} →
        </span>
      </div>
    </Link>
  );
}
