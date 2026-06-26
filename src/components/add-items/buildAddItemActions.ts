import type { AddItemActions } from './addItemRegistry';

export interface FlowAddItemHandlers {
  handleAddShape: AddItemActions['onAddShape'];
  handleAddAnnotation: AddItemActions['onAddAnnotation'];
  handleAddSection: AddItemActions['onAddSection'];
  handleAddTextNode: AddItemActions['onAddTextNode'];
  handleAddClassNode: AddItemActions['onAddClassNode'];
  handleAddEntityNode: AddItemActions['onAddEntityNode'];
  handleAddMindmapNode: AddItemActions['onAddMindmapNode'];
  handleAddJourneyNode: AddItemActions['onAddJourneyNode'];
  handleAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
  handleAddSequenceParticipant: AddItemActions['onAddSequenceParticipant'];
  handleAddWireframe: AddItemActions['onAddWireframe'];
}

export function buildAddItemActions(handlers: FlowAddItemHandlers): AddItemActions {
  return {
    onAddShape: handlers.handleAddShape,
    onAddAnnotation: handlers.handleAddAnnotation,
    onAddSection: handlers.handleAddSection,
    onAddTextNode: handlers.handleAddTextNode,
    onAddClassNode: handlers.handleAddClassNode,
    onAddEntityNode: handlers.handleAddEntityNode,
    onAddMindmapNode: handlers.handleAddMindmapNode,
    onAddJourneyNode: handlers.handleAddJourneyNode,
    onAddArchitectureNode: handlers.handleAddArchitectureNode,
    onAddSequenceParticipant: handlers.handleAddSequenceParticipant,
    onAddWireframe: handlers.handleAddWireframe,
  };
}

export function buildAddItemActionsFromToolbar(toolbar: {
  onAddShape: AddItemActions['onAddShape'];
  onAddAnnotation: AddItemActions['onAddAnnotation'];
  onAddSection: AddItemActions['onAddSection'];
  onAddTextNode: AddItemActions['onAddTextNode'];
  onAddClassNode: AddItemActions['onAddClassNode'];
  onAddEntityNode: AddItemActions['onAddEntityNode'];
  onAddMindmapNode: AddItemActions['onAddMindmapNode'];
  onAddJourneyNode: AddItemActions['onAddJourneyNode'];
  onAddArchitectureNode: AddItemActions['onAddArchitectureNode'];
  onAddSequenceParticipant: AddItemActions['onAddSequenceParticipant'];
  onAddWireframe: AddItemActions['onAddWireframe'];
}): AddItemActions {
  return {
    onAddShape: toolbar.onAddShape,
    onAddAnnotation: toolbar.onAddAnnotation,
    onAddSection: toolbar.onAddSection,
    onAddTextNode: toolbar.onAddTextNode,
    onAddClassNode: toolbar.onAddClassNode,
    onAddEntityNode: toolbar.onAddEntityNode,
    onAddMindmapNode: toolbar.onAddMindmapNode,
    onAddJourneyNode: toolbar.onAddJourneyNode,
    onAddArchitectureNode: toolbar.onAddArchitectureNode,
    onAddSequenceParticipant: toolbar.onAddSequenceParticipant,
    onAddWireframe: toolbar.onAddWireframe,
  };
}
