import { describe, expect, it } from 'vitest';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';
import { createEmptyFlowHistory } from '../historyState';
import type { FlowState } from '../types';
import { createWorkspaceDocumentActions } from './createWorkspaceDocumentActions';

function createDocument(id: string, name = id): FlowDocument {
  const pageId = `${id}:page:primary`;
  return {
    id,
    name,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    activePageId: pageId,
    pages: [
      {
        id: pageId,
        name: 'Page 1',
        diagramType: 'flowchart',
        updatedAt: '2026-01-01T00:00:00.000Z',
        nodes: [],
        edges: [],
        history: createEmptyFlowHistory(),
      },
    ],
  };
}

function createHarness(initial: Partial<FlowState> = {}) {
  let state = {
    documents: [createDocument('doc-a', 'Alpha'), createDocument('doc-b', 'Beta')],
    trashedDocuments: [] as FlowState['trashedDocuments'],
    activeDocumentId: 'doc-a',
    tabs: [],
    activeTabId: '',
    nodes: [],
    edges: [],
    ...initial,
  } as FlowState;

  const get = () => state;
  const set = (partial: Partial<FlowState> | ((current: FlowState) => Partial<FlowState>)) => {
    const next = typeof partial === 'function' ? partial(state) : partial;
    state = { ...state, ...next };
  };

  const actions = createWorkspaceDocumentActions(set as never, get as never);
  return { getState: () => state, actions };
}

describe('createWorkspaceDocumentActions trash', () => {
  it('soft-deletes a document into trashedDocuments', () => {
    const { getState, actions } = createHarness();

    actions.deleteDocumentRecord('doc-b');

    expect(getState().documents.map((doc) => doc.id)).toEqual(['doc-a']);
    expect(getState().trashedDocuments).toHaveLength(1);
    expect(getState().trashedDocuments[0]?.document.id).toBe('doc-b');
    expect(getState().trashedDocuments[0]?.deletedAt).toEqual(expect.any(String));
  });

  it('switches active document when the active one is soft-deleted', () => {
    const { getState, actions } = createHarness({ activeDocumentId: 'doc-a' });

    actions.deleteDocumentRecord('doc-a');

    expect(getState().activeDocumentId).toBe('doc-b');
    expect(getState().documents).toHaveLength(1);
    expect(getState().trashedDocuments[0]?.document.id).toBe('doc-a');
  });

  it('restores a trashed document into the active list', () => {
    const { getState, actions } = createHarness();
    actions.deleteDocumentRecord('doc-b');

    actions.restoreDocumentRecord('doc-b');

    expect(getState().documents.map((doc) => doc.id)).toEqual(['doc-a', 'doc-b']);
    expect(getState().trashedDocuments).toHaveLength(0);
  });

  it('permanently purges a trashed document from memory', () => {
    const { getState, actions } = createHarness();
    actions.deleteDocumentRecord('doc-b');

    actions.purgeDocumentRecord('doc-b');

    expect(getState().trashedDocuments).toHaveLength(0);
    expect(getState().documents.map((doc) => doc.id)).toEqual(['doc-a']);
  });
});
