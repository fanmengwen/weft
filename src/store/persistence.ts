import { DEFAULT_DIAGRAM_TYPE } from '@/services/diagramDocument';
import { clonePlaybackState, sanitizePlaybackState } from '@/services/playback/model';
import type { FlowTab } from '@/lib/types';
import { isDiagramType } from '@/lib/types';
import { sanitizeAISettings } from './aiSettings';
import { loadPersistedAISettings, persistAISettings } from './aiSettingsPersistence';
import { withSectionDefaults, ensureParentsBeforeChildren } from '@/hooks/node-operations/utils';
import { nowIso } from '@/lib/date';
import { createEmptyFlowHistory } from './historyState';
import {
  parsePersistedAISettings,
  parsePersistedViewSettings,
  persistedFlowHydrationSchema,
  persistedLayerSchema,
  persistedTabBaseSchema,
} from './persistenceSchemas';
import {
  DEFAULT_DESIGN_SYSTEM,
  INITIAL_GLOBAL_EDGE_OPTIONS,
  INITIAL_LAYERS,
  INITIAL_VIEW_SETTINGS,
} from './defaults';
import type { FlowState } from './types';

export type PersistedFlowStateSlice = Pick<
  FlowState,
  | 'designSystems'
  | 'activeDesignSystemId'
  | 'viewSettings'
  | 'globalEdgeOptions'
  | 'layers'
  | 'activeLayerId'
>;

export type PersistedFlowStateHydration = Partial<
  Pick<
    FlowState,
    | 'designSystems'
    | 'activeDesignSystemId'
    | 'viewSettings'
    | 'globalEdgeOptions'
    | 'layers'
    | 'activeLayerId'
    | 'documents'
    | 'trashedDocuments'
    | 'activeDocumentId'
    | 'tabs'
    | 'activeTabId'
    | 'aiSettings'
  >
>;

const DEFAULT_DESIGN_SYSTEM_ID = 'default';
const DEFAULT_LAYER_ID = 'default';
const EMPTY_WORKSPACE_ID = '';

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function isPersistedLayerParseSuccess(
  result: ReturnType<typeof persistedLayerSchema.safeParse>
): result is { success: true; data: typeof persistedLayerSchema._output } {
  return result.success;
}

function sanitizePersistedHistoryEntry(entry: unknown): FlowTab['history']['past'][number] | null {
  if (!isRecord(entry)) {
    return null;
  }

  return {
    nodes: Array.isArray(entry.nodes) ? entry.nodes.map(sanitizePersistedNode) : [],
    edges: Array.isArray(entry.edges) ? entry.edges.map(sanitizePersistedEdge) : [],
  };
}

function sanitizePersistedHistory(history: unknown): FlowTab['history'] {
  if (!isRecord(history)) {
    return createEmptyFlowHistory();
  }

  const past = Array.isArray(history.past)
    ? history.past
        .map((entry) => sanitizePersistedHistoryEntry(entry))
        .filter((entry): entry is FlowTab['history']['past'][number] => entry !== null)
    : [];
  const future = Array.isArray(history.future)
    ? history.future
        .map((entry) => sanitizePersistedHistoryEntry(entry))
        .filter((entry): entry is FlowTab['history']['future'][number] => entry !== null)
    : [];

  return { past, future };
}

// Diagram families retired from the editor are downgraded on load so
// documents saved before their node and edge components were removed keep rendering.
const RETIRED_NODE_TYPE_DOWNGRADES: Partial<Record<string, 'process' | 'annotation' | 'section'>> = {
  class: 'process',
  er_entity: 'process',
  mindmap: 'process',
  journey: 'process',
  sequence_participant: 'process',
  browser: 'process',
  mobile: 'process',
  text: 'annotation',
  image: 'annotation',
  sequence_note: 'annotation',
  swimlane: 'section',
};

export function downgradeRetiredNodeFamily(
  node: FlowTab['nodes'][number]
): FlowTab['nodes'][number] {
  const downgradedType = node.type ? RETIRED_NODE_TYPE_DOWNGRADES[node.type] : undefined;
  if (!downgradedType) {
    return node;
  }

  const data = { ...node.data };
  if (downgradedType === 'process') {
    data.shape = 'rounded';
  }
  if (downgradedType === 'annotation' && typeof data.label !== 'string') {
    data.label = '';
  }

  return { ...node, type: downgradedType, data };
}

