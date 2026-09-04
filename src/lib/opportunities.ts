import { api } from './api';
import { env } from './env';

export type OpportunityStatus = 'PUBLISHED' | 'INTEREST_OPEN' | 'INTEREST_CLOSED';
export type ReturnSchedule = 'MONTHLY' | 'YEARLY' | 'AT_MATURITY';
export type OpportunityStructure = 'CO_OWNERSHIP' | 'CO_FUNDING' | 'FULL_OWNERSHIP';
export type TermType = 'FIXED_TERM' | 'LIFE_OF_ASSET';
export type DurationUnit = 'DAYS' | 'MONTHS' | 'YEARS';

export type Opportunity = Readonly<{
  _id: string;
  slug: string;
  title: string;
  category: string;
  opportunityStructure: OpportunityStructure;
  returnModel: string;
  projectionType: string;
  summary: string;
  about: string;
  agreement: string;
  agreementVersion?: string;
  agreementEffectiveDate?: string | null;
  agreementStatus?: 'DRAFT' | 'ACTIVE' | 'RETIRED';
  agreementResourceUrl?: string;
  pricePerUnitMinorUnits: number;
  minimumUnits: number;
  totalUnits: number;
  memberFundedUnits: number;
  sponsorUnits: number;
  totalEconomicUnits: number;
  fundingTargetMinorUnits: number;
  ownershipPerUnitPercent: number | null;
  availableUnits: number;
  memberCount?: number;
  durationMonths: number | null;
  termType: TermType;
  durationValue: number | null;
  durationUnit: DurationUnit | null;
  capitalExitDescription: string;
  projectionDisclaimer: string;
  projectedReturnRatePercent: number;
  projectedDistributionPerUnitMinorUnits: number | null;
  projectedDistributionPerUnitMinimumMinorUnits: number | null;
  projectedDistributionPerUnitMaximumMinorUnits: number | null;
  equivalentProjectedPercentage: number | null;
  equivalentProjectedMinimumPercentage: number | null;
  equivalentProjectedMaximumPercentage: number | null;
  projectedProfitMinorUnits: number;
  projectedMonthlyProfitMinorUnits: number | null;
  returnSchedule: ReturnSchedule;
  rolloverAllowed: boolean;
  rolloverCompoundsReturns: boolean;
  rolloverNextPrincipalMinorUnits: number | null;
  rolloverNextProjectedProfitMinorUnits: number | null;
  location: string;
  memberAvailabilityDate: string | null;
  offerClosesAt: string | null;
  commencementDate: string | null;
  acquisitionStatus: 'OPEN' | 'CLOSED' | 'COMMENCED';
  interestModeEnabled: boolean;
  interestTargetAmount: number | null;
  interestOpensAt: string | null;
  interestClosesAt: string | null;
  showInterestProgress: boolean;
  collectOpeningCapital: boolean;
  collectRecurringAmount: boolean;
  recurringFrequency: 'monthly' | null;
  collectCapitalReadiness: boolean;
  interestAcknowledgementText: string;
  interestAcknowledgementVersion: string;
  imageUrl: string;
  imageWidth: number;
  imageHeight: number;
  imageAlt: string;
  status: OpportunityStatus;
  publishedAt: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
}>;

export type OpportunityChange = Readonly<{
  type: 'UPSERTED' | 'DELETED';
  id: string;
  slug: string;
  revision: number;
}>;

export function getOpportunities(): Promise<Opportunity[]> {
  return api<Opportunity[]>(`/v1/opportunities?fresh=${Date.now()}`, { cache: 'no-store' });
}

export function getOpportunity(slug: string): Promise<Opportunity> {
  return api<Opportunity>(
    `/v1/opportunities/${encodeURIComponent(slug)}?fresh=${Date.now()}`,
    { cache: 'no-store' },
  );
}

export type OpportunityInterest = Readonly<{ _id: string; openingCapital: number; recurringAmount: number | null; recurringFrequency: 'monthly' | null; capitalReadiness: 'available_now' | 'within_7_days' | 'not_sure'; status: string; acknowledgementVersion: string; createdAt: string; updatedAt: string }>;
export type InterestProgress = Readonly<{ totalCommitted: number; targetAmount: number; memberCount: number; totalMonthlyCommitment: number }>;
export type RecentInterestActivity = Readonly<{ id: string; name: string; joinedAt: string }>;
export const opportunityInterestService = {
  mine: (slug: string) => api<OpportunityInterest | null>(`/v1/opportunities/${encodeURIComponent(slug)}/interest/me`, { cache: 'no-store' }),
  progress: (slug: string) => api<InterestProgress>(`/v1/opportunities/${encodeURIComponent(slug)}/interest/progress`, { cache: 'no-store' }),
  recent: (slug: string) => api<RecentInterestActivity[]>(`/v1/opportunities/${encodeURIComponent(slug)}/interest/recent`, { cache: 'no-store' }),
  save: (slug: string, input: { openingCapital: number; recurringAmount?: number; capitalReadiness: OpportunityInterest['capitalReadiness']; acknowledgementVersion: string }) => api<OpportunityInterest>(`/v1/opportunities/${encodeURIComponent(slug)}/interest`, { method: 'POST', body: JSON.stringify(input) }),
  remove: (slug: string) => api<{ deleted: true }>(`/v1/opportunities/${encodeURIComponent(slug)}/interest`, { method: 'DELETE' }),
  listMine: () => api<Array<OpportunityInterest & { opportunityId: Pick<Opportunity, 'title' | 'slug' | 'imageUrl' | 'imageAlt'> }>>('/v1/member/opportunity-interests', { cache: 'no-store' }),
};

