import type { Request, Response, NextFunction } from 'express';

/**
 * Base contracts that enforce the layered architecture across every module.
 * Concrete controllers/services/repositories implement these in later phases.
 */

/** HTTP layer — translates requests to service calls and shapes responses. */
export interface IController {
  // Each controller exposes route handlers; this marker keeps the contract open.
  readonly basePath?: string;
}

export type AsyncRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => Promise<void> | void;

/** Business-logic layer. Generic CRUD-ish contract; modules extend as needed. */
export interface IService<TEntity, TCreateDto, TUpdateDto, TId = string> {
  create?(dto: TCreateDto): Promise<TEntity>;
  findById?(id: TId): Promise<TEntity | null>;
  findAll?(query?: unknown): Promise<TEntity[]>;
  update?(id: TId, dto: TUpdateDto): Promise<TEntity>;
  delete?(id: TId): Promise<void>;
}

/** Data-access layer — the only layer permitted to touch Prisma. */
export interface IRepository<TEntity, TId = string> {
  create(data: Partial<TEntity>): Promise<TEntity>;
  findById(id: TId): Promise<TEntity | null>;
  findMany(filter?: Partial<TEntity>): Promise<TEntity[]>;
  update(id: TId, data: Partial<TEntity>): Promise<TEntity>;
  delete(id: TId): Promise<void>;
}
