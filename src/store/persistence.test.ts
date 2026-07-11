import { describe, expect, it, vi } from 'vitest';
import type { FlowEdge, FlowNode, FlowTab } from '@/lib/types';
import {
    createInitialFlowState,
    migratePersistedFlowState,
    partializePersistedFlowState,
    sanitizePersistedNode,
    sanitizePersistedTab,
} from './persistence';
import * as aiSettingsPersistence from './aiSettingsPersistence';

function createNode(id: string, label: string): FlowNode {
    return {
        id,
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label, subLabel: '', color: 'slate' },
    };
}

function createEdge(id: string, source: string, target: string): FlowEdge {
    return { id, source, target };
}

function createTab(id: string, name: string, nodes: FlowNode[], edges: FlowEdge[]): FlowTab {
    return {
        id,
        name,
        nodes,
        edges,
        playback: undefined,
        history: { past: [], future: [] },
    };
}

describe('store persistence helpers', () => {
    it('creates the expected initial persisted runtime slice', () => {
        const loadPersistedAISettingsSpy = vi.spyOn(aiSettingsPersistence, 'loadPersistedAISettings').mockReturnValue({
            provider: 'openai',
            storageMode: 'local',
            apiKey: 'persisted-key',
            model: 'gpt-test',
            customBaseUrl: undefined,
            customHeaders: [],
        });
        const state = createInitialFlowState();

        expect(state.activeDocumentId).toBe('');
        expect(state.activeTabId).toBe('');
        expect(state.documents).toHaveLength(0);
        expect(state.tabs).toHaveLength(0);
        expect(state.nodes).toHaveLength(0);
        expect(state.edges).toHaveLength(0);
        expect(state.layers[0]?.id).toBe('default');
        expect(state.designSystems[0]?.id).toBe('default');
        expect(state.aiSettings.provider).toBe('openai');
        expect(state.aiSettings.apiKey).toBe('persisted-key');

        loadPersistedAISettingsSpy.mockRestore();
    });

    it('sanitizes tab content while stripping transient canvas fields', () => {
        const tab = createTab(
            'tab-2',
            'Tab 2',
            [
                {
                    ...createNode('n2', 'Recovered Tab 2'),
                    selected: true,
                    dragging: true,
                    measured: { width: 180, height: 96 },
                    positionAbsolute: { x: 50, y: 60 },
                } as FlowNode,
            ],
            [{ ...createEdge('e2', 'n2', 'n2'), selected: true }]
        );
        const persistedTab = sanitizePersistedTab(tab);
        const persistedNode = persistedTab.nodes[0] as FlowNode & {
            measured?: unknown;
            positionAbsolute?: unknown;
        };
        const persistedEdge = persistedTab.edges[0];

        expect(persistedNode.selected).toBeUndefined();
        expect(persistedNode.dragging).toBeUndefined();
        expect(persistedNode.measured).toBeUndefined();
        expect(persistedNode.positionAbsolute).toBeUndefined();
        expect(persistedEdge?.selected).toBeUndefined();
    });

    it('preserves sanitized playback state in persisted tabs', () => {
        const tab = createTab('tab-2', 'Tab 2', [createNode('n2', 'Recovered Tab 2')], []);
        tab.playback = {
            version: 1,
            scenes: [{ id: 'scene-1', name: 'Intro', stepIds: ['step-1'] }],
            timeline: [{ id: 'step-1', nodeId: 'n2', durationMs: 1200 }],
            selectedSceneId: 'scene-1',
            defaultStepDurationMs: 1500,
        };

        const persistedTab = sanitizePersistedTab(tab);

        expect(persistedTab.playback?.timeline[0]?.nodeId).toBe('n2');

        const migrated = migratePersistedFlowState({
            tabs: [persistedTab],
            activeTabId: 'tab-2',
        }) as {
            tabs: FlowTab[];
        };

        expect(migrated.tabs[0].playback?.scenes[0]?.name).toBe('Intro');
        expect(migrated.tabs[0].playback?.selectedSceneId).toBe('scene-1');
    });

    it('migrates malformed tabs and invalid active ids to a safe empty state', () => {
        const migrated = migratePersistedFlowState({
            tabs: [{ bogus: true }],
            activeTabId: 'missing-tab',
        }) as {
            tabs: FlowTab[];
            activeTabId: string;
        };

        expect(migrated.tabs).toHaveLength(0);
        expect(migrated.activeTabId).toBe('');
    });

    it('rehydrates default layers and merged view settings from persisted state', () => {
        const migrated = migratePersistedFlowState({
            tabs: [
                {
                    id: 'tab-a',
                    name: 'A',
                    nodes: [createNode('na', 'A')],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-a',
            layers: [{ id: 'infra', name: 'Infra', visible: true, locked: false }],
            viewSettings: { showGrid: false },
        }) as {
            layers: Array<{ id: string }>;
            activeLayerId: string;
            viewSettings: { showGrid: boolean; snapToGrid: boolean };
        };

        expect(migrated.layers.map((layer) => layer.id)).toEqual(['default', 'infra']);
        expect(migrated.activeLayerId).toBe('default');
        expect(migrated.viewSettings.showGrid).toBe(false);
        expect(migrated.viewSettings.snapToGrid).toBe(true);
    });

    it('drops invalid layer and view settings shapes through schema validation', () => {
        const migrated = migratePersistedFlowState({
            tabs: [],
            layers: [
                { id: 'infra', name: 'Infra', visible: true, locked: false },
                { id: '', name: 'Broken', visible: 'yes', locked: false },
            ],
            viewSettings: {
                showGrid: 'true',
                snapToGrid: false,
                largeGraphSafetyMode: 'balanced',
            },
        }) as {
            layers: Array<{ id: string }>;
            activeLayerId: string;
            viewSettings: { showGrid: boolean; snapToGrid: boolean; largeGraphSafetyMode: string };
        };

        expect(migrated.layers.map((layer) => layer.id)).toEqual(['default', 'infra']);
        expect(migrated.viewSettings.showGrid).toBe(true);
        expect(migrated.viewSettings.snapToGrid).toBe(false);
        expect(migrated.viewSettings.largeGraphSafetyMode).toBe('auto');
    });

    it('rejects invalid tab envelopes through schema validation', () => {
        const migrated = migratePersistedFlowState({
            tabs: [
                { id: '', name: 'Broken' },
                { id: 'tab-a', name: 'Valid', nodes: [], edges: [] },
            ],
            activeTabId: 'tab-a',
        }) as {
            tabs: FlowTab[];
            activeTabId: string;
        };

        expect(migrated.tabs).toHaveLength(1);
        expect(migrated.tabs[0]?.id).toBe('tab-a');
        expect(migrated.activeTabId).toBe('tab-a');
    });

    it('removes legacy section container nodes during migration', () => {
        const migrated = migratePersistedFlowState({
            tabs: [
                {
                    id: 'tab-a',
                    name: 'A',
                    nodes: [
                        {
                            id: 'section-1',
                            type: 'section',
                            position: { x: 20, y: 30 },
                            data: { label: 'Legacy Section' },
                            style: { width: 500, height: 400 },
                        },
                    ],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-a',
        }) as {
            tabs: FlowTab[];
        };

        expect(migrated.tabs[0]?.nodes).toEqual([]);
    });

    it('downgrades retired shape family nodes to rounded process nodes', () => {
        const tab = createTab(
            'tab-a',
            'A',
            [
                { ...createNode('n-class', 'Order'), type: 'class' },
                { ...createNode('n-mindmap', 'Idea'), type: 'mindmap' },
            ],
            []
        );

        const persistedTab = sanitizePersistedTab(tab);

        expect(persistedTab.nodes.map((node) => node.type)).toEqual(['process', 'process']);
        expect(persistedTab.nodes.map((node) => node.data.shape)).toEqual(['rounded', 'rounded']);
        expect(persistedTab.nodes.map((node) => node.data.label)).toEqual(['Order', 'Idea']);
    });

    it('downgrades text nodes to annotation nodes preserving the label', () => {
        const tab = createTab(
            'tab-a',
            'A',
            [{ ...createNode('n-text', 'Note to self'), type: 'text' }],
            []
        );

        const persistedTab = sanitizePersistedTab(tab);

        expect(persistedTab.nodes[0]?.type).toBe('annotation');
        expect(persistedTab.nodes[0]?.data.label).toBe('Note to self');
    });

    it('downgrades image nodes without a label to annotations with an empty label', () => {
        const sanitized = sanitizePersistedNode({
            id: 'n-image',
            type: 'image',
            position: { x: 0, y: 0 },
            data: { label: undefined, imageUrl: 'https://example.com/pic.png' },
        });

        expect(sanitized.type).toBe('annotation');
        expect(sanitized.data.label).toBe('');
    });

    it('downgrades swimlane nodes to section nodes', () => {
        const sanitized = sanitizePersistedNode({ ...createNode('n-lane', 'Lane A'), type: 'swimlane' });

        expect(sanitized.type).toBe('section');
        expect(sanitized.data.label).toBe('Lane A');
    });

    it('flattens swimlane frames like legacy sections, keeping children unparented', () => {
        const tab = createTab(
            'tab-a',
            'A',
            [
                { ...createNode('n-lane', 'Lane A'), type: 'swimlane' },
                { ...createNode('n-child', 'Step 1'), parentId: 'n-lane' },
            ],
            []
        );

        const persistedTab = sanitizePersistedTab(tab);

        expect(persistedTab.nodes.map((node) => node.id)).toEqual(['n-child']);
        expect(persistedTab.nodes[0]?.parentId).toBeUndefined();
    });

    it('drops the sequence_message type from persisted edges', () => {
        const tab = createTab(
            'tab-a',
            'A',
            [],
            [{ ...createEdge('e1', 'n1', 'n2'), type: 'sequence_message' }]
        );

        const persistedTab = sanitizePersistedTab(tab);

        expect(persistedTab.edges[0]?.type).toBeUndefined();
    });

    it('downgrades retired node families during persisted state migration', () => {
        const migrated = migratePersistedFlowState({
            tabs: [
                {
                    id: 'tab-a',
                    name: 'A',
                    nodes: [{ ...createNode('n-class', 'Order'), type: 'class' }],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-a',
        });

        expect(migrated.tabs?.[0]?.nodes[0]?.type).toBe('process');
        expect(migrated.tabs?.[0]?.nodes[0]?.data.shape).toBe('rounded');
    });

    it('sanitizes persisted ai settings during migration', () => {
        const loadPersistedAISettingsSpy = vi.spyOn(aiSettingsPersistence, 'loadPersistedAISettings').mockReturnValue({
            provider: 'gemini',
            storageMode: 'local',
            apiKey: undefined,
            model: undefined,
            customBaseUrl: undefined,
            customHeaders: [],
        });
        const persistAISettingsSpy = vi.spyOn(aiSettingsPersistence, 'persistAISettings').mockImplementation(() => undefined);
        const migrated = migratePersistedFlowState({
            tabs: [
                {
                    id: 'tab-a',
                    name: 'A',
                    nodes: [createNode('na', 'A')],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-a',
            aiSettings: {
                provider: 'invalid-provider',
                apiKey: '  secret  ',
                customHeaders: [
                    { key: ' Authorization ', value: 'Bearer token', enabled: true },
                    { key: '', value: 'skip-me' },
                ],
            },
        }) as {
            aiSettings: {
                provider: string;
                apiKey?: string;
                customHeaders?: Array<{ key: string; value: string; enabled?: boolean }>;
            };
        };

        expect(migrated.aiSettings.provider).toBe('gemini');
        expect(migrated.aiSettings.apiKey).toBe('secret');
        expect(migrated.aiSettings.customHeaders).toEqual([
            { key: 'Authorization', value: 'Bearer token', enabled: true },
        ]);
        expect(persistAISettingsSpy).toHaveBeenCalledWith({
            provider: 'gemini',
            storageMode: 'local',
            apiKey: 'secret',
            model: undefined,
            customBaseUrl: undefined,
            customHeaders: [
                { key: 'Authorization', value: 'Bearer token', enabled: true },
            ],
        });

        loadPersistedAISettingsSpy.mockRestore();
        persistAISettingsSpy.mockRestore();
    });

    it('keeps the resolved default ai settings when the persisted blob has no aiSettings', () => {
        // The main persisted slice never carries aiSettings (partialize excludes
        // it), so migration must preserve the resolved defaults verbatim —
        // including optional custom-endpoint fields seeded from env — instead of
        // running them through sanitizeAISettings, which would drop them.
        const loadPersistedAISettingsSpy = vi.spyOn(aiSettingsPersistence, 'loadPersistedAISettings').mockReturnValue({
            provider: 'custom',
            storageMode: 'local',
            apiKey: 'env-key',
            model: 'qwen-plus',
            customBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
            customHeaders: [],
        });
        const persistAISettingsSpy = vi.spyOn(aiSettingsPersistence, 'persistAISettings').mockImplementation(() => undefined);

        const migrated = migratePersistedFlowState({
            tabs: [
                {
                    id: 'tab-a',
                    name: 'A',
                    nodes: [createNode('na', 'A')],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-a',
        }) as {
            aiSettings: { provider: string; model?: string; customBaseUrl?: string; apiKey?: string };
        };

        expect(migrated.aiSettings.provider).toBe('custom');
        expect(migrated.aiSettings.model).toBe('qwen-plus');
        expect(migrated.aiSettings.customBaseUrl).toBe('https://dashscope.aliyuncs.com/compatible-mode/v1');
        expect(migrated.aiSettings.apiKey).toBe('env-key');
        // No persisted aiSettings means nothing to re-persist.
        expect(persistAISettingsSpy).not.toHaveBeenCalled();

        loadPersistedAISettingsSpy.mockRestore();
        persistAISettingsSpy.mockRestore();
    });

    it('does not include aiSettings in the main persisted flow slice', () => {
        const persistedSlice = partializePersistedFlowState(createInitialFlowState() as never);

        expect('aiSettings' in persistedSlice).toBe(false);
    });

    it('does not include durable document state in the main persisted flow slice', () => {
        const persistedSlice = partializePersistedFlowState(createInitialFlowState() as never);

        expect('tabs' in persistedSlice).toBe(false);
        expect('activeTabId' in persistedSlice).toBe(false);
    });
});
