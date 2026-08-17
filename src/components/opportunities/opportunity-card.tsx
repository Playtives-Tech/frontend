import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatOpportunityMoney,
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
      className="group flex h-full min-w-[18rem] flex-col overflow-hidden rounded-2xl border border-border/70 bg-background shadow-sm transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-md sm:min-w-[20rem] lg:min-w-[21rem]"
    >
      <div className="relative h-40 overflow-hidden bg-muted sm:h-44">
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
        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold backdrop-blur">
          {opportunity.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-brand">
              {opportunity.projectedReturnRatePercent}% projected return
            </p>
            <h2 className="mt-1.5 font-heading text-lg font-semibold leading-6">
              {opportunity.title}
            </h2>
          </div>
          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition group-hover:text-brand" />
        </div>
        <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
          {opportunity.summary}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t pt-4 text-sm">
          <Fact
            label="Price per unit"
            value={formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)}
          />
          <Fact
            label="Minimum units"
            value={`${opportunity.minimumUnits} ${opportunity.minimumUnits === 1 ? 'unit' : 'units'}`}
          />
          <Fact
            label="Duration"
            value={
              opportunity.durationMonths ? `${opportunity.durationMonths} months` : 'Not specified'
            }
          />
          <Fact
            label="Units available"
            value={`${opportunity.availableUnits} of ${opportunity.totalUnits}`}
          />
          <Fact
            label="Monthly profit"
            value={
              opportunity.projectedMonthlyProfitMinorUnits
                ? formatOpportunityMoney(opportunity.projectedMonthlyProfitMinorUnits)
                : formatReturnSchedule(opportunity.returnSchedule)
            }
          />
          <Fact
            label="Term profit"
            value={formatOpportunityMoney(opportunity.projectedProfitMinorUnits)}
          />
        </div>
        <div className="mt-auto pt-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5" />
            <span className="truncate">{opportunity.location || 'Not specified'}</span>
          </p>
          <p className="mt-3 inline-flex h-10 items-center rounded-xl bg-brand px-4 text-sm font-semibold text-brand-foreground">
            View opportunity
          </p>
        </div>
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

function Fact({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold" title={value}>
        {value}
      </p>
    </div>
  );
}
