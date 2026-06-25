/**
 * Authoritative Carrom game-state types. The rule engine is pure: every
 * transition takes a state + shot outcome and returns a new state + events.
 */

export type CoinColor = 'WHITE' | 'BLACK' | 'QUEEN';
export type Seat = 0 | 1;
export type CoinState = 'ON_BOARD' | 'POCKETED' | 'RETURNED';
export type TurnPhase = 'AIMING' | 'SIMULATING' | 'RESOLVING' | 'FINISHED';

export interface Coin {
  id: string;
  color: CoinColor;
  /** Owning player id; null for the neutral queen. */
  owner: string | null;
  state: CoinState;
  x: number;
  y: number;
}

export interface PlayerState {
  userId: string;
  seat: Seat;
  coinColor: 'WHITE' | 'BLACK';
  /** Count of own-colour coins currently pocketed (net of returns). */
  pocketedOwn: number;
  /** Ownership-tracked ids of this player's pocketed coins (for penalties). */
  pocketedCoinIds: string[];
  score: number;
  /** Deferred coin-return debt when a foul occurs with nothing to return. */
  pendingPenalty: number;
  fouls: number;
}

export interface GameState {
  matchId: string;
  mode: string;
  status: 'ACTIVE' | 'FINISHED';
  /** Seat-ordered player ids: [seat0, seat1]. */
  order: [string, string];
  players: Record<string, PlayerState>;
  coins: Coin[];
  turn: {
    currentPlayer: string;
    turnNumber: number;
    extraTurn: boolean;
    phase: TurnPhase;
  };
  queen: {
    status: QueenStatus;
    /** Permanent owner once SECURED. */
    owner: string | null;
    /** Transient claimer who owes a cover during PENDING_COVER. */
    claimedBy: string | null;
    onBoard: boolean;
  };
  winnerId: string | null;
}

export type QueenStatus = 'ON_BOARD' | 'PENDING_COVER' | 'SECURED';
export type QueenReturnReason = 'MISS' | 'ONLY_OPPONENT' | 'FOUL' | 'TURN_LOST';

/** Result of a settled physics simulation reported by the shooter. */
export interface ShotOutcome {
  pocketedCoinIds: string[];
  strikerPocketed: boolean;
}

export type GameEvent =
  | { type: 'coin:pocketed'; coinIds: string[]; owner: string | null; scoringPlayer: string | null }
  | { type: 'coin:returned'; coinId: string; slot: { x: number; y: number } }
  | { type: 'foul:committed'; player: string; reason: 'STRIKER_POCKETED' }
  | { type: 'turn:extra'; player: string }
  | { type: 'turn:changed'; nextPlayer: string; strikerSide: Seat }
  | { type: 'queen-pocketed'; claimedBy: string; turnNumber: number }
  | { type: 'queen-pending-cover'; player: string }
  | { type: 'queen-secured'; owner: string }
  | { type: 'queen-returned'; reason: QueenReturnReason; position: { x: number; y: number } }
  | {
      type: 'queen-owner-updated';
      status: QueenStatus;
      owner: string | null;
      claimedBy: string | null;
    }
  | { type: 'match:result'; winnerId: string; scores: Record<string, number> };

export interface ApplyShotResult {
  state: GameState;
  events: GameEvent[];
}
