import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { createId } from '@/lib/id';
import type { FlowNode, NodeData } from '@/lib/types';
import { createDomainLibraryNode, type DomainLibraryItem } from '@/services/domainLibrary';
import { useFlowStore } from '@/store';
import { queueNodeLabelEditRequest } from '@/hooks/nodeLabelEditRequest';
import {
  createAnnotationNode,
  createGenericShapeNode,
  createSectionNode,
  getDefaultNodePosition,
  getNextSectionOrder,
  getSectionInsertPosition,
  insertNodeIntoNearestSection,
  wrapSelectionInSection,
} from './utils';

interface UseNodeOperationAddersParams {
  recordHistory: () => void;
  nodesLength: number;
  setNodes: (updater: (nodes: FlowNode[]) => FlowNode[]) => void;
  setSelectedNodeId: (nodeId: string | null) => void;
}

export function useNodeOperationAdders({
  recordHistory,
  nodesLength,
  setNodes,
  setSelectedNodeId,
}: UseNodeOperationAddersParams) {
  const { t } = useTranslation();

  const commitAddedNode = useCallback(
    (
      id: string,
      createNode: (resolvedPosition?: { x: number; y: number }) => FlowNode,
      explicitPosition?: { x: number; y: number }
    ) => {
      const { activeLayerId, selectedNodeId } = useFlowStore.getState();

      setNodes((nds) => {
        const selectedSection =
          selectedNodeId
            ? nds.find((node) => node.id === selectedNodeId && node.type === 'section')
            : null;
        const fallbackPosition =
          explicitPosition
            ?? (selectedSection ? getSectionInsertPosition(selectedSection, nds) : undefined)
            ?? getDefaultNodePosition(nds.length, 100, 100);

        const createdNode = createNode(fallbackPosition);
        const baseNode: FlowNode = {
          ...createdNode,
          data: {
            ...createdNode.data,
            layerId: createdNode.data?.layerId ?? activeLayerId,
          },
        };

        const parentedNode = insertNodeIntoNearestSection(
          nds,
          baseNode,
          explicitPosition ? fallbackPosition : undefined,
          selectedSection?.id ?? null
        );

        return nds.concat(parentedNode);
      });
      setSelectedNodeId(id);
    },
    [setNodes, setSelectedNodeId]
  );

  const handleAddShape = useCallback(
    (shape: NodeData['shape'], position?: { x: number; y: number }) => {
      recordHistory();
      const id = createId();
      commitAddedNode(
        id,
        (resolvedPosition) =>
          createGenericShapeNode(id, resolvedPosition ?? getDefaultNodePosition(nodesLength, 100, 100), {
            type: 'process',
            color: 'white',
            shape,
          }),
        position
      );
      queueNodeLabelEditRequest(id, { replaceExisting: true });
    },
    [commitAddedNode, nodesLength, recordHistory]
  );

  const handleAddNode = useCallback(
    (position?: { x: number; y: number }) => {
      handleAddShape('rounded', position);
    },
    [handleAddShape]
  );

  const handleAddAnnotation = useCallback(
    (position?: { x: number; y: number }) => {
      recordHistory();
      const id = createId();
      commitAddedNode(
        id,
        (resolvedPosition) => createAnnotationNode(
          id,
          resolvedPosition || getDefaultNodePosition(nodesLength, 100, 100),
          { label: t('nodes.note'), subLabel: t('nodes.addCommentsHere') }
        ),
        position
      );
    },
    [commitAddedNode, nodesLength, recordHistory, t]
  );

  const handleAddArchitectureNode = useCallback(
    (position?: { x: number; y: number }) => {
      recordHistory();
      const id = createId('arch');
      commitAddedNode(
        id,
        (resolvedPosition) => ({
          id,
          type: 'architecture',
          position: resolvedPosition || getDefaultNodePosition(nodesLength, 120, 120),
          data: {
            label: 'New Service',
            color: 'slate',
            shape: 'rectangle',
            icon: 'Server',
            archProvider: 'custom',
            archResourceType: 'service',
            archEnvironment: 'default',
          },
          selected: true,
        }),
        position
      );
    },
    [commitAddedNode, nodesLength, recordHistory]
  );

  const handleAddSection = useCallback(
    (position?: { x: number; y: number }) => {
      recordHistory();
      const id = createId('section');
      const { activeLayerId } = useFlowStore.getState();
      setNodes((nds) => {
        const nextSectionOrder = getNextSectionOrder(nds);
        const createdSection = createSectionNode(id, position ?? getDefaultNodePosition(nds.length, 50, 50), t('nodes.newSection'));
        const nextNodes = position
          ? nds.concat({
              ...createdSection,
              data: {
                ...createdSection.data,
                sectionOrder: nextSectionOrder,
              },
            })
          : wrapSelectionInSection(nds, id, t('nodes.newSection'));

        return nextNodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  layerId: activeLayerId,
                  sectionOrder:
                    typeof node.data?.sectionOrder === 'number'
                      ? node.data.sectionOrder
                      : nextSectionOrder,
                },
              }
            : node
        );
      });
      setSelectedNodeId(id);
    },
    [recordHistory, setNodes, setSelectedNodeId, t]
  );

  const handleAddDomainLibraryItem = useCallback(
    (item: DomainLibraryItem, position?: { x: number; y: number }) => {
      recordHistory();
      const id = createId('lib');
      const { activeLayerId } = useFlowStore.getState();
      const newNode = createDomainLibraryNode(
        item,
        id,
        position || getDefaultNodePosition(nodesLength, 100, 100),
        activeLayerId
      );
      setNodes((nds) => {
        const selectedSectionId = useFlowStore.getState().selectedNodeId;
        return nds.concat(
          insertNodeIntoNearestSection(nds, newNode, position, selectedSectionId)
        );
      });
      setSelectedNodeId(id);
    },
    [nodesLength, recordHistory, setNodes, setSelectedNodeId]
  );

  return {
    handleAddShape,
    handleAddNode,
    handleAddAnnotation,
    handleAddArchitectureNode,
    handleAddSection,
    handleAddDomainLibraryItem,
  };
}
