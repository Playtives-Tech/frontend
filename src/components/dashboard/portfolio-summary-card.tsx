'use client';

import { ArrowRight, Building2, Plus, Wallet, X } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
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
  const walletEnd = walletPercentage * 3.6;
  const coOwnedEnd = walletEnd + coOwnedPercentage * 3.6;
  const coFundedEnd = coOwnedEnd + coFundedPercentage * 3.6;
  const hasFullOwnership = fullOwnershipContributionMinorUnits > 0;

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

            <div
              className="mx-auto mt-7 grid size-56 place-items-center rounded-full p-5 sm:size-60"
              style={{
                background: `conic-gradient(#19795a 0deg ${walletEnd}deg, #65dfae ${walletEnd}deg ${coOwnedEnd}deg, #38bdf8 ${coOwnedEnd}deg ${coFundedEnd}deg, #a78bfa ${coFundedEnd}deg 360deg)`,
              }}
            >
              <div className="flex size-full flex-col items-center justify-center rounded-full bg-background px-3 text-center">
                <span className="text-xs text-muted-foreground">Total balance</span>
                <BalanceAmount
                  value={portfolioBalance}
                  toggle
                  className="mt-1 max-w-[11.5rem] justify-center text-sm font-bold sm:text-base"
                />
              </div>
            </div>

            <div className="mt-8 overflow-hidden rounded-xl border bg-background">
              <BreakdownRow
                color="bg-brand"
                label="Wallet"
                value={walletBalance}
                percentage={walletPercentage}
              />
              <BreakdownRow
                color="bg-emerald-300"
                label="Co-owned"
                value={coOwnedBalance}
                percentage={coOwnedPercentage}
              />
              <BreakdownRow
                color="bg-sky-400"
                label="Co-funded"
                value={coFundedBalance}
                percentage={coFundedPercentage}
              />
              {hasFullOwnership ? (
                <BreakdownRow
                  color="bg-violet-400"
                  label="Full ownership"
                  value={fullOwnershipBalance}
                  percentage={fullOwnershipPercentage}
                />
              ) : null}
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
  percentage: number;
}>): React.JSX.Element {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 border-b px-4 py-3.5 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_minmax(10rem,1fr)_auto] sm:gap-y-0">
      <div className="flex min-w-0 items-center gap-2">
        <span className={`size-2 shrink-0 rounded-full ${color}`} />
        <span className="truncate text-sm font-medium text-foreground">{label}</span>
      </div>
      <BalanceAmount
        value={value}
        className="col-start-1 text-sm font-semibold sm:col-start-auto sm:justify-self-end"
      />
      <span className="col-start-2 row-span-2 row-start-1 self-center text-right text-xs tabular-nums text-muted-foreground sm:col-start-auto sm:row-span-1">
        {formatPercentage(percentage)}
      </span>
    </div>
  );
}

function formatPercentage(value: number): string {
  if (value === 0) return '0%';
  if (value < 0.01) return '<0.01%';
  return `${value.toFixed(2)}%`;
}
