import { useCallback, useEffect, useRef } from 'react';
import { shouldExitStudioOnSelection, type SelectionSnapshot } from './shouldExitStudioOnSelection';
import type { FlowEditorMode, StudioTab } from '@/hooks/useFlowEditorUIState';

interface UseFlowEditorStudioControllerParams {
    editorMode: FlowEditorMode;
    studioTab: StudioTab;
    selectedNodeId: string | null;
    selectedEdgeId: string | null;
    setStudioTab: (tab: StudioTab) => void;
    setStudioMode: () => void;
    openArchitectureRulesPanel: () => void;
    closeCommandBar: () => void;
    setCanvasMode: () => void;
    setSelectedNodeId: (id: string | null) => void;
    setSelectedEdgeId: (id: string | null) => void;
}

interface OpenStudioPanelOptions {
    closeLauncher?: boolean;
}

interface UseFlowEditorStudioControllerResult {
    openStudioPanel: (tab: StudioTab, options?: OpenStudioPanelOptions) => void;
    openStudioAI: () => void;
    openStudioPlayback: () => void;
    openArchitectureRulesPanel: () => void;
    toggleStudioPanel: () => void;
    closeStudioPanel: () => void;
    handleCanvasEntityIntent: () => void;
}

export function useFlowEditorStudioController({
    editorMode,
    studioTab,
    selectedNodeId,
    selectedEdgeId,
    setStudioTab,
    setStudioMode,
    openArchitectureRulesPanel: handleOpenArchitectureRulesPanel,
    closeCommandBar,
    setCanvasMode,
    setSelectedNodeId,
    setSelectedEdgeId,
}: UseFlowEditorStudioControllerParams): UseFlowEditorStudioControllerResult {
    const studioSelectionSnapshotRef = useRef<SelectionSnapshot>({
        selectedNodeId: null,
        selectedEdgeId: null,
    });

    const clearSelectionAndSetCanvasMode = useCallback(() => {
        setSelectedNodeId(null);
        setSelectedEdgeId(null);
        setCanvasMode();
    }, [setCanvasMode, setSelectedEdgeId, setSelectedNodeId]);

    const captureStudioSelectionSnapshot = useCallback(() => {
        studioSelectionSnapshotRef.current = {
            selectedNodeId,
            selectedEdgeId,
        };
    }, [selectedEdgeId, selectedNodeId]);

    const openStudioPanel = useCallback((
        tab: StudioTab,
        options?: OpenStudioPanelOptions
    ) => {
        captureStudioSelectionSnapshot();
        setStudioTab(tab);
        setStudioMode();
        if (options?.closeLauncher) {
            closeCommandBar();
        }
    }, [captureStudioSelectionSnapshot, closeCommandBar, setStudioMode, setStudioTab]);

    const openStudioAI = useCallback(() => {
        openStudioPanel('ai', { closeLauncher: true });
    }, [openStudioPanel]);

    const openStudioPlayback = useCallback(() => {
        openStudioPanel('playback', { closeLauncher: true });
    }, [openStudioPanel]);

    const openArchitectureRulesPanel = useCallback(() => {
        captureStudioSelectionSnapshot();
        handleOpenArchitectureRulesPanel();
        closeCommandBar();
    }, [captureStudioSelectionSnapshot, closeCommandBar, handleOpenArchitectureRulesPanel]);

    const toggleStudioPanel = useCallback(() => {
        if (editorMode === 'studio') {
            clearSelectionAndSetCanvasMode();
            return;
        }

        openStudioAI();
    }, [clearSelectionAndSetCanvasMode, editorMode, openStudioAI]);

    const closeStudioPanel = useCallback(() => {
        clearSelectionAndSetCanvasMode();
    }, [clearSelectionAndSetCanvasMode]);

    const handleCanvasEntityIntent = useCallback(() => undefined, []);

    useEffect(() => {
        if (!shouldExitStudioOnSelection({
            editorMode,
            studioTab,
            studioSelectionSnapshot: studioSelectionSnapshotRef.current,
            selectedNodeId,
            selectedEdgeId,
        })) {
            return;
        }

        setCanvasMode();
    }, [editorMode, selectedEdgeId, selectedNodeId, setCanvasMode, studioTab]);

    return {
        openStudioPanel,
        openStudioAI,
        openStudioPlayback,
        openArchitectureRulesPanel,
        toggleStudioPanel,
        closeStudioPanel,
        handleCanvasEntityIntent,
    };
}
