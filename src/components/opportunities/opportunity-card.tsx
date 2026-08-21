import Image from 'next/image';
import Link from 'next/link';
import { formatOpportunityMoney, type Opportunity } from '@/lib/opportunities';

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
      className="group flex h-full min-h-[10.75rem] flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-colors hover:border-brand/30"
    >
      <div className="relative h-24 shrink-0 overflow-hidden bg-muted">
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
      <div className="flex flex-1 flex-col p-2.5">
        <h2 className="text-[14px] line-clamp-2 font-sans font-bold leading-6 tracking-normal">
          {opportunity.title}
        </h2>
        <p className="mt-1 line-clamp-1 text-xs font-medium leading-3 text-muted-foreground">
          {formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)} per unit
        </p>
        <p className="mt-1.5 line-clamp-1 text-xs font-semibold leading-4 text-yellow-600 text-muted-foreground">
          {opportunity.projectedReturnRatePercent}% projected return
        </p>
      </div>
    </Link>
  );
}

function CompactOpportunityCard({ opportunity }: { opportunity: Opportunity }): React.JSX.Element {
  const projectedReturn = `${opportunity.projectedReturnRatePercent}% projected return`;

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
