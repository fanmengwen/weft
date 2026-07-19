type Translate = (key: string, fallback: string, options?: Record<string, unknown>) => string;

/**
 * Relative labels for files cards. Uses coarse buckets so UI copy matches the design
 * (hours / yesterday / days / last week) without a heavy date library.
 */
export function formatRelativeUpdatedAt(
  updatedAt: string | undefined,
  t: Translate,
  nowMs: number = Date.now()
): string {
  if (!updatedAt) {
    return t('home.autosaved', 'Autosaved');
  }
  const parsed = Date.parse(updatedAt);
  if (Number.isNaN(parsed)) {
    return t('home.autosaved', 'Autosaved');
  }

  const diffMs = Math.max(0, nowMs - parsed);
  const minute = 60_000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) {
    return t('homeFiles.relative.justNow', 'Just now');
  }
  if (diffMs < hour) {
    const minutes = Math.floor(diffMs / minute);
    return t('homeFiles.relative.minutesAgo', '{{count}} min ago', { count: minutes });
  }
  if (diffMs < day) {
    const hours = Math.floor(diffMs / hour);
    return t('homeFiles.relative.hoursAgo', '{{count}} hours ago', { count: hours });
  }
  if (diffMs < 2 * day) {
    return t('homeFiles.relative.yesterday', 'Yesterday');
  }
  if (diffMs < 7 * day) {
    const days = Math.floor(diffMs / day);
    return t('homeFiles.relative.daysAgo', '{{count}} days ago', { count: days });
  }
  if (diffMs < 14 * day) {
    return t('homeFiles.relative.lastWeek', 'Last week');
  }

  return new Date(parsed).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