export function subscribeToOpportunityChanges(
  onChange: (event: OpportunityChange) => void,
): () => void {
  const source = new EventSource(new URL('/v1/opportunities/events', env.NEXT_PUBLIC_API_URL));
  source.addEventListener('opportunity', (event) => {
    try {
      onChange(JSON.parse(event.data) as OpportunityChange);
    } catch {
      // Ignore malformed events and keep the last verified API state.
    }
  });
  return () => source.close();
}

export function formatOpportunityMoney(minorUnits: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(minorUnits / 100);
}

export function formatReturnSchedule(schedule: ReturnSchedule): string {
  if (schedule === 'MONTHLY') return 'Monthly';
  if (schedule === 'YEARLY') return 'Yearly';
  return 'At maturity';
}

export function formatOwnershipModel(structure: OpportunityStructure): string {
  if (structure === 'CO_FUNDING') return 'Co-funding';
  return structure === 'FULL_OWNERSHIP' ? 'Full ownership' : 'Co-ownership';
}

export function isOpportunityOpenForAcquisition(opportunity: Opportunity): boolean {
  return opportunity.acquisitionStatus === 'OPEN';
}

export function formatOpportunityTerm(opportunity: Opportunity): string {
  if (opportunity.termType === 'LIFE_OF_ASSET') return 'Life of asset';

  const duration = opportunity.durationValue ?? opportunity.durationMonths;
  if (!duration) return 'Fixed term';
  const unit = (opportunity.durationUnit ?? 'MONTHS').toLowerCase();
  return `${duration} ${unit}`;
}

export function formatCapitalReturn(opportunity: Opportunity): string {
  if (opportunity.termType === 'LIFE_OF_ASSET')
    return opportunity.capitalExitDescription || 'Upon asset sale or another qualifying exit event';

  return `At the end of the ${formatOpportunityTerm(opportunity)} term`;
}

export function formatProjectedReturnRate(opportunity: Opportunity): string {
  const minimum = opportunity.equivalentProjectedMinimumPercentage;
  const maximum = opportunity.equivalentProjectedMaximumPercentage;
  if (minimum != null && maximum != null)
    return `${formatPercentage(minimum)}–${formatPercentage(maximum)}`;
  if (opportunity.equivalentProjectedPercentage != null)
    return formatPercentage(opportunity.equivalentProjectedPercentage);
  if (opportunity.projectedReturnRatePercent > 0)
    return formatPercentage(opportunity.projectedReturnRatePercent);
  return 'Variable';
}

export function formatProjectedDistribution(opportunity: Opportunity, quantity = 1): string {
  const minimum = opportunity.projectedDistributionPerUnitMinimumMinorUnits;
  const maximum = opportunity.projectedDistributionPerUnitMaximumMinorUnits;
  if (minimum != null && maximum != null)
    return `${formatOpportunityMoney(minimum * quantity)}–${formatOpportunityMoney(maximum * quantity)}`;
  if (minimum != null) return formatOpportunityMoney(minimum * quantity);
  if (maximum != null) return formatOpportunityMoney(maximum * quantity);
  if (opportunity.projectedDistributionPerUnitMinorUnits != null)
    return formatOpportunityMoney(opportunity.projectedDistributionPerUnitMinorUnits * quantity);
  const rate = opportunity.equivalentProjectedPercentage ?? opportunity.projectedReturnRatePercent;
  if (rate > 0)
    return formatOpportunityMoney(
      Math.round((opportunity.pricePerUnitMinorUnits * quantity * rate) / 100),
    );
  return '—';
}

export function isVariableDistribution(opportunity: Opportunity): boolean {
  return (
    opportunity.returnModel === 'PROFIT_SHARING_VARIABLE' ||
    opportunity.returnModel === 'REVENUE_SHARING_VARIABLE' ||
    opportunity.projectedDistributionPerUnitMinimumMinorUnits != null ||
    opportunity.projectedDistributionPerUnitMaximumMinorUnits != null
  );
}

function formatPercentage(value: number): string {
  return `${value
    .toFixed(1)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1')}%`;
}