export function sanitizePersistedNode(node: FlowTab['nodes'][number]): FlowTab['nodes'][number] {
  const {
    selected: _selected,
    dragging: _dragging,
    measured: _measured,
    positionAbsolute: _positionAbsolute,
    ...persistedNode
  } = node as FlowTab['nodes'][number] & {
    measured?: unknown;
    positionAbsolute?: unknown;
  };

  return withSectionDefaults(downgradeRetiredNodeFamily(persistedNode));
}

function flattenLegacyContainerNodes(nodes: FlowTab['nodes']): FlowTab['nodes'] {
  const removedContainerIds = new Set(
    nodes
      .filter((node) => node.type === 'section' || node.type === 'group')
      .map((node) => node.id)
  );

  return nodes
    .filter((node) => !removedContainerIds.has(node.id))
    .map((node) => {
      if (!node.parentId || !removedContainerIds.has(node.parentId)) {
        return node;
      }

      const { parentId: _parentId, extent: _extent, ...flattenedNode } = node;
      return flattenedNode;
    });
}

export function downgradeRetiredEdgeType(
  edge: FlowTab['edges'][number]
): FlowTab['edges'][number] {
  if (edge.type !== 'sequence_message') {
    return edge;
  }

  const { type: _type, ...downgradedEdge } = edge;
  return downgradedEdge;
}

export function sanitizePersistedEdge(edge: FlowTab['edges'][number]): FlowTab['edges'][number] {
  const { selected: _selected, ...persistedEdge } = edge;
  return downgradeRetiredEdgeType(persistedEdge);
}

export function sanitizePersistedTab(tab: FlowTab): FlowTab {
  const sanitizedNodes = tab.nodes.map(sanitizePersistedNode);
  const flattenedNodes = flattenLegacyContainerNodes(sanitizedNodes);

  return {
    ...tab,
    nodes: ensureParentsBeforeChildren(flattenedNodes),
    edges: tab.edges.map(sanitizePersistedEdge),
    playback: clonePlaybackState(tab.playback),
    history: sanitizePersistedHistory(tab.history),
  };
}

export function normalizePersistedTab(rawTab: unknown): FlowTab | null {
  const parsedTab = persistedTabBaseSchema.safeParse(rawTab);
  if (!parsedTab.success) {
    return null;
  }

  const tab = parsedTab.data;

  return sanitizePersistedTab({
    id: tab.id,
    name: tab.name,
    diagramType: isDiagramType((tab as { diagramType?: unknown }).diagramType)
      ? (tab as { diagramType: FlowTab['diagramType'] }).diagramType
      : DEFAULT_DIAGRAM_TYPE,
    updatedAt: typeof tab.updatedAt === 'string' ? tab.updatedAt : nowIso(),
    nodes: Array.isArray(tab.nodes) ? (tab.nodes as FlowTab['nodes']) : [],
    edges: Array.isArray(tab.edges) ? (tab.edges as FlowTab['edges']) : [],
    playback: sanitizePlaybackState(tab.playback),
    history: sanitizePersistedHistory(tab.history),
  });
}

