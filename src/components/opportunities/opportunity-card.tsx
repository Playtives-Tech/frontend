import Image from 'next/image';
import Link from 'next/link';
import { UsersRound } from 'lucide-react';
import { formatProjectedReturnRate, type Opportunity } from '@/lib/opportunities';

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
      className="group flex h-[13rem] w-full flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-colors hover:border-brand/30"
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

function CompactOpportunityCard({ opportunity }: { opportunity: Opportunity }): React.JSX.Element {
  return (
    <Link
      href={`/discover/${opportunity.slug}`}
      className="group flex h-[13rem] w-[12.125rem] shrink-0 flex-col overflow-hidden rounded-xl border border-border/80 bg-background shadow-sm transition-colors hover:border-brand/30 sm:w-[13rem] lg:w-[14.125rem]"
    >
      <OpportunityCardImage opportunity={opportunity} sizes="(min-width: 1024px) 16vw, 60vw" />

      <div className="flex flex-1 flex-col px-3 py-2">
        <OpportunityCardDetails opportunity={opportunity} compact />
      </div>
    </Link>
  );
}

function OpportunityCardImage({
  opportunity,
  sizes,
}: Readonly<{
  opportunity: Opportunity;
  sizes: string;
}>): React.JSX.Element {
  return (
    <div className="relative h-32 shrink-0 overflow-hidden bg-muted">
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
        className={`absolute right-2 top-3 rounded-[200px] border px-4 py-1 text-[9px] font-bold tracking-wide text-white shadow-md ${opportunity.acquisitionStatus === 'OPEN' ? 'border-[#819f3b] bg-[#819f3b]' : 'border-red-600 bg-red-600'}`}
      >
        {opportunity.acquisitionStatus === 'OPEN'
          ? `${formatCompactNaira(opportunity.pricePerUnitMinorUnits)} · ${structureLabel(opportunity)}`
          : `${formatCompactNaira(opportunity.pricePerUnitMinorUnits)} · ${opportunity.acquisitionStatus === 'COMMENCED' ? 'DEAL LIVE' : 'OFFER CLOSED'}`}
      </span>
    </div>
  );
}

function OpportunityCardDetails({
  opportunity,
}: Readonly<{ opportunity: Opportunity; compact?: boolean }>): React.JSX.Element {
  const projectedRate = formatProjectedReturnRate(opportunity);
  const memberCount = opportunity.memberCount ?? 0;
  const memberLabel =
    opportunity.opportunityStructure === 'CO_FUNDING' ? 'CO-FUNDERS' : 'CO-OWNERS';
  const showTitleSuffix = Array.from(opportunity.title.trim()).length > 24;

  return (
    <>
      <div className="h-4">
        <p className="flex items-center gap-1 text-[9px] font-normal text-[#bab9b9]">
          {memberLabel}: {memberCount}
        </p>
      </div>
      <h3 className="relative mt-1 max-w-full overflow-hidden whitespace-nowrap pr-3 font-sans text-[11px] font-semibold leading-5 tracking-normal">
        <span className="block overflow-hidden text-clip">{opportunity.title}</span>
        {showTitleSuffix ? (
          <span className="absolute right-0 top-0 bg-background" aria-hidden="true">
            ...
          </span>
        ) : null}
      </h3>
      <div className="line-clamp-1 pt-1">
        <p className="text-[10.5px] font-semibold leading-4 text-brand">
          {projectedRate}{' '}
          <span className="font-medium text-muted-foreground">monthly profit share</span>
        </p>
      </div>
    </>
  );
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
