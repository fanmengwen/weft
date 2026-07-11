import type { DiagramNodePropertiesComponent } from '@/diagram-types/core';
import type { DiagramType } from '@/lib/types';
import { ArchitectureNodeProperties } from '@/components/properties/families/ArchitectureNodeProperties';
import { JourneyNodeProperties } from '@/components/properties/families/JourneyNodeProperties';
export interface BuiltInDiagramPropertyPanel {
  diagramType: DiagramType;
  component: DiagramNodePropertiesComponent;
}

export const BUILT_IN_DIAGRAM_PROPERTY_PANELS: BuiltInDiagramPropertyPanel[] = [
  { diagramType: 'journey', component: JourneyNodeProperties },
  { diagramType: 'architecture', component: ArchitectureNodeProperties },
];
