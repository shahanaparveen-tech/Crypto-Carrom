import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ShieldCheck, Play } from 'lucide-react';

import { Button } from '@shared/components';
import { cn } from '@shared/utils/cn';
import { ROUTES } from '@app/config/routes.constants';
import { STAGES, MODES, type GameMode } from '../data/stages';
import { StageCard } from '../components/StageCard';

const wrap = (i: number, n: number): number => ((i % n) + n) % n;

export const StagesPage = (): JSX.Element => {
  const navigate = useNavigate();
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<GameMode>('disc');

  const n = STAGES.length;
  const stage = STAGES[index]!;
  const prevStage = STAGES[wrap(index - 1, n)]!;
  const nextStage = STAGES[wrap(index + 1, n)]!;

  const go = (dir: -1 | 1): void => setIndex((i) => wrap(i + dir, n));

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-4">
      {/* Collect rewards banner */}
      <button
        onClick={() => navigate(ROUTES.WALLET)}
        className="relative mx-auto mb-6 flex w-full max-w-md items-center justify-center gap-2 rounded-2xl border-2 border-gold/60 bg-gradient-to-b from-gold-light via-gold to-gold-dark py-3 font-display text-xl font-extrabold text-maroon-dark shadow-panel transition hover:brightness-105 active:scale-[0.99]"
      >
        <ShieldCheck size={22} />
        Collect Rewards
      </button>

      {/* Carousel */}
      <div className="flex items-center justify-center gap-2 sm:gap-4">
        <button
          onClick={() => go(-1)}
          aria-label="Previous stage"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow ring-1 ring-black/25 transition hover:brightness-105 active:scale-95"
        >
          <ChevronLeft size={26} />
        </button>

        {/* peek (prev) */}
        <button
          onClick={() => go(-1)}
          aria-label={`Select ${prevStage.title}`}
          className="hidden h-[28rem] w-40 shrink-0 overflow-hidden rounded-3xl opacity-50 transition hover:opacity-70 xl:block"
        >
          <div className="w-[24rem]">
            <StageCard stage={prevStage} />
          </div>
        </button>

        <div className="w-full max-w-md">
          <StageCard stage={stage} />
        </div>

        {/* peek (next) */}
        <button
          onClick={() => go(1)}
          aria-label={`Select ${nextStage.title}`}
          className="hidden h-[28rem] w-40 shrink-0 overflow-hidden rounded-3xl opacity-50 transition hover:opacity-70 xl:block"
        >
          <div className="-ml-[20rem] w-[24rem]">
            <StageCard stage={nextStage} />
          </div>
        </button>

        <button
          onClick={() => go(1)}
          aria-label="Next stage"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-b from-gold-light to-gold-dark text-maroon-dark shadow ring-1 ring-black/25 transition hover:brightness-105 active:scale-95"
        >
          <ChevronRight size={26} />
        </button>
      </div>

      {/* Dots */}
      <div className="mt-4 flex justify-center gap-2">
        {STAGES.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setIndex(i)}
            aria-label={`Go to ${s.title}`}
            className={cn(
              'h-2.5 rounded-full transition-all',
              i === index ? 'w-6 bg-gold' : 'w-2.5 bg-felt/30 hover:bg-felt/50',
            )}
          />
        ))}
      </div>

      {/* Select mode */}
      <div className="mx-auto mt-6 max-w-md">
        <p className="mb-2 text-center font-display text-sm font-bold uppercase tracking-wide text-felt/70">
          Select Mode
        </p>
        <div className="grid grid-cols-3 overflow-hidden rounded-2xl border border-gold/20 bg-maroon-dark/40 p-1">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={cn(
                'rounded-xl py-2.5 font-display text-sm font-bold transition',
                mode === m.id
                  ? 'bg-gradient-to-b from-lime-400 to-green-600 text-white shadow'
                  : 'text-felt/65 hover:text-felt',
              )}
            >
              {m.label}
            </button>
          ))}
        </div>

        <Button
          size="lg"
          fullWidth
          className="mt-4"
          onClick={() => navigate(ROUTES.MATCHMAKING, { state: { stageId: stage.id, mode } })}
        >
          <Play size={18} fill="currentColor" /> Play · {stage.entryFee.toLocaleString()} coins
        </Button>
      </div>
    </div>
  );
};

export default StagesPage;
