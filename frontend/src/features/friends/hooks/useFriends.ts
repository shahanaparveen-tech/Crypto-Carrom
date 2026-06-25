import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { friendsApi } from '../services/friends.api';

const KEYS = {
  friends: ['friends', 'list'] as const,
  requests: ['friends', 'requests'] as const,
  suggestions: ['friends', 'suggestions'] as const,
  search: (q: string) => ['friends', 'search', q] as const,
};

export const useFriends = () =>
  useQuery({ queryKey: KEYS.friends, queryFn: () => friendsApi.list() });

export const useFriendRequests = () =>
  useQuery({ queryKey: KEYS.requests, queryFn: () => friendsApi.requests() });

export const useFriendSuggestions = () =>
  useQuery({ queryKey: KEYS.suggestions, queryFn: () => friendsApi.suggestions() });

export const useUserSearch = (q: string) =>
  useQuery({
    queryKey: KEYS.search(q),
    queryFn: () => friendsApi.search(q),
    enabled: q.trim().length >= 2,
  });

/** Invalidate every friends-related query after a mutation. */
const useInvalidateFriends = () => {
  const qc = useQueryClient();
  return (): void => {
    void qc.invalidateQueries({ queryKey: ['friends'] });
  };
};

export const useSendFriendRequest = () => {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (addresseeId: string) => friendsApi.sendRequest(addresseeId),
    onSuccess: invalidate,
  });
};

export const useAcceptRequest = () => {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.accept(requestId),
    onSuccess: invalidate,
  });
};

export const useDeclineRequest = () => {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (requestId: string) => friendsApi.declineRequest(requestId),
    onSuccess: invalidate,
  });
};

export const useRemoveFriend = () => {
  const invalidate = useInvalidateFriends();
  return useMutation({
    mutationFn: (userId: string) => friendsApi.removeFriend(userId),
    onSuccess: invalidate,
  });
};
