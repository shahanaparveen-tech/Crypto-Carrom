import type {
  ApplyShotResult,
  Coin,
  GameEvent,
  GameState,
  QueenReturnReason,
  ShotOutcome,
  TeamId,
  TeamState,
} from './types';
import { RECOVERY_SLOTS, BOARD } from './layout';
import { remainingByColor, otherTeam } from './state';

const SLOT_EPSILON = 10;

/** First recovery slot not currently occupied by an on-board coin. */
const firstFreeSlot = (state: GameState): { x: number; y: number } => {
  for (const slot of RECOVERY_SLOTS) {
    const occupied = state.coins.some(
      (c) => c.state === 'ON_BOARD' && Math.hypot(c.x - slot.x, c.y - slot.y) < SLOT_EPSILON,
    );
    if (!occupied) return slot;
  }
  return RECOVERY_SLOTS[0]!;
};

/** Returns one of the team's pocketed coins to the board. */
const returnOneTeamCoin = (state: GameState, team: TeamState, events: GameEvent[]): boolean => {
  for (let i = team.pocketedCoinIds.length - 1; i >= 0; i--) {
    const id = team.pocketedCoinIds[i]!;
    const coin = state.coins.find((c) => c.id === id && c.state === 'POCKETED');
    if (!coin) continue;
    const slot = firstFreeSlot(state);
    coin.state = 'ON_BOARD';
    coin.x = slot.x;
    coin.y = slot.y;
    team.pocketedCoinIds.splice(i, 1);
    team.pocketedOwn = Math.max(0, team.pocketedOwn - 1);
    team.score = Math.max(0, team.score - 1);
    events.push({ type: 'coin:returned', coinId: coin.id, slot });
    return true;
  }
  return false;
};

/** Return the queen to the centre (or nearest free slot) on a failed cover. */
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

const findWinnerTeam = (state: GameState): TeamId | null => {
  const rem = remainingByColor(state);
  for (const id of ['A', 'B'] as TeamId[]) {
    const team = state.teams[id];
    const colorLeft = team.color === 'WHITE' ? rem.WHITE : rem.BLACK;
    // Queen gate: the winning team must have SECURED the queen.
    const queenOk = state.queen.status === 'SECURED' && state.queen.owner === id;
    if (colorLeft === 0 && team.pendingPenalty === 0 && queenOk) return id;
  }
  return null;
};

