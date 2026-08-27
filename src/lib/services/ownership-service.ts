import { api } from '@/lib/api';
import { formatOpportunityMoney, type Opportunity } from '@/lib/opportunities';

export type OwnershipStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type Ownership = Readonly<{
  _id: string;
  opportunityId: Opportunity;
  orderId: Readonly<{
    _id: string;
    units: number;
    unitPriceMinorUnits: number;
    amountMinorUnits: number;
    createdAt: string;
  }>;
  units: number;
  amountMinorUnits: number;
  projectedReturnRatePercent: number;
  projectedReturnMinorUnits: number | null;
  projectedDistributionMinimumMinorUnits: number | null;
  projectedDistributionMaximumMinorUnits: number | null;
  equivalentProjectedMinimumPercentage: number | null;
  equivalentProjectedMaximumPercentage: number | null;
  capitalExitDescription: string;
  ownershipPercentageAtPurchase: number | null;
  totalEconomicUnitsAtPurchase: number;
  opportunityStructure: 'CO_OWNERSHIP' | 'CO_FUNDING' | 'FULL_OWNERSHIP';
  returnModel: string;
  projectionType: string;
  termType: 'FIXED_TERM' | 'LIFE_OF_ASSET';
  status: OwnershipStatus;
  progressPercent: number;
  adminNote?: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  investmentCapitalMinorUnits: number;
  totalAccruedReturnMinorUnits: number;
  cyclesAccrued: number;
  returnSchedule: 'MONTHLY' | 'YEARLY' | 'AT_MATURITY';
  durationValueAtPurchase: number | null;
  durationUnitAtPurchase: 'DAYS' | 'MONTHS' | 'YEARS' | null;
  scheduledReturnCycles: number;
  nextAccrualAt: string | null;
  maturityAt: string | null;
  completedAt: string | null;
}>;

export type MemberMaturityPayout = Readonly<{
  _id: string;
  ownershipId: string;
  opportunityId: Readonly<{ _id: string; title: string; slug: string; imageUrl: string }>;
  principalMinorUnits: number;
  returnMinorUnits: number;
  totalPayoutMinorUnits: number;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'REJECTED';
  reviewNote: string;
  createdAt: string;
  reviewedAt: string | null;
}>;

export type MemberOwnershipDistribution = Readonly<{
  _id: string;
  cycleNumber: number;
  scheduledFor: string;
  principalBeforeMinorUnits: number;
  returnMinorUnits: number;
  principalAfterMinorUnits: number;
  rolledOver: boolean;
  status: 'PENDING_ADMIN' | 'CREDITED' | 'ROLLED_OVER' | 'PENDING_MATURITY';
}>;

export function acquireOpportunity(
  opportunity: Opportunity,
  units: number,
  agreementVersion: string,
  idempotencyKey: string,
): Promise<Ownership> {
  return api<Ownership>(`/v1/opportunities/${opportunity._id}/acquire`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
      'If-Match': String(opportunity.revision),
    },
    body: JSON.stringify({ units, agreementVersion, agreementAccepted: true }),
  });
}

export function getOwnerships(): Promise<Ownership[]> {
  return api<Ownership[]>('/v1/ownership', { cache: 'no-store' });
}

export function getOwnership(id: string): Promise<Ownership> {
  return api<Ownership>(`/v1/ownership/${encodeURIComponent(id)}`, { cache: 'no-store' });
}

export function getMaturityPayouts(): Promise<MemberMaturityPayout[]> {
  return api<MemberMaturityPayout[]>('/v1/ownership/payouts', { cache: 'no-store' });
}

export function getOwnershipDistributions(id: string): Promise<MemberOwnershipDistribution[]> {
  return api<MemberOwnershipDistribution[]>(
    `/v1/ownership/${encodeURIComponent(id)}/distributions`,
    {
      cache: 'no-store',
    },
  );
}

export function getOwnershipProjection(ownership: Ownership): Readonly<{
  amount: string;
  rate: string;
  isRange: boolean;
}> {
  const opportunity = ownership.opportunityId;
  const minimum =
    ownership.projectedDistributionMinimumMinorUnits ??
    (opportunity.projectedDistributionPerUnitMinimumMinorUnits == null
      ? null
      : opportunity.projectedDistributionPerUnitMinimumMinorUnits * ownership.units);
  const maximum =
    ownership.projectedDistributionMaximumMinorUnits ??
    (opportunity.projectedDistributionPerUnitMaximumMinorUnits == null
      ? null
      : opportunity.projectedDistributionPerUnitMaximumMinorUnits * ownership.units);
  const minimumRate =
    ownership.equivalentProjectedMinimumPercentage ??
    opportunity.equivalentProjectedMinimumPercentage;
  const maximumRate =
    ownership.equivalentProjectedMaximumPercentage ??
    opportunity.equivalentProjectedMaximumPercentage;

  if (minimum != null && maximum != null) {
    return {
      amount: `${formatOpportunityMoney(minimum)}–${formatOpportunityMoney(maximum)}`,
      rate:
        minimumRate != null && maximumRate != null
          ? `${formatPercentage(minimumRate)}–${formatPercentage(maximumRate)} projected`
          : 'Variable projected distribution',
      isRange: true,
    };
  }

  const amount =
    ownership.projectedReturnMinorUnits ??
    Math.round((ownership.amountMinorUnits * ownership.projectedReturnRatePercent) / 100);
  const rate =
    ownership.amountMinorUnits > 0
      ? (amount / ownership.amountMinorUnits) * 100
      : ownership.projectedReturnRatePercent;
  return {
    amount: formatOpportunityMoney(amount),
    rate: `${formatPercentage(rate)} projected`,
    isRange: false,
  };
}

export function getOwnershipCapitalReturn(ownership: Ownership): string {
  if (ownership.termType === 'LIFE_OF_ASSET')
    return (
      ownership.capitalExitDescription ||
      ownership.opportunityId.capitalExitDescription ||
      'Upon asset sale or another qualifying exit event'
    );
  return ownership.maturityAt
    ? new Date(ownership.maturityAt).toLocaleDateString('en-NG', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
    : 'At the end of the fixed term';
}

function formatPercentage(value: number): string {
  return `${value
    .toFixed(4)
    .replace(/\.0+$/, '')
    .replace(/(\.\d*?)0+$/, '$1')}%`;
}
