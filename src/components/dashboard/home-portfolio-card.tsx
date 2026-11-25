import Link from 'next/link';
import { IconChartPie } from '@tabler/icons-react';
import { formatCompactNairaMinorUnits, formatNaira } from '@/components/ownership/formatters';
import type { Portfolio } from '@/lib/services/portfolio-service';

export function HomePortfolioCard({
  portfolio,
}: Readonly<{ portfolio: Portfolio | null }>): React.JSX.Element {
  return (
    <section className="rounded-2xl border border-brand/15 bg-background p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1 basis-[10rem]">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand">
            Productive Portfolio
          </p>
          <p
            className="mt-2 min-w-0 break-words text-[clamp(1.5rem,3vw,2rem)] font-bold tabular-nums"
            title={
              portfolio ? formatNaira(portfolio.productivePortfolioMinorUnits / 100) : undefined
            }
          >
            {portfolio
              ? formatCompactNairaMinorUnits(portfolio.productivePortfolioMinorUnits)
              : '—'}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            Track your working capital, returns, and position progress.
          </p>
        </div>
        <Link
          href="/ownership"
          className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-lg bg-brand/10 px-3 py-2 text-xs font-semibold text-brand transition-colors hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand sm:gap-2 sm:px-4 sm:text-sm"
        >
          <IconChartPie className="size-4" stroke={1.8} aria-hidden="true" />
          View Portfolio
        </Link>
      </div>
    </section>
  );
}