const strikerSideForTeam = (teamId: TeamId): 0 | 1 => (teamId === 'A' ? 0 : 1);

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
  const myTeamId = shooter.teamId;
  const oppTeamId = otherTeam(myTeamId);
  const myTeam = state.teams[myTeamId];
  const oppTeam = state.teams[oppTeamId];

  // 1. Classify pockets (only coins still on the board).
  const pocketed: Coin[] = state.coins.filter(
    (c) => outcome.pocketedCoinIds.includes(c.id) && c.state === 'ON_BOARD',
  );
  const ownPockets = pocketed.filter((c) => c.owner === myTeamId);
  const oppPockets = pocketed.filter((c) => c.owner === oppTeamId);
  const queenPockets = pocketed.filter((c) => c.color === 'QUEEN');

  // 2. Mark pocketed.
  for (const c of pocketed) c.state = 'POCKETED';

  // 3. Score with team ownership (opponent coins credit their team, never the shooter).
  for (const c of ownPockets) {
    myTeam.pocketedOwn += 1;
    myTeam.pocketedCoinIds.push(c.id);
    myTeam.score += 1;
  }
  for (const c of oppPockets) {
    oppTeam.pocketedOwn += 1;
    oppTeam.pocketedCoinIds.push(c.id);
    oppTeam.score += 1;
  }

  if (ownPockets.length)
    events.push({
      type: 'coin:pocketed',
      coinIds: ownPockets.map((c) => c.id),
      owner: myTeamId,
      scoringTeam: myTeamId,
    });
  if (oppPockets.length)
    events.push({
      type: 'coin:pocketed',
      coinIds: oppPockets.map((c) => c.id),
      owner: oppTeamId,
      scoringTeam: oppTeamId,
    });
  if (queenPockets.length)
    events.push({
      type: 'coin:pocketed',
      coinIds: queenPockets.map((c) => c.id),
      owner: null,
      scoringTeam: null,
    });

  const foul = outcome.strikerPocketed;

  // 4. Queen — resolve a pending cover owed by this team (the shot AFTER the claim).
  const isCoverShot = state.queen.status === 'PENDING_COVER' && state.queen.claimedBy === myTeamId;
  if (isCoverShot) {
    if (foul) {
      returnQueen(state, events, 'FOUL');
    } else if (ownPockets.length > 0) {
      state.queen.status = 'SECURED';
      state.queen.owner = myTeamId;
      state.queen.claimedBy = null;
      events.push({ type: 'queen-secured', owner: myTeamId });
      events.push({
        type: 'queen-owner-updated',
        status: 'SECURED',
        owner: myTeamId,
        claimedBy: null,
      });
    } else {
      returnQueen(state, events, oppPockets.length > 0 ? 'ONLY_OPPONENT' : 'MISS');
    }
  }

  // 5. Queen — pocketed this shot → claim + pending cover (a same-shot foul voids it).
  let forceExtraTurn = false;
  if (queenPockets.length) {
    if (foul) {
      returnQueen(state, events, 'FOUL');
    } else {
      state.queen.status = 'PENDING_COVER';
      state.queen.claimedBy = myTeamId;
      state.queen.owner = null;
      state.queen.onBoard = false;
      forceExtraTurn = true;
      events.push({
        type: 'queen-pocketed',
        claimedBy: myTeamId,
        turnNumber: state.turn.turnNumber,
      });
      events.push({ type: 'queen-pending-cover', team: myTeamId });
      events.push({
        type: 'queen-owner-updated',
        status: 'PENDING_COVER',
        owner: null,
        claimedBy: myTeamId,
      });
    }
  }

  // 6. Foul (striker pocketed) → standard team penalty + forced turn end.
  if (foul) {
    shooter.fouls += 1;
    events.push({ type: 'foul:committed', player: shooterId, reason: 'STRIKER_POCKETED' });
    if (!returnOneTeamCoin(state, myTeam, events)) {
      myTeam.pendingPenalty += 1; // nothing to return yet — defer
    }
  } else {
    // 7. Settle pre-existing team penalty debt when the team pockets own coins.
    while (myTeam.pendingPenalty > 0 && returnOneTeamCoin(state, myTeam, events)) {
      myTeam.pendingPenalty -= 1;
    }
  }

  // 8. Extra turn: a clean own pocket OR a fresh queen claim — never on a foul.
  const extraTurn = (ownPockets.length > 0 || forceExtraTurn) && !foul;

  // 9. Win check.
  const winnerTeam = findWinnerTeam(state);
  if (winnerTeam) {
    state.status = 'FINISHED';
    state.winnerTeam = winnerTeam;
    state.turn.phase = 'FINISHED';
    const scores: Record<TeamId, number> = { A: state.teams.A.score, B: state.teams.B.score };
    events.push({
      type: 'match:result',
      winnerTeam,
      winners: state.teams[winnerTeam].members,
      scores,
    });
    return { state, events };
  }

  // 10. Next turn — same player on extra turn, else advance the seat rotation.
  if (extraTurn) {
    state.turn.extraTurn = true;
    events.push({ type: 'turn:extra', player: shooterId });
  } else {
    const idx = state.order.indexOf(shooterId);
    const next = state.order[(idx + 1) % state.order.length]!;
    state.turn.currentPlayer = next;
    state.turn.extraTurn = false;
    state.turn.turnNumber += 1;
    events.push({
      type: 'turn:changed',
      nextPlayer: next,
      strikerSide: strikerSideForTeam(state.players[next]!.teamId),
    });
  }
  state.turn.phase = 'AIMING';

  return { state, events };
};
