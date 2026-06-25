import { clsx, type ClassValue } from 'clsx';

/** Conditional className joiner. */
export const cn = (...inputs: ClassValue[]): string => clsx(inputs);
