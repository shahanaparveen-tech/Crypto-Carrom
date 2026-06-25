import { ChevronRight } from 'lucide-react';

import { cn } from '@shared/utils/cn';
import { CarromBoardArt } from '@shared/components';
import { type CenterAction, TONE_BG } from '../data/homeContent';

interface ActionButtonProps {
  action: CenterAction;
  onClick: (id: CenterAction['id']) => void;
}

/** A large central call-to-action banner button. */
export const ActionButton = ({ action, onClick }: ActionButtonProps): JSX.Element => {
  const Icon = action.icon;
  const isPlay = action.id === 'play';

  return (
    <button
      onClick={() => onClick(action.id)}
      className={cn(
        'group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-gradient-to-b px-5 text-left shadow-lg ring-1 ring-black/30 transition active:scale-[0.98]',
        TONE_BG[action.tone],
        isPlay ? 'py-5' : 'py-4',
      )}
    >
      {/* shine */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-white/15" />

      <span className="relative z-10">
        <span
          className={cn(
            'block font-display font-extrabold drop-shadow',
            isPlay ? 'text-3xl' : 'text-xl',
          )}
        >
          {action.title}
        </span>
        {action.subtitle && (
          <span className="mt-0.5 block text-xs font-medium opacity-80">{action.subtitle}</span>
        )}
      </span>

      <span className="relative z-10 flex items-center gap-2">
        {isPlay ? (
          <CarromBoardArt size={68} />
        ) : (
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-black/15">
            <Icon size={26} />
          </span>
        )}
        <ChevronRight size={22} className="opacity-70 transition group-hover:translate-x-0.5" />
      </span>
    </button>
  );
};
