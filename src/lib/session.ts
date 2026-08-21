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
