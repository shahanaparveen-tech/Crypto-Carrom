import type { Notification, Prisma } from '@prisma/client';

import { prisma } from '../../../app/config/prisma';

export const notificationsRepository = {
  list(userId: string, skip: number, take: number): Promise<[Notification[], number]> {
    return Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where: { userId } }),
    ]);
  },

  unreadCount(userId: string): Promise<number> {
    return prisma.notification.count({ where: { userId, isRead: false } });
  },

  markRead(id: string, userId: string) {
    return prisma.notification.updateMany({ where: { id, userId }, data: { isRead: true } });
  },

  markAllRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },

  /** Internal: create a notification (used by other modules later). */
  create(data: {
    userId: string;
    type: Notification['type'];
    title: string;
    body?: string;
    payload?: Record<string, unknown>;
  }): Promise<Notification> {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        body: data.body ?? null,
        data: (data.payload ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  },
};
