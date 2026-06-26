import { useEffect, useRef, useState } from 'react';

interface TurnTimerProps {
  /** Epoch ms the current turn ends (server-authoritative; 0/absent = none). */
  deadline: number;
  /** Changes whenever the turn changes — drives the local fallback reset. */
  turnKey: string;
  total?: number; // seconds in a full turn
}

const R = 16;
const C = 2 * Math.PI * R;

/**
 * Turn countdown ring. Prefers the server `deadline` (synced across clients);
 * if the server didn't supply one, falls back to a local 20s countdown that
 * resets whenever `turnKey` changes — so the timer is always visible.
 */
export const TurnTimer = ({ deadline, turnKey, total = 20 }: TurnTimerProps): JSX.Element => {
  const [now, setNow] = useState(() => Date.now());
  const localDeadlineRef = useRef(0);

  // Reset the local fallback at the start of each turn.
  useEffect(() => {
    localDeadlineRef.current = Date.now() + total * 1000;
    setNow(Date.now());
  }, [turnKey, total]);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 200);
    return () => window.clearInterval(id);
  }, []);

  const effective = deadline > 0 ? deadline : localDeadlineRef.current;
  const msLeft = Math.max(0, effective - now);
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
