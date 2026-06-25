import type { AxiosError } from 'axios';

import type { ApiSuccess, ApiFailure, ApiMeta } from '@shared/types/api.types';
import { apiClient } from './apiClient';

/** Unwraps the standard `{ success, data }` envelope into just `data`. */
const unwrap = <T>(payload: ApiSuccess<T>): T => payload.data;

export const http = {
  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res = await apiClient.get<ApiSuccess<T>>(url, { params });
    return unwrap(res.data);
  },
  /** GET that also returns pagination meta from the envelope. */
  async getWithMeta<T>(
    url: string,
    params?: Record<string, unknown>,
  ): Promise<{ data: T; meta?: ApiMeta }> {
    const res = await apiClient.get<ApiSuccess<T>>(url, { params });
    return { data: res.data.data, meta: res.data.meta };
  },
  async post<T>(url: string, body?: unknown): Promise<T> {
    const res = await apiClient.post<ApiSuccess<T>>(url, body);
    return unwrap(res.data);
  },
  async patch<T>(url: string, body?: unknown): Promise<T> {
    const res = await apiClient.patch<ApiSuccess<T>>(url, body);
    return unwrap(res.data);
  },
  async delete<T>(url: string): Promise<T> {
    const res = await apiClient.delete<ApiSuccess<T>>(url);
    return unwrap(res.data);
  },
};

/** Extracts a human-readable message from an axios error. */
export const getApiErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  const axiosErr = error as AxiosError<ApiFailure>;
  return axiosErr.response?.data?.message ?? fallback;
};
