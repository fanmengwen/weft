import { createElement, useMemo, type ReactElement } from 'react';
import { useFlowStore } from '@/store';
import type { Node } from '@/lib/reactflowCompat';
import type { NodeData } from '@/lib/types';
import { getDiagramNodeProperties } from '@/diagram-types/core';
import { registerBuiltInPropertyPanels } from '@/diagram-types/registerBuiltInPropertyPanels';
import { NodeProperties } from './NodeProperties';

registerBuiltInPropertyPanels();

interface DiagramNodePropertiesRouterProps {
  selectedNode: Node<NodeData>;
  onChange: (id: string, data: Partial<NodeData>) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onAddMindmapChild?: (parentId: string) => void;
  onAddArchitectureService?: (sourceId: string) => void;
  onCreateArchitectureBoundary?: (sourceId: string) => void;
}

export function DiagramNodePropertiesRouter({
  selectedNode,
  onChange,
  onDuplicate,
  onDelete,
  onAddMindmapChild,
  onAddArchitectureService,
  onCreateArchitectureBoundary,
}: DiagramNodePropertiesRouterProps): ReactElement {
  const { tabs, activeTabId } = useFlowStore();
  const activeTab = tabs.find((tab) => tab.id === activeTabId);
  const diagramType = activeTab?.diagramType ?? 'flowchart';
  const registeredComponent = useMemo(() => getDiagramNodeProperties(diagramType), [diagramType]);

  if (!registeredComponent) {
    return (
      <NodeProperties
        selectedNode={selectedNode}
        onChange={onChange}
        onDuplicate={onDuplicate}
        onDelete={onDelete}
      />
    );
  }

  return createElement(registeredComponent, {
    selectedNode,
    onChange,
    onDuplicate,
    onDelete,
    onAddMindmapChild,
    onAddArchitectureService,
    onCreateArchitectureBoundary,
  });
}
