'use client';

import { ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, MapPin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { AgreementPreview } from './agreement-preview';
import {
  formatOpportunityMoney,
  formatCapitalReturn,
  formatOpportunityTerm,
  formatOwnershipModel,
  formatProjectedDistribution,
  formatProjectedReturnRate,
  formatReturnSchedule,
  isVariableDistribution,
  type Opportunity,
} from '@/lib/opportunities';

type OpportunityOverviewProps = Readonly<{
  opportunity: Opportunity;
  onContinue?: () => void;
  agreementAccepted?: boolean;
  onAgreementAccepted?: () => void;
}>;

export function OpportunityOverview({
  opportunity,
  onContinue,
  agreementAccepted = false,
  onAgreementAccepted,
}: OpportunityOverviewProps): React.JSX.Element {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const filledUnits = Math.max(0, opportunity.totalUnits - opportunity.availableUnits);
  const progress =
    opportunity.totalUnits > 0 ? Math.min(100, (filledUnits / opportunity.totalUnits) * 100) : 0;
  const isCoFunded = opportunity.opportunityStructure === 'CO_FUNDING';
  const agreementRequired = Boolean(opportunity.agreement.trim());
  const canContinue =
    opportunity.availableUnits >= opportunity.minimumUnits &&
    (!agreementRequired || agreementAccepted);
  const continueLabel =
    opportunity.availableUnits < opportunity.minimumUnits
      ? 'Currently unavailable'
      : agreementRequired && !agreementAccepted
        ? 'Accept agreement to continue'
          : isCoFunded
          ? 'Co-fund now'
          : 'Co own now';
  const canExpandSummary = opportunity.summary.trim().length > 140;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-8 sm:py-6 lg:px-10 lg:py-8">
      <Link
        href="/discover"
        className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-brand transition hover:opacity-75"
      >
        <ArrowLeft className="size-4" />
        Back to opportunities
      </Link>

      <article>
        <div className="relative h-40 overflow-hidden rounded-2xl bg-muted sm:h-64 sm:rounded-[1.75rem] lg:h-72">
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

        <div className="relative -mt-4 rounded-2xl border border-border/70 bg-background px-4 py-5 shadow-[0_18px_45px_rgb(31_47_40/0.08)] dark:shadow-none sm:-mt-8 sm:rounded-[1.75rem] sm:px-8 sm:py-8 lg:px-10">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand/10 px-3 py-1.5 text-xs font-semibold text-brand">
              <Check className="size-3.5" />
              {opportunity.acquisitionStatus === 'OPEN'
                ? 'Open for acquisition'
                : 'Closed to new owners'}
            </span>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {opportunity.category}
            </span>
            <span className="rounded-full bg-muted px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              {formatOwnershipModel(opportunity.opportunityStructure)}
            </span>
          </div>

          <div className="mt-4 flex items-start justify-between gap-4 sm:mt-5">
            <div className="min-w-0">
              <h1 className="max-w-5xl font-sans text-[18px] font-semibold leading-tight tracking-tight sm:text-[18px]">
                {opportunity.title}
              </h1>
              <p
                className={`mt-1 max-w-4xl text-[13px] font-normal leading-4 text-muted-foreground sm:text-[12px] sm:leading-5 ${summaryExpanded ? '' : 'line-clamp-2'}`}
              >
                {opportunity.summary}
              </p>
              {canExpandSummary ? (
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((expanded) => !expanded)}
                  aria-expanded={summaryExpanded}
                  className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-brand transition hover:opacity-75"
                >
                  {summaryExpanded ? 'See less' : 'See more'}
                  {summaryExpanded ? <ChevronUp className="size-3.5" /> : <ChevronDown className="size-3.5" />}
                </button>
              ) : null}
            </div>
            <p className="shrink-0 text-right text-[15px] font-bold tracking-tight text-foreground sm:text-base">
              {formatOpportunityMoney(opportunity.pricePerUnitMinorUnits)}
              <span className="mt-0.5 block text-[11px] font-medium text-muted-foreground">
                / unit
              </span>
            </p>
          </div>

          {onContinue ? (
            <div className="mt-4 sm:mt-5">
              <button
                type="button"
                disabled={!canContinue}
                onClick={onContinue}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-brand-foreground shadow-[0_12px_28px_rgb(8_68_49/0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:h-14 sm:rounded-2xl"
              >
                {continueLabel}
                <ArrowRight className="size-5" />
              </button>
            </div>
          ) : null}

          <dl className="mt-5 grid grid-cols-2 gap-4 border-y border-border/80 py-4 sm:mt-7 sm:gap-x-8 sm:gap-y-5 sm:py-6">
            <Metric label="Term" value={formatOpportunityTerm(opportunity)} />
            <Metric
              label="Location"
              value={opportunity.location || 'Not specified'}
              icon={<MapPin className="size-4 text-brand" />}
            />
            <Metric label="Capital return" value={formatCapitalReturn(opportunity)} />
            {opportunity.commencementDate ? (
              <Metric
                label="Start Date"
                value={new Date(opportunity.commencementDate).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              />
            ) : null}
          </dl>

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3">
            <Highlight
              label="Projected distribution rate"
              value={`${formatProjectedReturnRate(opportunity)} · ${formatReturnSchedule(opportunity.returnSchedule)}`}
            />
            <Highlight
              label={`Projected ${formatReturnSchedule(opportunity.returnSchedule).toLowerCase()} distribution per unit`}
              value={formatProjectedDistribution(opportunity)}
            />
            <Highlight
              label="Return type"
              value={
                isVariableDistribution(opportunity)
                  ? 'Variable monthly distribution'
                  : 'Projected monthly distribution'
              }
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

          {/* {opportunity.projectionDisclaimer ? (
            <p className="mt-4 rounded-xl border border-brand/25 bg-brand/10 px-3 py-2.5 text-sm leading-5 text-brand dark:border-brand/35 dark:bg-brand/15 sm:mt-5 sm:px-4 sm:py-3 sm:leading-6">
              {opportunity.projectionDisclaimer}
            </p>
          ) : null} */}

          <div className="mt-6 space-y-5 sm:mt-8 sm:space-y-7">
            <ContentSection title="About the opportunity" text={opportunity.about} />
            {opportunity.agreement ? (
              <AgreementPreview
                agreement={opportunity.agreement}
                resourceUrl={opportunity.agreementResourceUrl}
                accepted={agreementAccepted}
                allowAcceptance={opportunity.acquisitionStatus === 'OPEN'}
                onAccept={onAgreementAccepted}
              />
            ) : null}
            <div>
              <h2 className="font-sans text-lg font-bold tracking-tight">What you receive</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {opportunity.minimumUnits} {opportunity.minimumUnits === 1 ? 'unit' : 'units'}{' '}
                minimum in a {formatOwnershipModel(opportunity.opportunityStructure).toLowerCase()}{' '}
                opportunity, with {isVariableDistribution(opportunity) ? 'variable ' : ''}
                {formatReturnSchedule(opportunity.returnSchedule).toLowerCase()} distributions where
                available. Your capital is returned {formatCapitalReturn(opportunity).toLowerCase()}
                .
              </p>
            </div>
          </div>

          {onContinue ? (
            <div className="mt-7 border-t border-border/80 pt-5 sm:mt-9 sm:pt-6">
              <button
                type="button"
                disabled={!canContinue}
                onClick={onContinue}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-brand px-5 text-sm font-bold text-brand-foreground shadow-[0_12px_28px_rgb(8_68_49/0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:h-14 sm:rounded-2xl"
              >
                {continueLabel}
                <ArrowRight className="size-5" />
              </button>
            </div>
          ) : null}
        </div>
      </article>
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
      <dt className="text-[13px] font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 flex items-center gap-1.5 text-[12px] font-medium tracking-tight">
        {icon}
        {value}
      </dd>
    </div>
  );
}

function Highlight({ label, value }: { label: string; value: string }): React.JSX.Element {
  return (
    <div className="rounded-xl border border-brand/10 bg-brand/5 px-3 py-2.5 sm:py-3">
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
