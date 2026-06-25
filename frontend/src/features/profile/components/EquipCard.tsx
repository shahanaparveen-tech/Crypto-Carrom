import type { ReactNode } from 'react';
import { Pencil } from 'lucide-react';

import { cn } from '@shared/utils/cn';

interface EquipCardProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  children?: ReactNode;
  className?: string;
}

/** A customisable slot card (striker / goti / medals / tokens) with an edit pencil. */
export const EquipCard = ({
  icon,
  title,
  subtitle,
  onEdit,
  children,
  className,
}: EquipCardProps): JSX.Element => (
  <div className={cn('rounded-2xl border border-gold/15 bg-maroon-light/30 p-4', className)}>
    <div className="flex items-center gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-maroon-dark/50 text-gold-light">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display font-bold text-felt">{title}</p>
        {subtitle && <p className="text-xs uppercase tracking-wide text-felt/45">{subtitle}</p>}
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          aria-label={`Edit ${title}`}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold/15 text-gold-light transition hover:bg-gold/25"
        >
          <Pencil size={15} />
        </button>
      )}
    </div>
    {children && <div className="mt-3">{children}</div>}
  </div>
);
