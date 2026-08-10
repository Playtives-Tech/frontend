import { api } from './api';

type OpportunityRecord = {
  _id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  about?: string;
  agreement?: string;
  pricePerUnitMinorUnits: number;
  minimumUnits: number;
  totalUnits: number;
  availableUnits: number;
  durationMonths: number | null;
  projectedReturnRatePercent: number;
  projectedProfitMinorUnits: number;
  projectedMonthlyProfitMinorUnits: number | null;
  returnSchedule: 'MONTHLY' | 'YEARLY' | 'AT_MATURITY';
  ownershipModel: 'CO_OWNERSHIP' | 'FULL_OWNERSHIP';
  rolloverAllowed: boolean;
  rolloverCompoundsReturns: boolean;
  rolloverNextPrincipalMinorUnits: number | null;
  rolloverNextProjectedProfitMinorUnits: number | null;
  location?: string;
  operator?: string;
  imageUrl?: string;
  imageAlt?: string;
};

export type Opportunity = Readonly<{
  id: string;
  slug: string;
  title: string;
  category: string;
  description: string;
  returnRate: string;
  minimum: string;
  duration: string;
  location: string;
  availability: string;
  positionPrice: number;
  positionsAvailable: number;
  positionsTotal: number;
  maxPositionsPerMember: number;
  ownershipModel: 'Co-ownership' | 'Full ownership';
  returnSchedule: 'Fixed monthly' | 'Yearly' | 'At maturity';
  rollover: boolean;
  rolloverCompoundsReturns: boolean;
  operator: string;
  about: string;
  agreement: string;
  image: string;
  alt: string;
  projectedProfit: number;
  projectedMonthlyProfit: number | null;
  rolloverNextPrincipal: number | null;
  rolloverNextProjectedProfit: number | null;
}>;

const naira = (minor: number) =>
  new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(minor / 100);
function mapOpportunity(item: OpportunityRecord): Opportunity {
  const positionPrice = item.pricePerUnitMinorUnits / 100;
  const schedule =
    item.returnSchedule === 'MONTHLY'
      ? 'Fixed monthly'
      : item.returnSchedule === 'YEARLY'
        ? 'Yearly'
        : 'At maturity';
  return {
    id: item._id,
    slug: item.slug,
    title: item.title,
    category: item.category,
    description: item.summary,
    returnRate: `${item.projectedReturnRatePercent}%`,
    minimum: naira(item.pricePerUnitMinorUnits * item.minimumUnits),
    duration: item.durationMonths ? `${item.durationMonths} months` : 'Not specified',
    location: item.location || 'Not specified',
    availability: `${item.availableUnits} positions available`,
    positionPrice,
    positionsAvailable: item.availableUnits,
    positionsTotal: item.totalUnits,
    maxPositionsPerMember: item.totalUnits,
    ownershipModel: item.ownershipModel === 'FULL_OWNERSHIP' ? 'Full ownership' : 'Co-ownership',
    returnSchedule: schedule,
    rollover: item.rolloverAllowed,
    rolloverCompoundsReturns: item.rolloverCompoundsReturns,
    operator: item.operator || 'Not specified',
    about: item.about || '',
    agreement: item.agreement || '',
    image: item.imageUrl || '',
    alt: item.imageAlt || item.title,
    projectedProfit: item.projectedProfitMinorUnits / 100,
    projectedMonthlyProfit:
      item.projectedMonthlyProfitMinorUnits == null
        ? null
        : item.projectedMonthlyProfitMinorUnits / 100,
    rolloverNextPrincipal:
      item.rolloverNextPrincipalMinorUnits == null
        ? null
        : item.rolloverNextPrincipalMinorUnits / 100,
    rolloverNextProjectedProfit:
      item.rolloverNextProjectedProfitMinorUnits == null
        ? null
        : item.rolloverNextProjectedProfitMinorUnits / 100,
  };
}

export async function getOpportunities(): Promise<Opportunity[]> {
  return (await api<OpportunityRecord[]>('/v1/opportunities')).map(mapOpportunity);
}
export async function getOpportunity(slug: string): Promise<Opportunity> {
  return mapOpportunity(await api<OpportunityRecord>(`/v1/opportunities/${slug}`));
}
