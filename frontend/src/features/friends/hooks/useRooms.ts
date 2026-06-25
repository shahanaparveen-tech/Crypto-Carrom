import { useMutation, useQuery } from '@tanstack/react-query';

import { roomsApi } from '../services/rooms.api';

export const useCreateRoom = () =>
  useMutation({
    mutationFn: (body: { mode?: string; maxPlayers?: number }) => roomsApi.create(body),
  });

export const useJoinRoom = () => useMutation({ mutationFn: (code: string) => roomsApi.join(code) });

export const useLeaveRoom = () =>
  useMutation({ mutationFn: (roomId: string) => roomsApi.leave(roomId) });

/** Polls a room so members update as players join/leave. */
export const useRoom = (code: string | null) =>
  useQuery({
    queryKey: ['room', code],
    queryFn: () => roomsApi.get(code as string),
    enabled: !!code,
    refetchInterval: 3000,
  });
