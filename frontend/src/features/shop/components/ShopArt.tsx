import type { ChestTone } from '../data/shop';

const CHEST_COLORS: Record<ChestTone, { body: string; trim: string; inner: string }> = {
  green: { body: '#caa24a', trim: '#8a6a26', inner: '#39b54a' },
  blue: { body: '#c3cdd6', trim: '#8896a3', inner: '#3b82f6' },
  gold: { body: '#f2c14e', trim: '#c8881f', inner: '#a855f7' },
};

export const ChestArt = ({ tone, size = 96 }: { tone: ChestTone; size?: number }): JSX.Element => {
  const c = CHEST_COLORS[tone];
  return (
    <svg
      viewBox="0 0 100 90"
      width={size}
      height={size * 0.9}
      aria-hidden
      className="drop-shadow-lg"
    >
      <rect
        x="14"
        y="40"
        width="72"
        height="42"
        rx="6"
        fill={c.body}
        stroke={c.trim}
        strokeWidth="3"
      />
      <rect x="22" y="48" width="56" height="26" rx="3" fill={c.inner} opacity="0.85" />
      <path d="M14 40 Q14 18 50 18 Q86 18 86 40 Z" fill={c.body} stroke={c.trim} strokeWidth="3" />
      <rect x="10" y="38" width="80" height="10" rx="3" fill={c.trim} />
      <rect x="44" y="44" width="12" height="16" rx="3" fill={c.trim} />
      <circle cx="50" cy="50" r="3" fill={c.body} />
    </svg>
  );
};

export const GemPile = ({ size = 70 }: { size?: number }): JSX.Element => (
  <svg viewBox="0 0 100 70" width={size} height={size * 0.7} aria-hidden className="drop-shadow">
    {[
      { x: 50, y: 22, s: 1.1 },
      { x: 32, y: 40, s: 0.9 },
      { x: 66, y: 42, s: 0.95 },
    ].map((g, i) => (
      <g key={i} transform={`translate(${g.x} ${g.y}) scale(${g.s})`}>
        <path
          d="M-12 -4 L-6 -12 L6 -12 L12 -4 L0 12 Z"
          fill="#3b82f6"
          stroke="#1e40af"
          strokeWidth="1.5"
        />
        <path d="M-12 -4 L0 -2 L12 -4" fill="none" stroke="#93c5fd" strokeWidth="1.2" />
        <path d="M0 -2 L0 12" stroke="#1e3a8a" strokeWidth="1" />
      </g>
    ))}
  </svg>
);

export const CoinPile = ({ size = 70 }: { size?: number }): JSX.Element => (
  <svg viewBox="0 0 100 70" width={size} height={size * 0.7} aria-hidden className="drop-shadow">
    {[
      { x: 36, y: 48 },
      { x: 64, y: 48 },
      { x: 50, y: 34 },
      { x: 50, y: 22 },
    ].map((c, i) => (
      <g key={i} transform={`translate(${c.x} ${c.y})`}>
        <ellipse cx="0" cy="0" rx="16" ry="11" fill="#f5b942" stroke="#c8881f" strokeWidth="2" />
        <ellipse cx="0" cy="-2" rx="9" ry="6" fill="#ffd470" />
        <path d="M-3 -4 L0 -7 L3 -4 L1.5 0 L-1.5 0 Z" fill="#c8881f" />
      </g>
    ))}
  </svg>
);
