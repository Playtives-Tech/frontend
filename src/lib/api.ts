import { env } from './env';
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
  const response = await fetch(new URL(path, env.NEXT_PUBLIC_API_URL), {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });
  if (!response.ok) throw new ApiError(response.status, await response.text());
  return response.json() as Promise<T>;
}
