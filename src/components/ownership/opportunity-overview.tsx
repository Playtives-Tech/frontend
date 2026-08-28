'use client';

import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Check,
  ChevronDown,
  ChevronUp,
  Info,
  X,
} from 'lucide-react';
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
}>;

type HighlightDetail = Readonly<{
  label: string;
  value: string;
  description: string;
}>;

export function OpportunityOverview({
  opportunity,
  onContinue,
}: OpportunityOverviewProps): React.JSX.Element {
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [selectedHighlight, setSelectedHighlight] = useState<HighlightDetail | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);
  const availablePercentage =
    opportunity.totalUnits > 0
      ? Math.max(0, Math.min(100, (opportunity.availableUnits / opportunity.totalUnits) * 100))
      : 0;
  const isCoFunded = opportunity.opportunityStructure === 'CO_FUNDING';
  const canContinue = opportunity.availableUnits >= opportunity.minimumUnits;
  const continueLabel =
    opportunity.availableUnits < opportunity.minimumUnits
      ? 'Currently unavailable'
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
          <div className="flex items-start justify-between gap-3">
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
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-[12px] font-bold text-brand">
              Verified {isCoFunded ? 'co-funding' : 'co-ownership'}
              <BadgeCheck className="size-5" />
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
                  {summaryExpanded ? (
                    <ChevronUp className="size-3.5" />
                  ) : (
                    <ChevronDown className="size-3.5" />
                  )}
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={onContinue}
                  className="flex h-12 items-center justify-center gap-2 rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground shadow-[0_12px_28px_rgb(8_68_49/0.2)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-45 sm:h-14 sm:rounded-2xl"
                >
                  {continueLabel}
                  <ArrowRight className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setAboutOpen(true)}
                  className="flex h-12 items-center justify-center rounded-xl border border-brand/40 bg-background px-4 text-sm font-bold text-brand transition hover:bg-brand/5 sm:h-14 sm:rounded-2xl"
                >
                  About
                </button>
              </div>
              <div className="mt-2 border-t border-border/80 pt-4 text-center">
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-brand transition-[width]"
                    style={{ width: `${availablePercentage}%` }}
                  />
                </div>
                <p className="mt-5 text-xs font-medium text-muted-foreground">
                  {availablePercentage.toFixed(0)}% of co-own units are available
                </p>
              </div>
            </div>
          ) : null}

          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:mt-6 sm:gap-3">
            <Highlight
              label="Projected earnings (%)"
              value={`${formatProjectedReturnRate(opportunity)} ${formatReturnSchedule(opportunity.returnSchedule).toLowerCase()}`}
              description="This is the projected distribution rate for one return cycle. It is an estimate; actual monthly distributions are reviewed and credited by Playtives after each cycle."
              onClick={setSelectedHighlight}
            />
            <Highlight
              label="Deal type"
              value={formatOwnershipModel(opportunity.opportunityStructure)}
              description=""
              onClick={setSelectedHighlight}
            />
            <Highlight
              label="Return type"
              value={
                isVariableDistribution(opportunity)
                  ? 'Variable monthly distribution'
                  : 'Projected monthly distribution'
              }
              description={
                isVariableDistribution(opportunity)
                  ? 'The monthly distribution may change based on the opportunity’s realised performance. Each distribution is reviewed before it is credited.'
                  : 'The displayed monthly distribution is a projection. Actual distributions are reviewed and credited based on the opportunity’s performance.'
              }
              onClick={setSelectedHighlight}
            />
            <Highlight
              label={`Projected earnings per unit`}
              value={formatProjectedDistribution(opportunity)}
              description="This is the projected amount for each unit you own in one distribution cycle. It is not an automatic or guaranteed wallet credit."
              onClick={setSelectedHighlight}
            />
            <Highlight
              label="Term"
              value={formatOpportunityTerm(opportunity)}
              description="This is the expected period for the opportunity. For fixed-term opportunities, capital is considered for return at the end of this term."
              onClick={setSelectedHighlight}
            />
            <Highlight
              label="Capital return"
              value={formatCapitalReturn(opportunity)}
              description="This explains when your original contribution is due for return. Capital return is handled separately from monthly distributions."
              onClick={setSelectedHighlight}
            />
            {opportunity.commencementDate ? (
              <Highlight
                label="Start date"
                value={new Date(opportunity.commencementDate).toLocaleDateString('en-NG', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
                description="This is when the opportunity commences. New ownership contributions close from this date, and the monthly distribution cycle starts from this point."
                onClick={setSelectedHighlight}
              />
            ) : null}
            <Highlight
              label="Deal location"
              value={opportunity.location || 'Not specified'}
              description="This is the primary location associated with the opportunity or underlying asset."
              onClick={setSelectedHighlight}
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
            <ContentSection title="" text={opportunity.about} />
            {opportunity.agreement ? (
              <AgreementPreview
                agreement={opportunity.agreement}
                resourceUrl={opportunity.agreementResourceUrl}
                allowAcceptance={opportunity.acquisitionStatus === 'OPEN'}
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
      {selectedHighlight ? (
        <HighlightModal detail={selectedHighlight} onClose={() => setSelectedHighlight(null)} />
      ) : null}
      {aboutOpen ? (
        <AboutOpportunityModal opportunity={opportunity} onClose={() => setAboutOpen(false)} />
      ) : null}
    </div>
  );
}

function AboutOpportunityModal({
  opportunity,
  onClose,
}: Readonly<{
  opportunity: Opportunity;
  onClose: () => void;
}>): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-opportunity-title"
    >
      <section className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border bg-background shadow-xl">
        <header className="flex items-start justify-between gap-4 border-b px-5 py-4 sm:px-6 sm:py-5">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">About</p> */}
            <h2 id="about-opportunity-title" className="mt-1 text-lg font-semibold">
              {opportunity.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close opportunity details"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="overflow-y-auto px-5 py-5 sm:px-6">
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {opportunity.about}
          </p>
        </div>
        {/* <footer className="border-t px-5 py-4 sm:px-6">
          <button
            type="button"
            onClick={onClose}
            className="h-10 w-full rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
          >
            Done
          </button>
        </footer> */}
      </section>
    </div>
  );
}

function Highlight({
  label,
  value,
  description,
  onClick,
}: HighlightDetail & { onClick: (detail: HighlightDetail) => void }): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onClick({ label, value, description })}
      className="group rounded-xl border border-brand/10 bg-brand/5 px-3 py-2.5 text-left transition hover:border-brand/30 hover:bg-brand/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 sm:py-3"
    >
      <p className="line-clamp-1 text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 line-clamp-1 flex items-center gap-1.5 text-[14px] font-bold tracking-tight text-brand">
        {value}
        <Info className="size-3 shrink-0 opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100" />
      </p>
    </button>
  );
}

function HighlightModal({
  detail,
  onClose,
}: Readonly<{
  detail: HighlightDetail;
  onClose: () => void;
}>): React.JSX.Element {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="highlight-detail-title"
    >
      <section className="w-full max-w-md rounded-2xl border bg-background p-5 shadow-xl sm:p-6">
        <header className="flex items-start justify-between gap-4">
          <div>
            {/* <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand">
              Opportunity detail
            </p> */}
            <h2 id="highlight-detail-title" className="mt-1 text-lg font-semibold">
              {detail.label}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid size-9 shrink-0 place-items-center rounded-lg border text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="Close detail"
          >
            <X className="size-4" />
          </button>
        </header>
        <div className="mt-5 rounded-xl bg-brand/5 p-4">
          <p className="text-xs text-muted-foreground">Current value</p>
          <p className="mt-1 text-lg font-semibold text-brand">{detail.value}</p>
        </div>
        {/* <p className="mt-5 text-sm leading-6 text-muted-foreground">{detail.description}</p> */}
        {/* <button
          type="button"
          onClick={onClose}
          className="mt-6 h-10 w-full rounded-lg bg-brand px-4 text-sm font-semibold text-brand-foreground transition hover:brightness-110"
        >
          Done
        </button> */}
      </section>
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
