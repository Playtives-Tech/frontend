import Image from 'next/image';
import Link from 'next/link';
import {
  formatOpportunityMoney,
  formatProjectedDistribution,
  formatReturnSchedule,
  type Opportunity,
} from '@/lib/opportunities';

type OpportunityCardProps = Readonly<{
  opportunity: Opportunity;
  variant?: 'default' | 'compact';
}>;

export function OpportunityCard({
  opportunity,
  variant = 'default',
}: OpportunityCardProps): React.JSX.Element {
  if (variant === 'compact') return <CompactOpportunityCard opportunity={opportunity} />;

  return (
    <Link
      href={`/discover/${opportunity.slug}`}
      className="group flex w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-colors hover:border-brand/30 sm:min-h-[10.75rem]"
    >
      <div className="relative aspect-video shrink-0 overflow-hidden bg-muted sm:aspect-auto sm:h-24">
        {opportunity.imageUrl && (
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        )}
      </div>
      <div className="px-4 py-3 sm:flex sm:flex-1 sm:flex-col sm:p-2.5">
        <span
          className={`mb-2 inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-semibold ${opportunity.acquisitionStatus === 'OPEN' ? 'bg-brand/10 text-brand' : 'bg-muted text-muted-foreground'}`}
        >
          {opportunity.acquisitionStatus === 'OPEN' ? 'Open' : 'Closed'}
        </span>
        <h2 className="line-clamp-2 font-sans text-[14px] font-bold leading-5 tracking-normal sm:leading-6">
          {opportunity.title}
        </h2>
        <p className="mt-1 line-clamp-1 text-xs font-medium leading-3 text-muted-foreground">
          {formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)} per unit
        </p>
        <p className="mt-1 line-clamp-1 text-xs font-semibold leading-4 text-muted-foreground text-yellow-600 sm:mt-1.5">
          {projectionLabel(opportunity)}
        </p>
      </div>
    </Link>
  );
}

function CompactOpportunityCard({ opportunity }: { opportunity: Opportunity }): React.JSX.Element {
  const projectedReturn = projectionLabel(opportunity);

  return (
    <Link
      href={`/discover/${opportunity.slug}`}
      className="group flex w-[12rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-colors hover:border-brand/30 sm:w-[13rem] lg:w-[14rem]"
    >
      <div className="relative h-20 overflow-hidden bg-muted sm:h-24">
        {opportunity.imageUrl && (
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt}
            fill
            sizes="(min-width: 1024px) 16vw, 60vw"
            className="object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-2.5">
        <span className="mb-1 text-[10px] font-semibold text-muted-foreground">
          {opportunity.acquisitionStatus === 'OPEN' ? 'Open' : 'Closed'}
        </span>
        <h3 className="line-clamp-1 font-sans text-sm font-bold leading-5 tracking-normal">
          {opportunity.title}
        </h3>
        <p className="mt-1 text-xs leading-4 text-muted-foreground">
          {formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)} per unit
        </p>
        <p
          className="mt-1 truncate text-xs font-medium leading-4 text-amber-700 dark:text-amber-300"
          title={projectedReturn}
        >
          {projectedReturn}
        </p>
      </div>
    </Link>
  );
}

function projectionLabel(opportunity: Opportunity): string {
  const schedule = formatReturnSchedule(opportunity.returnSchedule).toLowerCase();
  return `${formatProjectedDistribution(opportunity)} projected return · ${schedule}`;
}
