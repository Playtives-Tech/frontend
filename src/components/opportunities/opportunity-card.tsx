import { ArrowUpRight, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Opportunity } from '@/lib/opportunities';

type OpportunityCardProps = Readonly<{ opportunity: Opportunity }>;

export function OpportunityCard({ opportunity }: OpportunityCardProps): React.JSX.Element {
  return (
    <Link
      href={`/discover/${opportunity.slug}`}
      className="group overflow-hidden rounded-2xl border bg-background transition hover:-translate-y-0.5 hover:border-brand/30 hover:shadow-lg"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        <Image
          src={opportunity.image}
          alt={opportunity.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/5 to-transparent" />

        <span className="absolute left-4 top-4 rounded-full bg-background/90 px-3 py-1 text-xs font-semibold text-foreground backdrop-blur">
          {opportunity.category}
        </span>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-brand">Up to {opportunity.returnRate}</p>

            <h2 className="mt-2 font-heading text-xl font-semibold">{opportunity.title}</h2>
          </div>

          <ArrowUpRight className="size-5 shrink-0 text-muted-foreground transition group-hover:text-brand" />
        </div>

        <p className="mt-3 line-clamp-2 text-sm leading-6 text-muted-foreground">
          {opportunity.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-y-4 gap-x-2 border-t pt-4 text-sm">
          <div>
            <p className="text-muted-foreground">Entry</p>
            <p className="mt-1 font-semibold">{opportunity.minimum}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="mt-1 font-semibold">{opportunity.duration}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Availability</p>
            <p className="mt-1 font-semibold">{opportunity.positionsAvailable} of {opportunity.positionsTotal}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Return Schedule</p>
            <p className="mt-1 font-semibold">{opportunity.returnSchedule}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Ownership</p>
            <p className="mt-1 font-semibold">{opportunity.ownershipModel}</p>
          </div>

          <div>
            <p className="text-muted-foreground">Operator</p>
            <p className="mt-1 truncate font-semibold" title={opportunity.operator}>
              {opportunity.operator}
            </p>
          </div>
        </div>

        <p className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          <MapPin className="size-3.5" />
          {opportunity.location}
        </p>
      </div>
    </Link>
  );
}
