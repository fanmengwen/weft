import type { EdgeTypes, NodeTypes } from '@/lib/reactflowCompat';
import AnnotationNode from '@/components/AnnotationNode';
import CustomNode from '@/components/CustomNode';
import {
  CustomBezierEdge,
  CustomSmoothStepEdge,
  CustomStepEdge,
  CustomStraightEdge,
} from '@/components/CustomEdge';
import ImageNode from '@/components/ImageNode';
import MermaidSvgNode from '@/components/MermaidSvgNode';
import TextNode from '@/components/TextNode';
import BrowserNode from '@/components/custom-nodes/BrowserNode';
import MobileNode from '@/components/custom-nodes/MobileNode';
import ArchitectureNode from '@/components/custom-nodes/ArchitectureNode';
import SectionNode from '@/components/SectionNode';

export const flowCanvasNodeTypes: NodeTypes = {
  start: CustomNode,
  process: CustomNode,
  decision: CustomNode,
  end: CustomNode,
  custom: CustomNode,
  architecture: ArchitectureNode,
  annotation: AnnotationNode,
  text: TextNode,
  section: SectionNode,
  image: ImageNode,
  mermaid_svg: MermaidSvgNode,
  browser: BrowserNode,
  mobile: MobileNode,
};

export const flowCanvasEdgeTypes: EdgeTypes = {
  default: CustomBezierEdge,
  smoothstep: CustomSmoothStepEdge,
  step: CustomStepEdge,
  bezier: CustomBezierEdge,
  straight: CustomStraightEdge,
};

interface ConnectionLike {
  source?: string | null;
  target?: string | null;
  sourceHandle?: string | null;
  targetHandle?: string | null;
}

export function isDuplicateConnection(
  connection: ConnectionLike,
  edges: ConnectionLike[]
): boolean {
  return edges.some((edge) => {
    return (
      edge.source === connection.source &&
      edge.target === connection.target &&
      edge.sourceHandle === connection.sourceHandle &&
      edge.targetHandle === connection.targetHandle
    );
  });
}
