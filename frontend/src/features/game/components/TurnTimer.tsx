import { useEffect, useState } from 'react';

interface TurnTimerProps {
  /** Epoch ms the current turn ends (0 = inactive). Server-authoritative. */
  deadline: number;
  total?: number; // seconds in a full turn (for the ring sweep)
}

const R = 16;
const C = 2 * Math.PI * R;

/**
 * Server-synced countdown ring. Reads the authoritative `deadline` so every
 * client shows the same remaining time; turns amber then red as it runs out.
 */
export const TurnTimer = ({ deadline, total = 20 }: TurnTimerProps): JSX.Element | null => {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!deadline) return;
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, [deadline]);

  if (!deadline) return null;

  const msLeft = Math.max(0, deadline - now);
  const secs = Math.ceil(msLeft / 1000);
  const frac = Math.max(0, Math.min(1, msLeft / (total * 1000)));
  const color = secs <= 5 ? '#f43f5e' : secs <= 10 ? '#f59e0b' : '#a3e635';

  return (
    <div className="relative h-11 w-11" aria-label={`${secs} seconds left`}>
      <svg viewBox="0 0 40 40" className="h-full w-full -rotate-90">
        <circle cx="20" cy="20" r={R} fill="none" stroke="#00000055" strokeWidth="4" />
        <circle
          cx="20"
          cy="20"
          r={R}
          fill="none"
          stroke={color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
          style={{ transition: 'stroke-dashoffset 0.2s linear, stroke 0.3s' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center font-display text-sm font-bold"
        style={{ color }}
      >
        {secs}
      </span>
    </div>
  );
};
