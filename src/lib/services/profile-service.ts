import type { LinkedAccount } from '@/stores/use-profile-store';

const pause = (milliseconds = 850): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function verifyBankAccount(bank: string, number: string): Promise<LinkedAccount> {
  await pause();
  if (!/^\d{10}$/.test(number) || number.endsWith('0000'))
    throw new Error('We could not verify this account. Check the details and try again.');
  return {
    id: `${bank.toLowerCase()}-${number}`,
    bank,
    number,
    name: number.endsWith('76') ? 'Gabriel Ola' : 'Playtives Member',
  };
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

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await pause();
  if (currentPassword.length < 6 || newPassword.length < 8)
    throw new Error('Use a current password and a new password with at least 8 characters.');
}
