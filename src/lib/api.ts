import { env } from './env';
import { expireSession, getAccessToken } from './session';
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAccessToken();
  const isFormData = init?.body instanceof FormData;
  const response = await fetch(new URL(path, env.NEXT_PUBLIC_API_URL), {
    ...init,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(!isFormData && init?.body ? { 'Content-Type': 'application/json' } : {}),
      ...init?.headers,
    },
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message =
      typeof body === 'object' && body !== null && 'message' in body
        ? Array.isArray(body.message)
          ? body.message.join('. ')
          : String(body.message)
        : 'Request failed. Please try again.';
    if (response.status === 401 && token) expireSession();
    throw new ApiError(response.status, message);
  }
  return response.json() as Promise<T>;
}
