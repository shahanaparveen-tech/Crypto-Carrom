import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, Coins, WifiOff } from 'lucide-react';

import { Avatar, Spinner } from '@shared/components';
import { ROUTES } from '@app/config/routes.constants';
import { formatCoins } from '@shared/utils/format';
import { useAuthState } from '@features/auth/hooks';
import { NetGameCanvas } from '../components/NetGameCanvas';
import { WinnerModal } from '../components/WinnerModal';
import { TurnTimer } from '../components/TurnTimer';
import { useNetMatch } from '../net/useNetMatch';

export const MultiplayerMatchPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { myId, state, lastShot, pausedUser, gameOver, sendShot, sendAim, liveAim } = useNetMatch(
    roomId ?? null,
  );

  const { user } = useAuthState();
  const myTeam = state?.players[myId]?.teamId ?? 'A';
  const oppTeam = myTeam === 'A' ? 'B' : 'A';
  const myScore = state?.teams[myTeam].score ?? 0;
  const oppScore = state?.teams[oppTeam].score ?? 0;

  const oppId = state?.order.find((id) => id !== myId);
  const myName = state?.players[myId]?.username ?? user?.username ?? 'You';
  // Prefer the opponent's username; fall back to their id so it's always shown.
  const oppName = (oppId && (state?.players[oppId]?.username || oppId)) || 'Opponent';
  const myTurn = state?.turn.currentPlayer === myId;

  const finished = state?.status === 'FINISHED' && state.winnerTeam !== null;
  const iWon = finished && state?.winnerTeam === myTeam;
  const winnerName = iWon ? myName : oppName;
  const reward = (gameOver && gameOver.rewards[myId]) || null;

  // Each team owns one colour; coins render white→blue puck, black→dark puck.
  const swatch = (team: 'A' | 'B'): string =>
    state?.teams[team].color === 'WHITE' ? '#29a3e6' : '#2b2f38';
  const colorName = (team: 'A' | 'B'): string =>
    state?.teams[team].color === 'WHITE' ? 'White' : 'Black';

  const banner = (): string => {
    if (!state) return 'Connecting…';
    if (state.status === 'FINISHED') return iWon ? '🎉 You win!' : 'You lost';
    if (state.queen.status === 'PENDING_COVER' && state.queen.claimedBy === myTeam) {
      return '👑 Cover the Queen!';
    }
    if (myTurn) return 'Your Turn';
    const name = state.players[state.turn.currentPlayer]?.username ?? 'Opponent';
    return `${name}'s Turn`;
  };

  const PlayerCard = ({
    name,
    id,
    team,
    active,
    you,
  }: {
    name: string;
    id?: string;
    team: 'A' | 'B';
    active: boolean;
    you?: boolean;
  }): JSX.Element => (
    <div
      className={`flex flex-col items-center rounded-2xl p-1 transition ${active ? 'ring-2 ring-lime-400' : ''}`}
    >
      <Avatar name={name} size={56} className="!rounded-xl border-[3px]" />
      <span className="mt-1 max-w-[96px] truncate text-[11px] font-semibold text-white/90">
        {you ? `${name} (You)` : name}
      </span>
      {id && id !== name && (
        <span className="max-w-[96px] truncate text-[9px] text-white/45" title={id}>
          id: {id}
        </span>
      )}
      <span className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-white/70">
        <span
          className="h-2.5 w-2.5 rounded-full ring-1 ring-white/40"
          style={{ background: swatch(team) }}
        />
        {colorName(team)}
      </span>
    </div>
  );

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center px-3 py-3"
      style={{
        background: 'radial-gradient(ellipse at 50% 28%, #2f6f9e 0%, #1d3b6b 45%, #0e1a3a 100%)',
      }}
    >
      {/* Players */}
      <div className="flex w-full max-w-xl items-start justify-between gap-2">
        <PlayerCard name={myName} id={myId} team={myTeam} active={!!myTurn} you />

        <div className="flex flex-1 flex-col items-center pt-1">
          <span className="flex items-center gap-1.5 font-display text-xl font-extrabold text-white drop-shadow">
            <Coins size={18} className="text-gold-light" /> {state?.matchType?.toUpperCase() ?? '…'}
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="rounded-lg bg-black/55 px-3 py-1.5 text-center text-sm font-semibold text-white shadow">
              {banner()}
            </span>
            {state?.status === 'ACTIVE' && (
              <TurnTimer
                deadline={state.turn.deadline ?? 0}
                turnKey={`${state.turn.currentPlayer}#${state.turn.turnNumber}`}
              />
            )}
          </div>
        </div>

        <PlayerCard name={oppName} id={oppId} team={oppTeam} active={!!state && !myTurn} />
      </div>

      {/* Scores */}
      <div className="mt-2 flex w-full max-w-xl items-center justify-between">
        <span className="font-display text-2xl font-bold text-white">{myScore}</span>
        <span className="text-xs uppercase tracking-wide text-white/50">
          Team {myTeam} vs {oppTeam}
        </span>
        <span className="font-display text-2xl font-bold text-white">{oppScore}</span>
      </div>

      {/* Board */}
      <div className="relative mt-3 w-full">
        <NetGameCanvas
          state={state}
          myId={myId}
          lastShot={lastShot}
          onLocalShot={sendShot}
          liveAim={liveAim}
          sendAim={sendAim}
        />

        {pausedUser && state?.status === 'ACTIVE' && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3 rounded-3xl bg-black/70 backdrop-blur-sm">
            <WifiOff size={36} className="text-rose-300" />
            <p className="font-display text-lg font-bold text-white">
              {pausedUser === myId ? 'Reconnecting…' : 'Opponent disconnected'}
            </p>
            <p className="text-sm text-white/70">Waiting to reconnect…</p>
            <Spinner className="h-6 w-6" />
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(ROUTES.LOBBY)}
        className="mt-4 flex items-center gap-2 rounded-xl bg-black/50 px-5 py-2.5 font-display text-sm font-bold text-white shadow ring-1 ring-white/10 transition hover:bg-black/70"
      >
        <LogOut size={16} /> Leave match
      </button>

      {finished && (
        <WinnerModal
          won={!!iWon}
          winnerName={winnerName}
          myScore={myScore}
          oppScore={oppScore}
          coinsEarned={formatCoins(reward?.coins ?? '0')}
          xpEarned={reward?.xp ?? 0}
          durationSec={gameOver?.durationSec ?? 0}
          onPlayAgain={() => navigate(ROUTES.FRIENDS)}
          onHome={() => navigate(ROUTES.HOME)}
          onStats={() => navigate(ROUTES.PROFILE)}
        />
      )}
    </div>
  );
};

export default MultiplayerMatchPage;
