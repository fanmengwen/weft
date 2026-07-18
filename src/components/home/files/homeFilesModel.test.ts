import { beforeEach, describe, expect, it } from 'vitest';
import { setDocumentKind } from '../documentKindStorage';
import type { HomeFlowCard } from '../homeTypes';
import {
  HOME_FILES_ALL_PREVIEW_LIMIT,
  filterFlowsByQuery,
  limitForAllTab,
  partitionFlowsByKind,
  selectFlowsForTab,
  sortFlowsByUpdatedAtDesc,
} from './homeFilesModel';

function card(id: string, name: string, updatedAt?: string): HomeFlowCard {
  return {
    id,
    name,
    nodeCount: 0,
    edgeCount: 0,
    updatedAt,
    preview: null,
  };
}

describe('homeFilesModel', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('partitions charts and workflows by stored kind', () => {
    setDocumentKind('c1', 'chart');
    setDocumentKind('w1', 'workflow');
    const { charts, workflows } = partitionFlowsByKind([
      card('c1', 'A'),
      card('w1', 'B'),
      card('unknown', 'C'),
    ]);
    expect(charts.map((f) => f.id)).toEqual(['c1', 'unknown']);
    expect(workflows.map((f) => f.id)).toEqual(['w1']);
  });

  it('filters by case-insensitive name query', () => {
    const flows = [card('1', 'Order Flow'), card('2', 'Support Bot')];
    expect(filterFlowsByQuery(flows, 'order').map((f) => f.id)).toEqual(['1']);
    expect(filterFlowsByQuery(flows, '  ').map((f) => f.id)).toEqual(['1', '2']);
  });

  it('sorts by updatedAt descending, missing dates last', () => {
    const sorted = sortFlowsByUpdatedAtDesc([
      card('old', 'Old', '2026-01-01T00:00:00.000Z'),
      card('new', 'New', '2026-03-01T00:00:00.000Z'),
      card('none', 'None'),
    ]);
    expect(sorted.map((f) => f.id)).toEqual(['new', 'old', 'none']);
  });

  it('selects flows for kind tabs', () => {
    setDocumentKind('c1', 'chart');
    setDocumentKind('w1', 'workflow');
    const flows = [card('c1', 'A'), card('w1', 'B')];
    expect(selectFlowsForTab(flows, 'all')).toHaveLength(2);
    expect(selectFlowsForTab(flows, 'chart').map((f) => f.id)).toEqual(['c1']);
    expect(selectFlowsForTab(flows, 'workflow').map((f) => f.id)).toEqual(['w1']);
  });

  it('limits all-tab previews to the design density', () => {
    const flows = Array.from({ length: 5 }, (_, index) => card(`id-${index}`, `F${index}`));
    expect(limitForAllTab(flows, true)).toHaveLength(HOME_FILES_ALL_PREVIEW_LIMIT);
    expect(limitForAllTab(flows, false)).toHaveLength(5);
  });
});
