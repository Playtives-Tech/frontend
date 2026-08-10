import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  MapPin,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import type { Opportunity } from '@/lib/opportunities';
import { formatNaira } from './formatters';

type OpportunityOverviewProps = Readonly<{
  opportunity: Opportunity;
  onContinue: () => void;
}>;

export function OpportunityOverview({
  opportunity,
  onContinue,
}: OpportunityOverviewProps): React.JSX.Element {
  const filledPositions = opportunity.positionsTotal - opportunity.positionsAvailable;
  const progress = (filledPositions / opportunity.positionsTotal) * 100;
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
      <Link
        href="/discover"
        className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-semibold text-foreground shadow-sm transition hover:border-brand/35 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <ArrowLeft className="size-4" />
        Back to Discover
      </Link>
      <div className="overflow-hidden rounded-3xl border bg-background">
        <div className="relative aspect-[16/7] min-h-64 bg-muted">
          <Image
            src={opportunity.image}
            unoptimized
            alt={opportunity.alt}
            fill
            priority
            sizes="(min-width: 1024px) 960px, 100vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        </div>

        <div className="relative -mt-10 rounded-t-3xl bg-background p-6 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
              <ShieldCheck className="size-3.5" />
              Due diligence completed
            </span>

            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
              <BadgeCheck className="size-3.5" />
              Verified operator
            </span>

            <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {opportunity.category}
            </span>
          </div>

          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {opportunity.title}
          </h1>

          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            {opportunity.description}
          </p>

          <div className="mt-7 grid gap-5 border-y py-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Per position</p>
              <p className="mt-2 text-lg font-semibold">{formatNaira(opportunity.positionPrice)}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Duration</p>
              <p className="mt-2 text-lg font-semibold">{opportunity.duration}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Location</p>
              <p className="mt-2 flex items-center gap-1.5 text-lg font-semibold">
                <MapPin className="size-4 text-brand" />
                {opportunity.location}
              </p>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {filledPositions} of {opportunity.positionsTotal} positions filled
            </span>
            <span className="font-semibold text-brand">
              {opportunity.positionsAvailable} available
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
          </div>

          <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <h2 className="font-heading text-2xl font-semibold">About the opportunity</h2>
              <p className="mt-4 leading-8 text-muted-foreground">{opportunity.about}</p>
              <p className="mt-5 leading-8 text-muted-foreground">
                Operator: {opportunity.operator}
              </p>
              {opportunity.agreement && (
                <section className="mt-10 rounded-2xl border bg-surface p-5">
                  <h2 className="font-heading text-2xl font-semibold">Opportunity agreement</h2>
                  <p className="mt-4 whitespace-pre-wrap leading-8 text-muted-foreground">
                    {opportunity.agreement}
                  </p>
                </section>
              )}
              <h2 className="mt-10 font-heading text-2xl font-semibold">What you receive</h2>
              <p className="mt-4 leading-8 text-muted-foreground">
                A defined ownership position, signed ownership record, milestone updates, reviewed
                documents, and distributions according to signed terms.
              </p>
            </div>

            <aside className="h-fit rounded-2xl bg-surface p-5">
              <h2 className="font-heading text-lg font-semibold">Ownership terms</h2>
              <dl className="mt-5 grid gap-5 text-sm">
                <div>
                  <dt className="text-muted-foreground">Model</dt>
                  <dd className="mt-1 font-semibold">{opportunity.ownershipModel}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <CalendarClock className="size-4" />
                    Returns
                  </dt>
                  <dd className="mt-1 font-semibold">{opportunity.returnSchedule}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2 text-muted-foreground">
                    <RefreshCw className="size-4" />
                    Rollover
                  </dt>
                  <dd className="mt-1 font-semibold">
                    {opportunity.rollover
                      ? 'Monthly ROI and principal roll over'
                      : 'No automatic rollover'}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Target ROI</dt>
                  <dd className="mt-1 font-semibold text-brand">Up to {opportunity.returnRate}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">
                    {opportunity.projectedMonthlyProfit == null
                      ? 'Projected profit'
                      : 'Projected monthly profit'}
                  </dt>
                  <dd className="mt-1 font-semibold text-brand">
                    {formatNaira(opportunity.projectedMonthlyProfit ?? opportunity.projectedProfit)}
                  </dd>
                </div>
                {opportunity.rolloverNextPrincipal != null && (
                  <div>
                    <dt className="text-muted-foreground">Next rollover principal</dt>
                    <dd className="mt-1 font-semibold">
                      {formatNaira(opportunity.rolloverNextPrincipal)}
                    </dd>
                    {opportunity.rolloverCompoundsReturns && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Profit is added before the next ROI is calculated.
                      </p>
                    )}
                  </div>
                )}
              </dl>
            </aside>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 z-10 -mx-5 mt-6 border-t bg-background/95 px-5 py-4 backdrop-blur sm:-mx-8 sm:px-8 lg:-mx-10 lg:px-10">
        <button
          type="button"
          onClick={onContinue}
          className="mx-auto flex h-12 w-full max-w-5xl items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110"
        >
          Co-own now <ArrowRight className="size-5" />
        </button>
      </div>
    </div>
  );
}
