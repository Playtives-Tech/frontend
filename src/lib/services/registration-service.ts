import { api } from '@/lib/api';
import type { WalletSummary } from './wallet-service';

export type RegistrationInput = Readonly<{
  name: string;
  email: string;
  password: string;
}>;

export type RegistrationResponse = Readonly<{
  user: Readonly<{
    id: string;
    name: string;
    email: string;
    emailVerified: false;
  }>;
  message: string;
}>;

export function register(input: RegistrationInput): Promise<RegistrationResponse> {
  return api<RegistrationResponse>('/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function verifyEmail(token: string): Promise<{ message: string }> {
  return api<{ message: string }>('/v1/auth/email/verify', {
    method: 'POST',
    body: JSON.stringify({ token }),
  });
}

export function resendVerification(email: string): Promise<{ message: string }> {
  return api<{ message: string }>('/v1/auth/email/resend', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function login(
  email: string,
  password: string,
): Promise<{
  accessToken: string;
  user: { id: string; name: string; email: string; emailVerified: true; roles: string[] };
  wallet: WalletSummary;
}> {
  return api('/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}
