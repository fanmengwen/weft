import React from 'react';
import {
  CheckCircle,
  Database,
  Download,
  HelpCircle,
  Pencil,
  Play,
  Square,
} from 'lucide-react';
import type { TFunction } from 'i18next';
import type { FlowNode, NodeData } from '@/lib/types';

export type AddItemId =
  | 'start'
  | 'end'
  | 'process'
  | 'decision'
  | 'io'
  | 'database'
  | 'annotation';

export type AddItemSectionId = 'shapes' | 'diagrams' | 'other';
export type AddItemScope = 'toolbar' | 'assets';

export interface AddShapeSpec {
  type: FlowNode['type'];
  shape?: NodeData['shape'];
}

export type AddShapeInput = NodeData['shape'] | AddShapeSpec;

export interface AddItemDefinition {
  id: AddItemId;
  label: string;
  section: AddItemSectionId;
  keywords: string[];
  scope: AddItemScope[];
  renderIcon: (className?: string) => React.ReactElement;
}

const DEFAULT_TOOLBAR_ADD_ITEM_ID: AddItemId = 'process';

function makeLucideIcon(Icon: React.ComponentType<{ className?: string }>): (className?: string) => React.ReactElement {
  return function renderLucideIcon(className?: string): React.ReactElement {
    return <Icon className={className ?? 'h-5 w-5'} />;
  };
}

export function getAddItemSections(t: TFunction): Array<{ id: AddItemSectionId; title: string }> {
  return [
    { id: 'shapes', title: t('toolbar.shapes', 'Shapes') },
    { id: 'diagrams', title: t('toolbar.diagrams', 'Diagrams') },
    { id: 'other', title: t('toolbar.other', 'Other') },
  ];
}

export function getAddItemDefinitions(t: TFunction): AddItemDefinition[] {
  return [
    {
      id: 'start',
      label: t('toolbar.start', 'Start'),
      section: 'shapes',
      keywords: ['start', 'begin', 'terminal', 'stadium'],
      scope: ['toolbar'],
      renderIcon: makeLucideIcon(Play),
    },
    {
      id: 'end',
      label: t('toolbar.end', 'End'),
      section: 'shapes',
      keywords: ['end', 'finish', 'terminal', 'stadium'],
      scope: ['toolbar'],
      renderIcon: makeLucideIcon(CheckCircle),
    },
    {
      id: 'process',
      label: t('toolbar.process', 'Process'),
      section: 'shapes',
      keywords: ['process', 'action', 'step', 'block'],
      scope: ['toolbar', 'assets'],
      renderIcon: makeLucideIcon(Square),
    },
    {
      id: 'decision',
      label: t('toolbar.decision', 'Decision'),
      section: 'shapes',
      keywords: ['decision', 'branch', 'diamond', 'condition'],
      scope: ['toolbar'],
      renderIcon: makeLucideIcon(HelpCircle),
    },
    {
      id: 'io',
      label: t('nodes.inputOutput', 'Input / Output'),
      section: 'shapes',
      keywords: ['input', 'output', 'io', 'parallelogram'],
      scope: ['toolbar'],
      renderIcon: makeLucideIcon(Download),
    },
    {
      id: 'database',
      label: t('nodes.database', 'Database'),
      section: 'shapes',
      keywords: ['database', 'storage', 'cylinder', 'data'],
      scope: ['toolbar'],
      renderIcon: makeLucideIcon(Database),
    },
    {
      id: 'annotation',
      label: t('toolbar.annotation', 'Note'),
      section: 'other',
      keywords: ['annotation', 'note', 'comment', 'sticky'],
      scope: ['toolbar', 'assets'],
      renderIcon: makeLucideIcon(Pencil),
    },
  ];
}

export function getAddItemsForScope(scope: AddItemScope, t: TFunction): AddItemDefinition[] {
  return getAddItemDefinitions(t).filter((item) => item.scope.includes(scope));
}

export function getAddItemDefinitionById(id: AddItemId, t: TFunction): AddItemDefinition {
  const definition = getAddItemDefinitions(t).find((item) => item.id === id);

  if (!definition) {
    throw new Error(`Unknown add item id: ${id}`);
  }

  return definition;
}

export interface AddItemActions {
  onAddShape: (input: AddShapeInput, position?: { x: number; y: number }) => void;
  onAddAnnotation: (position?: { x: number; y: number }) => void;
  onAddSection: (position?: { x: number; y: number }) => void;
  onAddArchitectureNode: (position?: { x: number; y: number }) => void;
}

export function executeAddItem(
  id: AddItemId,
  actions: AddItemActions,
  position?: { x: number; y: number },
): void {
  switch (id) {
    case 'start':
      actions.onAddShape({ type: 'start', shape: 'capsule' }, position);
      return;
    case 'end':
      actions.onAddShape({ type: 'end', shape: 'capsule' }, position);
      return;
    case 'process':
      actions.onAddShape({ type: 'process', shape: 'rounded' }, position);
      return;
    case 'decision':
      actions.onAddShape({ type: 'decision', shape: 'diamond' }, position);
      return;
    case 'io':
      actions.onAddShape({ type: 'custom', shape: 'parallelogram' }, position);
      return;
    case 'database':
      actions.onAddShape({ type: 'custom', shape: 'cylinder' }, position);
      return;
    case 'annotation':
      actions.onAddAnnotation(position);
      return;
    default: {
      const exhaustiveCheck: never = id;
      throw new Error(`Unhandled add item id: ${exhaustiveCheck}`);
    }
  }
}

export function getDefaultToolbarAddItemId(): AddItemId {
  return DEFAULT_TOOLBAR_ADD_ITEM_ID;
}
