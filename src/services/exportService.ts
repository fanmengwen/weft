import type { FlowEdge, FlowNode } from '@/lib/types';
import { toMermaid as toMermaidBuilder } from './export/mermaidBuilder';
import { toPlantUML as toPlantUMLBuilder } from './export/plantumlBuilder';

export function toMermaid(nodes: FlowNode[], edges: FlowEdge[]): string {
  return toMermaidBuilder(nodes, edges);
}

export function toPlantUML(nodes: FlowNode[], edges: FlowEdge[]): string {
  return toPlantUMLBuilder(nodes, edges);
}
