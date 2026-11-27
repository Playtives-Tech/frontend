import Link from 'next/link';
import { IconBriefcase } from '@tabler/icons-react';
import { formatCompactNairaMinorUnits, formatNaira } from '@/components/ownership/formatters';
import { PortfolioBreakdown } from '@/components/ownership/portfolio-breakdown';
import type { Portfolio } from '@/lib/services/portfolio-service';

export function HomePortfolioCard({
  portfolio,
}: Readonly<{ portfolio: Portfolio | null }>): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-brand/15 bg-background p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-[10rem]">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Portfolio Value
          </p>
          <p
            className="mt-1 min-w-0 break-words text-[clamp(1.5rem,3vw,2rem)] font-bold tabular-nums"
            title={
              portfolio ? formatNaira(portfolio.productivePortfolioMinorUnits / 100) : undefined
            }
          >
            {portfolio
              ? formatCompactNairaMinorUnits(portfolio.productivePortfolioMinorUnits)
              : '—'}
          </p>
          <p className="mt-1 mb-2 text-sm text-muted-foreground">
            Available wallet balance:{' '}
            <span className="font-semibold text-foreground" title={portfolio ? formatNaira(portfolio.availableWalletMinorUnits / 100) : undefined}>
              {portfolio ? formatCompactNairaMinorUnits(portfolio.availableWalletMinorUnits) : '—'}
            </span>
          </p>
          <p className="mt-1 text-xs leading-5 text-muted-foreground">
            Track your working capital, returns, and position progress.
          </p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Link
          href="/ownership"
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-brand/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <IconBriefcase className="size-4" stroke={1.8} aria-hidden="true" />
          View Portfolio
        </Link>
        {portfolio ? <PortfolioBreakdown portfolio={portfolio} variant="home" /> : null}
      </div>
    </section>
  );
}
