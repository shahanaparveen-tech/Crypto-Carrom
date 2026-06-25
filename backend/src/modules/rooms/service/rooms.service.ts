import { Prisma, type GameMode } from '@prisma/client';

import { roomsRepository, type RoomWithMembers } from '../repository/rooms.repository';
import { BadRequestError, NotFoundError, ConflictError } from '../../../shared/errors';

const CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
const CODE_LEN = 6;
const MAX_CODE_ATTEMPTS = 6;

const randomCode = (): string => {
  let out = '';
  for (let i = 0; i < CODE_LEN; i++)
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  return out;
};

const toGameMode = (mode?: string): GameMode => (mode === 'freestyle' ? 'FREESTYLE' : 'CLASSIC');

export interface RoomMember {
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  level: number;
  seat: number;
  isHost: boolean;
}

export interface RoomDto {
  id: string;
  code: string;
  status: string;
  mode: GameMode;
  maxPlayers: number;
  hostId: string;
  members: RoomMember[];
}

const toDto = (room: RoomWithMembers): RoomDto => {
  const match = room.matches[0];
  const members: RoomMember[] = (match?.players ?? []).map((p) => ({
    userId: p.user.id,
    username: p.user.username,
    displayName: p.user.profile?.displayName ?? null,
    avatarUrl: p.user.profile?.avatarUrl ?? null,
    level: p.user.profile?.level ?? 1,
    seat: p.seat,
    isHost: p.user.id === room.hostId,
  }));
  return {
    id: room.id,
    code: room.code,
    status: room.status,
    mode: room.mode,
    maxPlayers: room.maxPlayers,
    hostId: room.hostId,
    members,
  };
};

export const roomsService = {
  /** Create a private room with a unique shareable code. */
  async create(userId: string, opts: { mode?: string; maxPlayers?: number }): Promise<RoomDto> {
    const mode = toGameMode(opts.mode);
    const maxPlayers = Math.min(4, Math.max(2, opts.maxPlayers ?? 2));

    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      try {
        const room = await roomsRepository.create({
          hostId: userId,
          code: randomCode(),
          mode,
          maxPlayers,
        });
        return toDto(room);
      } catch (err) {
        if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') continue;
        throw err;
      }
    }
    throw new ConflictError('Could not allocate a room code, please retry');
  },

  /** Join an existing room by code. */
  async join(userId: string, rawCode: string): Promise<RoomDto> {
    const code = rawCode.trim().toUpperCase();
    const room = await roomsRepository.findByCode(code);
    if (!room) throw new NotFoundError('Room not found — check the code');
    if (room.status === 'FINISHED' || room.status === 'CANCELLED') {
      throw new BadRequestError('This room is closed');
    }
    const match = room.matches[0];
    if (!match) throw new BadRequestError('Room is not joinable');

    const players = match.players;
    if (players.some((p) => p.userId === userId)) return toDto(room); // already in
    if (players.length >= room.maxPlayers) throw new ConflictError('Room is full');

    const takenSeats = new Set(players.map((p) => p.seat));
    let seat = 0;
    while (takenSeats.has(seat)) seat += 1;

    await roomsRepository.addPlayer(match.id, userId, seat);
    const updated = await roomsRepository.findByCode(code);
    return toDto(updated!);
  },

  async get(code: string): Promise<RoomDto> {
    const room = await roomsRepository.findByCode(code.trim().toUpperCase());
    if (!room) throw new NotFoundError('Room not found');
    return toDto(room);
  },

  /** Leave a room. Host leaving cancels the room for everyone. */
  async leave(userId: string, roomId: string): Promise<void> {
    const room = await roomsRepository.findById(roomId);
    if (!room) return;
    const match = room.matches[0];

    if (room.hostId === userId) {
      await roomsRepository.setStatus(room.id, 'CANCELLED');
      return;
    }
    if (match) await roomsRepository.removePlayer(match.id, userId);
  },
};
