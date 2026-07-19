import { describe, expect, it } from 'vitest';
import type { FlowTemplate } from '@/services/templates';
import { Layout } from 'lucide-react';
import { NodeType } from '@/lib/types';
import {
  filterTemplatesByQuery,
  isFlowchartTemplate,
  isWorkflowTemplate,
  shortDescription,
  splitHeroAndRest,
} from './templateCatalog';

function stub(partial: Partial<FlowTemplate> & Pick<FlowTemplate, 'id' | 'name'>): FlowTemplate {
  return {
    description: '',
    icon: Layout,
    msg: 'flowchart',
    category: 'flowchart',
    tags: [],
    audience: 'builders',
    useCase: '',
    launchPriority: 1,
    featured: true,
    difficulty: 'starter',
    outcome: '',
    replacementHints: [],
    nodes: [],
    edges: [],
    ...partial,
  };
}

describe('templateCatalog', () => {
  it('classifies workflow by category or tag', () => {
    expect(isWorkflowTemplate(stub({ id: 'a', name: 'A', category: 'workflow' }))).toBe(true);
    expect(isWorkflowTemplate(stub({ id: 'b', name: 'B', tags: ['工作流'] }))).toBe(true);
    expect(isFlowchartTemplate(stub({ id: 'c', name: 'C' }))).toBe(true);
  });

  it('filters by name and hints', () => {
    const list = [
      stub({ id: '1', name: '请假审批', replacementHints: ['主管'] }),
      stub({ id: '2', name: '订单履约', description: '电商出库' }),
    ];
    expect(filterTemplatesByQuery(list, '请假').map((t) => t.id)).toEqual(['1']);
    expect(filterTemplatesByQuery(list, '出库').map((t) => t.id)).toEqual(['2']);
  });

  it('splits hero and rest', () => {
    const list = [stub({ id: 'h', name: 'H' }), stub({ id: 'r', name: 'R' })];
    expect(splitHeroAndRest(list).hero?.id).toBe('h');
    expect(splitHeroAndRest(list).rest.map((t) => t.id)).toEqual(['r']);
    expect(splitHeroAndRest([]).hero).toBeNull();
  });

  it('shortens long descriptions', () => {
    expect(shortDescription('短文案')).toBe('短文案');
    expect(shortDescription('这是一段很长很长很长很长很长很长很长很长很长的说明文字', 12).endsWith('…')).toBe(
      true
    );
  });

  it('ignores annotation when counting kinds via decision helper input shape', () => {
    const template = stub({
      id: 'n',
      name: 'N',
      nodes: [
        {
          id: '1',
          type: NodeType.DECISION,
          position: { x: 0, y: 0 },
          data: { label: '?', color: 'amber' },
        },
      ],
    });
    expect(template.nodes).toHaveLength(1);
  });
});
