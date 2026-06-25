import type {
  ApplyShotResult,
  Coin,
  GameEvent,
  GameState,
  PlayerState,
  QueenReturnReason,
  ShotOutcome,
} from './types';
import { RECOVERY_SLOTS, BOARD } from './layout';
import { remainingByColor, opponentOf } from './state';

const SLOT_EPSILON = 10;

/** First recovery slot not currently occupied by an on-board coin. */
const firstFreeSlot = (state: GameState): { x: number; y: number } => {
  for (const slot of RECOVERY_SLOTS) {
    const occupied = state.coins.some(
      (c) => c.state === 'ON_BOARD' && Math.hypot(c.x - slot.x, c.y - slot.y) < SLOT_EPSILON,
    );
    if (!occupied) return slot;
  }
  return RECOVERY_SLOTS[0]!; // fallback: center (shouldn't happen with 19 slots)
};

/** Returns one of the player's pocketed own coins to the board. */
const returnOneOwnCoin = (state: GameState, player: PlayerState, events: GameEvent[]): boolean => {
  // Most-recently pocketed own coin still off the board.
  for (let i = player.pocketedCoinIds.length - 1; i >= 0; i--) {
    const id = player.pocketedCoinIds[i]!;
    const coin = state.coins.find((c) => c.id === id && c.state === 'POCKETED');
    if (!coin) continue;
    const slot = firstFreeSlot(state);
    coin.state = 'ON_BOARD';
    coin.x = slot.x;
    coin.y = slot.y;
    player.pocketedCoinIds.splice(i, 1);
    player.pocketedOwn = Math.max(0, player.pocketedOwn - 1);
    player.score = Math.max(0, player.score - 1);
    events.push({ type: 'coin:returned', coinId: coin.id, slot });
    return true;
  }
  return false;
};

/** Returns the offending player's queen to the centre (or nearest free slot). */
const returnQueen = (state: GameState, events: GameEvent[], reason: QueenReturnReason): void => {
  const queen = state.coins.find((c) => c.color === 'QUEEN');
  if (!queen) return;
  const center = { x: BOARD.CENTER, y: BOARD.CENTER };
  const occupied = state.coins.some(
    (c) =>
      c.id !== queen.id &&
      c.state === 'ON_BOARD' &&
      Math.hypot(c.x - center.x, c.y - center.y) < SLOT_EPSILON,
  );
  const slot = occupied ? firstFreeSlot(state) : center;
  queen.state = 'ON_BOARD';
  queen.x = slot.x;
  queen.y = slot.y;
  state.queen.status = 'ON_BOARD';
  state.queen.owner = null;
  state.queen.claimedBy = null;
  state.queen.onBoard = true;
  events.push({ type: 'queen-returned', reason, position: slot });
  events.push({ type: 'queen-owner-updated', status: 'ON_BOARD', owner: null, claimedBy: null });
};

const findWinner = (state: GameState): string | null => {
  const rem = remainingByColor(state);
  for (const id of state.order) {
    const p = state.players[id]!;
    const colorLeft = p.coinColor === 'WHITE' ? rem.WHITE : rem.BLACK;
    // Queen gate: the winner must have SECURED the queen (strict spec).
    const queenOk = state.queen.status === 'SECURED' && state.queen.owner === id;
    if (colorLeft === 0 && p.pendingPenalty === 0 && queenOk) return id;
  }
  return null;
};

/**
 * Applies a settled shot to the authoritative state and returns the new state
 * plus the events to broadcast. Pure: never mutates the input.
 */
