/**
 * Access-token storage. The refresh token is kept in an httpOnly cookie set by
 * the backend, so only the short-lived access token is held client-side.
 */
const ACCESS_TOKEN_KEY = 'cc_access_token';

export const tokenStorage = {
  get(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },
  set(token: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
  },
  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
  },
  isAuthenticated(): boolean {
    return Boolean(localStorage.getItem(ACCESS_TOKEN_KEY));
  },
};
