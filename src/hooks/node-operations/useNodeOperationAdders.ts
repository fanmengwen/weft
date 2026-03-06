import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { trackEvent } from '@/lib/analytics';
import { createId } from '@/lib/id';
import type { FlowNode } from '@/lib/types';
import { useFlowStore } from '@/store';
import {
  createAnnotationNode,
  createImageNode,
  createProcessNode,
  createSectionNode,
  createTextNode,
  getDefaultNodePosition,
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

  const handleAddNode = useCallback((position?: { x: number; y: number }) => {
    recordHistory();
    const id = createId();
    const { activeLayerId } = useFlowStore.getState();
    const newNode = createProcessNode(
      id,
      position || getDefaultNodePosition(nodesLength, 100, 100),
      { label: t('nodes.newNode'), subLabel: t('nodes.processStep') }
    );
    newNode.data = {
      ...newNode.data,
      layerId: activeLayerId,
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
    trackEvent('add_node', { node_type: 'process' });
  }, [nodesLength, recordHistory, setNodes, setSelectedNodeId, t]);

  const handleAddAnnotation = useCallback((position?: { x: number; y: number }) => {
    recordHistory();
    const id = createId();
    const { activeLayerId } = useFlowStore.getState();
    const newNode = createAnnotationNode(
      id,
      position || getDefaultNodePosition(nodesLength, 100, 100),
      { label: t('nodes.note'), subLabel: t('nodes.addCommentsHere') }
    );
    newNode.data = {
      ...newNode.data,
      layerId: activeLayerId,
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
    trackEvent('add_node', { node_type: 'annotation' });
  }, [nodesLength, recordHistory, setNodes, setSelectedNodeId, t]);

  const handleAddJourneyNode = useCallback((position?: { x: number; y: number }) => {
    recordHistory();
    const id = createId('journey');
    const { activeLayerId } = useFlowStore.getState();
    const newNode: FlowNode = {
      id,
      type: 'journey',
      position: position || getDefaultNodePosition(nodesLength, 120, 120),
      data: {
        label: 'User Journey',
        subLabel: 'User',
        color: 'violet',
        shape: 'rounded',
        journeySection: 'General',
        journeyTask: 'User Journey',
        journeyActor: 'User',
        journeyScore: 3,
        layerId: activeLayerId,
      },
      selected: true,
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
    trackEvent('add_node', { node_type: 'journey' });
  }, [nodesLength, recordHistory, setNodes, setSelectedNodeId]);

  const handleAddSection = useCallback((position?: { x: number; y: number }) => {
    recordHistory();
    const id = createId('section');
    const { activeLayerId } = useFlowStore.getState();
    const newNode = createSectionNode(
      id,
      position || getDefaultNodePosition(nodesLength, 50, 50),
      t('nodes.newSection')
    );
    newNode.data = {
      ...newNode.data,
      layerId: activeLayerId,
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
    trackEvent('add_node', { node_type: 'section' });
  }, [nodesLength, recordHistory, setNodes, setSelectedNodeId, t]);

  const handleAddTextNode = useCallback((position?: { x: number; y: number }) => {
    recordHistory();
    const id = createId('text');
    const { activeLayerId } = useFlowStore.getState();
    const newNode = createTextNode(
      id,
      position || getDefaultNodePosition(nodesLength, 100, 100),
      t('nodes.text')
    );
    newNode.data = {
      ...newNode.data,
      layerId: activeLayerId,
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
    trackEvent('add_node', { node_type: 'text' });
  }, [nodesLength, recordHistory, setNodes, setSelectedNodeId, t]);

  const handleAddImage = useCallback((imageUrl: string, position?: { x: number; y: number }) => {
    recordHistory();
    const id = createId('image');
    const { activeLayerId } = useFlowStore.getState();
    const newNode = createImageNode(
      id,
      imageUrl,
      position || getDefaultNodePosition(nodesLength, 100, 100),
      t('nodes.image')
    );
    newNode.data = {
      ...newNode.data,
      layerId: activeLayerId,
    };
    setNodes((nds) => nds.concat(newNode));
    setSelectedNodeId(id);
    trackEvent('add_node', { node_type: 'image' });
  }, [nodesLength, recordHistory, setNodes, setSelectedNodeId, t]);

  return {
    handleAddNode,
    handleAddAnnotation,
    handleAddJourneyNode,
    handleAddSection,
    handleAddTextNode,
    handleAddImage,
  };
}