export const applyShot = (
  prev: GameState,
  shooterId: string,
  outcome: ShotOutcome,
): ApplyShotResult => {
  const events: GameEvent[] = [];

  // Defensive guards — invalid shots are no-ops.
  if (prev.status !== 'ACTIVE' || prev.turn.currentPlayer !== shooterId) {
    return { state: prev, events };
  }

  const state: GameState = structuredClone(prev);
  const shooter = state.players[shooterId]!;
  const oppId = opponentOf(state, shooterId);
  const opp = state.players[oppId]!;

  // 1. Classify pockets (only coins still on the board).
  const pocketed: Coin[] = state.coins.filter(
    (c) => outcome.pocketedCoinIds.includes(c.id) && c.state === 'ON_BOARD',
  );
  const ownPockets = pocketed.filter((c) => c.owner === shooterId);
  const oppPockets = pocketed.filter((c) => c.owner === oppId);
  const queenPockets = pocketed.filter((c) => c.color === 'QUEEN');

  // 2. Mark pocketed.
  for (const c of pocketed) c.state = 'POCKETED';

  // 3. Score with ownership (opponent coins credit their owner, never the shooter).
  for (const c of ownPockets) {
    shooter.pocketedOwn += 1;
    shooter.pocketedCoinIds.push(c.id);
    shooter.score += 1;
  }
  for (const c of oppPockets) {
    opp.pocketedOwn += 1;
    opp.pocketedCoinIds.push(c.id);
    opp.score += 1;
  }
  // Emit pocket events grouped by attribution.
  if (ownPockets.length)
    events.push({
      type: 'coin:pocketed',
      coinIds: ownPockets.map((c) => c.id),
      owner: shooterId,
      scoringPlayer: shooterId,
    });
  if (oppPockets.length)
    events.push({
      type: 'coin:pocketed',
      coinIds: oppPockets.map((c) => c.id),
      owner: oppId,
      scoringPlayer: oppId,
    });
  if (queenPockets.length)
    events.push({
      type: 'coin:pocketed',
      coinIds: queenPockets.map((c) => c.id),
      owner: null,
      scoringPlayer: null,
    });

  const foul = outcome.strikerPocketed;

  // 4. Queen — resolve a pending cover owed by this shooter (the shot AFTER the claim).
  const isCoverShot = state.queen.status === 'PENDING_COVER' && state.queen.claimedBy === shooterId;
  if (isCoverShot) {
    if (foul) {
      returnQueen(state, events, 'FOUL');
    } else if (ownPockets.length > 0) {
      state.queen.status = 'SECURED';
      state.queen.owner = shooterId;
      state.queen.claimedBy = null;
      events.push({ type: 'queen-secured', owner: shooterId });
      events.push({
        type: 'queen-owner-updated',
        status: 'SECURED',
        owner: shooterId,
        claimedBy: null,
      });
    } else {
      returnQueen(state, events, oppPockets.length > 0 ? 'ONLY_OPPONENT' : 'MISS');
    }
  }

  // 5. Queen — pocketed this shot → claim + pending cover (a same-shot foul voids the claim).
  let forceExtraTurn = false;
  if (queenPockets.length) {
    if (foul) {
      returnQueen(state, events, 'FOUL');
    } else {
      state.queen.status = 'PENDING_COVER';
      state.queen.claimedBy = shooterId;
      state.queen.owner = null;
      state.queen.onBoard = false;
      forceExtraTurn = true;
      events.push({
        type: 'queen-pocketed',
        claimedBy: shooterId,
        turnNumber: state.turn.turnNumber,
      });
      events.push({ type: 'queen-pending-cover', player: shooterId });
      events.push({
        type: 'queen-owner-updated',
        status: 'PENDING_COVER',
        owner: null,
        claimedBy: shooterId,
      });
    }
  }

  // 6. Foul (striker pocketed) → standard penalty + forced turn end.
  if (foul) {
    shooter.fouls += 1;
    events.push({ type: 'foul:committed', player: shooterId, reason: 'STRIKER_POCKETED' });
    if (!returnOneOwnCoin(state, shooter, events)) {
      shooter.pendingPenalty += 1; // nothing to return yet — defer
    }
  } else {
    // 7. Settle pre-existing penalty debt when the player pockets own coins.
    while (shooter.pendingPenalty > 0 && returnOneOwnCoin(state, shooter, events)) {
      shooter.pendingPenalty -= 1;
    }
  }

  // 8. Extra turn: a clean own pocket OR a fresh queen claim — never on a foul.
  const extraTurn = (ownPockets.length > 0 || forceExtraTurn) && !foul;

  // 7. Win check.
  const winnerId = findWinner(state);
  if (winnerId) {
    state.status = 'FINISHED';
    state.winnerId = winnerId;
    state.turn.phase = 'FINISHED';
    const scores: Record<string, number> = {};
    for (const id of state.order) scores[id] = state.players[id]!.score;
    events.push({ type: 'match:result', winnerId, scores });
    return { state, events };
  }

  // 8. Next turn.
  if (extraTurn) {
    state.turn.extraTurn = true;
    events.push({ type: 'turn:extra', player: shooterId });
  } else {
    state.turn.currentPlayer = oppId;
    state.turn.extraTurn = false;
    state.turn.turnNumber += 1;
    events.push({ type: 'turn:changed', nextPlayer: oppId, strikerSide: opp.seat });
  }
  state.turn.phase = 'AIMING';

  return { state, events };
};
