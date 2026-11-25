import Image from 'next/image';
import Link from 'next/link';
import { IconArrowRight, IconChartPie, IconClock } from '@tabler/icons-react';
import { trackEvent } from '@/lib/product-analytics';
import {
  formatProjectedReturnRate,
  formatReturnSchedule,
  formatOpportunityTerm,
  isInterestOpportunityOpen,
  isPlaytivesCollective,
  type Opportunity,
} from '@/lib/opportunities';

type OpportunityCardProps = Readonly<{
  opportunity: Opportunity;
  variant?: 'default' | 'compact' | 'catalogue';
}>;

export function OpportunityCard({
  opportunity,
  variant = 'default',
}: OpportunityCardProps): React.JSX.Element {
  if (variant === 'compact') return <CompactOpportunityCard opportunity={opportunity} />;
  if (variant === 'catalogue') return <CompactOpportunityCard opportunity={opportunity} fluid />;

  return (
    <Link
      href={opportunityHref(opportunity)}
      onClick={() => trackEvent('opportunity_card_clicked', { opportunity_id: opportunity._id, sector: opportunity.category, product_type: opportunity.opportunityStructure })}
      className="group flex min-h-[19rem] w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-colors hover:border-brand/30"
    >
      <OpportunityCardImage
        opportunity={opportunity}
        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
      />
      <div className="flex flex-1 flex-col px-3 py-2">
        <OpportunityCardDetails opportunity={opportunity} />
      </div>
    </Link>
  );
}

function CompactOpportunityCard({ opportunity, fluid = false }: { opportunity: Opportunity; fluid?: boolean }): React.JSX.Element {
  return (
    <Link
      href={opportunityHref(opportunity)}
      onClick={() => trackEvent('opportunity_card_clicked', { opportunity_id: opportunity._id, sector: opportunity.category, product_type: opportunity.opportunityStructure })}
      className={`group flex shrink-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-colors hover:border-brand/30 ${fluid ? 'h-[17rem] w-full min-w-0 sm:h-[15.5rem]' : 'h-[17rem] w-[14.125rem]'}`}
    >
      <OpportunityCardImage opportunity={opportunity} sizes={fluid ? '(min-width: 1024px) 22vw, 45vw' : '(min-width: 1024px) 16vw, 60vw'} compact catalogue={fluid} />

      <div className={`flex min-h-0 flex-1 flex-col px-3 pt-2 ${fluid ? 'pb-2' : 'pb-3'}`}>
        <OpportunityCardDetails opportunity={opportunity} compact catalogue={fluid} />
      </div>
    </Link>
  );
}

