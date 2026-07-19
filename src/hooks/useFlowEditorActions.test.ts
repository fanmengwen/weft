import { act, renderHook } from '@testing-library/react';
import type { TFunction } from 'i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowEditorActions } from './useFlowEditorActions';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { getOpenFlowDSLExportDiagnostics, toOpenFlowDSL } from '@/services/openFlowDSLExporter';

vi.mock('@/services/openFlowDSLExporter', () => ({
    toOpenFlowDSL: vi.fn(() => 'mock-dsl'),
    getOpenFlowDSLExportDiagnostics: vi.fn(() => []),
}));

vi.mock('@/services/elkLayout', () => ({
    getElkLayout: vi.fn(async (nodes: FlowNode[], edges: FlowEdge[]) => ({ nodes, edges })),
}));

vi.mock('@/services/figmaExportService', () => ({
    toFigmaSVG: vi.fn(() => '<svg />'),
}));

vi.mock('@/services/onboarding/events', () => ({
    recordOnboardingEvent: vi.fn(),
}));

vi.mock('@/services/analytics/analytics', () => ({
    captureAnalyticsEvent: vi.fn(),
}));

function createNode(id: string): FlowNode {
    return {
        id,
        type: 'process',
        position: { x: 0, y: 0 },
        data: { label: id, subLabel: '', color: 'slate' },
    };
}

function createEdge(id: string, source: string, target: string): FlowEdge {
    return { id, source, target };
}

function createTranslator(fn: (key: string, options?: Record<string, unknown>) => string): TFunction {
    return fn as unknown as TFunction;
}

describe('useFlowEditorActions', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
        vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback: FrameRequestCallback): number => {
            callback(0);
            return 1;
        });
        Object.assign(navigator, {
            clipboard: {
                writeText: vi.fn().mockResolvedValue(undefined),
            },
        });
    });

    it('copies Weft DSL and shows success toast', async () => {
        const addToast = vi.fn();
        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [createNode('n1')],
                edges: [createEdge('e1', 'n1', 'n1')],
                recordHistory: vi.fn(),
                setNodes: vi.fn(),
                setEdges: vi.fn(),
                fitView: vi.fn(),
                getZoom: () => 1,
                t: createTranslator((key: string) => key),
                addToast,
                exportSerializationMode: 'deterministic',
            })
        );

        await act(async () => {
            await result.current.handleExportOpenFlowDSL();
        });

        expect(toOpenFlowDSL).toHaveBeenCalledWith(
            expect.any(Array),
            expect.any(Array),
            { mode: 'deterministic' }
        );
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith('mock-dsl');
        expect(addToast).toHaveBeenCalledWith('flowEditor.dslCopied', 'success');
    });

    it('shows error toast when Figma export copy fails', async () => {
        const addToast = vi.fn();
        vi.spyOn(console, 'error').mockImplementation(() => undefined);
        vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValueOnce(new Error('copy failed'));

        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [createNode('n1')],
                edges: [createEdge('e1', 'n1', 'n1')],
                recordHistory: vi.fn(),
                setNodes: vi.fn(),
                setEdges: vi.fn(),
                fitView: vi.fn(),
                getZoom: () => 1,
                t: createTranslator((key: string, options?: Record<string, unknown>) => options?.message ? `${key}:${String(options.message)}` : key),
                addToast,
                exportSerializationMode: 'deterministic',
            })
        );

        await act(async () => {
            await result.current.handleExportFigma();
        });

        expect(addToast).toHaveBeenCalledWith('flowEditor.figmaExportFailed:copy failed', 'error');
    });

  it('shows warning toast when export skips dangling edges', async () => {
        const addToast = vi.fn();
        vi.mocked(getOpenFlowDSLExportDiagnostics).mockReturnValueOnce([
            {
                edgeId: 'e-dangling',
                source: 'missing-a',
                target: 'missing-b',
                message: 'Edge skipped',
            },
        ]);
        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [createNode('n1')],
                edges: [createEdge('e1', 'n1', 'n1')],
                recordHistory: vi.fn(),
                setNodes: vi.fn(),
                setEdges: vi.fn(),
                fitView: vi.fn(),
                getZoom: () => 1,
                t: createTranslator((key: string, options?: Record<string, unknown>) => {
                    if (key === 'flowEditor.dslExportSkippedEdges') return `${String(options?.count)} skipped`;
                    return key;
                }),
                addToast,
                exportSerializationMode: 'deterministic',
            })
        );

        await act(async () => {
            await result.current.handleExportOpenFlowDSL();
        });

        expect(addToast).toHaveBeenCalledWith('1 skipped', 'warning');
    });

    it('shows an error toast when share is requested on an empty canvas', () => {
        const addToast = vi.fn();

        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [],
                edges: [],
                recordHistory: vi.fn(),
                setNodes: vi.fn(),
                setEdges: vi.fn(),
                fitView: vi.fn(),
                getZoom: () => 1,
                t: createTranslator((key: string) => key),
                addToast,
                exportSerializationMode: 'deterministic',
            })
        );

        act(() => {
            result.current.handleShare();
        });

        expect(addToast).toHaveBeenCalledWith('Add nodes before creating a share link.', 'error');
        expect(result.current.shareViewerUrl).toBeNull();
    });

    it('fits inserted templates at 100% zoom instead of auto-scaling', () => {
        vi.useFakeTimers();
        const fitView = vi.fn();
        const setNodes = vi.fn();
        const setEdges = vi.fn();

        const { result } = renderHook(() =>
            useFlowEditorActions({
                nodes: [],
                edges: [],
                recordHistory: vi.fn(),
                setNodes,
                setEdges,
                fitView,
                getZoom: () => 1,
                t: createTranslator((key: string) => key),
                addToast: vi.fn(),
                exportSerializationMode: 'deterministic',
            })
        );

        act(() => {
            result.current.handleInsertTemplate({
                id: 'starter-simple',
                name: 'Simple',
                description: 'desc',
                icon: (() => null) as never,
                msg: 'Simple',
                category: 'flowchart',
                tags: [],
                audience: 'builders',
                useCase: 'test template insert zoom',
                launchPriority: 1,
                featured: false,
                difficulty: 'starter',
                outcome: 'canvas receives template graph',
                replacementHints: ['a', 'b', 'c'],
                nodes: [createNode('tpl-1')],
                edges: [],
            });
        });

        expect(setNodes).toHaveBeenCalled();
        expect(fitView).not.toHaveBeenCalled();

        act(() => {
            vi.advanceTimersByTime(100);
        });

        expect(fitView).toHaveBeenCalledWith({
            duration: 800,
            padding: 0.2,
            minZoom: 1,
            maxZoom: 1,
        });
        vi.useRealTimers();
    });
});
