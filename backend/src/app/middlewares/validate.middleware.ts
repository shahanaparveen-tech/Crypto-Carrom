import type { Request, Response, NextFunction } from 'express';
import type { ZodTypeAny } from 'zod';

export interface RequestSchemas {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
}

/**
 * Validates and coerces request parts against Zod schemas. Parsed values
 * replace the originals so downstream handlers receive typed, sanitized data.
 */
export const validate =
  (schemas: RequestSchemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      if (schemas.params) Object.assign(req.params, schemas.params.parse(req.params));
      next();
    } catch (error) {
      next(error);
    }
  };
