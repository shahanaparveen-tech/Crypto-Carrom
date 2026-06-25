import { http } from '@shared/services/http';

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  isRead: boolean;
  createdAt: string;
}

export const notificationsApi = {
  list() {
    return http.get<{ notifications: AppNotification[]; unread: number }>('/notifications');
  },
  markRead(id: string) {
    return http.post<{ read: boolean }>(`/notifications/${id}/read`);
  },
  markAll() {
    return http.post<{ read: boolean }>('/notifications/read-all');
  },
};
