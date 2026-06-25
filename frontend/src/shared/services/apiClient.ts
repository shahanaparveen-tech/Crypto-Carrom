import axios, { type AxiosInstance, type AxiosError, type InternalAxiosRequestConfig } from 'axios';

import { appEnv } from '@app/config/env';
import { tokenStorage } from './tokenStorage';

/**
 * Central axios instance. Attaches the access token, and transparently refreshes
 * it once on a 401 using the httpOnly refresh cookie. All feature services build
 * on top of this client.
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: appEnv.apiBaseUrl,
  withCredentials: true,
  timeout: 15_000,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = tokenStorage.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let isRefreshing = false;
let queue: Array<(token: string | null) => void> = [];

const flushQueue = (token: string | null): void => {
  queue.forEach((resolve) => resolve(token));
  queue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status !== 401 || original._retry) {
      return Promise.reject(error);
    }

    original._retry = true;

    if (isRefreshing) {
      const token = await new Promise<string | null>((resolve) => queue.push(resolve));
      if (token) original.headers.Authorization = `Bearer ${token}`;
      return apiClient(original);
    }

    isRefreshing = true;
    try {
      const { data } = await axios.post<{ data: { accessToken: string } }>(
        `${appEnv.apiBaseUrl}/auth/refresh`,
        {},
        { withCredentials: true },
      );
      const newToken = data.data.accessToken;
      tokenStorage.set(newToken);
      flushQueue(newToken);
      original.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(original);
    } catch (refreshError) {
      flushQueue(null);
      tokenStorage.clear();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
