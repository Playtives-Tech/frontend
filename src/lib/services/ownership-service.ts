import { api } from '@/lib/api';
import type { Opportunity } from '@/lib/opportunities';

export type OwnershipStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

export type Ownership = Readonly<{
  _id: string;
  opportunityId: Opportunity;
  orderId: Readonly<{
    _id: string;
    units: number;
    unitPriceMinorUnits: number;
    amountMinorUnits: number;
    narration: string;
    createdAt: string;
  }>;
  units: number;
  amountMinorUnits: number;
  projectedReturnRatePercent: number;
  status: OwnershipStatus;
  progressPercent: number;
  adminNote?: string;
  revision: number;
  createdAt: string;
  updatedAt: string;
  investmentCapitalMinorUnits: number;
  totalAccruedReturnMinorUnits: number;
  cyclesAccrued: number;
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

export function acquireOpportunity(
  opportunity: Opportunity,
  units: number,
  narration: string,
  idempotencyKey: string,
): Promise<Ownership> {
  return api<Ownership>(`/v1/opportunities/${opportunity._id}/acquire`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
      'If-Match': String(opportunity.revision),
    },
    body: JSON.stringify({ units, narration }),
  });
}

export function createOwnershipPaymentNarration(slug: string, units: number): string {
  const offer = slug
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `PLAYTIVES-${offer}-${units}U`;
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
