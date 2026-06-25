/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME: string;
  readonly VITE_API_BASE_URL: string;
  readonly VITE_SOCKET_URL: string;
  readonly VITE_SOCKET_PATH: string;
  readonly VITE_CRYPTO_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
