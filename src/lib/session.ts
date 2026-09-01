const TOKEN_KEY = 'playtives_access_token';
const LAST_ACTIVITY_KEY = 'playtives_last_activity_at';

export function getAccessToken(): string | null {
  return typeof window === 'undefined' ? null : sessionStorage.getItem(TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
  markSessionActivity();
}

export function clearAccessToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LAST_ACTIVITY_KEY);
}

export function markSessionActivity(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(LAST_ACTIVITY_KEY, String(Date.now()));
}

export function getSessionLastActivity(): number | null {
  if (typeof window === 'undefined') return null;
  const timestamp = Number(sessionStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null;
}

export function expireSession(): void {
  if (typeof window === 'undefined') return;
  clearAccessToken();
  localStorage.removeItem('playtives-auth');
  const destination = '/sign-in';
  if (`${window.location.pathname}${window.location.search}` !== destination)
    window.location.replace(destination);
}

export function isAccessTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))) as {
      exp?: number;
    };
    return typeof payload.exp !== 'number' || payload.exp * 1000 <= Date.now();
  } catch {
    return true;
  }
}
