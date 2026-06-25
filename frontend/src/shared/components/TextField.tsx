import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@shared/utils/cn';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="mb-1.5 block text-sm font-medium text-felt/90">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-maroon-dark/60 px-4 py-2.5 text-felt placeholder:text-felt/40',
            'outline-none transition focus:ring-2 focus:ring-gold/60',
            error ? 'border-coin-queen' : 'border-gold/20 focus:border-gold/50',
            className,
          )}
          aria-invalid={Boolean(error)}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-coin-queen">{error}</p>
        ) : hint ? (
          <p className="mt-1 text-xs text-felt/50">{hint}</p>
        ) : null}
      </div>
    );
  },
);

TextField.displayName = 'TextField';
