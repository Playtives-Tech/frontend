import { api } from '@/lib/api';

export type WalletSummary = Readonly<{
  id: string;
  currency: 'NGN';
  status: 'active' | 'locked';
  deposit: Readonly<{
    availableBalanceMinorUnits: number;
    pendingBalanceMinorUnits: number;
  }>;
  earnings: Readonly<{
    availableBalanceMinorUnits: number;
    lifetimeEarningsMinorUnits: number;
  }>;
  totalAvailableBalanceMinorUnits: number;
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

export type DepositRequestRecord = Readonly<{
  _id: string;
  amountMinorUnits: number;
  transferReference: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}>;

export function createDepositRequest(input: {
  amountMinorUnits: number;
  transferReference: string;
}): Promise<DepositRequestRecord> {
  return api<DepositRequestRecord>('/v1/wallet/deposits', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function getDepositRequests(): Promise<DepositRequestRecord[]> {
  return api<DepositRequestRecord[]>('/v1/wallet/deposits');
}

export type WithdrawalRequestRecord = Readonly<{
  _id: string;
  amountMinorUnits: number;
  status: 'pending' | 'completed' | 'rejected';
  createdAt: string;
}>;

export function createWithdrawalRequest(input: {
  amountMinorUnits: number;
  bankName: string;
  accountNumber: string;
  accountName: string;
}): Promise<WithdrawalRequestRecord> {
  return api<WithdrawalRequestRecord>('/v1/wallet/withdrawals', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}
