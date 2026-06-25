import type { HTMLAttributes } from 'react';

import { cn } from '@shared/utils/cn';

export const Card = ({ className, ...props }: HTMLAttributes<HTMLDivElement>): JSX.Element => (
  <div
    className={cn(
      'rounded-2xl border border-gold/15 bg-maroon-light/30 p-5 shadow-panel backdrop-blur',
      className,
    )}
    {...props}
  />
);
