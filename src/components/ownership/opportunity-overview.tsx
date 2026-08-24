import { ArrowLeft, ArrowRight, Check, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { AgreementPreview } from './agreement-preview';
import {
  formatOpportunityMoney,
  formatOwnershipModel,
  formatReturnSchedule,
  type Opportunity,
} from '@/lib/opportunities';

type OpportunityOverviewProps = Readonly<{
  opportunity: Opportunity;
  onContinue?: () => void;
}>;

export function OpportunityOverview({
  opportunity,
  onContinue,
}: OpportunityOverviewProps): React.JSX.Element {
  const filledUnits = Math.max(0, opportunity.totalUnits - opportunity.availableUnits);
  const progress =
    opportunity.totalUnits > 0 ? Math.min(100, (filledUnits / opportunity.totalUnits) * 100) : 0;
  const isCoFunded = opportunity.ownershipModel === 'CO_OWNERSHIP';
  const monthlyProfit = opportunity.projectedMonthlyProfitMinorUnits;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 lg:px-10 lg:py-8">
      <Link
        href="/discover"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:opacity-75"
      >
        <ArrowLeft className="size-4" />
        Back to opportunities
      </Link>

      <article>
        <div className="relative h-48 overflow-hidden rounded-[1.75rem] bg-muted sm:h-64 lg:h-72">
          {opportunity.imageUrl ? (
            <Image
              src={opportunity.imageUrl}
              unoptimized
              alt={opportunity.imageAlt || opportunity.title}
              fill
              priority
              sizes="(min-width: 1280px) 960px, (min-width: 640px) 90vw, 100vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="relative -mt-5 rounded-[1.75rem] border border-border/70 bg-background px-5 py-6 shadow-[0_18px_45px_rgb(31_47_40/0.08)] dark:shadow-none sm:-mt-8 sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
              <Check className="size-3.5" />
              Available now
            </span>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {opportunity.category}
            </span>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {formatOwnershipModel(opportunity.ownershipModel)}
            </span>
          </div>

          <h1 className="sm:text-[18px] mt-5 max-w-5xl font-sans text-[18px] font-semibold leading-tight tracking-tight">
            {opportunity.title}
          </h1>
          <p className="mt-1 max-w-4xl text-[13px] font-normal leading-4 text-muted-foreground sm:text-[12px] sm:leading-5">
            {opportunity.summary}
          </p>

          <dl className="mt-7 grid gap-5 border-y border-border/80 py-5 sm:grid-cols-3 sm:gap-8 sm:py-6">
            <Metric
              label="Price per unit"
              value={formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)}
            />
            <Metric
              label="Duration"
              value={
                opportunity.durationMonths
                  ? `${opportunity.durationMonths} months`
                  : 'Not specified'
              }
            />
            <Metric
              label="Location"
              value={opportunity.location || 'Not specified'}
              icon={<MapPin className="size-4 text-brand" />}
            />
          </dl>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Highlight
              label={
                monthlyProfit == null
                  ? 'Projected profit per unit'
                  : 'Projected monthly profit per unit'
              }
              value={formatOpportunityMoney(monthlyProfit ?? opportunity.projectedProfitMinorUnits)}
            />
            <Highlight
              label="Projected total profit per unit"
              value={formatOpportunityMoney(opportunity.projectedProfitMinorUnits)}
            />
            <Highlight
              label="Distribution schedule"
              value={formatReturnSchedule(opportunity.returnSchedule)}
            />
          </div>

          {/* <div className="mt-6 flex items-end justify-between gap-4 text-sm">
            <span className="text-muted-foreground">
              {filledUnits} of {opportunity.totalUnits} units selected
            </span>
            <span className="font-semibold text-brand">
              {opportunity.availableUnits} {opportunity.availableUnits === 1 ? 'unit' : 'units'} available
            </span>
          </div> */}
          {/* <div className="mt-2 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${progress}%` }} />
          </div> */}

          <p className="mt-5 rounded-xl border border-brand/25 bg-brand/10 px-4 py-3 text-sm leading-6 text-brand dark:border-brand/35 dark:bg-brand/15">
            Projected profit figures are provided for planning only and are not guaranteed.
          </p>

          <div className="mt-8 space-y-7">
            <ContentSection title="About the opportunity" text={opportunity.about} />
            {opportunity.agreement ? <AgreementPreview agreement={opportunity.agreement} /> : null}
            <div>
              <h2 className="font-sans text-lg font-bold tracking-tight">What you receive</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {opportunity.minimumUnits} {opportunity.minimumUnits === 1 ? 'unit' : 'units'}{' '}
                minimum in a {formatOwnershipModel(opportunity.ownershipModel).toLowerCase()}{' '}
                opportunity, with {formatReturnSchedule(opportunity.returnSchedule).toLowerCase()}{' '}
                distributions where available.
              </p>
            </div>
          </div>
        </div>
      </article>

      {onContinue ? (
        <div className="sticky bottom-[4.75rem] z-10 mt-5 border-t border-border/70 bg-background/95 py-3 backdrop-blur lg:bottom-0">
          <button
            type="button"
            disabled={opportunity.availableUnits < opportunity.minimumUnits}
            onClick={onContinue}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-brand px-5 text-sm font-bold text-brand-foreground shadow-[0_12px_28px_rgb(8_68_49/0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45"
          >
            {opportunity.availableUnits < opportunity.minimumUnits
              ? 'Currently unavailable'
              : isCoFunded
                ? 'Co-fund now'
                : 'Own this opportunity'}
            <ArrowRight className="size-5" />
          </button>
        </div>
      ) : null}
    </div>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}): React.JSX.Element {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-1.5 text-base font-bold tracking-tight">
        {icon}
        {value}
      </dd>
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-brand/10 bg-brand/5 px-3 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-[14px] font-bold tracking-tight text-brand">{value}</p>
    </div>
  );
}

function ContentSection({ title, text }: { title: string; text: string }): React.JSX.Element {
  return (
    <section>
      <h2 className="font-sans text-[16px] font-bold tracking-tight">{title}</h2>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{text}</p>
    </section>
  );
}
