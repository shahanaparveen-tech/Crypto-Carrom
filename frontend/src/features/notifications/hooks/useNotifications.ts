import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { notificationsApi } from '../services/notifications.api';

const KEY = ['notifications', 'list'] as const;

export const useNotifications = () =>
  useQuery({ queryKey: KEY, queryFn: () => notificationsApi.list() });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => notificationsApi.markRead(id),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => notificationsApi.markAll(),
    onSuccess: () => void qc.invalidateQueries({ queryKey: KEY }),
  });
};
