import { cn } from '@shared/utils/cn';
import { formatCoins } from '@shared/utils/format';

interface CoinBadgeProps {
  amount: string | number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'text-sm px-2.5 py-1',
  md: 'text-base px-3 py-1.5',
  lg: 'text-xl px-4 py-2',
};

const CoinIcon = ({ s }: { s: number }): JSX.Element => (
  <svg viewBox="0 0 24 24" width={s} height={s} aria-hidden>
    <circle cx="12" cy="12" r="11" fill="#f5b942" stroke="#c8881f" strokeWidth="2" />
    <circle cx="12" cy="12" r="6.5" fill="#ffd470" />
    <text x="12" y="16" textAnchor="middle" fontSize="9" fontWeight="bold" fill="#9c5a25">
      ₡
    </text>
  </svg>
);

export const CoinBadge = ({ amount, size = 'md', className }: CoinBadgeProps): JSX.Element => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full bg-maroon-dark/70 font-display font-bold text-gold-light shadow-coin',
      sizeMap[size],
      className,
    )}
  >
    <CoinIcon s={size === 'lg' ? 22 : size === 'sm' ? 14 : 18} />
    {formatCoins(amount)}
  </span>
);
