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

export type WalletFundingDetails = Readonly<{
  accountNumber: string;
  bankName: string;
  accountName: string;
}>;

export function getWalletFundingDetails(): Promise<WalletFundingDetails> {
  return api<WalletFundingDetails>('/v1/wallet/funding-details');
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

export type ActivityLogPage = Readonly<{
  items: ActivityLog[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}>;

export function getActivityLogPage(page: number, limit = 8): Promise<ActivityLogPage> {
  return api<ActivityLogPage>(`/v1/activity-logs/me/page?page=${page}&limit=${limit}`);
}

export type DepositRequestRecord = Readonly<{
  _id: string;
  amountMinorUnits: number;
  narration: string;
  receiptImageUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}>;

export function createDepositRequest(input: {
  amountMinorUnits: number;
  narration: string;
  receipt: File;
}): Promise<DepositRequestRecord> {
  const body = new FormData();
  body.append('amountMinorUnits', String(input.amountMinorUnits));
  body.append('narration', input.narration);
  body.append('receipt', input.receipt);
  return api<DepositRequestRecord>('/v1/wallet/deposits', {
    method: 'POST',
    body,
  });
}

export function getDepositRequests(): Promise<DepositRequestRecord[]> {
  return api<DepositRequestRecord[]>('/v1/wallet/deposits');
}

export type WithdrawalRequestRecord = Readonly<{
  _id: string;
  amountMinorUnits: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  createdAt: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  paymentReference?: string | null;
  reviewNote?: string | null;
}>;

export function createWithdrawalRequest(
  input: {
    amountMinorUnits: number;
    linkedBankAccountId: string;
  },
  idempotencyKey: string,
): Promise<WithdrawalRequestRecord> {
  return api<WithdrawalRequestRecord>('/v1/wallet/withdrawals', {
    method: 'POST',
    headers: { 'Idempotency-Key': idempotencyKey },
    body: JSON.stringify(input),
  });
}

export function getWithdrawalRequests(): Promise<WithdrawalRequestRecord[]> {
  return api<WithdrawalRequestRecord[]>('/v1/wallet/withdrawals', { cache: 'no-store' });
}
