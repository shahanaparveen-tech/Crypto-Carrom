/**
 * Typed, validated access to Vite environment variables. Imported anywhere the
 * app needs configuration instead of touching `import.meta.env` directly.
 */
export const appEnv = {
  appName: import.meta.env.VITE_APP_NAME ?? 'Crypto Carrom',
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:4000/api/v1',
  socketUrl: import.meta.env.VITE_SOCKET_URL ?? 'http://localhost:4000',
  socketPath: import.meta.env.VITE_SOCKET_PATH ?? '/socket.io',
  cryptoEnabled: import.meta.env.VITE_CRYPTO_ENABLED === 'true',
  isDev: import.meta.env.DEV,
  isProd: import.meta.env.PROD,
} as const;

export type AppEnv = typeof appEnv;
