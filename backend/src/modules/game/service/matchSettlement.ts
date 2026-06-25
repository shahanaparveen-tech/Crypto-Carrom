import { prisma } from '../../../app/config/prisma';
import { walletService } from '../../wallet';
import type { GameState, TeamId } from '../engine';

const K_FACTOR = 32;
const FLAT_WIN_REWARD = 100n;
const WIN_XP = 50;
const LOSS_XP = 20;

const expectedScore = (rating: number, oppRating: number): number =>
  1 / (1 + 10 ** ((oppRating - rating) / 400));

/**
 * Settles a finished match: rating (Elo), profile stats, wallet rewards,
 * game history and the global leaderboard. Idempotency is the caller's concern
 * (invoked once, on the finishing shot).
 */
export const matchSettlement = {
  async settle(state: GameState): Promise<void> {
    if (state.status !== 'FINISHED' || !state.winnerTeam) return;
    const winnerTeam = state.winnerTeam;

    const userIds = state.order;
    const profiles = await prisma.profile.findMany({ where: { userId: { in: userIds } } });
    const ratingOf = new Map(profiles.map((p) => [p.userId, p.rating]));

    const teamAvg = (team: TeamId): number => {
      const members = state.teams[team].members;
      const sum = members.reduce((a, id) => a + (ratingOf.get(id) ?? 1000), 0);
      return members.length ? sum / members.length : 1000;
    };
    const avg: Record<TeamId, number> = { A: teamAvg('A'), B: teamAvg('B') };

    // Match + prize pool.
    const match = await prisma.match.findUnique({ where: { id: state.matchId } });
    const winners = state.teams[winnerTeam].members;
    const pool = match?.prizePool && match.prizePool > 0n ? match.prizePool : FLAT_WIN_REWARD;
    const perWinner = winners.length > 0 ? pool / BigInt(winners.length) : 0n;

    const startedAt = match?.startedAt?.getTime() ?? Date.now();
    const durationSec = Math.max(0, Math.round((Date.now() - startedAt) / 1000));

    for (const userId of userIds) {
      const player = state.players[userId]!;
      const won = player.teamId === winnerTeam;
      const before = ratingOf.get(userId) ?? 1000;
      const oppRating = avg[player.teamId === 'A' ? 'B' : 'A'];
      const delta = Math.round(K_FACTOR * ((won ? 1 : 0) - expectedScore(before, oppRating)));
      const after = Math.max(0, before + delta);
      const teamScore = state.teams[player.teamId].score;

      // Profile stats + rating.
      const prof = profiles.find((p) => p.userId === userId);
      const newXp = (prof?.xp ?? 0) + (won ? WIN_XP : LOSS_XP);
      const streak = won ? (prof?.winStreak ?? 0) + 1 : 0;
      await prisma.profile.update({
        where: { userId },
        data: {
          rating: after,
          xp: newXp,
          level: Math.floor(newXp / 500) + 1,
          gamesPlayed: { increment: 1 },
          gamesWon: won ? { increment: 1 } : undefined,
          gamesLost: won ? undefined : { increment: 1 },
          winStreak: streak,
          bestStreak: Math.max(prof?.bestStreak ?? 0, streak),
        },
      });

      // Match player result.
      await prisma.matchPlayer.updateMany({
        where: { matchId: state.matchId, userId },
        data: {
          result: won ? 'WIN' : 'LOSS',
          score: teamScore,
          ratingBefore: before,
          ratingAfter: after,
        },
      });

      // Game history.
      const coinsDelta = won ? perWinner : 0n;
      await prisma.gameHistory.create({
        data: {
          matchId: state.matchId,
          userId,
          result: won ? 'WIN' : 'LOSS',
          score: teamScore,
          ratingDelta: delta,
          coinsDelta,
          durationSec,
        },
      });

      // Global leaderboard snapshot.
      await prisma.leaderboard.upsert({
        where: { userId_period_periodKey: { userId, period: 'GLOBAL', periodKey: 'GLOBAL' } },
        create: {
          userId,
          period: 'GLOBAL',
          periodKey: 'GLOBAL',
          rating: after,
          wins: won ? 1 : 0,
          losses: won ? 0 : 1,
        },
        update: {
          rating: after,
          wins: { increment: won ? 1 : 0 },
          losses: { increment: won ? 0 : 1 },
        },
      });

      // Wallet reward (winners only).
      if (won && perWinner > 0n) {
        await walletService.credit(userId, perWinner, 'MATCH_WINNING', state.matchId);
      }
    }
  },
};
