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

export async function verifyNin(nin: string): Promise<void> {
  await pause();
  if (!/^\d{11}$/.test(nin) || /^0+$/.test(nin))
    throw new Error('We could not verify this NIN. Check the number and try again.');
}

export async function verifyBvn(bvn: string, name: string, dateOfBirth: string): Promise<void> {
  await pause();
  if (!/^\d{11}$/.test(bvn) || name.trim().length < 3 || !dateOfBirth || bvn.endsWith('0'))
    throw new Error('Details do not match BVN records. Check your name and date of birth.');
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
