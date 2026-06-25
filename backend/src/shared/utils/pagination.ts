export interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PaginationQuery {
  page?: number | string;
  limit?: number | string;
}

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export const getPagination = (query: PaginationQuery): PaginationParams => {
  const page = Math.max(DEFAULT_PAGE, Number(query.page) || DEFAULT_PAGE);
  const limit = Math.min(MAX_LIMIT, Math.max(1, Number(query.limit) || DEFAULT_LIMIT));
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPaginationMeta = (
  total: number,
  page: number,
  limit: number,
): { page: number; limit: number; total: number; totalPages: number } => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit) || 1,
});
