import { useCallback, useState } from 'react';
import type { FlowNode } from '@/lib/types';
import { computeAlignmentGuides, type AlignmentGuides } from './alignmentGuides';

interface UseFlowCanvasAlignmentGuidesParams {
    enabled: boolean;
    layerAdjustedNodes: FlowNode[];
}

export function useFlowCanvasAlignmentGuides({
    enabled,
    layerAdjustedNodes,
}: UseFlowCanvasAlignmentGuidesParams) {
    const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuides>({
        verticalFlowX: null,
        horizontalFlowY: null,
    });

    const updateAlignmentGuidesForNode = useCallback((draggedNode: FlowNode): void => {
        if (!enabled) {
            return;
        }
        setAlignmentGuides(computeAlignmentGuides(draggedNode, layerAdjustedNodes));
    }, [enabled, layerAdjustedNodes]);

    const clearAlignmentGuides = useCallback((): void => {
        if (!enabled) {
            return;
        }
        setAlignmentGuides({ verticalFlowX: null, horizontalFlowY: null });
    }, [enabled]);

    return {
        alignmentGuides,
        updateAlignmentGuidesForNode,
        clearAlignmentGuides,
    };
}