function OpportunityCardImage({
  opportunity,
  sizes,
  compact = false,
  catalogue = false,
}: Readonly<{
  opportunity: Opportunity;
  sizes: string;
  compact?: boolean;
  catalogue?: boolean;
}>): React.JSX.Element {
  const isInterestOpen = isInterestOpportunityOpen(opportunity);
  const isCardOpen = opportunity.interestModeEnabled
    ? isInterestOpen
    : opportunity.acquisitionStatus === 'OPEN';
  const fullyFunded = opportunity.memberStatus === 'FULLY_FUNDED' || opportunity.acquisitionStatus === 'FULLY_FUNDED';
  const statusLabel = opportunity.memberStatus?.replaceAll('_', ' ') ?? opportunity.acquisitionStatus.replaceAll('_', ' ');

  return (
    <div className={`relative shrink-0 overflow-hidden bg-muted ${catalogue ? 'h-[40%] sm:h-[45%]' : compact ? 'h-[45%]' : 'h-32'}`}>
      {opportunity.imageUrl ? (
        <Image
          src={opportunity.imageUrl}
          unoptimized
          alt={opportunity.imageAlt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : null}
      <span
        className={`absolute right-2 top-3 rounded-full border px-3 py-1 text-[9px] font-bold tracking-wide text-white shadow-md ${isCardOpen || fullyFunded ? 'border-brand bg-brand' : 'border-slate-600 bg-slate-700'}`}
      >
        {fullyFunded && !opportunity.interestModeEnabled
          ? 'SOLD OUT'
          : opportunity.interestModeEnabled
          ? isInterestOpen
            ? isPlaytivesCollective(opportunity)
              ? 'JOIN NOW'
              : 'REGISTER INTEREST'
            : 'INTEREST CLOSED'
          : statusLabel}
      </span>
    </div>
  );
}

function OpportunityCardDetails({
  opportunity,
  compact = false,
  catalogue = false,
}: Readonly<{ opportunity: Opportunity; compact?: boolean; catalogue?: boolean }>): React.JSX.Element {
  const isInterestOpen = isInterestOpportunityOpen(opportunity);
  const projectedRate = opportunity.interestModeEnabled
    ? isInterestOpen && isPlaytivesCollective(opportunity)
      ? 'Join now'
      : isInterestOpen
        ? 'Register interest'
        : 'Registration closed'
    : opportunity.assetLifecycleEnabled
      ? `${formatProjectedReturnRate(opportunity)} projected monthly once operational`
      : formatProjectedReturnRate(opportunity);
  const minimum = (opportunity.pricePerUnitMinorUnits * opportunity.minimumUnits) / 100;
  const fundedPercent = opportunity.totalUnits > 0
    ? Math.min(100, Math.max(0, ((opportunity.totalUnits - opportunity.availableUnits) / opportunity.totalUnits) * 100))
    : null;

  if (compact) {
    return (
      <div className={`flex h-full min-h-0 flex-col ${catalogue ? 'justify-between' : ''}`}>
        <div className="min-w-0">
          <p className="inline-block max-w-full truncate rounded-md border border-brand/15 bg-brand/[0.035] px-1.5 py-0.5 text-[8px] font-semibold uppercase leading-3 tracking-wide text-brand">
            {opportunity.category} · {structureLabel(opportunity)}
          </p>
          <h3 className={`mt-1 line-clamp-2 font-sans font-semibold tracking-normal ${catalogue ? 'text-xs leading-4' : 'text-sm leading-5'}`}>
            {opportunity.title}
          </h3>
        </div>
        <div className="min-w-0">
          <p className={`line-clamp-2 font-semibold leading-4 text-brand ${catalogue ? 'text-[9px]' : 'text-[10px]'}`}>
            {catalogue && isInterestOpen && isPlaytivesCollective(opportunity) ? (
              <span className="inline-flex min-h-7 items-center rounded-lg bg-brand px-3 text-[9px] font-semibold text-brand-foreground">Join now</span>
            ) : catalogue && isInterestOpen && opportunity.interestModeEnabled ? (
              <span className="inline-flex min-h-7 items-center gap-1.5 rounded-lg bg-brand px-3 text-[9px] font-semibold text-brand-foreground">Register interest <IconArrowRight className="size-3.5" stroke={1.8} aria-hidden="true" /></span>
            ) : projectedRate}
            {!opportunity.interestModeEnabled && !opportunity.assetLifecycleEnabled ? (
              <span className="font-medium text-muted-foreground">
                {' '}{formatReturnSchedule(opportunity.returnSchedule).toLowerCase()}
              </span>
            ) : null}
          </p>
          {!opportunity.interestModeEnabled ? (
            <div className={`flex flex-wrap items-center gap-x-2 gap-y-0.5 pt-1.5 text-muted-foreground ${catalogue ? 'text-[9px]' : 'text-[10px]'}`}>
              <span className="font-semibold text-foreground">{minimum > 0 ? `From ${formatCompactNaira(minimum * 100)}` : 'From —'}</span>
              <span aria-hidden="true" className="text-border">·</span>
              <span className="inline-flex items-center gap-1 whitespace-nowrap"><IconClock className="size-3.5 text-brand" stroke={1.8} aria-hidden="true" />{formatOpportunityTerm(opportunity)}</span>
            </div>
          ) : null}
          {!opportunity.interestModeEnabled && fundedPercent !== null ? (
            <p className={`mt-1 inline-flex items-center gap-1 font-medium text-brand ${catalogue ? 'text-[9px]' : 'text-[10px]'}`}><IconChartPie className="size-3.5" stroke={1.8} aria-hidden="true" />{Math.round(fundedPercent)}% funded</p>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-4">
        <p className="flex items-center gap-1 text-[9px] font-medium text-muted-foreground">
          {opportunity.category} · {structureLabel(opportunity)}
        </p>
      </div>
      <h3 className="mt-1 line-clamp-2 font-sans text-sm font-semibold leading-5 tracking-normal">
        {opportunity.title}
      </h3>
      <div className="line-clamp-1 pt-1">
        <p className="text-[10.5px] font-semibold leading-4 text-brand">
          {projectedRate}
          {!opportunity.interestModeEnabled && !opportunity.assetLifecycleEnabled ? (
            <span className="font-medium text-muted-foreground">
              {' '}
              {formatReturnSchedule(opportunity.returnSchedule).toLowerCase()}
            </span>
          ) : null}
        </p>
      </div>
      {!opportunity.interestModeEnabled && minimum > 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">From {formatCompactNaira(minimum * 100)}</p>
      ) : null}
      {!opportunity.interestModeEnabled ? (
        <p className="mt-1 text-xs text-muted-foreground">Term: {formatOpportunityTerm(opportunity)}</p>
      ) : null}
      {!opportunity.interestModeEnabled && fundedPercent !== null ? (
        <div className="mt-auto pt-2" aria-label={`${Math.round(fundedPercent)}% funded`}>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-brand" style={{ width: `${fundedPercent}%` }} />
          </div>
          <p className="mt-1 text-[10px] text-muted-foreground">{Math.round(fundedPercent)}% funded</p>
        </div>
      ) : null}
    </>
  );
}

function opportunityHref(opportunity: Opportunity): string {
  return opportunity.interestModeEnabled && isPlaytivesCollective(opportunity)
    ? '/collectives'
    : `/discover/${opportunity.slug}`;
}

function formatCompactNaira(minorUnits: number): string {
  const amount = minorUnits / 100;
  if (amount >= 1_000_000) return `₦${compactNumber(amount / 1_000_000)}M`;
  if (amount >= 1_000) return `₦${compactNumber(amount / 1_000)}K`;
  return `₦${Math.round(amount).toLocaleString('en-NG')}`;
}

function compactNumber(value: number): string {
  return value % 1 === 0 ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

function structureLabel(opportunity: Opportunity): string {
  if (opportunity.opportunityStructure === 'CO_FUNDING') return 'CO-FUND';
  if (opportunity.opportunityStructure === 'FULL_OWNERSHIP') return 'OWN';
  return 'CO-OWN';
}
