import { Trophy, Crown, Medal } from 'lucide-react';

import { Avatar, Card, Spinner } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { useLeaderboard, useMyRank } from '../hooks/useLeaderboard';
import type { LeaderboardEntry } from '../services/leaderboard.api';

const rankBadge = (rank: number): JSX.Element => {
  if (rank === 1) return <Crown size={18} className="text-yellow-300" />;
  if (rank === 2) return <Medal size={18} className="text-slate-300" />;
  if (rank === 3) return <Medal size={18} className="text-amber-600" />;
  return <span className="font-display text-sm font-bold text-felt/60">#{rank}</span>;
};

const Row = ({ e, me }: { e: LeaderboardEntry; me?: boolean }): JSX.Element => (
  <div
    className={cn(
      'flex items-center gap-3 rounded-2xl border px-3 py-2.5 shadow-panel',
      me
        ? 'border-gold/50 bg-gold/10'
        : 'border-gold/15 bg-gradient-to-b from-wood/40 to-wood-dark/30',
      e.rank <= 3 && !me && 'ring-1 ring-gold/30',
    )}
  >
    <span className="flex w-9 shrink-0 items-center justify-center">{rankBadge(e.rank)}</span>
    <Avatar name={e.displayName ?? e.username} src={e.avatarUrl} size={40} level={e.level} />
    <div className="min-w-0 flex-1">
      <p className="truncate font-display font-semibold text-felt">{e.displayName ?? e.username}</p>
      <p className="text-xs text-felt/55">
        {e.gamesWon} wins · {e.winRate}% win rate
      </p>
    </div>
    <span className="flex items-center gap-1 font-display text-lg font-bold text-gold-light">
      <Trophy size={15} /> {e.rating}
    </span>
  </div>
);

export const LeaderboardPage = (): JSX.Element => {
  const { data, isLoading } = useLeaderboard();
  const { data: meData } = useMyRank();
  const entries = data?.leaderboard ?? [];
  const me = meData?.entry ?? null;

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-6">
      <header className="mb-6 flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow-lg">
          <Trophy size={26} />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-gold text-shadow-deep">
            Leaderboards
          </h1>
          <p className="text-sm text-felt/60">Global ranking by rating.</p>
        </div>
      </header>

      {me && (
        <Card className="mb-5 flex items-center gap-3 bg-gold/5">
          <span className="flex w-9 shrink-0 items-center justify-center font-display text-lg font-extrabold text-gold-light">
            #{me.rank}
          </span>
          <Avatar
            name={me.displayName ?? me.username}
            src={me.avatarUrl}
            size={40}
            level={me.level}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate font-display font-semibold text-felt">
              {me.displayName ?? me.username} (You)
            </p>
            <p className="text-xs text-felt/55">
              {me.gamesWon} wins · {me.winRate}% win rate
            </p>
          </div>
          <span className="flex items-center gap-1 font-display text-lg font-bold text-gold-light">
            <Trophy size={15} /> {me.rating}
          </span>
        </Card>
      )}

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner className="h-9 w-9" />
        </div>
      ) : (
        <div className="space-y-2.5">
          {entries.map((e) => (
            <Row key={e.userId} e={e} me={e.userId === me?.userId} />
          ))}
          {entries.length === 0 && (
            <p className="py-12 text-center text-felt/45">
              No ranked players yet — play a match to climb!
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default LeaderboardPage;
