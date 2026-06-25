import { useNavigate, useParams } from 'react-router-dom';
import { LogOut, Coins } from 'lucide-react';

import { Avatar } from '@shared/components';
import { ROUTES } from '@app/config/routes.constants';
import { NetGameCanvas } from '../components/NetGameCanvas';
import { useNetMatch } from '../net/useNetMatch';

export const MultiplayerMatchPage = (): JSX.Element => {
  const navigate = useNavigate();
  const { roomId } = useParams<{ roomId: string }>();
  const { myId, state, lastShot, sendShot } = useNetMatch(roomId ?? null);

  const myTeam = state?.players[myId]?.teamId ?? 'A';
  const oppTeam = myTeam === 'A' ? 'B' : 'A';
  const myScore = state?.teams[myTeam].score ?? 0;
  const oppScore = state?.teams[oppTeam].score ?? 0;

  const banner = (): string => {
    if (!state) return 'Connecting…';
    if (state.status === 'FINISHED') {
      return state.winnerTeam === myTeam ? '🎉 You win!' : 'You lost';
    }
    if (state.queen.status === 'PENDING_COVER' && state.queen.claimedBy === myTeam) {
      return '👑 Cover the Queen!';
    }
    return state.turn.currentPlayer === myId ? 'Your turn' : "Opponent's turn";
  };

  return (
    <div
      className="flex min-h-screen w-full flex-col items-center px-3 py-3"
      style={{
        background: 'radial-gradient(ellipse at 50% 28%, #2f6f9e 0%, #1d3b6b 45%, #0e1a3a 100%)',
      }}
    >
      {/* Players */}
      <div className="flex w-full max-w-xl items-start justify-between gap-2">
        <div
          className={`flex flex-col items-center rounded-2xl p-1 ${state?.turn.currentPlayer === myId ? 'ring-2 ring-lime-400' : ''}`}
        >
          <Avatar name="You" size={56} className="!rounded-xl border-[3px]" />
          <span className="mt-1 text-[11px] font-semibold text-white/85">You</span>
        </div>

        <div className="flex flex-1 flex-col items-center pt-1">
          <span className="flex items-center gap-1.5 font-display text-xl font-extrabold text-white drop-shadow">
            <Coins size={18} className="text-gold-light" /> {state?.matchType?.toUpperCase() ?? '…'}
          </span>
          <span className="mt-1 rounded-lg bg-black/55 px-3 py-1.5 text-center text-sm font-semibold text-white shadow">
            {banner()}
          </span>
        </div>

        <div
          className={`flex flex-col items-center rounded-2xl p-1 ${state && state.turn.currentPlayer !== myId ? 'ring-2 ring-lime-400' : ''}`}
        >
          <Avatar name="Opponent" size={56} className="!rounded-xl border-[3px]" />
          <span className="mt-1 text-[11px] font-semibold text-white/85">Opponent</span>
        </div>
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
      <div className="mt-3 w-full">
        <NetGameCanvas state={state} myId={myId} lastShot={lastShot} onLocalShot={sendShot} />
      </div>

      <button
        onClick={() => navigate(ROUTES.LOBBY)}
        className="mt-4 flex items-center gap-2 rounded-xl bg-black/50 px-5 py-2.5 font-display text-sm font-bold text-white shadow ring-1 ring-white/10 transition hover:bg-black/70"
      >
        <LogOut size={16} /> Leave match
      </button>
    </div>
  );
};

export default MultiplayerMatchPage;
