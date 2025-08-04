// src/utils/formatAgo.ts
import { formatDistanceToNow } from 'date-fns';

/**
 * Returns a human-friendly “time ago” string, e.g. “5 minutes ago”, “about 1 year ago”.
 * If you pass `undefined` or an invalid value, it returns “just now”.
 */
export function formatAgo(
  date?: Date | string | number
): string {
  if (!date) return 'just now';

  const d = 
    date instanceof Date
      ? date
      : typeof date === 'number'
        ? new Date(date)
        : new Date(date); // parses ISO or RFC strings

  // if the Date is invalid, fall back
  if (isNaN(d.getTime())) {
    return 'just now';
  }

  return formatDistanceToNow(d, { addSuffix: true });
}
