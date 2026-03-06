import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { FlowNode } from '@/lib/types';
import type { FlowCanvasQuickAddOverlay } from './useFlowCanvasQuickActions';

interface FlowCanvasQuickActionsProps {
    enabled: boolean;
    quickToolbarAnchor: { left: number; top: number } | null;
    selectedVisibleNodes: FlowNode[];
    quickToolbarColorValue: string;
    onQuickToolbarDelete: () => void;
    onQuickToolbarDuplicate: () => void;
    onQuickToolbarAddConnected: () => void;
    onQuickToolbarColorChange: (nextColor: string) => void;
    singleSelectedNode: FlowNode | null;
    quickAddOverlay: FlowCanvasQuickAddOverlay | null;
    isQuickAddHovering: boolean;
    setIsQuickAddHovering: (next: boolean) => void;
}

export function FlowCanvasQuickActions({
    enabled,
    quickToolbarAnchor,
    selectedVisibleNodes,
    quickToolbarColorValue,
    onQuickToolbarDelete,
    onQuickToolbarDuplicate,
    onQuickToolbarAddConnected,
    onQuickToolbarColorChange,
    singleSelectedNode,
    quickAddOverlay,
    isQuickAddHovering,
    setIsQuickAddHovering,
}: FlowCanvasQuickActionsProps): React.ReactElement | null {
    if (!enabled) {
        return null;
    }

    return (
        <>
            {quickToolbarAnchor && (
                <div
                    className="absolute z-30"
                    style={{
                        left: quickToolbarAnchor.left,
                        top: quickToolbarAnchor.top,
                        transform: 'translate(-50%, -100%)',
                    }}
                >
                    <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white/95 px-2 py-1 shadow-lg">
                        <button
                            type="button"
                            onClick={onQuickToolbarDelete}
                            className="rounded px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                        >
                            Delete
                        </button>
                        <button
                            type="button"
                            onClick={onQuickToolbarDuplicate}
                            disabled={selectedVisibleNodes.length !== 1}
                            className="rounded px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Duplicate
                        </button>
                        <button
                            type="button"
                            onClick={onQuickToolbarAddConnected}
                            disabled={selectedVisibleNodes.length !== 1}
                            className="rounded px-2 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            + Node
                        </button>
                        <label className="inline-flex items-center gap-1 text-[11px] text-slate-600">
                            Color
                            <input
                                type="color"
                                value={quickToolbarColorValue}
                                onChange={(event) => onQuickToolbarColorChange(event.target.value)}
                                className="h-6 w-8 cursor-pointer rounded border border-slate-300 bg-white p-0.5"
                            />
                        </label>
                    </div>
                </div>
            )}
            {singleSelectedNode && quickAddOverlay && (
                <>
                    {isQuickAddHovering && (
                        <div
                            className="pointer-events-none absolute z-20 rounded-xl border border-sky-300/70 bg-slate-100/45"
                            style={{
                                left: quickAddOverlay.previewLeft,
                                top: quickAddOverlay.previewTop,
                                width: quickAddOverlay.previewWidth,
                                height: quickAddOverlay.previewHeight,
                            }}
                        />
                    )}
                    <button
                        type="button"
                        aria-label="Add connected node"
                        onClick={onQuickToolbarAddConnected}
                        onMouseEnter={() => setIsQuickAddHovering(true)}
                        onMouseLeave={() => setIsQuickAddHovering(false)}
                        className="absolute z-30 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-sky-500 bg-white text-sky-600 shadow-lg transition-all hover:scale-105 hover:bg-sky-50"
                        style={{
                            left: quickAddOverlay.buttonLeft,
                            top: quickAddOverlay.buttonTop,
                        }}
                    >
                        <ArrowRight className="h-6 w-6" />
                    </button>
                </>
            )}
        </>
    );
}
