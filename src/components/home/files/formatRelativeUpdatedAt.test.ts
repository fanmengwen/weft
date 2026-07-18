import { describe, expect, it } from 'vitest';
import { formatRelativeUpdatedAt } from './formatRelativeUpdatedAt';

const t = (key: string, fallback: string, options?: Record<string, unknown>): string => {
  if (options && 'count' in options) {
    return fallback.replace('{{count}}', String(options.count));
  }
  return fallback;
};

describe('formatRelativeUpdatedAt', () => {
  const now = Date.parse('2026-03-10T12:00:00.000Z');

  it('returns autosaved for missing dates', () => {
    expect(formatRelativeUpdatedAt(undefined, t, now)).toBe('Autosaved');
  });

  it('uses hour / yesterday / day buckets', () => {
    expect(formatRelativeUpdatedAt('2026-03-10T10:00:00.000Z', t, now)).toBe('2 hours ago');
    expect(formatRelativeUpdatedAt('2026-03-09T12:00:00.000Z', t, now)).toBe('Yesterday');
    expect(formatRelativeUpdatedAt('2026-03-07T12:00:00.000Z', t, now)).toBe('3 days ago');
    expect(formatRelativeUpdatedAt('2026-03-02T12:00:00.000Z', t, now)).toBe('Last week');
  });
});
