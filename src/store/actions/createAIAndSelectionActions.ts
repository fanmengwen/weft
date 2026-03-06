import type { FlowState } from '../types';

type SetFlowState = (partial: Partial<FlowState> | ((state: FlowState) => Partial<FlowState>)) => void;

export function createAIAndSelectionActions(set: SetFlowState): Pick<
    FlowState,
    'setAISettings' | 'setSelectedNodeId' | 'setSelectedEdgeId' | 'setMermaidDiagnostics' | 'clearMermaidDiagnostics'
> {
    return {
        setAISettings: (settings) => set((state) => ({
            aiSettings: { ...state.aiSettings, ...settings },
        })),

        setSelectedNodeId: (id) => set({ selectedNodeId: id }),
        setSelectedEdgeId: (id) => set({ selectedEdgeId: id }),
        setMermaidDiagnostics: (snapshot) => set({ mermaidDiagnostics: snapshot }),
        clearMermaidDiagnostics: () => set({ mermaidDiagnostics: null }),
    };
}
