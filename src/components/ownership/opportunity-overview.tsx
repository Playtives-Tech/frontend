import { ArrowLeft, ArrowRight, CalendarClock, MapPin, RefreshCw } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import {
  formatOpportunityMoney,
  formatOwnershipModel,
  formatReturnSchedule,
  type Opportunity,
} from '@/lib/opportunities';

export function OpportunityOverview({
  opportunity,
  onContinue,
}: {
  opportunity: Opportunity;
  onContinue?: () => void;
}): React.JSX.Element {
  const filled = Math.max(0, opportunity.totalUnits - opportunity.availableUnits);
  const progress =
    opportunity.totalUnits > 0 ? Math.min(100, (filled / opportunity.totalUnits) * 100) : 0;
  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 lg:px-10">
      <Link
        href="/discover"
        className="mb-5 inline-flex items-center gap-2 rounded-lg border bg-background px-3.5 py-2 text-sm font-semibold shadow-sm"
      >
        <ArrowLeft className="size-4" />
        Back to Discover
      </Link>
      <article className="overflow-hidden rounded-3xl border bg-background">
        <div className="relative aspect-[16/7] min-h-64 bg-muted">
          {opportunity.imageUrl && (
            <Image
              src={opportunity.imageUrl}
              unoptimized
              alt={opportunity.imageAlt}
              fill
              priority
              sizes="(min-width: 1024px) 960px, 100vw"
              className="object-cover"
            />
          )}
        </div>
        <div className="p-6 sm:p-8">
          <span className="rounded-full bg-surface px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            {opportunity.category}
          </span>
          <h1 className="mt-6 font-heading text-4xl font-semibold tracking-tight sm:text-5xl">
            {opportunity.title}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted-foreground">
            {opportunity.summary}
          </p>
          <div className="mt-7 grid gap-5 border-y py-6 sm:grid-cols-3">
            <Fact
              label="Per unit"
              value={formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)}
            />
            <Fact
              label="Duration"
              value={
                opportunity.durationMonths
                  ? `${opportunity.durationMonths} months`
                  : 'Not specified'
              }
            />
            <Fact
              label="Location"
              value={opportunity.location || 'Not specified'}
              icon={<MapPin className="size-4 text-brand" />}
            />
          </div>
          <div className="mt-6 flex justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {filled} of {opportunity.totalUnits} units filled
            </span>
            <span className="font-semibold text-brand">{opportunity.availableUnits} available</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
          </div>
          <div className="mt-10 grid gap-8 lg:grid-cols-[1.35fr_0.65fr]">
            <div>
              <Section title="About the opportunity" text={opportunity.about} />
              <p className="mt-5 leading-8 text-muted-foreground">
                Operator: {opportunity.operator || 'Not specified'}
              </p>
              {opportunity.agreement && (
                <div className="mt-10">
                  <Section title="Opportunity agreement" text={opportunity.agreement} />
                </div>
              )}
            </div>
            <aside className="h-fit rounded-2xl bg-surface p-5">
              <h2 className="font-heading text-lg font-semibold">Opportunity facts</h2>
              <dl className="mt-5 grid gap-5 text-sm">
                <Term
                  label="Ownership model"
                  value={formatOwnershipModel(opportunity.ownershipModel)}
                />
                <Term
                  label="Return schedule"
                  value={formatReturnSchedule(opportunity.returnSchedule)}
                  icon={<CalendarClock className="size-4" />}
                />
                <Term
                  label="Rollover"
                  value={
                    opportunity.rolloverAllowed
                      ? opportunity.rolloverCompoundsReturns
                        ? 'Allowed with compounded returns'
                        : 'Allowed without compounded returns'
                      : 'Not allowed'
                  }
                  icon={<RefreshCw className="size-4" />}
                />
                <Term
                  label="Projected return"
                  value={`${opportunity.projectedReturnRatePercent}%`}
                />
                <Term
                  label={
                    opportunity.projectedMonthlyProfitMinorUnits == null
                      ? 'Projected profit'
                      : 'Projected monthly profit'
                  }
                  value={formatOpportunityMoney(
                    opportunity.projectedMonthlyProfitMinorUnits ??
                      opportunity.projectedProfitMinorUnits,
                  )}
                />
                {opportunity.rolloverNextPrincipalMinorUnits != null && (
                  <Term
                    label="Next rollover principal"
                    value={formatOpportunityMoney(opportunity.rolloverNextPrincipalMinorUnits)}
                  />
                )}
              </dl>
            </aside>
          </div>
          {onContinue && (
            <button
              type="button"
              disabled={opportunity.availableUnits < opportunity.minimumUnits}
              onClick={onContinue}
              className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 font-semibold text-brand-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
            >
              {opportunity.availableUnits < opportunity.minimumUnits
                ? 'Currently unavailable'
                : 'Choose your positions'}
              <ArrowRight className="size-5" />
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

function Fact({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 flex items-center gap-1.5 text-lg font-semibold">
        {icon}
        {value}
      </p>
    </div>
  );
}
function Section({ title, text }: { title: string; text: string }) {
  return (
    <section>
      <h2 className="font-heading text-2xl font-semibold">{title}</h2>
      <p className="mt-4 whitespace-pre-wrap leading-8 text-muted-foreground">{text}</p>
    </section>
  );
}
function Term({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div>
      <dt className="flex items-center gap-2 text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
