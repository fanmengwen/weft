import { useCallback } from 'react';
import { useFlowStore } from '@/store';
import { buildArchitectureServiceSuggestionPrompt } from '@/hooks/ai-generation/nodeActionPrompts';
import type { ArchitectureTemplateId } from '@/lib/architectureTemplates';

interface UseFlowEditorPanelActionsParams {
    handleFocusedAIRequest: (prompt: string, selectedNodeIds?: string[]) => Promise<boolean>;
    handleApplyArchitectureTemplate?: (sourceId: string, templateId: ArchitectureTemplateId) => void;
}

interface UseFlowEditorPanelActionsResult {
    handleSuggestArchitectureNode: (nodeId: string) => Promise<void>;
    applyArchitectureTemplate: (sourceId: string, templateId: ArchitectureTemplateId) => void;
}

export function useFlowEditorPanelActions({
    handleFocusedAIRequest,
    handleApplyArchitectureTemplate,
}: UseFlowEditorPanelActionsParams): UseFlowEditorPanelActionsResult {
    const handleSuggestArchitectureNode = useCallback(async (nodeId: string) => {
        const node = useFlowStore.getState().nodes.find((candidate) => candidate.id === nodeId);
        if (!node) {
            return;
        }

        await handleFocusedAIRequest(buildArchitectureServiceSuggestionPrompt(node), [nodeId]);
    }, [handleFocusedAIRequest]);

    const applyArchitectureTemplate = useCallback((sourceId: string, templateId: ArchitectureTemplateId) => {
        handleApplyArchitectureTemplate?.(sourceId, templateId);
    }, [handleApplyArchitectureTemplate]);

    return {
        handleSuggestArchitectureNode,
        applyArchitectureTemplate,
    };
}
