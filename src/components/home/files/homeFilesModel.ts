import type { WorkflowRunRecord } from '@/workflow/history/workflowRunHistoryStore';
import { getDocumentKind, type DocumentKind } from '../documentKindStorage';
import type { HomeFlowCard } from '../homeTypes';

export type HomeFilesKindTab = 'all' | DocumentKind;
export type HomeFilesLayout = 'grid' | 'list';

/** Preview count per kind on the All tab (matches design sample density). */
export const HOME_FILES_ALL_PREVIEW_LIMIT = 3;

export function partitionFlowsByKind(flows: HomeFlowCard[]): {
  charts: HomeFlowCard[];
  workflows: HomeFlowCard[];
} {
  const charts: HomeFlowCard[] = [];
  const workflows: HomeFlowCard[] = [];
  for (const flow of flows) {
    if (getDocumentKind(flow.id) === 'workflow') {
      workflows.push(flow);
    } else {
      charts.push(flow);
    }
  }
  return { charts, workflows };
}

export function filterFlowsByQuery(flows: HomeFlowCard[], query: string): HomeFlowCard[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return flows;
  }
  return flows.filter((flow) => flow.name.toLowerCase().includes(normalized));
}

export function sortFlowsByUpdatedAtDesc(flows: HomeFlowCard[]): HomeFlowCard[] {
  return [...flows].sort((left, right) => {
    const leftTime = parseUpdatedAt(left.updatedAt);
    const rightTime = parseUpdatedAt(right.updatedAt);
    return rightTime - leftTime;
  });
}

export function selectFlowsForTab(
  flows: HomeFlowCard[],
  tab: HomeFilesKindTab
): HomeFlowCard[] {
  if (tab === 'all') {
    return flows;
  }
  return flows.filter((flow) => getDocumentKind(flow.id) === tab);
}

export function limitForAllTab(flows: HomeFlowCard[], isAllTab: boolean): HomeFlowCard[] {
  if (!isAllTab) {
    return flows;
  }
  return flows.slice(0, HOME_FILES_ALL_PREVIEW_LIMIT);
}

/** Records are stored newest-first, so the first match is the latest run. */
export function getLatestRunStatus(
  documentId: string,
  records: WorkflowRunRecord[]
): WorkflowRunRecord['status'] | undefined {
  return records.find((record) => record.documentId === documentId)?.status;
}

function parseUpdatedAt(updatedAt: string | undefined): number {
  if (!updatedAt) {
    return 0;
  }
  const parsed = Date.parse(updatedAt);
  return Number.isNaN(parsed) ? 0 : parsed;
}
