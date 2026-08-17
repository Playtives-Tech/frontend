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
      className="group flex h-full flex-col overflow-hidden rounded-[1.35rem] border border-border/80 bg-background shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md"
    >
      <div className="relative h-36 overflow-hidden bg-muted sm:h-40">
        {opportunity.imageUrl && (
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h2 className="line-clamp-2 font-sans text-lg font-bold leading-6 tracking-normal">
          {opportunity.title}
        </h2>
        <p className="mt-2 line-clamp-1 text-sm leading-5 text-muted-foreground">
          {formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)} per unit
          {' · '}
          {opportunity.projectedReturnRatePercent}% projected return
        </p>
      </div>
    </Link>
  );
}

function CompactOpportunityCard({
  opportunity,
}: {
  opportunity: Opportunity;
}): React.JSX.Element {
  const projectedReturn = `${opportunity.projectedReturnRatePercent}% projected return`;

  return (
    <Link
      href={`/discover/${opportunity.slug}`}
      className="group flex w-[11rem] shrink-0 flex-col overflow-hidden rounded-[1.35rem] border border-border/80 bg-background shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md sm:w-[11.75rem] lg:w-[12rem]"
    >
      <div className="relative h-24 overflow-hidden bg-muted sm:h-28">
        {opportunity.imageUrl && (
          <Image
            src={opportunity.imageUrl}
            unoptimized
            alt={opportunity.imageAlt}
            fill
            sizes="(min-width: 1024px) 16vw, 60vw"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h3 className="line-clamp-2 font-sans text-base font-bold leading-5 tracking-normal">
          {opportunity.title}
        </h3>
        <p className="mt-2 text-sm leading-5 text-muted-foreground">
          {formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)} per unit
        </p>
        <p className="mt-2 truncate text-sm font-medium leading-5 text-amber-700" title={projectedReturn}>
          {projectedReturn}
        </p>
      </div>
    </Link>
  );
}
