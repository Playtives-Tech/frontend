'use client';

import { ArrowRight, Building2, Plus, Wallet, X } from 'lucide-react';
import Link from 'next/link';
import { useRef, useState } from 'react';
import { formatNaira } from '@/components/ownership/formatters';
import { BalanceAmount } from '@/components/ui/balance-amount';

type PortfolioSummaryCardProps = Readonly<{
  walletBalanceMinorUnits: number | null;
  ownershipBalanceMinorUnits: number;
  coOwnedContributionMinorUnits: number;
  coFundedContributionMinorUnits: number;
  fullOwnershipContributionMinorUnits: number;
  activeOwnershipCount: number;
  isGuest: boolean;
}>;

export function PortfolioSummaryCard({
  walletBalanceMinorUnits,
  ownershipBalanceMinorUnits,
  coOwnedContributionMinorUnits,
  coFundedContributionMinorUnits,
  fullOwnershipContributionMinorUnits,
  activeOwnershipCount,
  isGuest,
}: PortfolioSummaryCardProps): React.JSX.Element {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [breakdownView, setBreakdownView] = useState(0);
  const breakdownViewsRef = useRef<HTMLDivElement>(null);
  const walletMinorUnits = walletBalanceMinorUnits ?? 0;
  const portfolioMinorUnits = walletMinorUnits + ownershipBalanceMinorUnits;
  const walletPercentage =
    portfolioMinorUnits > 0 ? (walletMinorUnits / portfolioMinorUnits) * 100 : 0;
  const coOwnedPercentage =
    portfolioMinorUnits > 0 ? (coOwnedContributionMinorUnits / portfolioMinorUnits) * 100 : 0;
  const coFundedPercentage =
    portfolioMinorUnits > 0 ? (coFundedContributionMinorUnits / portfolioMinorUnits) * 100 : 0;
  const fullOwnershipPercentage =
    portfolioMinorUnits > 0 ? (fullOwnershipContributionMinorUnits / portfolioMinorUnits) * 100 : 0;
  const portfolioBalance = formatNaira(portfolioMinorUnits / 100);
  const walletBalance = formatNaira(walletMinorUnits / 100);
  const coOwnedBalance = formatNaira(coOwnedContributionMinorUnits / 100);
  const coFundedBalance = formatNaira(coFundedContributionMinorUnits / 100);
  const fullOwnershipBalance = formatNaira(fullOwnershipContributionMinorUnits / 100);
  const ownershipAction = activeOwnershipCount > 0 ? 'My ownership' : 'Co-own now';
  const ownershipHref = isGuest
    ? '/sign-up'
    : activeOwnershipCount > 0
      ? '/ownership'
      : '/discover';
  const hasFullOwnership = fullOwnershipContributionMinorUnits > 0;
  const breakdownSegments: PortfolioSegment[] = [
    {
      label: 'Wallet',
      value: walletBalance,
      percentage: walletPercentage,
      color: '#19795a',
      colorClassName: 'bg-brand',
    },
    {
      label: 'Co-owned',
      value: coOwnedBalance,
      percentage: coOwnedPercentage,
      color: '#65dfae',
      colorClassName: 'bg-emerald-300',
    },
    {
      label: 'Co-funded',
      value: coFundedBalance,
      percentage: coFundedPercentage,
      color: '#38bdf8',
      colorClassName: 'bg-sky-400',
    },
    ...(hasFullOwnership
      ? [
          {
            label: 'Full ownership',
            value: fullOwnershipBalance,
            percentage: fullOwnershipPercentage,
            color: '#a78bfa',
            colorClassName: 'bg-violet-400',
          },
        ]
      : []),
  ];

  return (
    <>
      <section className="rounded-2xl border border-brand/15 bg-background p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              Portfolio value
            </p>
            <div className="mt-2 text-[clamp(1.8rem,5vw,2.55rem)] font-bold leading-tight tracking-tight text-foreground">
              <BalanceAmount value={portfolioBalance} toggle />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Your wallet plus active co-funded and co-owned positions.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Link
              href="/wallet"
              className="group relative grid size-10 shrink-0 place-items-center rounded-xl bg-brand/10 text-brand transition hover:bg-brand hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2"
              aria-label="Go to wallet"
            >
              <Wallet className="size-5" />
              <span className="pointer-events-none absolute right-0 top-full z-10 mt-2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-[11px] font-semibold text-background opacity-0 shadow-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                Wallet
              </span>
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-t-brand/5 pt-4 sm:flex sm:items-center sm:justify-between">
          <div className="contents sm:flex sm:items-center sm:gap-2">
            <Link
              href="/wallet/deposit"
              className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-brand px-2 text-[11px] font-semibold text-white transition hover:brightness-110 sm:px-3 sm:text-xs"
            >
              <Plus className="size-3.5 shrink-0" />
              Add funds
            </Link>
            <Link
              href={ownershipHref}
              className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border px-2 text-[11px] font-semibold text-foreground transition hover:bg-muted sm:px-3 sm:text-xs"
            >
              <Building2 className="size-3.5 shrink-0 text-brand" />
              {ownershipAction}
            </Link>
          </div>
          {/* Wallet detail access is temporarily paused while the portfolio card is the primary balance view.
          <Link href="/wallet" className="inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-semibold text-foreground transition hover:bg-muted">
            View wallet
            <ArrowRight className="size-3.5" />
          </Link> */}
          <button
            type="button"
            onClick={() => setShowBreakdown(true)}
            className="inline-flex h-9 min-w-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-brand/20 px-2 text-[11px] font-semibold text-brand transition hover:bg-brand/5 sm:px-3 sm:text-xs"
          >
            <span className="sm:hidden">Breakdown</span>
            <span className="hidden sm:inline">Portfolio breakdown</span>
            <ArrowRight className="size-3.5 shrink-0" />
          </button>
        </div>
      </section>

      {showBreakdown ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="portfolio-breakdown-title"
        >
          <section className="w-full max-w-xl rounded-2xl border bg-background p-6 shadow-xl sm:p-8">
            <header className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-brand">
                  Portfolio value
                </p>
                {/* <h2 id="portfolio-breakdown-title" className="mt-1 text-lg font-semibold">Your balance breakdown</h2> */}
              </div>
              <button
                type="button"
                onClick={() => setShowBreakdown(false)}
                className="grid size-8 place-items-center rounded-full bg-muted text-muted-foreground transition hover:text-foreground"
                aria-label="Close portfolio breakdown"
              >
                <X className="size-4" />
              </button>
            </header>

            <p className="mt-4 text-center text-xs text-muted-foreground">Swipe to compare your portfolio views</p>
            <div className="mt-2 flex items-center justify-center gap-2" aria-label="Portfolio breakdown views">
              {['Donut breakdown', 'Pie breakdown'].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => breakdownViewsRef.current?.scrollTo({ left: index * breakdownViewsRef.current.clientWidth, behavior: 'smooth' })}
                  className={`h-2 rounded-full transition ${breakdownView === index ? 'w-5 bg-brand' : 'w-2 bg-muted-foreground/35 hover:bg-muted-foreground/60'}`}
                  aria-label={`Show ${label}`}
                  aria-current={breakdownView === index ? 'true' : undefined}
                />
              ))}
            </div>
            <div ref={breakdownViewsRef} onScroll={(event) => setBreakdownView(event.currentTarget.scrollLeft >= event.currentTarget.clientWidth / 2 ? 1 : 0)} className="scrollbar-none mt-3 flex snap-x snap-mandatory gap-5 overflow-x-auto pb-2">
              <div className="w-full shrink-0 snap-center">
                <PortfolioDonutChart segments={breakdownSegments} value={portfolioBalance} />
                <div className="mt-8 overflow-hidden rounded-xl border bg-background">
                  {breakdownSegments.map((segment) => (
                    <BreakdownRow key={segment.label} color={segment.colorClassName} label={segment.label} value={segment.value} percentage={segment.percentage} />
                  ))}
                </div>
              </div>
              <div className="w-full shrink-0 snap-center">
                <PortfolioPieChart segments={breakdownSegments} />
                <div className="mt-5 text-center">
                  <p className="text-xs text-muted-foreground">Total balance</p>
                  <BalanceAmount value={portfolioBalance} toggle className="mt-1 justify-center text-lg font-bold sm:text-xl" />
                </div>
                <div className="mt-8 overflow-hidden rounded-xl border bg-background">
                  {breakdownSegments.map((segment) => (
                    <BreakdownRow key={segment.label} color={segment.colorClassName} label={segment.label} value={segment.value} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function BreakdownRow({
  color,
  label,
  value,
  percentage,
}: Readonly<{
  color: string;
  label: string;
  value: string;
  percentage?: number;
}>): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 border-b px-4 py-3.5 last:border-b-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`size-2 shrink-0 rounded-full ${color}`} />
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
      </div>
      <BalanceAmount value={value} className="shrink-0 text-sm font-semibold" />
      {percentage !== undefined ? <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{formatPiePercentage(percentage)}</span> : null}
    </div>
  );
}

