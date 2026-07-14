import { useMemo } from 'react';
import { useFlowOperations } from '@/hooks/useFlowOperations';
import { useFlowEditorCallbacks } from '@/hooks/useFlowEditorCallbacks';
import type { TFunction } from 'i18next';
import type { useFlowEditorScreenState } from './useFlowEditorScreenState';

type ScreenState = ReturnType<typeof useFlowEditorScreenState>;

export function useFlowEditorScreenBehavior(params: {
  screenState: ScreenState;
  t: TFunction;
}) {
  const { screenState, t } = params;
  const operations = useFlowOperations(screenState.recordHistory);
  const selectedNodeType = useMemo(
    () => screenState.nodes.find((node) => node.id === screenState.selectedNodeId)?.type ?? null,
    [screenState.nodes, screenState.selectedNodeId],
  );

  const callbacks = useFlowEditorCallbacks({
    addPage: screenState.addPage,
    closePage: screenState.closePage,
    updatePage: screenState.updatePage,
    reorderPage: screenState.reorderPage,
    navigate: screenState.navigate,
    pagesLength: screenState.pages.length,
    cannotCloseLastTabMessage: t('flowEditor.cannotCloseLastTab'),
    setNodes: screenState.setNodes,
    setEdges: screenState.setEdges,
    restoreSnapshot: screenState.restoreSnapshot,
    recordHistory: screenState.recordHistory,
    fitView: screenState.fitView,
    screenToFlowPosition: screenState.screenToFlowPosition,
  });

  return {
    operations,
    selectedNodeType,
    callbacks,
  };
}
