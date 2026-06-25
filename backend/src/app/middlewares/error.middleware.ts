import type { ErrorRequestHandler, RequestHandler } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Prisma } from '@prisma/client';
import { ZodError } from 'zod';

import { AppError } from '../../shared/errors';
import { sendError } from '../../shared/utils/apiResponse';
import { isProduction } from '../config/env';
import { logger } from '../logger';

/** 404 handler — reached when no route matched. */
export const notFoundHandler: RequestHandler = (req, res) => {
  sendError(
    res,
    `Route not found: ${req.method} ${req.originalUrl}`,
    'NOT_FOUND',
    StatusCodes.NOT_FOUND,
  );
};

/** Global error handler. Must be the last middleware registered. */
export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  // Zod validation errors
  if (err instanceof ZodError) {
    sendError(
      res,
      'Validation failed',
      'VALIDATION_ERROR',
      StatusCodes.UNPROCESSABLE_ENTITY,
      err.flatten(),
    );
    return;
  }

  // Known Prisma errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      sendError(
        res,
        'A record with these details already exists',
        'CONFLICT',
        StatusCodes.CONFLICT,
        err.meta,
      );
      return;
    }
    if (err.code === 'P2025') {
      sendError(res, 'Record not found', 'NOT_FOUND', StatusCodes.NOT_FOUND);
      return;
    }
  }

  // Operational AppErrors
  if (err instanceof AppError) {
    if (!err.isOperational) logger.error(err.message, { stack: err.stack });
    sendError(res, err.message, err.code, err.statusCode, err.details);
    return;
  }

  // Unknown / programmer errors
  const error = err as Error;
  logger.error('Unhandled error', { message: error.message, stack: error.stack });
  sendError(
    res,
    isProduction ? 'Internal server error' : error.message,
    'INTERNAL_ERROR',
    StatusCodes.INTERNAL_SERVER_ERROR,
    isProduction ? undefined : error.stack,
  );
};
