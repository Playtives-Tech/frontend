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

export async function sendPhoneCode(phone: string): Promise<void> {
  await pause(600);
  if (!/^\+?234\d{10}$/.test(phone.replace(/\s/g, '')))
    throw new Error('Enter a valid Nigerian phone number.');
}

export async function verifyPhoneCode(code: string): Promise<void> {
  await pause(700);
  if (code !== '123456')
    throw new Error('That code is incorrect or has expired. Use 123456 for this demo.');
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
