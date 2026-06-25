/** Decorative (non-interactive) carrom board, used on the lobby/home screen. */
export const CarromBoardArt = ({ size = 280 }: { size?: number }): JSX.Element => {
  const pocket = (cx: number, cy: number) => (
    <circle cx={cx} cy={cy} r="16" fill="#1a0f08" stroke="#3a2412" strokeWidth="2" />
  );
  // central coin cluster (6 around 1, alternating colors + red queen)
  const cluster = [
    { x: 0, y: -26, c: '#1f2937' },
    { x: 22, y: -13, c: '#f4f1e8' },
    { x: 22, y: 13, c: '#1f2937' },
    { x: 0, y: 26, c: '#f4f1e8' },
    { x: -22, y: 13, c: '#1f2937' },
    { x: -22, y: -13, c: '#f4f1e8' },
  ];

  return (
    <svg viewBox="0 0 300 300" width={size} height={size} aria-hidden className="drop-shadow-2xl">
      <rect x="6" y="6" width="288" height="288" rx="18" fill="#6e3f18" />
      <rect x="22" y="22" width="256" height="256" rx="8" fill="#e9c89a" />
      <rect x="34" y="34" width="232" height="232" fill="none" stroke="#b9893f" strokeWidth="2" />
      {/* corner circles */}
      {[
        [54, 54],
        [246, 54],
        [54, 246],
        [246, 246],
      ].map(([x, y]) => (
        <circle
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          r="16"
          fill="none"
          stroke="#c8881f"
          strokeWidth="3"
        />
      ))}
      {/* center circle */}
      <circle cx="150" cy="150" r="46" fill="none" stroke="#b9893f" strokeWidth="2" />
      <circle cx="150" cy="150" r="10" fill="none" stroke="#d4271c" strokeWidth="2" />
      {/* pockets */}
      {pocket(30, 30)}
      {pocket(270, 30)}
      {pocket(30, 270)}
      {pocket(270, 270)}
      {/* coins */}
      <circle cx="150" cy="150" r="9" fill="#d4271c" />
      {cluster.map((c, i) => (
        <circle key={i} cx={150 + c.x} cy={150 + c.y} r="9" fill={c.c} />
      ))}
      {/* striker */}
      <circle cx="150" cy="252" r="11" fill="#19b3c4" stroke="#0e7c8a" strokeWidth="2" />
    </svg>
  );
};
