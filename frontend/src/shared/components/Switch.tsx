import { cn } from '@shared/utils/cn';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
}

/** Control-only toggle switch (green = on). */
export const Switch = ({ checked, onChange, disabled, label }: SwitchProps): JSX.Element => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    aria-label={label}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative h-8 w-14 shrink-0 rounded-full ring-1 ring-black/30 transition disabled:opacity-50',
      checked
        ? 'bg-gradient-to-b from-lime-400 to-green-600'
        : 'bg-gradient-to-b from-wood to-wood-dark',
    )}
  >
    <span
      className={cn(
        'absolute top-1 h-6 w-6 rounded-full bg-gradient-to-b from-white to-neutral-200 shadow-md transition-all',
        checked ? 'left-[1.75rem]' : 'left-1',
      )}
    />
  </button>
);
