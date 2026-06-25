import { Check, Sparkles, User } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { FRAMES, type FrameOption, type AvatarOption } from '../utils/cosmetics';

interface FramesTabProps {
  avatar: AvatarOption;
  selected: FrameOption;
  onSelect: (f: FrameOption) => void;
}

export const FramesTab = ({ avatar, selected, onSelect }: FramesTabProps): JSX.Element => (
  <div>
    <p className="mb-3 flex items-center gap-1 text-sm text-felt/60">
      <Sparkles size={15} className="text-gold-light" /> Choose a frame
    </p>
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
      {FRAMES.map((f) => (
        <button
          key={f.id}
          type="button"
          onClick={() => onSelect(f)}
          className="flex flex-col items-center gap-1.5"
          aria-label={f.name}
        >
          <span
            className={cn(
              'relative flex h-16 w-16 items-center justify-center rounded-2xl border-4',
              f.ring,
              f.id === selected.id ? 'ring-2 ring-gold ring-offset-2 ring-offset-maroon' : '',
            )}
            style={{ background: avatar.bg }}
          >
            <User size={24} className="text-white/85" />
            {f.id === selected.id && (
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-maroon-dark">
                <Check size={12} />
              </span>
            )}
          </span>
          <span className="text-[11px] text-felt/60">{f.name}</span>
        </button>
      ))}
    </div>
  </div>
);
