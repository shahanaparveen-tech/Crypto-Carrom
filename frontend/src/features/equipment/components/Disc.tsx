interface DiscProps {
  color: string;
  accent: string;
  size?: number;
}

/** Stylised carrom striker / disc rendered from the item's colours. */
export const Disc = ({ color, accent, size = 84 }: DiscProps): JSX.Element => (
  <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden className="drop-shadow-lg">
    <defs>
      <radialGradient id={`g-${color}-${accent}`} cx="38%" cy="34%" r="70%">
        <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
        <stop offset="35%" stopColor={color} />
        <stop offset="100%" stopColor={color} />
      </radialGradient>
    </defs>
    <circle cx="50" cy="50" r="46" fill="#00000040" />
    <circle
      cx="50"
      cy="50"
      r="44"
      fill={`url(#g-${color}-${accent})`}
      stroke={accent}
      strokeWidth="2.5"
    />
    <circle cx="50" cy="50" r="34" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.7" />
    <circle cx="50" cy="50" r="22" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.55" />
    {/* simple radial motif */}
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i * Math.PI) / 4;
      const x1 = 50 + Math.cos(a) * 12;
      const y1 = 50 + Math.sin(a) * 12;
      const x2 = 50 + Math.cos(a) * 33;
      const y2 = 50 + Math.sin(a) * 33;
      return (
        <line
          key={i}
          x1={x1}
          y1={y1}
          x2={x2}
          y2={y2}
          stroke={accent}
          strokeWidth="1.2"
          opacity="0.5"
        />
      );
    })}
    <circle cx="50" cy="50" r="9" fill={accent} />
    <circle cx="46" cy="46" r="3" fill="#ffffff" opacity="0.6" />
  </svg>
);
