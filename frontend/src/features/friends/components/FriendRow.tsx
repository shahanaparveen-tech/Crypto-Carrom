import { Avatar } from '@shared/components';

interface FriendRowProps {
  name: string;
  level: number;
  subtitle?: string;
  /** Right-aligned action buttons supplied by the caller. */
  children?: React.ReactNode;
}

export const FriendRow = ({ name, level, subtitle, children }: FriendRowProps): JSX.Element => (
  <div className="flex items-center gap-3 rounded-2xl border border-gold/15 bg-gradient-to-b from-wood/40 to-wood-dark/30 px-3 py-2.5 shadow-panel">
    <Avatar name={name} size={48} level={level} />
    <div className="min-w-0 flex-1">
      <p className="truncate font-display font-semibold text-felt">{name}</p>
      {subtitle && <p className="truncate text-xs text-gold-light/80">{subtitle}</p>}
    </div>
    {children && <div className="flex shrink-0 items-center gap-2">{children}</div>}
  </div>
);
