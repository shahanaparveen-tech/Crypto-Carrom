import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { settingsApi, type UpdateSettingsBody } from '../services/settings.api';

const SETTINGS_KEY = ['settings'] as const;

export const useSettings = () =>
  useQuery({ queryKey: SETTINGS_KEY, queryFn: () => settingsApi.get() });

export const useUpdateSettings = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateSettingsBody) => settingsApi.update(body),
    onSuccess: (data) => {
      qc.setQueryData(SETTINGS_KEY, data);
    },
  });
};
