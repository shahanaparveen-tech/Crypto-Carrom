import { notificationsRepository } from '../repository/notifications.repository';
import { getPagination, buildPaginationMeta } from '../../../shared/utils/pagination';

export const notificationsService = {
  async list(userId: string, query: { page?: string; limit?: string }) {
    const { page, limit, skip } = getPagination(query);
    const [items, total] = await notificationsRepository.list(userId, skip, limit);
    const unread = await notificationsRepository.unreadCount(userId);
    return { items, unread, meta: buildPaginationMeta(total, page, limit) };
  },

  async markRead(userId: string, id: string): Promise<void> {
    await notificationsRepository.markRead(id, userId);
  },

  async markAllRead(userId: string): Promise<void> {
    await notificationsRepository.markAllRead(userId);
  },
};
