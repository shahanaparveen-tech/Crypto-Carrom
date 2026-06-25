import { Check, User } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { AVATARS, type AvatarOption } from '../utils/cosmetics';

interface AvatarTabProps {
  selected: AvatarOption;
  onSelect: (a: AvatarOption) => void;
}

export const AvatarTab = ({ selected, onSelect }: AvatarTabProps): JSX.Element => (
  <div>
    <p className="mb-3 text-sm text-felt/60">Pick your avatar</p>
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {AVATARS.map((a) => (
        <button
          key={a.id}
          type="button"
          onClick={() => onSelect(a)}
          className={cn(
            'relative flex aspect-square items-center justify-center rounded-2xl border-2 transition',
            a.id === selected.id ? 'border-gold' : 'border-transparent hover:border-gold/40',
          )}
          style={{ background: a.bg }}
          aria-label={a.name}
        >
          <User size={28} className="text-white/85" />
          {a.id === selected.id && (
            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-maroon-dark">
              <Check size={12} />
            </span>
          )}
        </button>
      ))}
    </div>
    <p className="mt-3 text-xs text-felt/40">
      More avatars unlock through the shop & achievements (coming soon).
    </p>
  </div>
);
