import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Coins, Hexagon } from 'lucide-react';

import { Avatar, CoinBadge, GemBadge } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { ROUTES } from '@app/config/routes.constants';
import { useAuthState } from '@features/auth/hooks';
import { useMyProfile } from '@features/profile/hooks/useProfile';
import { useWalletBalance } from '@features/wallet/hooks/useWallet';
import { STAGES, MODES, type GameMode } from '@features/stages/data/stages';

/** Seconds the VS screen is shown before the board opens. */
const REVEAL_MS = 3200;

interface MatchState {
  stageId?: string;
  mode?: GameMode;
}

interface PlayerInfo {
  name: string;
  level: number;
  rating: number;
  club?: string;
}

const PlayerColumn = ({
  player,
  side,
}: {
  player: PlayerInfo;
  side: 'left' | 'right';
}): JSX.Element => (
  <div className="flex flex-1 flex-col items-center gap-2">
    <Avatar
      name={player.name}
      size={104}
      level={player.level}
      className="!rounded-2xl border-[3px]"
    />
    <p className="max-w-[10rem] truncate text-center font-display text-sm font-bold text-white">
      {player.name}
    </p>

    {/* Club */}
    <div className="flex items-center gap-1.5 rounded-lg bg-black/25 px-3 py-1.5 text-xs text-white/85">
      {player.club ? (
        <>
          <Hexagon size={14} className="text-gold-light" fill="currentColor" />
          <span className="max-w-[7rem] truncate">{player.club}</span>
        </>
      ) : (
        <>
          <Hexagon size={14} className="text-white/40" />
          <span className="text-white/60">No Club</span>
        </>
      )}
    </div>

    {/* Rating */}
    <div
      className={cn(
        'rounded-xl bg-black/30 px-8 py-2 font-display text-xl font-bold text-white shadow-inner',
        side === 'left' ? '' : '',
      )}
    >
      {player.rating}
    </div>
  </div>
);

export const MatchmakingPage = (): JSX.Element => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuthState();
  const { data: profileData } = useMyProfile();
  const { data: walletData } = useWalletBalance();

  const state = (location.state ?? {}) as MatchState;
  const stage = STAGES.find((s) => s.id === state.stageId) ?? STAGES[0]!;
  const modeLabel = MODES.find((m) => m.id === state.mode)?.label ?? 'Carrom';
  const profile = profileData?.profile;

  const me: PlayerInfo = {
    name: profile?.displayName ?? user?.username ?? 'You',
    level: profile?.level ?? 1,
    rating: profile?.rating ?? 421,
    club: undefined,
  };
  const opponent: PlayerInfo = {
    name: 'Guest_868891663',
    level: 20,
    rating: profile?.rating ?? 421,
    club: 'JAY SHREE RA…',
  };

  // Auto-advance to the board after the reveal.
  useEffect(() => {
    const id = window.setTimeout(() => navigate(ROUTES.PRACTICE, { replace: true }), REVEAL_MS);
    return () => window.clearTimeout(id);
  }, [navigate]);

  return (
    <div
      onClick={() => navigate(ROUTES.PRACTICE, { replace: true })}
      className="relative flex min-h-screen w-full cursor-pointer flex-col items-center px-4 py-6"
      style={{
        background: `radial-gradient(ellipse at 50% 35%, ${stage.theme.glow}33, #3a0f0c 55%, #2a0a09 100%)`,
      }}
    >
      {/* Currencies */}
      <div className="flex items-center gap-2 self-end">
        <GemBadge amount={walletData?.wallet.gems ?? '0'} size="sm" />
        <CoinBadge amount={walletData?.wallet.balance ?? '0'} size="sm" />
      </div>

      {/* Stage badge */}
      <div className="mt-8 rounded-2xl bg-black/25 px-6 py-2 text-center shadow ring-1 ring-white/10">
        <span className="block font-display text-4xl font-extrabold uppercase leading-none text-white drop-shadow">
          {stage.title}
        </span>
        <span className="block font-display text-xl font-bold italic leading-none text-gold-light">
          {stage.subtitle}
        </span>
      </div>

      {/* VS */}
      <div className="mt-12 flex w-full max-w-xl items-start justify-center gap-2">
        <PlayerColumn player={me} side="left" />
        <span className="mt-8 font-display text-4xl font-extrabold italic text-gold drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
          VS
        </span>
        <PlayerColumn player={opponent} side="right" />
      </div>

      {/* Pot */}
      <div className="mt-6 flex flex-col items-center gap-1">
        <Coins size={40} className="text-gold-light drop-shadow" />
        <div className="rounded-xl bg-black/30 px-10 py-2 font-display text-xl font-bold text-white shadow-inner">
          {stage.entryFee.toLocaleString()}
        </div>
      </div>

      {/* Tip + mode */}
      <div className="mt-auto flex flex-col items-center gap-4 pt-10">
        <p className="rounded-lg bg-black/25 px-4 py-2 text-center text-sm font-semibold text-white/90">
          Tip: Lucky Shot gives you the chance to win big rewards
        </p>
        <p className="font-display text-2xl font-extrabold text-white drop-shadow">{modeLabel}</p>
        <p className="text-xs text-white/50">Starting match… (tap to continue)</p>
      </div>
    </div>
  );
};

export default MatchmakingPage;
