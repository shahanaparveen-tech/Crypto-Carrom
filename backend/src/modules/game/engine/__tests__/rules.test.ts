import { describe, it, expect } from 'vitest';

import { createInitialState, remainingByColor } from '../state';
import { applyShot } from '../rules';
import type { GameState } from '../types';

const P0 = 'p0'; // seat 0 → team A → WHITE
const P1 = 'p1'; // seat 1 → team B → BLACK

const fresh = (): GameState => createInitialState('m1', 'disc', '1v1', [P0, P1]);

const whiteIds = Array.from({ length: 9 }, (_, i) => `w${i + 1}`);
const blackIds = Array.from({ length: 9 }, (_, i) => `b${i + 1}`);

/** Secure the queen for the given player so coin-clears can win. */
const secureQueen = (s: GameState, player: string, ownCoin: string): GameState => {
  s = applyShot(s, player, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
  return applyShot(s, player, { pocketedCoinIds: [ownCoin], strikerPocketed: false }).state;
};

describe('coin assignment', () => {
  it('assigns white to team A (seat 0) and black to team B (seat 1)', () => {
    const s = fresh();
    expect(s.teams.A.color).toBe('WHITE');
    expect(s.teams.B.color).toBe('BLACK');
    expect(s.players[P0]!.teamId).toBe('A');
    expect(s.players[P1]!.teamId).toBe('B');
    expect(s.coins.filter((c) => c.color === 'WHITE' && c.owner === 'A')).toHaveLength(9);
    expect(s.coins.filter((c) => c.color === 'BLACK' && c.owner === 'B')).toHaveLength(9);
    expect(s.coins.find((c) => c.color === 'QUEEN')!.owner).toBeNull();
  });
});

describe('ownership scoring', () => {
  it('scores own coin and grants an extra turn', () => {
    const { state, events } = applyShot(fresh(), P0, {
      pocketedCoinIds: ['w1'],
      strikerPocketed: false,
    });
    expect(state.teams.A.score).toBe(1);
    expect(state.turn.currentPlayer).toBe(P0);
    expect(events.some((e) => e.type === 'turn:extra')).toBe(true);
  });

  it('does NOT score the shooter for the opponent coin, and passes the turn', () => {
    const { state, events } = applyShot(fresh(), P0, {
      pocketedCoinIds: ['b1'],
      strikerPocketed: false,
    });
    expect(state.teams.A.score).toBe(0);
    expect(state.teams.B.score).toBe(1); // credited to owning team
    expect(state.turn.currentPlayer).toBe(P1);
    const changed = events.find((e) => e.type === 'turn:changed');
    expect(changed && changed.type === 'turn:changed' && changed.strikerSide).toBe(1);
  });
});

describe('turn change', () => {
  it('passes the turn when nothing is pocketed', () => {
    const { state } = applyShot(fresh(), P0, { pocketedCoinIds: [], strikerPocketed: false });
    expect(state.turn.currentPlayer).toBe(P1);
    expect(state.turn.turnNumber).toBe(2);
  });
});

describe('striker foul + penalty', () => {
  it('returns one of the team’s pocketed coins and ends the turn', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: [], strikerPocketed: true });
    s = res.state;
    expect(s.players[P0]!.fouls).toBe(1);
    expect(s.teams.A.pocketedOwn).toBe(0);
    expect(remainingByColor(s).WHITE).toBe(9);
    expect(s.turn.currentPlayer).toBe(P1);
    expect(res.events.some((e) => e.type === 'coin:returned')).toBe(true);
    expect(res.events.some((e) => e.type === 'foul:committed')).toBe(true);
  });

  it('defers the penalty when nothing is available, collecting it on the next own pocket', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: [], strikerPocketed: true }).state;
    expect(s.teams.A.pendingPenalty).toBe(1);
    s = applyShot(s, P1, { pocketedCoinIds: [], strikerPocketed: false }).state; // back to P0
    const res = applyShot(s, P0, { pocketedCoinIds: ['w1'], strikerPocketed: false });
    s = res.state;
    expect(s.teams.A.pendingPenalty).toBe(0);
    expect(s.teams.A.pocketedOwn).toBe(0);
    expect(res.events.some((e) => e.type === 'coin:returned')).toBe(true);
  });

  it('never returns the opponent coin as a penalty', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    s = applyShot(s, P0, { pocketedCoinIds: ['b1'], strikerPocketed: true }).state; // opp coin + foul
    expect(s.coins.filter((c) => c.color === 'WHITE' && c.state === 'ON_BOARD').length).toBe(9);
    expect(s.coins.find((c) => c.id === 'b1')!.state).toBe('POCKETED');
  });
});

describe('win condition', () => {
  it('declares a winner only after all assigned coins are pocketed (queen secured)', () => {
    let s = secureQueen(fresh(), P0, whiteIds[0]!);
    for (let i = 1; i < 8; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [whiteIds[i]!], strikerPocketed: false }).state;
      expect(s.status).toBe('ACTIVE');
    }
    const res = applyShot(s, P0, { pocketedCoinIds: [whiteIds[8]!], strikerPocketed: false });
    expect(res.state.status).toBe('FINISHED');
    expect(res.state.winnerTeam).toBe('A');
    expect(res.events.some((e) => e.type === 'match:result')).toBe(true);
  });

  it('opponent coins never win for the shooter', () => {
    let s = fresh();
    for (let i = 0; i < 9; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [blackIds[i]!], strikerPocketed: false }).state;
      if (s.turn.currentPlayer === P1) {
        s = applyShot(s, P1, { pocketedCoinIds: [], strikerPocketed: false }).state;
      }
    }
    expect(s.winnerTeam).not.toBe('A');
  });
});
