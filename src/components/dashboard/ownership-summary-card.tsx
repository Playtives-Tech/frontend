import { ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';
import { formatNaira } from '@/components/ownership/formatters';

type OwnershipSummaryCardProps = Readonly<{
  href: string;
  isGuest: boolean;
  activeContributionMinorUnits?: number;
  activeDealsCount?: number;
}>;

export function OwnershipSummaryCard({
  href,
  isGuest,
  activeContributionMinorUnits = 0,
  activeDealsCount = 0,
}: OwnershipSummaryCardProps): React.JSX.Element {
  const activeContribution = formatNaira(activeContributionMinorUnits / 100);
  const dealLabel = activeDealsCount === 1 ? 'deal' : 'deals';

  return (
    <section className="playtives-gold-card rounded-[1.75rem] p-5 text-white sm:p-6">
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-foreground/70">
            Your active contribution
          </p>

          <p className="mt-2 font-sans text-4xl font-bold tracking-normal">{activeContribution}</p>
          <p className="mt-1 text-sm font-medium text-brand-foreground/75">
            {activeDealsCount > 0
              ? `Across ${activeDealsCount} active ${dealLabel}`
              : 'No active contribution yet'}
          </p>
        </div>

        <span className="grid size-12 place-items-center rounded-2xl bg-brand-foreground/10">
          <Building2 className="size-5" />
        </span>
      </div>

      <div className="mt-7 border-t border-brand-foreground/20 pt-5">
        <p className="text-sm font-semibold text-brand-foreground/75">Currently active</p>
        <p className="mt-1 text-2xl font-bold">
          {activeDealsCount} {dealLabel}
        </p>
      </div>

      <Link
        href={href}
        className="mt-5 inline-flex h-10 items-center gap-2 rounded-lg border border-brand-foreground/25 bg-brand-foreground/10 px-3.5 text-sm font-semibold transition hover:bg-brand-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-foreground/70"
      >
        {isGuest ? 'Create an account to own' : 'View my ownership'}

        <ArrowRight className="size-4" />
      </Link>
    </section>
  );
}
