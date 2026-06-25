import { Gem } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { formatCoins } from '@shared/utils/format';

interface GemBadgeProps {
  amount: string | number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 'text-sm px-2.5 py-1',
  md: 'text-base px-3 py-1.5',
  lg: 'text-xl px-4 py-2',
};

export const GemBadge = ({ amount, size = 'md', className }: GemBadgeProps): JSX.Element => (
  <span
    className={cn(
      'inline-flex items-center gap-1.5 rounded-full bg-maroon-dark/70 font-display font-bold text-sky-200 shadow-coin',
      sizeMap[size],
      className,
    )}
  >
    <Gem
      size={size === 'lg' ? 20 : size === 'sm' ? 14 : 17}
      fill="currentColor"
      className="text-sky-300"
    />
    {formatCoins(amount)}
  </span>
);
