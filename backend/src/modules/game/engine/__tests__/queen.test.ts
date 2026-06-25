import { describe, it, expect } from 'vitest';

import { createInitialState } from '../state';
import { applyShot } from '../rules';
import type { GameState } from '../types';

const P0 = 'p0';
const P1 = 'p1';
const fresh = (): GameState => createInitialState('m1', 'disc', P0, P1);

describe('queen — claim', () => {
  it('pocketing the queen sets PENDING_COVER, claims it, and grants an extra turn', () => {
    const { state, events } = applyShot(fresh(), P0, {
      pocketedCoinIds: ['Q'],
      strikerPocketed: false,
    });
    expect(state.queen.status).toBe('PENDING_COVER');
    expect(state.queen.claimedBy).toBe(P0);
    expect(state.queen.owner).toBeNull();
    expect(state.turn.currentPlayer).toBe(P0); // extra turn
    expect(events.some((e) => e.type === 'queen-pocketed')).toBe(true);
    expect(events.some((e) => e.type === 'queen-pending-cover')).toBe(true);
  });
});

describe('queen — cover success', () => {
  it('secures the queen when the claimer pockets an own coin with no foul', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: ['w1'], strikerPocketed: false });
    s = res.state;
    expect(s.queen.status).toBe('SECURED');
    expect(s.queen.owner).toBe(P0);
    expect(s.queen.claimedBy).toBeNull();
    expect(res.events.some((e) => e.type === 'queen-secured')).toBe(true);
    expect(s.turn.currentPlayer).toBe(P0); // own pocket → still extra turn
  });
});

describe('queen — cover failures (queen returns to board)', () => {
  it('returns the queen when the cover shot misses everything', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: [], strikerPocketed: false });
    s = res.state;
    expect(s.queen.status).toBe('ON_BOARD');
    expect(s.queen.owner).toBeNull();
    expect(s.coins.find((c) => c.color === 'QUEEN')!.state).toBe('ON_BOARD');
    expect(s.turn.currentPlayer).toBe(P1); // turn passes
    const ret = res.events.find((e) => e.type === 'queen-returned');
    expect(ret && ret.type === 'queen-returned' && ret.reason).toBe('MISS');
  });

  it('returns the queen when the cover shot pockets only an opponent coin', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: ['b1'], strikerPocketed: false });
    s = res.state;
    expect(s.queen.status).toBe('ON_BOARD');
    const ret = res.events.find((e) => e.type === 'queen-returned');
    expect(ret && ret.type === 'queen-returned' && ret.reason).toBe('ONLY_OPPONENT');
  });

  it('returns the queen on a striker foul during the cover shot (+ standard penalty)', () => {
    // P0 claims queen, pockets w1 first to have something to lose to the penalty.
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state; // own pocket, extra turn
    s = applyShot(s, P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state; // claim queen, extra turn
    const res = applyShot(s, P0, { pocketedCoinIds: [], strikerPocketed: true }); // foul cover
    s = res.state;
    expect(s.queen.status).toBe('ON_BOARD'); // returned
    expect(s.players[P0]!.fouls).toBe(1);
    expect(res.events.some((e) => e.type === 'queen-returned')).toBe(true);
    expect(res.events.some((e) => e.type === 'foul:committed')).toBe(true);
    expect(s.turn.currentPlayer).toBe(P1);
  });

  it('voids the claim when the queen and striker are pocketed in the same shot', () => {
    const res = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: true });
    expect(res.state.queen.status).toBe('ON_BOARD'); // never entered pending cover
    expect(res.state.queen.claimedBy).toBeNull();
    expect(res.state.turn.currentPlayer).toBe(P1); // foul → turn passes
  });
});

describe('queen — win gate', () => {
  it('blocks victory while the queen is unsecured, and allows it once secured', () => {
    let s = fresh();
    // P0 secures the queen first: claim then cover with w1.
    s = applyShot(s, P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    s = applyShot(s, P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    expect(s.queen.status).toBe('SECURED');

    // Clear w2..w8 (8 more needed; w1 already pocketed → 9 total).
    for (let i = 2; i <= 8; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [`w${i}`], strikerPocketed: false }).state;
      expect(s.status).toBe('ACTIVE');
    }
    // Last white coin → win (all coins + queen secured by P0).
    const res = applyShot(s, P0, { pocketedCoinIds: ['w9'], strikerPocketed: false });
    expect(res.state.status).toBe('FINISHED');
    expect(res.state.winnerId).toBe(P0);
  });

  it('does NOT declare a winner if all coins are cleared but the queen was never secured', () => {
    let s = fresh();
    // P0 clears all 9 white coins without ever securing the queen.
    for (let i = 1; i <= 9; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [`w${i}`], strikerPocketed: false }).state;
    }
    expect(s.queen.status).toBe('ON_BOARD');
    expect(s.status).toBe('ACTIVE'); // no win — queen gate blocks it
    expect(s.winnerId).toBeNull();
  });
});
