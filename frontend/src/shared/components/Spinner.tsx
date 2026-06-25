import { cn } from '@shared/utils/cn';

export const Spinner = ({ className }: { className?: string }): JSX.Element => (
  <span
    className={cn(
      'inline-block h-6 w-6 animate-spin rounded-full border-2 border-gold/40 border-t-gold',
      className,
    )}
  />
);

export const FullPageSpinner = (): JSX.Element => (
  <div className="flex min-h-screen items-center justify-center bg-maroon-radial">
    <Spinner className="h-10 w-10" />
  </div>
);
