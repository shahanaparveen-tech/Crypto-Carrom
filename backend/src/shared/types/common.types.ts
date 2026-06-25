export interface AuthenticatedUser {
  id: string;
  role: string;
  isGuest: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type Nullable<T> = T | null;
export type Maybe<T> = T | null | undefined;
export type ID = string;
