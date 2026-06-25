import { usersRepository } from '../repository/users.repository';
import { NotFoundError } from '../../../shared/errors';
import { getPagination, buildPaginationMeta } from '../../../shared/utils/pagination';

export const usersService = {
  async getById(id: string) {
    const user = await usersRepository.findPublicById(id);
    if (!user) throw new NotFoundError('User not found');
    return user;
  },

  async search(term: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await usersRepository.search(term.trim(), skip, limit);
    return { items, meta: buildPaginationMeta(total, page, limit) };
  },
};
