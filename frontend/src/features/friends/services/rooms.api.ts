import { http } from '@shared/services/http';

export interface RoomMember {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  seat: number;
  isHost: boolean;
}

export interface Room {
  id: string;
  code: string;
  status: string;
  mode: string;
  maxPlayers: number;
  hostId: string;
  members: RoomMember[];
}

export const roomsApi = {
  create(body: { mode?: string; maxPlayers?: number }) {
    return http.post<{ room: Room }>('/rooms', body);
  },
  join(code: string) {
    return http.post<{ room: Room }>('/rooms/join', { code });
  },
  get(code: string) {
    return http.get<{ room: Room }>(`/rooms/${code}`);
  },
  leave(roomId: string) {
    return http.post<{ left: boolean }>('/rooms/leave', { roomId });
  },
};
