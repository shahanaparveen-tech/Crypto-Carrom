import { describe, it, expect } from 'vitest';

import { createInitialState } from '../state';
import { applyShot } from '../rules';
import type { GameState } from '../types';

// Seats: A1, B1, A2, B2  → teams A = {A1,A2}, B = {B1,B2}
const A1 = 'a1';
const B1 = 'b1';
const A2 = 'a2';
const B2 = 'b2';
const fresh = (): GameState => createInitialState('m2', 'disc', '2v2', [A1, B1, A2, B2]);

describe('2v2 — setup', () => {
  it('groups seats into two teams of two with shared colours', () => {
    const s = fresh();
    expect(s.teams.A.members).toEqual([A1, A2]);
    expect(s.teams.B.members).toEqual([B1, B2]);
    expect(s.players[A1]!.teamId).toBe('A');
    expect(s.players[A2]!.teamId).toBe('A');
    expect(s.players[B1]!.teamId).toBe('B');
    expect(s.turn.currentPlayer).toBe(A1);
  });
});

describe('2v2 — turn rotation', () => {
  it('rotates A1 → B1 → A2 → B2 → A1 on misses', () => {
    let s = fresh();
    const seen: string[] = [s.turn.currentPlayer];
    for (let i = 0; i < 4; i++) {
      s = applyShot(s, s.turn.currentPlayer, { pocketedCoinIds: [], strikerPocketed: false }).state;
      seen.push(s.turn.currentPlayer);
    }
    expect(seen).toEqual([A1, B1, A2, B2, A1]);
  });
});

describe('2v2 — shared team scoring', () => {
  it('counts both teammates’ pockets toward the shared team score', () => {
    let s = fresh();
    // A1 pockets a white coin → team A scores, A1 keeps shooting (extra turn).
    s = applyShot(s, A1, { pocketedCoinIds: ['w1'], strikerPocketed: false }).state;
    expect(s.teams.A.score).toBe(1);
    expect(s.turn.currentPlayer).toBe(A1);
    // A1 misses → turn passes to B1.
    s = applyShot(s, A1, { pocketedCoinIds: [], strikerPocketed: false }).state;
    expect(s.turn.currentPlayer).toBe(B1);
    // B1 misses → A2.
    s = applyShot(s, B1, { pocketedCoinIds: [], strikerPocketed: false }).state;
    expect(s.turn.currentPlayer).toBe(A2);
    // A2 pockets another white → same team A score increments to 2.
    s = applyShot(s, A2, { pocketedCoinIds: ['w2'], strikerPocketed: false }).state;
    expect(s.teams.A.score).toBe(2);
  });

  it('lets a teammate cover the queen claimed by the other teammate', () => {
    let s = fresh();
    // A1 claims the queen.
    s = applyShot(s, A1, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state;
    expect(s.queen.claimedBy).toBe('A');
    // A1 misses the cover → queen returns (cover must be the claiming team's NEXT shot).
    // Re-claim to test teammate cover cleanly:
    s = applyShot(s, A1, { pocketedCoinIds: [], strikerPocketed: false }).state; // queen returns, turn → B1
    // Rotate back to team A via A2 and let A2 claim + cover.
    s = applyShot(s, B1, { pocketedCoinIds: [], strikerPocketed: false }).state; // → A2
    s = applyShot(s, A2, { pocketedCoinIds: ['Q'], strikerPocketed: false }).state; // A2 claims, extra turn
    expect(s.queen.claimedBy).toBe('A');
    const res = applyShot(s, A2, { pocketedCoinIds: ['w3'], strikerPocketed: false }); // A2 covers
    expect(res.state.queen.status).toBe('SECURED');
    expect(res.state.queen.owner).toBe('A');
  });
});