type PortfolioSegment = {
  label: string;
  value: string;
  percentage: number;
  color: string;
  colorClassName: string;
};

function PortfolioDonutChart({ segments, value }: Readonly<{ segments: PortfolioSegment[]; value: string }>): React.JSX.Element {
  const visibleSegments = segments.filter((segment) => segment.percentage > 0);
  const stops = visibleSegments.reduce<{ angle: number; values: string[] }>((result, segment) => {
    const nextAngle = result.angle + segment.percentage * 3.6;
    result.values.push(`${segment.color} ${result.angle}deg ${nextAngle}deg`);
    result.angle = nextAngle;
    return result;
  }, { angle: 0, values: [] });
  const background = stops.values.length ? `conic-gradient(${stops.values.join(', ')})` : '#a78bfa';

  return (
    <div className="mx-auto mt-6 grid size-56 place-items-center rounded-full p-5 sm:size-60" style={{ background }}>
      <div className="flex size-full flex-col items-center justify-center rounded-full bg-background px-3 text-center">
        <span className="text-xs text-muted-foreground">Total balance</span>
        <BalanceAmount value={value} toggle className="mt-1 max-w-[11.5rem] justify-center text-sm font-bold sm:text-base" />
      </div>
    </div>
  );
}

function PortfolioPieChart({ segments }: Readonly<{ segments: PortfolioSegment[] }>): React.JSX.Element {
  const visibleSegments = segments.filter((segment) => segment.percentage > 0);
  const displaySegments = getDisplaySegments(visibleSegments);
  let startAngle = -90;

  return (
    <svg
      viewBox="0 0 100 100"
      className="mx-auto mt-7 size-56 sm:size-60"
      role="img"
      aria-label="Portfolio balance allocation by wallet and ownership type"
    >
      {displaySegments.length === 1 ? (
        <circle cx="50" cy="50" r="50" fill={displaySegments[0].color} />
      ) : (
        displaySegments.map((segment) => {
          const endAngle = startAngle + segment.displayPercentage * 3.6;
          const path = pieSlicePath(startAngle, endAngle);
          const label = pieLabelPosition(startAngle, endAngle);
          startAngle = endAngle;

          return (
            <g key={segment.label}>
              <path d={path} fill={segment.color} stroke="var(--background)" strokeWidth="0.35" />
              {segment.percentage >= 3 ? (
                <text
                  x={label.x}
                  y={label.y}
                  fill="white"
                  fontSize={segment.percentage < 7 ? '3.25' : '4.5'}
                  fontWeight="700"
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {formatPiePercentage(segment.percentage)}
                </text>
              ) : null}
            </g>
          );
        })
      )}
      {displaySegments.length === 1 && displaySegments[0].percentage >= 3 ? (
        <text x="50" y="50" fill="white" fontSize="6" fontWeight="700" textAnchor="middle" dominantBaseline="middle">
          {formatPiePercentage(displaySegments[0].percentage)}
        </text>
      ) : null}
    </svg>
  );
}

