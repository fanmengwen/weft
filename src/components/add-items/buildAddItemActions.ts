import type { AddItemActions } from './addItemRegistry';

export interface FlowAddItemHandlers {
  handleAddShape: AddItemActions['onAddShape'];
  handleAddAnnotation: AddItemActions['onAddAnnotation'];
  handleAddSection: AddItemActions['onAddSection'];
  handleAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
}

export function buildAddItemActions(handlers: FlowAddItemHandlers): AddItemActions {
  return {
    onAddShape: handlers.handleAddShape,
    onAddAnnotation: handlers.handleAddAnnotation,
    onAddSection: handlers.handleAddSection,
    onAddArchitectureNode: handlers.handleAddArchitectureNode,
  };
}

export function buildAddItemActionsFromToolbar(toolbar: {
  onAddShape: AddItemActions['onAddShape'];
  onAddAnnotation: AddItemActions['onAddAnnotation'];
  onAddSection: AddItemActions['onAddSection'];
  onAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
}): AddItemActions {
  return {
    onAddShape: toolbar.onAddShape,
    onAddAnnotation: toolbar.onAddAnnotation,
    onAddSection: toolbar.onAddSection,
    onAddArchitectureNode: toolbar.onAddArchitectureNode,
  };
}
