import { describe, it, expect } from 'vitest';

import { createInitialState, remainingByColor } from '../state';
import { applyShot } from '../rules';
import type { GameState } from '../types';

const P0 = 'p0';
const P1 = 'p1';

const fresh = (): GameState => createInitialState('m1', 'disc', P0, P1);

const whiteIds = Array.from({ length: 9 }, (_, i) => `w${i + 1}`);
const blackIds = Array.from({ length: 9 }, (_, i) => `b${i + 1}`);

describe('coin assignment', () => {
  it('assigns white to seat 0 and black to seat 1', () => {
    const s = fresh();
    expect(s.players[P0]!.coinColor).toBe('WHITE');
    expect(s.players[P1]!.coinColor).toBe('BLACK');
    expect(s.coins.filter((c) => c.color === 'WHITE' && c.owner === P0)).toHaveLength(9);
    expect(s.coins.filter((c) => c.color === 'BLACK' && c.owner === P1)).toHaveLength(9);
    expect(s.coins.find((c) => c.color === 'QUEEN')!.owner).toBeNull();
  });
});

describe('ownership scoring', () => {
  it('scores own coin and grants an extra turn (same player keeps shooting)', () => {
    const { state, events } = applyShot(fresh(), P0, {
      pocketedCoinIds: ['w1'],
      strikerPocketed: false,
    });
    expect(state.players[P0]!.score).toBe(1);
    expect(state.players[P0]!.pocketedOwn).toBe(1);
    expect(state.turn.currentPlayer).toBe(P0); // extra turn
    expect(events.some((e) => e.type === 'turn:extra')).toBe(true);
  });

  it('does NOT score the shooter for the opponent coin, and passes the turn', () => {
    const { state, events } = applyShot(fresh(), P0, {
      pocketedCoinIds: ['b1'],
      strikerPocketed: false,
    });
    expect(state.players[P0]!.score).toBe(0); // opponent coin doesn't score for P0
    expect(state.players[P1]!.score).toBe(1); // credited to owner P1
    expect(state.turn.currentPlayer).toBe(P1); // no own pocket → turn passes
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
  it('returns one previously pocketed own coin and ends the turn', () => {
    // P0 pockets w1 (extra turn), then fouls.
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    expect(s.players[P0]!.pocketedOwn).toBe(1);
    const res = applyShot(s, P0, { pocketedCoinIds: [], strikerPocketed: true });
    s = res.state;
    expect(s.players[P0]!.fouls).toBe(1);
    expect(s.players[P0]!.pocketedOwn).toBe(0); // coin returned
    expect(remainingByColor(s).WHITE).toBe(9); // back on board
    expect(s.turn.currentPlayer).toBe(P1); // turn ended
    expect(res.events.some((e) => e.type === 'coin:returned')).toBe(true);
    expect(res.events.some((e) => e.type === 'foul:committed')).toBe(true);
  });

  it('defers the penalty when no own coin is available, then collects it on the next own pocket', () => {
    // P0 fouls with nothing pocketed → pendingPenalty = 1, turn passes.
    let s = applyShot(fresh(), P0, { pocketedCoinIds: [], strikerPocketed: true }).state;
    expect(s.players[P0]!.pendingPenalty).toBe(1);
    expect(s.turn.currentPlayer).toBe(P1);

    // P1 misses → back to P0.
    s = applyShot(s, P1, { pocketedCoinIds: [], strikerPocketed: false }).state;
    expect(s.turn.currentPlayer).toBe(P0);

    // P0 pockets own coin → debt collected (coin returned), net pocketedOwn 0.
    const res = applyShot(s, P0, { pocketedCoinIds: ['w1'], strikerPocketed: false });
    s = res.state;
    expect(s.players[P0]!.pendingPenalty).toBe(0);
    expect(s.players[P0]!.pocketedOwn).toBe(0); // scored then returned
    expect(res.events.some((e) => e.type === 'coin:returned')).toBe(true);
  });

  it('never returns the opponent coin as a penalty', () => {
    // P0 pockets w1, then pockets b1 (opp) — only own coins are returnable.
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    s = applyShot(s, P0, { pocketedCoinIds: ['b1'], strikerPocketed: true }).state; // pockets opp coin + foul
    // The returned coin must be P0's white, not P1's black.
    const onBoardWhite = s.coins.filter(
      (c) => c.color === 'WHITE' && c.state === 'ON_BOARD',
    ).length;
    expect(onBoardWhite).toBe(9); // w1 came back
    expect(s.coins.find((c) => c.id === 'b1')!.state).toBe('POCKETED'); // opp coin stays pocketed
  });
});

describe('win condition', () => {
  it('declares a winner only after all assigned coins are pocketed (with the queen secured)', () => {
    let s = fresh();
    // Secure the queen first (claim → cover with w1).
    s = applyShot(s, P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    s = applyShot(s, P0, { pocketedCoinIds: [whiteIds[0]!], strikerPocketed: false }).state;
    // Clear w2..w8 — still not all cleared.
    for (let i = 1; i < 8; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [whiteIds[i]!], strikerPocketed: false }).state;
      expect(s.status).toBe('ACTIVE');
      expect(s.winnerId).toBeNull();
    }
    // Final white coin → win.
    const res = applyShot(s, P0, { pocketedCoinIds: [whiteIds[8]!], strikerPocketed: false });
    expect(res.state.status).toBe('FINISHED');
    expect(res.state.winnerId).toBe(P0);
    expect(res.events.some((e) => e.type === 'match:result')).toBe(true);
  });

  it('opponent coins never win for the shooter', () => {
    let s = fresh();
    // P0 pockets all 9 BLACK coins (opponent's) — P0 must never be credited the win.
    for (let i = 0; i < 9; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [blackIds[i]!], strikerPocketed: false }).state;
      if (s.turn.currentPlayer === P1) {
        s = applyShot(s, P1, { pocketedCoinIds: [], strikerPocketed: false }).state;
      }
    }
    expect(s.winnerId).not.toBe(P0); // queen unsecured + wrong colour → never P0
  });
});

describe('striker auto-side', () => {
  it('reports the opponent seat as the next striker side on a turn change', () => {
    const res = applyShot(fresh(), P0, { pocketedCoinIds: [], strikerPocketed: false });
    const changed = res.events.find((e) => e.type === 'turn:changed');
    expect(changed && changed.type === 'turn:changed' && changed.strikerSide).toBe(1);
  });
});
