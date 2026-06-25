import { Gem } from 'lucide-react';

interface SettingsRowProps {
  icon?: JSX.Element;
  label: string;
  /** Optional secondary line under the label. */
  hint?: React.ReactNode;
  /** Shows "Reward N 💎" under the label. */
  reward?: number;
  /** Red "!" badge in the corner. */
  alert?: boolean;
  /** The control / action on the right. */
  children: React.ReactNode;
}

/** A single labelled settings row with a right-aligned control. */
export const SettingsRow = ({
  icon,
  label,
  hint,
  reward,
  alert,
  children,
}: SettingsRowProps): JSX.Element => (
  <div className="relative flex items-center justify-between gap-4 rounded-2xl border border-gold/15 bg-gradient-to-b from-wood/40 to-wood-dark/30 px-4 py-3 shadow-panel">
    {alert && (
      <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[11px] font-bold text-white ring-2 ring-maroon-dark">
        !
      </span>
    )}

    <div className="flex min-w-0 items-center gap-3">
      {icon && (
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/20 text-felt">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <p className="truncate font-display font-semibold text-felt">{label}</p>
        {reward !== undefined && (
          <p className="flex items-center gap-1 text-xs font-semibold text-gold-light">
            Reward {reward} <Gem size={13} className="text-sky-300" fill="currentColor" />
          </p>
        )}
        {hint && <p className="truncate text-xs text-felt/55">{hint}</p>}
      </div>
    </div>

    <div className="shrink-0">{children}</div>
  </div>
);
