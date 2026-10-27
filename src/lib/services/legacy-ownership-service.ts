import { api } from '@/lib/api';

export type LegacyOwnership = Readonly<{
  _id: string;
  opportunity: {
    title: string;
    category: string;
    summary: string;
    about: string;
    agreement: string;
    imageUrl: string;
    imageAlt: string;
  };
  units: number;
  principalMinorUnits: number;
  status: 'ACTIVE' | 'COMPLETED' | 'EXITED';
  firstCycle: number;
  lastCycle: number;
  participationStartAt: string;
  endAt: string | null;
  preference: 'PAY_TO_ACCOUNT' | 'ROLL_OVER' | 'UNKNOWN';
  capitalReturnedMinorUnits: number;
  hasLiveOwnership: boolean;
  ownershipId: string | null;
  remainingCycles: number;
  periods: Array<{
    cycleNumber: number;
    label: string;
    dueAt: string;
    status: 'UNPAID' | 'PARTIAL' | 'PAID' | 'ROLLED_OVER';
    paidMinorUnits: number;
    rolledOverMinorUnits: number;
    expectedReturnMinorUnits: number | null;
  }>;
}>;

export function getLegacyOwnerships(): Promise<LegacyOwnership[]> {
  return api<LegacyOwnership[]>('/v1/member/legacy-ownerships', { cache: 'no-store' });
}
