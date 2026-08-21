import { api } from './api';
import { env } from './env';

export type OpportunityStatus = 'PUBLISHED';
export type ReturnSchedule = 'MONTHLY' | 'YEARLY' | 'AT_MATURITY';
export type OwnershipModel = 'CO_OWNERSHIP' | 'FULL_OWNERSHIP';

export type Opportunity = Readonly<{
  _id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  about: string;
  agreement: string;
  pricePerUnitMinorUnits: number;
  minimumUnits: number;
  totalUnits: number;
  availableUnits: number;
  durationMonths: number | null;
  projectedReturnRatePercent: number;
  projectedProfitMinorUnits: number;
  projectedMonthlyProfitMinorUnits: number | null;
  returnSchedule: ReturnSchedule;
  ownershipModel: OwnershipModel;
  rolloverAllowed: boolean;
  rolloverCompoundsReturns: boolean;
  rolloverNextPrincipalMinorUnits: number | null;
  rolloverNextProjectedProfitMinorUnits: number | null;
  location: string;
  operator: string;
  principalReleaseDate: string | null;
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
  return api<Opportunity[]>('/v1/opportunities', { cache: 'no-store' });
}

export function getOpportunity(slug: string): Promise<Opportunity> {
  return api<Opportunity>(`/v1/opportunities/${encodeURIComponent(slug)}`, { cache: 'no-store' });
}

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

export function formatOwnershipModel(model: OwnershipModel): string {
  return model === 'FULL_OWNERSHIP' ? 'Full ownership' : 'Co-ownership';
}
