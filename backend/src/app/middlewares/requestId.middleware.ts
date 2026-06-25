import type { Request, Response, NextFunction } from 'express';
import { nanoid } from 'nanoid';

/** Attaches a correlation id to every request for tracing across logs. */
export const requestId = (req: Request, res: Response, next: NextFunction): void => {
  const incoming = req.headers['x-request-id'];
  const id = typeof incoming === 'string' && incoming.length ? incoming : nanoid(12);
  req.requestId = id;
  res.setHeader('x-request-id', id);
  next();
};
