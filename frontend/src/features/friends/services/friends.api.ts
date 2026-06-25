import { http } from '@shared/services/http';

export interface FriendUser {
  id: string;
  username: string;
  profile: {
    displayName: string | null;
    avatarUrl: string | null;
    country: string | null;
    level: number;
    rating: number;
  } | null;
}

export interface Friendship {
  friendshipId: string;
  since: string;
  user: FriendUser;
}

export interface FriendRequest {
  requestId: string;
  createdAt: string;
  user: FriendUser;
}

export const friendsApi = {
  list() {
    return http.get<{ friends: Friendship[] }>('/friends');
  },
  requests() {
    return http.get<{ incoming: FriendRequest[]; outgoing: FriendRequest[] }>('/friends/requests');
  },
  suggestions() {
    return http.get<{ suggestions: FriendUser[] }>('/friends/suggestions');
  },
  search(q: string) {
    return http.get<{ users: FriendUser[] }>('/users/search', { q });
  },
  sendRequest(addresseeId: string) {
    return http.post<{ request: unknown }>('/friends/requests', { addresseeId });
  },
  accept(requestId: string) {
    return http.post<{ friend: unknown }>(`/friends/requests/${requestId}/accept`);
  },
  declineRequest(requestId: string) {
    return http.delete<{ removed: boolean }>(`/friends/requests/${requestId}`);
  },
  removeFriend(userId: string) {
    return http.delete<{ removed: boolean }>(`/friends/${userId}`);
  },
};
