/** Formats a coin balance (may arrive as a BigInt-string from the API). */
export const formatCoins = (value: string | number): string => {
  const n = typeof value === 'string' ? Number(value) : value;
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat('en-US').format(n);
};

/** Short relative-ish date for transaction lists. */
export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

/** First-letter avatar fallback. */
export const initials = (name: string): string => name.trim().charAt(0).toUpperCase() || '?';
