import { cn } from '@shared/utils/cn';

export type PillTone = 'green' | 'blue' | 'red' | 'orange' | 'apple' | 'gold';

const TONE: Record<PillTone, string> = {
  green: 'from-lime-400 via-green-500 to-green-700 text-white',
  blue: 'from-sky-400 via-blue-500 to-blue-700 text-white',
  red: 'from-rose-500 via-red-600 to-red-800 text-white',
  orange: 'from-amber-400 via-orange-500 to-orange-700 text-white',
  apple: 'from-neutral-700 via-neutral-800 to-black text-white',
  gold: 'from-gold-light via-gold to-gold-dark text-maroon-dark',
};

interface ActionPillProps {
  tone: PillTone;
  children: React.ReactNode;
  icon?: JSX.Element;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  size?: 'sm' | 'md';
  className?: string;
}

/** Glossy gradient action button used across feature screens. */
export const ActionPill = ({
  tone,
  children,
  icon,
  onClick,
  disabled,
  title,
  size = 'md',
  className,
}: ActionPillProps): JSX.Element => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={cn(
      'relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-b font-display font-bold shadow-lg ring-1 ring-black/25 transition hover:brightness-105 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:brightness-100',
      size === 'sm' ? 'min-w-[5rem] px-3 py-1.5 text-xs' : 'min-w-[7.5rem] px-5 py-2.5 text-sm',
      TONE[tone],
      className,
    )}
  >
    <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/20" />
    <span className="relative z-10 inline-flex items-center gap-2">
      {icon}
      {children}
    </span>
  </button>
);
