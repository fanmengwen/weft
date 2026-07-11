import { createId } from '@/lib/id';
import type { FlowNode } from '@/lib/types';

export interface FigmaTextLayerInput {
  text: string;
  position: { x: number; y: number };
  layerId?: string;
}

export function mapFigmaTextLayerToAnnotationNode(input: FigmaTextLayerInput): FlowNode {
  return {
    id: createId('annotation'),
    type: 'annotation',
    position: input.position,
    data: {
      label: input.text,
      subLabel: '',
      color: 'yellow',
      layerId: input.layerId,
    },
  };
}
