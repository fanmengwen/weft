import type { AddItemActions } from './addItemRegistry';

export interface FlowAddItemHandlers {
  handleAddShape: AddItemActions['onAddShape'];
  handleAddAnnotation: AddItemActions['onAddAnnotation'];
  handleAddSection: AddItemActions['onAddSection'];
  handleAddTextNode: AddItemActions['onAddTextNode'];
  handleAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
  handleAddWireframe: AddItemActions['onAddWireframe'];
}

export function buildAddItemActions(handlers: FlowAddItemHandlers): AddItemActions {
  return {
    onAddShape: handlers.handleAddShape,
    onAddAnnotation: handlers.handleAddAnnotation,
    onAddSection: handlers.handleAddSection,
    onAddTextNode: handlers.handleAddTextNode,
    onAddArchitectureNode: handlers.handleAddArchitectureNode,
    onAddWireframe: handlers.handleAddWireframe,
  };
}

export function buildAddItemActionsFromToolbar(toolbar: {
  onAddShape: AddItemActions['onAddShape'];
  onAddAnnotation: AddItemActions['onAddAnnotation'];
  onAddSection: AddItemActions['onAddSection'];
  onAddTextNode: AddItemActions['onAddTextNode'];
  onAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
  onAddWireframe: AddItemActions['onAddWireframe'];
}): AddItemActions {
  return {
    onAddShape: toolbar.onAddShape,
    onAddAnnotation: toolbar.onAddAnnotation,
    onAddSection: toolbar.onAddSection,
    onAddTextNode: toolbar.onAddTextNode,
    onAddArchitectureNode: toolbar.onAddArchitectureNode,
    onAddWireframe: toolbar.onAddWireframe,
  };
}