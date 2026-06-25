import { cn } from '@shared/utils/cn';

const SEGMENTS = 12;

const Row = ({ label, value }: { label: string; value: number }): JSX.Element => {
  const filled = Math.round((value / 100) * SEGMENTS);
  return (
    <div className="flex items-center gap-2">
      <span className="w-10 text-[11px] font-medium text-felt/70">{label}</span>
      <div className="flex flex-1 gap-px">
        {Array.from({ length: SEGMENTS }).map((_, i) => (
          <span
            key={i}
            className={cn('h-2.5 flex-1 rounded-[1px]', i < filled ? 'bg-lime-400' : 'bg-black/40')}
          />
        ))}
      </div>
    </div>
  );
};

export const AttrBars = ({
  force,
  aim,
  time,
}: {
  force: number;
  aim: number;
  time: number;
}): JSX.Element => (
  <div className="w-full space-y-1.5">
    <Row label="Force" value={force} />
    <Row label="Aim" value={aim} />
    <Row label="Time" value={time} />
  </div>
);
