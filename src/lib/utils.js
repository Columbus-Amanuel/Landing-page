import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names, deduplicating conflicting utilities.
 * Used by every shadcn-style primitive to compose `className` props.
 *
 * @param {...(string | undefined | null | false | Record<string, boolean>)} inputs
 * @returns {string}
 */
export const cn = (...inputs) => twMerge(clsx(inputs));
