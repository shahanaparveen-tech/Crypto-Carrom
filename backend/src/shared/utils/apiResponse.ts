import type { Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export interface ApiMeta {
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  meta?: ApiMeta;
}

export interface ApiFailure {
  success: false;
  message: string;
  code: string;
  details?: unknown;
}

/** Standard success envelope used by every controller. */
export const sendSuccess = <T>(
  res: Response,
  data: T,
  message = 'OK',
  statusCode: number = StatusCodes.OK,
  meta?: ApiMeta,
): Response<ApiSuccess<T>> => {
  return res.status(statusCode).json({ success: true, message, data, ...(meta ? { meta } : {}) });
};

/** Standard error envelope (used by the global error handler). */
export const sendError = (
  res: Response,
  message: string,
  code: string,
  statusCode: number = StatusCodes.INTERNAL_SERVER_ERROR,
  details?: unknown,
): Response<ApiFailure> => {
  return res
    .status(statusCode)
    .json({ success: false, message, code, ...(details ? { details } : {}) });
};
