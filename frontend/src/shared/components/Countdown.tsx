import { useEffect, useRef, useState } from 'react';

interface CountdownProps {
  /** Total duration in seconds from first mount. */
  seconds: number;
  /** Compact "Dd Hh" form vs full "Mm Ss". */
  compact?: boolean;
  className?: string;
  /** Fired once the timer reaches zero. */
  onComplete?: () => void;
}

const pad = (n: number): string => String(n).padStart(2, '0');

const format = (total: number, compact: boolean): string => {
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;

  if (compact) {
    if (d > 0) return `${d}d ${h}h`;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m ${pad(s)}s`;
  }
  if (d > 0) return `${d}d ${pad(h)}h ${pad(m)}m`;
  if (h > 0) return `${h}h ${pad(m)}m ${pad(s)}s`;
  return `${pad(m)}m ${pad(s)}s`;
};

/** Live ticking countdown. Anchors to a target time on first mount. */
export const Countdown = ({
  seconds,
  compact = false,
  className,
  onComplete,
}: CountdownProps): JSX.Element => {
  const targetRef = useRef<number>(Date.now() + seconds * 1000);
  const [remaining, setRemaining] = useState<number>(seconds);
  const doneRef = useRef(false);

  useEffect(() => {
    const tick = (): void => {
      const left = Math.max(0, Math.round((targetRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left === 0 && !doneRef.current) {
        doneRef.current = true;
        onComplete?.();
      }
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [onComplete]);

  return <span className={className}>{format(remaining, compact)}</span>;
};
