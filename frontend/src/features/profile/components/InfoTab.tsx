import { useState } from 'react';
import {
  Zap,
  Target,
  Clock,
  CircleDot,
  Medal,
  Coins,
  Gamepad2,
  Percent,
  Flame,
  Crown,
  Globe,
  Flag,
  Check,
  Trophy,
} from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { formatCoins } from '@shared/utils/format';
import { EquipCard } from './EquipCard';
import { STRIKERS, COINS, type StrikerOption, type CoinOption } from '../utils/cosmetics';

export interface ProfileStats {
  gamesWon: number;
  winRate: string;
  currentStreak: number;
  bestStreak: number;
  worldRank: string;
  countryRank: string;
}

interface InfoTabProps {
  striker: StrikerOption;
  coin: CoinOption;
  onSelectStriker: (s: StrikerOption) => void;
  onSelectCoin: (c: CoinOption) => void;
  totalWinnings: string;
  stats: ProfileStats;
}

type Editing = 'striker' | 'coin' | 'medals' | 'tokens' | null;

const AttrBar = ({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: number;
}): JSX.Element => (
  <div className="flex items-center gap-2">
    <span className="flex w-14 items-center gap-1 text-[11px] uppercase tracking-wide text-felt/50">
      {icon}
      {label}
    </span>
    <div className="h-2 flex-1 overflow-hidden rounded-full bg-maroon-dark">
      <div className="h-full rounded-full bg-gold-gradient" style={{ width: `${value}%` }} />
    </div>
    <span className="w-7 text-right text-[11px] font-semibold text-felt/70">{value}</span>
  </div>
);

const StatTile = ({
  icon,
  label,
  value,
}: {
  icon: JSX.Element;
  label: string;
  value: string | number;
}): JSX.Element => (
  <div className="flex flex-col items-center gap-1 rounded-xl bg-maroon-dark/40 px-2 py-3 text-center">
    <span className="text-gold-light">{icon}</span>
    <span className="font-display text-lg font-bold text-felt">{value}</span>
    <span className="text-[10px] uppercase leading-tight tracking-wide text-felt/45">{label}</span>
  </div>
);

export const InfoTab = ({
  striker,
  coin,
  onSelectStriker,
  onSelectCoin,
  totalWinnings,
  stats,
}: InfoTabProps): JSX.Element => {
  const [editing, setEditing] = useState<Editing>(null);

  return (
    <div className="space-y-4">
      {/* Striker */}
      <EquipCard
        icon={<Zap size={20} />}
        title={`${striker.name} ${striker.tier}`}
        subtitle="Striker"
        onEdit={() => setEditing(editing === 'striker' ? null : 'striker')}
      >
        <div className="space-y-2">
          <AttrBar icon={<Zap size={12} />} label="Force" value={striker.force} />
          <AttrBar icon={<Target size={12} />} label="Aim" value={striker.aim} />
          <AttrBar icon={<Clock size={12} />} label="Time" value={striker.time} />
        </div>
      </EquipCard>

      {editing === 'striker' && (
        <div className="grid grid-cols-2 gap-2">
          {STRIKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => {
                onSelectStriker(s);
                setEditing(null);
              }}
              className={cn(
                'rounded-xl border p-3 text-left transition',
                s.id === striker.id
                  ? 'border-gold bg-gold/10'
                  : 'border-gold/15 bg-maroon-dark/30 hover:border-gold/40',
              )}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-felt">{s.name}</span>
                {s.id === striker.id && <Check size={15} className="text-gold-light" />}
              </div>
              <span className="text-[10px] uppercase tracking-wide text-felt/45">{s.tier}</span>
            </button>
          ))}
        </div>
      )}

      {/* Goti / coin */}
      <EquipCard
        icon={<CircleDot size={20} />}
        title={`${coin.name} ${coin.tier}`}
        subtitle="Goti (coin)"
        onEdit={() => setEditing(editing === 'coin' ? null : 'coin')}
      >
        <div className="flex items-center gap-2">
          <span
            className="h-7 w-7 rounded-full border border-black/30"
            style={{ background: coin.color }}
          />
          <span className="text-sm text-felt/60">Equipped coin</span>
        </div>
      </EquipCard>

      {editing === 'coin' && (
        <div className="flex flex-wrap gap-2">
          {COINS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => {
                onSelectCoin(c);
                setEditing(null);
              }}
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 transition',
                c.id === coin.id
                  ? 'border-gold bg-gold/10'
                  : 'border-gold/15 bg-maroon-dark/30 hover:border-gold/40',
              )}
            >
              <span
                className="h-5 w-5 rounded-full border border-black/30"
                style={{ background: c.color }}
              />
              <span className="text-sm text-felt">{c.name}</span>
            </button>
          ))}
        </div>
      )}

      {/* Medals */}
      <EquipCard
        icon={<Medal size={20} />}
        title="Medals"
        subtitle="Achievements"
        onEdit={() => setEditing(editing === 'medals' ? null : 'medals')}
      >
        <div className="flex gap-2">
          {[Crown, Trophy, Medal].map((Ic, i) => (
            <span
              key={i}
              className="flex h-9 w-9 items-center justify-center rounded-lg bg-maroon-dark/50 text-gold-light"
            >
              <Ic size={18} />
            </span>
          ))}
          <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-dashed border-gold/30 text-felt/30">
            +
          </span>
        </div>
      </EquipCard>

      {editing === 'medals' && (
        <p className="rounded-xl bg-gold/5 px-3 py-2 text-xs text-felt/50">
          Medal showcase is coming with the achievements system.
        </p>
      )}

      {/* Album tokens */}
      <EquipCard
        icon={<Coins size={20} />}
        title="Album Tokens"
        subtitle="Collectibles"
        onEdit={() => setEditing(editing === 'tokens' ? null : 'tokens')}
      >
        <div className="flex items-center gap-2 text-sm text-felt/70">
          <Coins size={16} className="text-gold-light" /> 0 tokens collected
        </div>
      </EquipCard>

      {editing === 'tokens' && (
        <p className="rounded-xl bg-gold/5 px-3 py-2 text-xs text-felt/50">
          Token album unlocks with the collectibles system.
        </p>
      )}

      {/* Total winnings */}
      <div className="flex items-center justify-between rounded-2xl border border-gold/20 bg-gold/5 px-4 py-3">
        <span className="text-sm font-medium text-felt/80">Total winnings</span>
        <span className="flex items-center gap-1.5 font-display text-lg font-bold text-gold-light">
          <Coins size={18} />
          {formatCoins(totalWinnings)}
        </span>
      </div>

      {/* Stats frame */}
      <div className="rounded-2xl border border-gold/15 bg-maroon-light/30 p-4">
        <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-felt/60">
          Career stats
        </h3>
        <div className="grid grid-cols-3 gap-2">
          <StatTile icon={<Gamepad2 size={18} />} label="Games Won" value={stats.gamesWon} />
          <StatTile icon={<Percent size={18} />} label="Win Rate" value={stats.winRate} />
          <StatTile icon={<Flame size={18} />} label="Win Streak" value={stats.currentStreak} />
          <StatTile icon={<Crown size={18} />} label="Best Streak" value={stats.bestStreak} />
          <StatTile icon={<Globe size={18} />} label="World Rank" value={stats.worldRank} />
          <StatTile icon={<Flag size={18} />} label="Country Rank" value={stats.countryRank} />
        </div>
      </div>
    </div>
  );
};
