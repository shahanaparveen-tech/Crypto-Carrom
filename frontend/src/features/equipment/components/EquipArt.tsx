import { Ban } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import type { ArtKind } from '../data/equipment';
import { Disc } from './Disc';

interface ArtProps {
  kind: ArtKind;
  color: string;
  accent: string;
  size?: number;
  dimmed?: boolean;
}

/** Glowing power ring around a pale disc. */
const PowerArt = ({ color, size }: { color: string; size: number }): JSX.Element => (
  <div className="flex items-center justify-center" style={{ width: size, height: size }}>
    <span
      className="flex items-center justify-center rounded-full"
      style={{
        width: size * 0.82,
        height: size * 0.82,
        border: `${size * 0.07}px solid ${color}`,
        boxShadow: `0 0 ${size * 0.22}px ${size * 0.04}px ${color}`,
      }}
    >
      <span
        className="rounded-full bg-felt"
        style={{
          width: size * 0.42,
          height: size * 0.42,
          boxShadow: 'inset 0 0 6px rgba(0,0,0,0.35)',
        }}
      />
    </span>
  </div>
);

/** Hex cluster of 7 coins. */
const PuckArt = ({
  color,
  accent,
  size,
}: {
  color: string;
  accent: string;
  size: number;
}): JSX.Element => {
  const r = size * 0.16;
  const ring = size * 0.27;
  const coin = (cx: number, cy: number, key: string): JSX.Element => (
    <span
      key={key}
      className="absolute rounded-full"
      style={{
        width: r * 2,
        height: r * 2,
        left: cx - r,
        top: cy - r,
        background: `radial-gradient(circle at 35% 30%, #ffffff66, ${color})`,
        border: `1.5px solid ${accent}`,
        boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
      }}
    />
  );
  const c = size / 2;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      {coin(c, c, 'center')}
      {Array.from({ length: 6 }).map((_, i) => {
        const a = (i * Math.PI) / 3 - Math.PI / 2;
        return coin(c + Math.cos(a) * ring, c + Math.sin(a) * ring, `p${i}`);
      })}
    </div>
  );
};

/** Striker with a colored motion trail. */
const TrailArt = ({
  color,
  accent,
  size,
}: {
  color: string;
  accent: string;
  size: number;
}): JSX.Element => (
  <svg viewBox="0 0 120 70" width={size * 1.3} height={size * 0.75} aria-hidden>
    <defs>
      <linearGradient id={`t-${color}-${accent}`} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={color} stopOpacity="0" />
        <stop offset="70%" stopColor={color} stopOpacity="0.9" />
        <stop offset="100%" stopColor={accent} />
      </linearGradient>
    </defs>
    <path d="M2 35 Q60 8 96 35 Q60 62 2 35 Z" fill={`url(#t-${color}-${accent})`} />
    <circle cx="96" cy="35" r="17" fill="#3a3a3a" stroke="#1f1f1f" strokeWidth="3" />
    <circle cx="90" cy="29" r="4" fill="#ffffff" opacity="0.4" />
  </svg>
);

/** Board corner with a glowing pocket. */
const PocketArt = ({
  color,
  accent,
  size,
}: {
  color: string;
  accent: string;
  size: number;
}): JSX.Element => (
  <svg viewBox="0 0 100 80" width={size * 1.2} height={size} aria-hidden>
    <rect x="0" y="0" width="100" height="16" rx="4" fill="#9c5a25" />
    <rect x="0" y="0" width="16" height="80" rx="4" fill="#9c5a25" />
    <rect x="16" y="16" width="84" height="64" fill="#e9c89a" />
    <circle cx="30" cy="30" r="18" fill={color} opacity="0.5" />
    <circle cx="30" cy="30" r="13" fill="#120a06" stroke={accent} strokeWidth="3" />
    <circle cx="26" cy="26" r="3" fill="#ffffff" opacity="0.4" />
  </svg>
);

/** "No effect" placeholder (recessed slot with a slash). */
const NoneArt = ({ size }: { size: number }): JSX.Element => (
  <span
    className="flex items-center justify-center rounded-xl bg-black/20 text-felt/30 ring-1 ring-black/30"
    style={{ width: size, height: size }}
  >
    <Ban size={size * 0.42} />
  </span>
);

export const EquipArt = ({ kind, color, accent, size = 84, dimmed }: ArtProps): JSX.Element => {
  const art = ((): JSX.Element => {
    switch (kind) {
      case 'disc':
        return <Disc color={color} accent={accent} size={size} />;
      case 'power':
        return <PowerArt color={color} size={size} />;
      case 'puck':
        return <PuckArt color={color} accent={accent} size={size} />;
      case 'trail':
        return <TrailArt color={color} accent={accent} size={size} />;
      case 'pocket':
        return <PocketArt color={color} accent={accent} size={size} />;
      case 'none':
        return <NoneArt size={size} />;
    }
  })();
  return (
    <div className={cn('flex items-center justify-center', dimmed && 'opacity-70')}>{art}</div>
  );
};
