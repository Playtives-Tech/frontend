import { api } from '@/lib/api';

export type WalletSummary = Readonly<{
  id: string;
  currency: 'NGN';
  status: 'active' | 'locked';
  deposit: Readonly<{ availableKobo: number; pendingKobo: number }>;
  earnings: Readonly<{ availableKobo: number; lifetimeEarnedKobo: number }>;
  totalAvailableKobo: number;
}>;

export function getWallet(): Promise<WalletSummary> {
  return api<WalletSummary>('/v1/wallet');
}

export type ActivityLog = Readonly<{
  _id: string;
  action: string;
  subjectType: string;
  subjectId?: string;
  metadata?: Readonly<Record<string, string | number | boolean | null>>;
  createdAt: string;
}>;

export function getActivityLogs(): Promise<ActivityLog[]> {
  return api<ActivityLog[]>('/v1/activity-logs/me');
}
