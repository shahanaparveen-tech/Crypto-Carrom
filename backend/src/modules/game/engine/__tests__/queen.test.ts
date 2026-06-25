import { describe, it, expect } from 'vitest';

import { createInitialState } from '../state';
import { applyShot } from '../rules';
import type { GameState } from '../types';

const P0 = 'p0'; // team A
const P1 = 'p1'; // team B
const fresh = (): GameState => createInitialState('m1', 'disc', '1v1', [P0, P1]);

describe('queen — claim', () => {
  it('pocketing the queen sets PENDING_COVER for the team and grants an extra turn', () => {
    const { state, events } = applyShot(fresh(), P0, {
      pocketedCoinIds: ['Q'],
      strikerPocketed: false,
    });
    expect(state.queen.status).toBe('PENDING_COVER');
    expect(state.queen.claimedBy).toBe('A');
    expect(state.queen.owner).toBeNull();
    expect(state.turn.currentPlayer).toBe(P0);
    expect(events.some((e) => e.type === 'queen-pocketed')).toBe(true);
    expect(events.some((e) => e.type === 'queen-pending-cover')).toBe(true);
  });
});

describe('queen — cover success', () => {
  it('secures the queen when the claiming team pockets an own coin with no foul', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: ['w1'], strikerPocketed: false });
    s = res.state;
    expect(s.queen.status).toBe('SECURED');
    expect(s.queen.owner).toBe('A');
    expect(res.events.some((e) => e.type === 'queen-secured')).toBe(true);
  });
});

describe('queen — cover failures (queen returns)', () => {
  it('returns the queen when the cover shot misses', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: [], strikerPocketed: false });
    s = res.state;
    expect(s.queen.status).toBe('ON_BOARD');
    expect(s.turn.currentPlayer).toBe(P1);
    const ret = res.events.find((e) => e.type === 'queen-returned');
    expect(ret && ret.type === 'queen-returned' && ret.reason).toBe('MISS');
  });

  it('returns the queen when only an opponent coin is pocketed on the cover', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: ['b1'], strikerPocketed: false });
    const ret = res.events.find((e) => e.type === 'queen-returned');
    expect(ret && ret.type === 'queen-returned' && ret.reason).toBe('ONLY_OPPONENT');
  });

  it('returns the queen on a foul during the cover shot', () => {
    let s = applyShot(fresh(), P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    s = applyShot(s, P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    const res = applyShot(s, P0, { pocketedCoinIds: [], strikerPocketed: true });
    s = res.state;
    expect(s.queen.status).toBe('ON_BOARD');
    expect(s.players[P0]!.fouls).toBe(1);
    expect(s.turn.currentPlayer).toBe(P1);
  });

  it('voids the claim when queen and striker are pocketed in the same shot', () => {
    const res = applyShot(fresh(), P0, { pocketedCoinIds: ['Q'], strikerPocketed: true });
    expect(res.state.queen.status).toBe('ON_BOARD');
    expect(res.state.queen.claimedBy).toBeNull();
    expect(res.state.turn.currentPlayer).toBe(P1);
  });
});

describe('queen — win gate', () => {
  it('blocks victory until the queen is secured, then allows it', () => {
    let s = fresh();
    s = applyShot(s, P0, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    s = applyShot(s, P0, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    for (let i = 2; i <= 8; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [`w${i}`], strikerPocketed: false }).state;
      expect(s.status).toBe('ACTIVE');
    }
    const res = applyShot(s, P0, { pocketedCoinIds: ['w9'], strikerPocketed: false });
    expect(res.state.status).toBe('FINISHED');
    expect(res.state.winnerTeam).toBe('A');
  });

  it('does NOT win if all coins are cleared but the queen was never secured', () => {
    let s = fresh();
    for (let i = 1; i <= 9; i++) {
      s = applyShot(s, P0, { pocketedCoinIds: [`w${i}`], strikerPocketed: false }).state;
    }
    expect(s.queen.status).toBe('ON_BOARD');
    expect(s.status).toBe('ACTIVE');
    expect(s.winnerTeam).toBeNull();
  });
});
