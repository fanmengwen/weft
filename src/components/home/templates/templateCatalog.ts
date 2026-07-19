import { NodeType } from '@/lib/types';
import type { FlowTemplate } from '@/services/templates';

export type TemplatesKindTab = 'all' | 'flowchart' | 'workflow';

export function isWorkflowTemplate(template: FlowTemplate): boolean {
  return (
    template.category === 'workflow' ||
    template.tags.some((tag) => tag === 'workflow' || tag === '工作流')
  );
}

export function isFlowchartTemplate(template: FlowTemplate): boolean {
  return !isWorkflowTemplate(template);
}

export function filterTemplatesByQuery(
  templates: FlowTemplate[],
  query: string
): FlowTemplate[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return templates;
  }
  return templates.filter((template) => {
    const haystack = [
      template.name,
      template.description,
      template.useCase,
      template.category,
      ...template.tags,
      ...template.replacementHints,
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(normalized);
  });
}

export function splitHeroAndRest(templates: FlowTemplate[]): {
  hero: FlowTemplate | null;
  rest: FlowTemplate[];
} {
  if (templates.length === 0) {
    return { hero: null, rest: [] };
  }
  return { hero: templates[0] ?? null, rest: templates.slice(1) };
}

export function countDecisionNodes(template: FlowTemplate): number {
  return template.nodes.filter(
    (node) => node.type === NodeType.DECISION || node.type === 'ifElse'
  ).length;
}

export function countNodesByKind(template: FlowTemplate): {
  startEnd: number;
  decision: number;
  process: number;
  other: number;
} {
  let startEnd = 0;
  let decision = 0;
  let process = 0;
  let other = 0;
  for (const node of template.nodes) {
    if (node.type === NodeType.ANNOTATION) {
      continue;
    }
    const type = node.type ?? '';
    if (
      type === NodeType.START ||
      type === NodeType.END ||
      type === 'textInput' ||
      type === 'output'
    ) {
      startEnd += 1;
    } else if (type === NodeType.DECISION || type === 'ifElse') {
      decision += 1;
    } else if (
      type === NodeType.PROCESS ||
      type === 'llm' ||
      type === 'webSearch' ||
      type === 'knowledgeRetrieval' ||
      type === 'code'
    ) {
      process += 1;
    } else {
      other += 1;
    }
  }
  return { startEnd, decision, process, other };
}

export function shortDescription(text: string, maxLength = 42): string {
  const compact = text.replace(/\s+/g, ' ').trim();
  if (compact.length <= maxLength) {
    return compact;
  }
  return `${compact.slice(0, maxLength - 1)}…`;
}
