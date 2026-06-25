import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { profileApi, type UpdateProfileBody } from '../services/profile.api';

const MY_PROFILE_KEY = ['profile', 'me'] as const;

export const useMyProfile = () =>
  useQuery({
    queryKey: MY_PROFILE_KEY,
    queryFn: () => profileApi.getMine(),
  });

export const useUpdateProfile = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: UpdateProfileBody) => profileApi.update(body),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: MY_PROFILE_KEY });
    },
  });
};
