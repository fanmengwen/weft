import type { DiagramPlugin } from '@/diagram-types/core';
import { ARCHITECTURE_PLUGIN } from '@/diagram-types/architecture/plugin';
import { FLOWCHART_PLUGIN } from '@/diagram-types/flowchart/plugin';
import { STATE_DIAGRAM_PLUGIN } from '@/diagram-types/stateDiagram/plugin';

export const BUILT_IN_DIAGRAM_PLUGINS: DiagramPlugin[] = [
  FLOWCHART_PLUGIN,
  STATE_DIAGRAM_PLUGIN,
  ARCHITECTURE_PLUGIN,
];
