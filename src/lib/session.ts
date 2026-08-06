const TOKEN_KEY = 'playtives_access_token';

export function getAccessToken(): string | null {
  return typeof window === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}
