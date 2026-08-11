import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatOpportunityMoney,
  formatOwnershipModel,
  formatReturnSchedule,
  type Opportunity,
} from '@/lib/opportunities';

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }): React.JSX.Element {
  return (
    <Link
      href={`/discover/${opportunity.slug}`}
      className="group overflow-hidden rounded-2xl border bg-background transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
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
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">
              {opportunity.projectedReturnRatePercent}% projected return
            </p>
            <h2 className="mt-2 font-heading text-xl font-semibold">{opportunity.title}</h2>
          </div>
          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition group-hover:text-brand" />
        </div>
        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {opportunity.summary}
        </p>
        <div className="mt-5 grid grid-cols-2 gap-4 border-t pt-4 text-sm">
          <Fact
            label="Minimum entry"
            value={formatOpportunityMoney(
              opportunity.pricePerUnitMinorUnits * opportunity.minimumUnits,
            )}
          />
          <Fact
            label="Duration"
            value={
              opportunity.durationMonths ? `${opportunity.durationMonths} months` : 'Not specified'
            }
          />
          <Fact
            label="Availability"
            value={`${opportunity.availableUnits} of ${opportunity.totalUnits}`}
          />
          <Fact label="Returns" value={formatReturnSchedule(opportunity.returnSchedule)} />
          <Fact label="Ownership" value={formatOwnershipModel(opportunity.ownershipModel)} />
          <Fact label="Operator" value={opportunity.operator || 'Not specified'} />
        </div>
        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3.5" />
          {opportunity.location || 'Not specified'}
        </p>
      </div>
    </Link>
  );
}

function Fact({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div>
      <p className="text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold" title={value}>
        {value}
      </p>
    </div>
  );
}
