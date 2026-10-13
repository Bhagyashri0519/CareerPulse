/**
 * formatters.ts
 * Pure utility functions for formatting values throughout the UI.
 */

/** Format a 0-100 skill level into a human-readable label. */
export function skillLevelLabel(level: number): string {
  if (level >= 90) return 'Expert';
  if (level >= 75) return 'Advanced';
  if (level >= 55) return 'Intermediate';
  if (level >= 30) return 'Beginner';
  return 'Novice';
}

/** Clamp a number between min and max, inclusive. */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/** Format a duration in hours as a readable string, e.g. "1h 30m". */
export function formatDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

/** Capitalise the first letter of a string. */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}
