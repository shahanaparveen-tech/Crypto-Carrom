import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Zap, Bot } from 'lucide-react';

import { Button, CarromBoardArt } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { ROUTES } from '@app/config/routes.constants';
import { DIFFICULTIES, DIFFICULTY, type Difficulty } from '@features/game/ai/aiPlayer';

/** Hero "Play" panel — the primary call to action on the desktop home. */
export const FeaturedPlay = (): JSX.Element => {
  const navigate = useNavigate();
  const [pickAi, setPickAi] = useState(false);

  const playAi = (difficulty: Difficulty): void => {
    navigate(ROUTES.PRACTICE, { state: { ai: true, difficulty } });
  };

  return (
    <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl border border-sky-300/30 bg-gradient-to-br from-sky-500 via-sky-600 to-sky-800 p-6 shadow-panel sm:flex-row sm:items-center">
      {/* shine */}
      <span className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-white/10" />

      <div className="relative z-10 max-w-sm">
        <span className="inline-flex items-center gap-1 rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-sky-100">
          <Zap size={13} /> Quick play
        </span>
        <h1 className="mt-3 font-display text-4xl font-extrabold text-white drop-shadow">
          Play Carrom
        </h1>
        <p className="mt-1 text-sm text-sky-100/90">
          Jump straight onto the board — flick the striker, pocket your coins and the Queen.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button size="lg" onClick={() => navigate(ROUTES.STAGES)}>
            <Play size={18} fill="currentColor" /> Play now
          </Button>
          <Button size="lg" variant="secondary" onClick={() => setPickAi((v) => !v)}>
            <Bot size={18} /> Play vs Computer
          </Button>
        </div>

        {pickAi && (
          <div className="mt-4 rounded-2xl bg-black/25 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sky-100/80">
              Choose difficulty
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {DIFFICULTIES.map((d) => (
                <button
                  key={d}
                  onClick={() => playAi(d)}
                  className={cn(
                    'rounded-xl px-3 py-2 font-display text-sm font-bold text-white shadow ring-1 ring-black/20 transition hover:brightness-110 active:scale-95',
                    d === 'easy' && 'bg-gradient-to-b from-lime-400 to-green-600',
                    d === 'medium' && 'bg-gradient-to-b from-amber-400 to-orange-600',
                    d === 'hard' && 'bg-gradient-to-b from-orange-500 to-red-600',
                    d === 'expert' && 'bg-gradient-to-b from-rose-500 to-purple-700',
                  )}
                >
                  {DIFFICULTY[d].label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="relative z-10 mx-auto mt-6 shrink-0 sm:mt-0">
        <CarromBoardArt size={200} />
      </div>
    </div>
  );
};
