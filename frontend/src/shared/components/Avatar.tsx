import { cn } from '@shared/utils/cn';
import { initials } from '@shared/utils/format';

interface AvatarProps {
  name: string;
  src?: string | null;
  size?: number;
  level?: number;
  className?: string;
}

export const Avatar = ({ name, src, size = 48, level, className }: AvatarProps): JSX.Element => (
  <div className="relative inline-block" style={{ width: size, height: size }}>
    <div
      className={cn(
        'flex h-full w-full items-center justify-center overflow-hidden rounded-xl border-2 border-gold/70 bg-wood font-display font-bold text-felt',
        className,
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span style={{ fontSize: size * 0.4 }}>{initials(name)}</span>
      )}
    </div>
    {typeof level === 'number' && (
      <span className="absolute -left-1 -top-2 rounded-md bg-gold px-1 text-[10px] font-bold text-maroon-dark shadow">
        {level}
      </span>
    )}
  </div>
);
