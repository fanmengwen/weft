import type { AddItemActions } from './addItemRegistry';

export interface FlowAddItemHandlers {
  handleAddShape: AddItemActions['onAddShape'];
  handleAddAnnotation: AddItemActions['onAddAnnotation'];
  handleAddSection: AddItemActions['onAddSection'];
  handleAddTextNode: AddItemActions['onAddTextNode'];
  handleAddJourneyNode: AddItemActions['onAddJourneyNode'];
  handleAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
  handleAddWireframe: AddItemActions['onAddWireframe'];
}

export function buildAddItemActions(handlers: FlowAddItemHandlers): AddItemActions {
  return {
    onAddShape: handlers.handleAddShape,
    onAddAnnotation: handlers.handleAddAnnotation,
    onAddSection: handlers.handleAddSection,
    onAddTextNode: handlers.handleAddTextNode,
    onAddJourneyNode: handlers.handleAddJourneyNode,
    onAddArchitectureNode: handlers.handleAddArchitectureNode,
    onAddWireframe: handlers.handleAddWireframe,
  };
}

export function buildAddItemActionsFromToolbar(toolbar: {
  onAddShape: AddItemActions['onAddShape'];
  onAddAnnotation: AddItemActions['onAddAnnotation'];
  onAddSection: AddItemActions['onAddSection'];
  onAddTextNode: AddItemActions['onAddTextNode'];
  onAddJourneyNode: AddItemActions['onAddJourneyNode'];
  onAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
  onAddWireframe: AddItemActions['onAddWireframe'];
}): AddItemActions {
  return {
    onAddShape: toolbar.onAddShape,
    onAddAnnotation: toolbar.onAddAnnotation,
    onAddSection: toolbar.onAddSection,
    onAddTextNode: toolbar.onAddTextNode,
    onAddJourneyNode: toolbar.onAddJourneyNode,
    onAddArchitectureNode: toolbar.onAddArchitectureNode,
    onAddWireframe: toolbar.onAddWireframe,
  };
}
