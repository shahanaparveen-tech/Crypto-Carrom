import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import { logger } from '../../logger';
import type { TypedServer, TypedSocket } from '../types';
import { gameSession } from '../../../modules/game/service/gameSession';

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : 'Game error');

/** Reconnection grace window before a disconnected player forfeits. */
const GRACE_MS = 45_000;

/** socketId → rooms it joined (for disconnect cleanup). */
const joinedRooms = new Map<string, Set<string>>();
/** `${roomId}:${userId}` → pending forfeit timer. */
const graceTimers = new Map<string, ReturnType<typeof setTimeout>>();

/**
 * Authoritative game-session transport. Validates membership/turn server-side
 * and drives the rule engine; clients only render the broadcast results.
 * Handles reconnection (pause → resume / grace-timer forfeit) and spectators
 * (anyone may join the channel; only seated players may ready/shoot).
 */
export const registerGameHandlers = (io: TypedServer, socket: TypedSocket): void => {
  const { userId } = socket.data;

  socket.on(SOCKET_EVENTS.GAME_JOIN, async ({ roomId }, ack) => {
    try {
      await socket.join(SOCKET_ROOMS.game(roomId));
      const set = joinedRooms.get(socket.id) ?? new Set<string>();
      set.add(roomId);
      joinedRooms.set(socket.id, set);

      void gameSession.setConnected(roomId, userId, true);

      // Cancel a pending forfeit + tell the room the player is back.
      const key = `${roomId}:${userId}`;
      const timer = graceTimers.get(key);
      if (timer) {
        clearTimeout(timer);
        graceTimers.delete(key);
        io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_RESUMED, { roomId, userId });
      }

      const state = await gameSession.getState(roomId);
      if (state) socket.emit(SOCKET_EVENTS.GAME_STATE, { roomId, state });
      ack?.({ success: true });
    } catch (e) {
      ack?.({ success: false, error: errMsg(e) });
    }
  });

  socket.on(SOCKET_EVENTS.GAME_READY, async ({ roomId, ready }, ack) => {
    try {
      const { allReady } = await gameSession.setReady(roomId, userId, ready);
      io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.ROOM_UPDATED, {
        roomId,
        state: { ready: { userId, ready } },
      });
      if (allReady) {
        const state = await gameSession.startMatch(roomId);
        io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_START, { roomId, state });
      }
      ack?.({ success: true });
    } catch (e) {
      ack?.({ success: false, error: errMsg(e) });
    }
  });

  socket.on(SOCKET_EVENTS.GAME_SHOT, async ({ roomId, outcome, inputs }, ack) => {
    try {
      const { state, events } = await gameSession.applyPlayerShot(roomId, userId, outcome);
      io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_SHOT, {
        roomId,
        shooter: userId,
        inputs,
        events,
        state,
      });
      ack?.({ success: true });
    } catch (e) {
      logger.debug('game:shot rejected', { userId, roomId, error: errMsg(e) });
      ack?.({ success: false, error: errMsg(e) });
    }
  });

  socket.on(SOCKET_EVENTS.DISCONNECT, () => {
    const rooms = joinedRooms.get(socket.id);
    joinedRooms.delete(socket.id);
    if (!rooms) return;

    for (const roomId of rooms) {
      void (async () => {
        if (!(await gameSession.isPlayer(roomId, userId))) return; // spectators just leave
        // Broadcast immediately, then persist (don't make peers wait on the DB).
        io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_PAUSED, {
          roomId,
          userId,
          graceMs: GRACE_MS,
        });
        void gameSession.setConnected(roomId, userId, false);

        const key = `${roomId}:${userId}`;
        const timer = setTimeout(async () => {
          graceTimers.delete(key);
          const finished = await gameSession.forfeit(roomId, userId);
          if (finished)
            io.to(SOCKET_ROOMS.game(roomId)).emit(SOCKET_EVENTS.GAME_STATE, {
              roomId,
              state: finished,
            });
        }, GRACE_MS);
        graceTimers.set(key, timer);
      })();
    }
  });
};
