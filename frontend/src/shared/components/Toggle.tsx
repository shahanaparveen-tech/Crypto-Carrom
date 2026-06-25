import { cn } from '@shared/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  disabled?: boolean;
}

export const Toggle = ({ checked, onChange, label, disabled }: ToggleProps): JSX.Element => (
  <label className="flex cursor-pointer items-center justify-between py-2.5">
    <span className="text-sm text-felt/90">{label}</span>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative h-6 w-11 rounded-full transition disabled:opacity-50',
        checked ? 'bg-gold' : 'bg-maroon-dark/80 border border-gold/20',
      )}
    >
      <span
        className={cn(
          'absolute top-0.5 h-5 w-5 rounded-full bg-felt shadow transition-all',
          checked ? 'left-[22px]' : 'left-0.5',
        )}
      />
    </button>
  </label>
);
