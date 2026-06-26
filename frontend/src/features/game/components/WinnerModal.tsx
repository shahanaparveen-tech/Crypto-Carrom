import { Trophy, Frown } from 'lucide-react';

import { GameModal } from './GameModal';

interface WinnerModalProps {
  won: boolean;
  /** Display label for the winner (e.g. your username, or "Opponent"). */
  winnerName: string;
  /** Winner's player id(s), shown as a sub-identifier. */
  winnerId: string;
  myScore: number;
  oppScore: number;
  onLeave: () => void;
}

/** End-of-match result popup. The match has already ended server-side. */
export const WinnerModal = ({
  won,
  winnerName,
  winnerId,
  myScore,
  oppScore,
  onLeave,
}: WinnerModalProps): JSX.Element => (
  <GameModal
    title={won ? 'Victory!' : 'Match Over'}
    onClose={onLeave}
    footer={
      <button
        onClick={onLeave}
        className="w-full rounded-xl bg-gradient-to-b from-gold-light to-gold py-3 font-display text-lg font-bold text-maroon-dark shadow-lg ring-1 ring-black/20 transition hover:brightness-110 active:scale-95"
      >
        Back to Lobby
      </button>
    }
  >
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      {won ? (
        <Trophy size={64} className="text-gold-light drop-shadow" strokeWidth={1.5} />
      ) : (
        <Frown size={64} className="text-white/60" strokeWidth={1.5} />
      )}

      <p className="font-display text-2xl font-extrabold text-white">
        {won ? '🎉 You Win!' : 'You Lost'}
      </p>

      <p className="text-sm text-white/85">
        Winner: <span className="font-bold text-gold-light">{winnerName}</span>
      </p>
      <p className="-mt-1 text-[11px] text-white/45">id: {winnerId}</p>

      <div className="mt-2 flex items-center gap-4 rounded-xl bg-black/25 px-6 py-3 ring-1 ring-black/20">
        <span className="font-display text-3xl font-bold text-white">{myScore}</span>
        <span className="text-xs uppercase tracking-wide text-white/50">final</span>
        <span className="font-display text-3xl font-bold text-white">{oppScore}</span>
      </div>
    </div>
  </GameModal>
);
