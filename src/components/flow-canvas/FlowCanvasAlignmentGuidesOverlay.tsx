import React from 'react';
import type { AlignmentGuides } from './alignmentGuides';

interface FlowCanvasAlignmentGuidesOverlayProps {
    enabled: boolean;
    alignmentGuides: AlignmentGuides;
    zoom: number;
    viewportX: number;
    viewportY: number;
}

export function FlowCanvasAlignmentGuidesOverlay({
    enabled,
    alignmentGuides,
    zoom,
    viewportX,
    viewportY,
}: FlowCanvasAlignmentGuidesOverlayProps): React.ReactElement | null {
    if (!enabled || (alignmentGuides.verticalFlowX === null && alignmentGuides.horizontalFlowY === null)) {
        return null;
    }

    return (
        <div className="pointer-events-none absolute inset-0 z-20">
            {alignmentGuides.verticalFlowX !== null && (
                <div
                    className="absolute top-0 bottom-0 w-px bg-sky-400/70"
                    style={{ left: alignmentGuides.verticalFlowX * zoom + viewportX }}
                />
            )}
            {alignmentGuides.horizontalFlowY !== null && (
                <div
                    className="absolute left-0 right-0 h-px bg-sky-400/70"
                    style={{ top: alignmentGuides.horizontalFlowY * zoom + viewportY }}
                />
            )}
        </div>
    );
}
