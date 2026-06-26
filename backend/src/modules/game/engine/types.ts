/**
 * Authoritative Carrom game-state types. Generalised to teams so the same engine
 * powers 1v1 (single-member teams) and 2v2 (two-member teams). Pure: every
 * transition takes a state + shot outcome and returns a new state + events.
 */

export type CoinColor = 'WHITE' | 'BLACK' | 'QUEEN';
export type TeamId = 'A' | 'B';
export type MatchType = '1v1' | '2v2';
export type CoinState = 'ON_BOARD' | 'POCKETED' | 'RETURNED';
export type TurnPhase = 'AIMING' | 'SIMULATING' | 'RESOLVING' | 'FINISHED';
export type QueenStatus = 'ON_BOARD' | 'PENDING_COVER' | 'SECURED';
export type QueenReturnReason = 'MISS' | 'ONLY_OPPONENT' | 'FOUL' | 'TURN_LOST';

export interface Coin {
  id: string;
  color: CoinColor;
  /** Owning team; null for the neutral queen. */
  owner: TeamId | null;
  state: CoinState;
  x: number;
  y: number;
}

export interface PlayerState {
  userId: string;
  /** Display name (falls back to userId when unknown). */
  username: string;
  /** Seat index in the turn rotation (0..3). */
  seat: number;
  teamId: TeamId;
  fouls: number;
}

export interface TeamState {
  id: TeamId;
  color: 'WHITE' | 'BLACK';
  members: string[];
  /** Team coins currently pocketed (net of returns). */
  pocketedOwn: number;
  /** Ids of the team's pocketed coins (for penalty returns). */
  pocketedCoinIds: string[];
  score: number;
  /** Deferred coin-return debt (team-level). */
  pendingPenalty: number;
}

export interface GameState {
  matchId: string;
  mode: string;
  matchType: MatchType;
  status: 'ACTIVE' | 'FINISHED';
  /** Seat-ordered player ids (length 2 for 1v1, 4 for 2v2). */
  order: string[];
  players: Record<string, PlayerState>;
  teams: Record<TeamId, TeamState>;
  coins: Coin[];
  turn: {
    currentPlayer: string;
    turnNumber: number;
    extraTurn: boolean;
    phase: TurnPhase;
    /** Epoch ms by which the current player must shoot (0 = no timer). */
    deadline: number;
  };
  queen: {
    status: QueenStatus;
    owner: TeamId | null;
    claimedBy: TeamId | null;
    onBoard: boolean;
  };
  winnerTeam: TeamId | null;
}

/** Result of a settled physics simulation reported by the shooter. */
export interface ShotOutcome {
  pocketedCoinIds: string[];
  strikerPocketed: boolean;
}

export type GameEvent =
  | { type: 'coin:pocketed'; coinIds: string[]; owner: TeamId | null; scoringTeam: TeamId | null }
  | { type: 'coin:returned'; coinId: string; slot: { x: number; y: number } }
  | { type: 'foul:committed'; player: string; reason: 'STRIKER_POCKETED' }
  | { type: 'turn:extra'; player: string }
  | { type: 'turn:changed'; nextPlayer: string; strikerSide: 0 | 1 }
  | { type: 'queen-pocketed'; claimedBy: TeamId; turnNumber: number }
  | { type: 'queen-pending-cover'; team: TeamId }
  | { type: 'queen-secured'; owner: TeamId }
  | { type: 'queen-returned'; reason: QueenReturnReason; position: { x: number; y: number } }
  | {
      type: 'queen-owner-updated';
      status: QueenStatus;
      owner: TeamId | null;
      claimedBy: TeamId | null;
    }
  | { type: 'match:result'; winnerTeam: TeamId; winners: string[]; scores: Record<TeamId, number> };

export interface ApplyShotResult {
  state: GameState;
  events: GameEvent[];
}