export function migratePersistedFlowState(
  persistedState: unknown
): PersistedFlowStateHydration {
  const parsedHydration = persistedFlowHydrationSchema.safeParse(persistedState);
  if (!parsedHydration.success) {
    return {};
  }

  const state = parsedHydration.data;
  const tabs = (Array.isArray(state.tabs) ? state.tabs : [])
    .map((tab) => normalizePersistedTab(tab))
    .filter((tab): tab is FlowTab => tab !== null);
  const persistedViewSettings = parsePersistedViewSettings(state.viewSettings);
  const persistedLayers = Array.isArray(state.layers)
    ? state.layers
        .map((layer) => persistedLayerSchema.safeParse(layer))
        .filter(isPersistedLayerParseSuccess)
        .map((result) => result.data as FlowState['layers'][number])
    : [];
  const layers = persistedLayers.some((layer) => layer.id === 'default')
    ? persistedLayers
    : [...INITIAL_LAYERS, ...persistedLayers];
  const persistedAiSettings = parsePersistedAISettings(state.aiSettings) as
    | Partial<FlowState['aiSettings']>
    | undefined;
  const baseAiSettings = loadPersistedAISettings();
  // Only re-sanitize when the persisted blob actually carried AI settings.
  // Otherwise keep the resolved defaults intact — sanitizeAISettings drops
  // optional fields (model / customBaseUrl / apiKey) that are absent from its
  // input, which would strip env-seeded custom-endpoint config on every reload.
  const hasPersistedAiSettings =
    !!persistedAiSettings && Object.keys(persistedAiSettings).length > 0;
  const migratedAISettings = hasPersistedAiSettings
    ? sanitizeAISettings(persistedAiSettings, baseAiSettings)
    : baseAiSettings;
  if (hasPersistedAiSettings) {
    persistAISettings(migratedAISettings);
  }

  return {
    ...state,
    documents: Array.isArray(state.documents)
      ? (state.documents as FlowState['documents'])
      : [],
    trashedDocuments: Array.isArray(state.trashedDocuments)
      ? (state.trashedDocuments as FlowState['trashedDocuments'])
      : [],
    activeDocumentId:
      typeof state.activeDocumentId === 'string' ? state.activeDocumentId : EMPTY_WORKSPACE_ID,
    tabs,
    activeTabId:
      typeof state.activeTabId === 'string' && tabs.some((tab) => tab.id === state.activeTabId)
        ? state.activeTabId
        : EMPTY_WORKSPACE_ID,
    layers,
    activeLayerId:
      typeof state.activeLayerId === 'string' &&
      layers.some((layer) => layer.id === state.activeLayerId)
        ? state.activeLayerId
        : DEFAULT_LAYER_ID,
    viewSettings: {
      ...INITIAL_VIEW_SETTINGS,
      ...persistedViewSettings,
    },
    aiSettings: migratedAISettings,
  };
}

export function partializePersistedFlowState(state: FlowState): PersistedFlowStateSlice {
  return {
    designSystems: state.designSystems,
    activeDesignSystemId: state.activeDesignSystemId,
    viewSettings: state.viewSettings,
    globalEdgeOptions: state.globalEdgeOptions,
    layers: state.layers,
    activeLayerId: state.activeLayerId,
  };
}

export function createInitialFlowState(): Pick<
  FlowState,
  | 'nodes'
  | 'edges'
  | 'documents'
  | 'trashedDocuments'
  | 'activeDocumentId'
  | 'tabs'
  | 'activeTabId'
  | 'designSystems'
  | 'activeDesignSystemId'
  | 'viewSettings'
  | 'globalEdgeOptions'
  | 'aiSettings'
  | 'layers'
  | 'activeLayerId'
  | 'selectedNodeId'
  | 'selectedEdgeId'
  | 'hoveredSectionId'
  | 'pendingNodeLabelEditRequest'
  | 'mermaidDiagnostics'
  | 'lastUpdateTime'
> {
  return {
    nodes: [],
    edges: [],
    documents: [],
    trashedDocuments: [],
    activeDocumentId: EMPTY_WORKSPACE_ID,
    tabs: [],
    activeTabId: EMPTY_WORKSPACE_ID,
    designSystems: [DEFAULT_DESIGN_SYSTEM],
    activeDesignSystemId: DEFAULT_DESIGN_SYSTEM_ID,
    viewSettings: INITIAL_VIEW_SETTINGS,
    globalEdgeOptions: INITIAL_GLOBAL_EDGE_OPTIONS,
    aiSettings: loadPersistedAISettings(),
    layers: INITIAL_LAYERS,
    activeLayerId: DEFAULT_LAYER_ID,
    selectedNodeId: null,
    selectedEdgeId: null,
    hoveredSectionId: null,
    pendingNodeLabelEditRequest: null,
    mermaidDiagnostics: null,
    lastUpdateTime: Date.now(),
  };
}