function getDisplaySegments(segments: PortfolioSegment[]): Array<PortfolioSegment & { displayPercentage: number }> {
  const minimumVisiblePercentage = 1;
  const adjustedSegments = segments.map((segment) => ({
    ...segment,
    displayPercentage: Math.max(segment.percentage, minimumVisiblePercentage),
  }));
  const excess = adjustedSegments.reduce((total, segment) => total + segment.displayPercentage, 0) - 100;

  if (excess <= 0) return adjustedSegments;

  const largestSegment = adjustedSegments.reduce((largest, segment) =>
    segment.percentage > largest.percentage ? segment : largest,
  );
  largestSegment.displayPercentage -= excess;
  return adjustedSegments;
}

function pieSlicePath(startAngle: number, endAngle: number): string {
  const start = polarToCartesian(startAngle);
  const end = polarToCartesian(endAngle);
  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return `M 50 50 L ${start.x} ${start.y} A 50 50 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

function pieLabelPosition(startAngle: number, endAngle: number): { x: number; y: number } {
  const angleInRadians = (((startAngle + endAngle) / 2) * Math.PI) / 180;
  const radius = 30;
  return { x: 50 + radius * Math.cos(angleInRadians), y: 50 + radius * Math.sin(angleInRadians) };
}

function polarToCartesian(angle: number): { x: string; y: string } {
  const angleInRadians = (angle * Math.PI) / 180;
  return {
    x: (50 + 50 * Math.cos(angleInRadians)).toFixed(3),
    y: (50 + 50 * Math.sin(angleInRadians)).toFixed(3),
  };
}

function formatPiePercentage(value: number): string {
  return `${value.toFixed(1)}%`;
}
