import { api } from '@/lib/api';
import type { LinkedAccount } from '@/stores/use-profile-store';

const pause = (milliseconds = 850): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export type NigerianBank = Readonly<{ id: number; name: string; code: string }>;

export function listNigerianBanks(): Promise<NigerianBank[]> {
  return api<NigerianBank[]>('/v1/bank-accounts/banks', { cache: 'no-store' });
}

export function listBankAccounts(): Promise<LinkedAccount[]> {
  return api<LinkedAccount[]>('/v1/bank-accounts', { cache: 'no-store' });
}

export type ResolvedBankAccount = Readonly<{
  bankCode: string;
  bankName: string;
  accountName: string;
  accountNumberLast4: string;
  nameMatchPercentage: number;
  nameMatches: boolean;
}>;

export function resolveBankAccount(
  bankCode: string,
  accountNumber: string,
): Promise<ResolvedBankAccount> {
  return api<ResolvedBankAccount>('/v1/bank-accounts/resolve', {
    method: 'POST',
    body: JSON.stringify({ bankCode, accountNumber }),
  });
}

export function linkBankAccount(bankCode: string, accountNumber: string): Promise<LinkedAccount> {
  return api<LinkedAccount>('/v1/bank-accounts', {
    method: 'POST',
    body: JSON.stringify({ bankCode, accountNumber }),
  });
}

export function removeBankAccount(id: string): Promise<{ message: string }> {
  return api<{ message: string }>(`/v1/bank-accounts/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function sendPhoneCode(
  phone: string,
): Promise<{ message: string; expiresInSeconds: number; resendAfterSeconds: number }> {
  return api('/v1/auth/phone/send-otp', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function verifyPhoneCode(
  phone: string,
  code: string,
): Promise<{ message: string; phone: string }> {
  return api('/v1/auth/phone/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ phone, code }),
  });
}

export function getPhoneVerificationStatus(): Promise<{
  verified: boolean;
  phone: string | null;
  verifiedAt: string | null;
}> {
  return api('/v1/auth/phone/status', { cache: 'no-store' });
}

export type VerificationStepStatus = Readonly<{
  verified: boolean;
  maskedValue: string | null;
  verifiedAt: string | null;
}>;

export type VerificationSteps = Readonly<{
  bvn: VerificationStepStatus;
  nin: VerificationStepStatus;
  phone: VerificationStepStatus;
  completed: number;
}>;

export function getVerificationSteps(): Promise<VerificationSteps> {
  return api<VerificationSteps>('/v1/kyc/steps', { cache: 'no-store' });
}

export function verifyIdentityNumber(
  type: 'bvn' | 'nin',
  input: { number: string; firstName: string; lastName: string; dateOfBirth: string },
): Promise<{ verified: boolean; message: string; maskedValue?: string; verifiedAt?: string }> {
  return api(`/v1/kyc/${type}/verify`, {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export type KycSubmission = Readonly<{
  id?: string;
  status:
    'NOT_STARTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'NEEDS_RESUBMISSION' | 'VERIFIED' | 'REJECTED';
  legalName?: string;
  documentType?: string;
  documentNumberMasked?: string;
  reviewNote?: string | null;
  submittedAt?: string;
}>;

export function getKycSubmission(): Promise<KycSubmission> {
  return api<KycSubmission>('/v1/kyc', { cache: 'no-store' });
}

export function submitKyc(input: {
  legalName: string;
  dateOfBirth: string;
  residentialAddress: string;
  state: string;
  country: string;
  documentType: string;
  documentNumber: string;
  documentFront: File;
  documentBack?: File | null;
}): Promise<KycSubmission> {
  const body = new FormData();
  Object.entries(input).forEach(([key, value]) => {
    if (value) body.set(key, value);
  });
  body.set('consent', 'true');
  return api<KycSubmission>('/v1/kyc', { method: 'POST', body });
}

export async function requestWithdrawal(amount: number): Promise<void> {
  await pause();
  if (amount <= 0) throw new Error('Enter a valid withdrawal amount.');
}

export async function changePassword(
  currentPassword: string,
  newPassword: string,
): Promise<{ message: string }> {
  return api<{ message: string }>('/v1/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export type AccountClosureEligibility = Readonly<{
  eligible: boolean;
  availableWalletBalanceMinorUnits: number;
  pendingWalletBalanceMinorUnits: number;
  activeOwnershipCount: number;
  pendingWithdrawalCount: number;
  pendingDepositCount: number;
  blockers: readonly string[];
}>;

export function getAccountClosureEligibility(): Promise<AccountClosureEligibility> {
  return api<AccountClosureEligibility>('/v1/auth/account-closure-eligibility', {
    cache: 'no-store',
  });
}

export function closeAccount(): Promise<{ message: string }> {
  return api<{ message: string }>('/v1/auth/account', { method: 'DELETE' });
}

export type NameChangeRequest = Readonly<{
  id: string;
  reason: string;
  proposedName?: string;
  identityDocumentType: string;
  identityDocumentNumber: string;
  identityDocumentFileName: string;
  status: 'PENDING' | 'LINK_SENT' | 'COMPLETED';
  createdAt: string;
  linkSentAt: string | null;
  completedAt: string | null;
}>;

export function requestNameChange(
  proposedName: string,
  reason: string,
  identityDocumentType: string,
  identityDocumentNumber: string,
  identityDocument?: File | null,
): Promise<NameChangeRequest> {
  const body = new FormData();
  body.set('proposedName', proposedName);
  body.set('reason', reason);
  body.set('identityDocumentType', identityDocumentType);
  body.set('identityDocumentNumber', identityDocumentNumber);
  if (identityDocument) body.set('identityDocument', identityDocument);
  return api<NameChangeRequest>('/v1/profile/name-change-requests', {
    method: 'POST',
    body,
  });
}

export function getLatestNameChangeRequest(): Promise<NameChangeRequest | null> {
  return api<NameChangeRequest | null>('/v1/profile/name-change-requests/latest', {
    cache: 'no-store',
  });
}

export function completeNameChange(token: string, name: string): Promise<{ message: string }> {
  return api<{ message: string }>('/v1/name-change/complete', {
    method: 'POST',
    body: JSON.stringify({ token, name }),
  });
}

export type NextOfKin = Readonly<{
  fullName: string;
  relationship: string;
  phone: string;
  email: string | null;
  address: string | null;
}>;
export function getNextOfKin(): Promise<NextOfKin | null> {
  return api<NextOfKin | null>('/v1/profile/next-of-kin', { cache: 'no-store' });
}
export function updateNextOfKin(input: NextOfKin): Promise<NextOfKin> {
  return api<NextOfKin>('/v1/profile/next-of-kin', {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}
