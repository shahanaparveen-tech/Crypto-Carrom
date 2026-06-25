import { SOCKET_EVENTS, SOCKET_ROOMS } from '../events';
import { logger } from '../../logger';
import type { TypedServer, TypedSocket } from '../types';
import { gameSession } from '../../../modules/game/service/gameSession';

const errMsg = (e: unknown): string => (e instanceof Error ? e.message : 'Game error');

/**
 * Authoritative game-session transport. Validates membership/turn server-side
 * and drives the rule engine; clients only render the broadcast results.
 */
export const registerGameHandlers = (io: TypedServer, socket: TypedSocket): void => {
  const { userId } = socket.data;

  // Join the room's game channel and receive the current snapshot (resume/spectate).
  socket.on(SOCKET_EVENTS.GAME_JOIN, async ({ roomId }, ack) => {
    try {
      await socket.join(SOCKET_ROOMS.game(roomId));
      const state = await gameSession.getState(roomId);
      if (state) socket.emit(SOCKET_EVENTS.GAME_STATE, { roomId, state });
      ack?.({ success: true });
    } catch (e) {
      ack?.({ success: false, error: errMsg(e) });
    }
  });

  // Ready toggle; when everyone is ready the match starts and state is broadcast.
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

  // A settled shot: server validates turn + applies rules, then broadcasts the result.
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
};
