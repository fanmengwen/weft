import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';

export type HomeRunFilter = 'all' | 'succeeded' | 'failed' | 'running';

export function formatRunDuration(durationMs: number): string {
  if (durationMs < 1000) {
    return `${durationMs} ms`;
  }
  return `${(durationMs / 1000).toFixed(1)} s`;
}

export function formatRunRelativeTime(
  timestamp: number,
  locale: string,
  justNowLabel: string
): string {
  const minutes = Math.round((timestamp - Date.now()) / 60_000);
  if (Math.abs(minutes) < 1) {
    return justNowLabel;
  }
  const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, 'minute');
  }
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, 'hour');
  }
  return formatter.format(Math.round(hours / 24), 'day');
}

export function runResultPreview(record: WorkflowRunRecord): string {
  const compact = normalizeRunMarkdown(record.finalOutput).replace(/\s+/g, ' ').trim();
  if (compact) {
    return compact;
  }
  return record.logEntries.findLast((entry) => entry.level === 'error')?.raw ?? '';
}

export function normalizeRunMarkdown(content: string): string {
  const trimmed = content.trim();
  if (!trimmed.startsWith('```') || !trimmed.endsWith('```')) {
    return content;
  }
  const firstBreak = trimmed.indexOf('\n');
  if (firstBreak < 0) {
    return content;
  }
  return trimmed.slice(firstBreak + 1, -3).trim();
}

export function matchesRunFilter(record: WorkflowRunRecord, filter: HomeRunFilter): boolean {
  if (filter === 'all') {
    return true;
  }
  if (filter === 'failed') {
    return record.status === 'failed' || record.status === 'aborted';
  }
  return record.status === filter;
}

export function groupRunRecords(
  records: WorkflowRunRecord[]
): Array<{ name: string; records: WorkflowRunRecord[] }> {
  const groups = new Map<string, WorkflowRunRecord[]>();
  for (const record of records) {
    const group = groups.get(record.documentName) ?? [];
    group.push(record);
    groups.set(record.documentName, group);
  }
  return Array.from(groups, ([name, groupedRecords]) => ({ name, records: groupedRecords }));
}

export function nodeDurationMs(record: WorkflowRunRecord, nodeId: string): number | null {
  const entries = record.logEntries.filter((entry) => entry.nodeId === nodeId);
  if (entries.length < 2) {
    return null;
  }
  return Math.max(0, entries.at(-1)!.ts - entries[0].ts);
}
