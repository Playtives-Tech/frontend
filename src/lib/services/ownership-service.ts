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
}>;

export function acquireOpportunity(
  opportunity: Opportunity,
  units: number,
  idempotencyKey: string,
): Promise<Ownership> {
  return api<Ownership>(`/v1/opportunities/${opportunity._id}/acquire`, {
    method: 'POST',
    headers: {
      'Idempotency-Key': idempotencyKey,
      'If-Match': String(opportunity.revision),
    },
    body: JSON.stringify({ units }),
  });
}

export function getOwnerships(): Promise<Ownership[]> {
  return api<Ownership[]>('/v1/ownership', { cache: 'no-store' });
}

export function getOwnership(id: string): Promise<Ownership> {
  return api<Ownership>(`/v1/ownership/${encodeURIComponent(id)}`, { cache: 'no-store' });
}
