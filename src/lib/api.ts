import { env } from './env';
import { expireSession, getAccessToken } from './session';
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly retryAfterSeconds: number | null = null,
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
    const retryAfterSeconds = readRetryAfter(response);
    throw new ApiError(
      response.status,
      response.status === 429 && retryAfterSeconds
        ? `${message} Try again in ${formatWaitTime(retryAfterSeconds)}.`
        : message,
      retryAfterSeconds,
    );
  }
  return response.json() as Promise<T>;
}

function readRetryAfter(response: Response): number | null {
  for (const name of ['Retry-After', 'Retry-After-account', 'Retry-After-ip']) {
    const value = Number(response.headers.get(name));
    if (Number.isFinite(value) && value > 0) return Math.ceil(value);
  }
  return null;
}

function formatWaitTime(seconds: number): string {
  if (seconds < 60) return `${seconds} second${seconds === 1 ? '' : 's'}`;
  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours === 1 ? '' : 's'}`;
}
