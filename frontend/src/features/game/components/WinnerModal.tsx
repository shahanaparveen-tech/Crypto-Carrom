import { Trophy, Coins, Star, Clock, BarChart3, Home, RotateCcw } from 'lucide-react';

import { Avatar } from '@shared/components';
import { GameModal } from './GameModal';

interface WinnerModalProps {
  won: boolean;
  winnerName: string;
  myScore: number;
  oppScore: number;
  coinsEarned: string; // already formatted (or raw numeric string)
  xpEarned: number;
  durationSec: number;
  onPlayAgain: () => void;
  onHome: () => void;
  onStats: () => void;
}

const fmtDuration = (s: number): string => {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
};

const Stat = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}): JSX.Element => (
  <div className="flex flex-1 flex-col items-center gap-1 rounded-xl bg-black/25 px-2 py-2 ring-1 ring-black/20">
    {icon}
    <span className="font-display text-base font-bold text-white">{value}</span>
    <span className="text-[10px] uppercase tracking-wide text-white/50">{label}</span>
  </div>
);

/** Polished end-of-match result popup. The match has already ended server-side. */
export const WinnerModal = ({
  won,
  winnerName,
  myScore,
  oppScore,
  coinsEarned,
  xpEarned,
  durationSec,
  onPlayAgain,
  onHome,
  onStats,
}: WinnerModalProps): JSX.Element => (
  <GameModal
    title={won ? 'Victory!' : 'Defeat'}
    onClose={onHome}
    footer={
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onPlayAgain}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-lime-400 to-green-600 py-3 font-display text-sm font-bold text-white shadow-lg ring-1 ring-black/20 transition hover:brightness-110 active:scale-95"
          >
            <RotateCcw size={16} /> Play Again
          </button>
          <button
            onClick={onHome}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-b from-wood-light to-wood-dark py-3 font-display text-sm font-bold text-white shadow-lg ring-1 ring-black/20 transition hover:brightness-110 active:scale-95"
          >
            <Home size={16} /> Home
          </button>
        </div>
        <button
          onClick={onStats}
          className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-black/30 py-2.5 font-display text-sm font-bold text-gold-light ring-1 ring-gold/30 transition hover:bg-black/50 active:scale-95"
        >
          <BarChart3 size={16} /> View Match Statistics
        </button>
      </div>
    }
  >
    <div className="flex flex-col items-center gap-3 py-2 text-center">
      <div className="relative">
        <Avatar name={winnerName} size={72} className="!rounded-2xl border-[3px] border-gold/60" />
        {won && (
          <Trophy
            size={28}
            className="absolute -right-2 -top-2 text-gold-light drop-shadow"
            fill="currentColor"
          />
        )}
      </div>

      <div>
        <p className="font-display text-2xl font-extrabold text-white">
          {won ? '🎉 You Win!' : 'You Lost'}
        </p>
        <p className="text-sm text-white/80">
          Winner: <span className="font-bold text-gold-light">{winnerName}</span>
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-black/25 px-6 py-2 ring-1 ring-black/20">
        <span className="font-display text-3xl font-bold text-white">{myScore}</span>
        <span className="text-xs uppercase tracking-wide text-white/50">score</span>
        <span className="font-display text-3xl font-bold text-white">{oppScore}</span>
      </div>

      <div className="flex w-full gap-2">
        <Stat
          icon={<Coins size={18} className="text-gold-light" />}
          label="Coins"
          value={`+${coinsEarned}`}
        />
        <Stat
          icon={<Star size={18} className="text-sky-300" />}
          label="XP"
          value={`+${xpEarned}`}
        />
        <Stat
          icon={<Clock size={18} className="text-white/70" />}
          label="Time"
          value={fmtDuration(durationSec)}
        />
      </div>
    </div>
  </GameModal>
);
