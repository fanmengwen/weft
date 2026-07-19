import { describe, expect, it } from 'vitest';
import { createStarterTemplateRegistry, STARTER_TEMPLATE_MANIFESTS } from './starterTemplates';
import { STARTER_WORKFLOW_TEMPLATE_MANIFESTS } from './starterWorkflowTemplates';
import {
  WORKFLOW_TEMPLATE_MIN_GAP,
  WORKFLOW_TEMPLATE_NODE_HEIGHT_EST,
  WORKFLOW_TEMPLATE_NODE_WIDTH,
} from './workflowTemplateFactories';

const EXPECTED_FLOW_IDS = [
  'leave-approval-flow',
  'order-fulfillment-flow',
  'user-registration-flow',
  'software-release-flow',
] as const;

const EXPECTED_WORKFLOW_IDS = [
  'online-hot-brief',
  'weekly-report-generator',
  'docs-qa-assistant',
  'competitor-monitor-report',
] as const;

describe('starter template manifests', () => {
  it('ships four flowchart and four workflow starters', () => {
    const flows = STARTER_TEMPLATE_MANIFESTS.filter((template) => template.category === 'flowchart');
    const workflows = STARTER_TEMPLATE_MANIFESTS.filter(
      (template) => template.category === 'workflow'
    );

    expect(flows.map((template) => template.id)).toEqual([...EXPECTED_FLOW_IDS]);
    expect(workflows.map((template) => template.id)).toEqual([...EXPECTED_WORKFLOW_IDS]);
    expect(STARTER_TEMPLATE_MANIFESTS).toHaveLength(8);
    expect(STARTER_TEMPLATE_MANIFESTS.every((template) => template.featured)).toBe(true);
  });

  it('uses real workflow node kinds for every workflow template', () => {
    STARTER_WORKFLOW_TEMPLATE_MANIFESTS.forEach((template) => {
      expect(template.category).toBe('workflow');
      expect(template.graph.nodes.length).toBeGreaterThanOrEqual(3);
      template.graph.nodes.forEach((node) => {
        expect(node.type).toBe((node.data as { kind?: string }).kind);
      });
      template.graph.edges.forEach((edge) => {
        const nodeIds = new Set(template.graph.nodes.map((node) => node.id));
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });
    });
  });

  it('lays out workflow templates with breathing room and no card overlap', () => {
    const nodeH = WORKFLOW_TEMPLATE_NODE_HEIGHT_EST;
    const nodeW = WORKFLOW_TEMPLATE_NODE_WIDTH;
    const minGap = WORKFLOW_TEMPLATE_MIN_GAP;

    STARTER_WORKFLOW_TEMPLATE_MANIFESTS.forEach((template) => {
      const boxes = template.graph.nodes.map((node) => ({
        id: node.id,
        left: node.position.x,
        right: node.position.x + nodeW,
        top: node.position.y,
        bottom: node.position.y + nodeH,
      }));

      for (let i = 0; i < boxes.length; i += 1) {
        for (let j = i + 1; j < boxes.length; j += 1) {
          const a = boxes[i];
          const b = boxes[j];
          const gapX = Math.max(0, b.left - a.right, a.left - b.right);
          const gapY = Math.max(0, b.top - a.bottom, a.top - b.bottom);
          const overlaps = gapX === 0 && gapY === 0;
          expect(overlaps, `${template.id}: ${a.id} overlaps ${b.id}`).toBe(false);

          // Separated on both axes counts as diagonal clearance; require the
          // dominant free axis to keep a visible gutter.
          const separation = gapX === 0 ? gapY : gapY === 0 ? gapX : Math.hypot(gapX, gapY);
          expect(
            separation,
            `${template.id}: ${a.id} too close to ${b.id} (sep=${separation})`
          ).toBeGreaterThanOrEqual(minGap);
        }
      }

      // Side handles: main-chain edges should still read left→right.
      template.graph.edges.forEach((edge) => {
        if (edge.sourceHandle === 'true' || edge.sourceHandle === 'false') return;
        const source = template.graph.nodes.find((node) => node.id === edge.source);
        const target = template.graph.nodes.find((node) => node.id === edge.target);
        expect(source).toBeDefined();
        expect(target).toBeDefined();
        expect(target!.position.x).toBeGreaterThan(source!.position.x);
      });
    });
  });

  it('has deterministic graph integrity for every starter template', () => {
    STARTER_TEMPLATE_MANIFESTS.forEach((template) => {
      const nodeIds = new Set(template.graph.nodes.map((node) => node.id));
      const edgeIds = new Set(template.graph.edges.map((edge) => edge.id));

      expect(nodeIds.size).toBe(template.graph.nodes.length);
      expect(edgeIds.size).toBe(template.graph.edges.length);

      template.graph.edges.forEach((edge) => {
        expect(nodeIds.has(edge.source)).toBe(true);
        expect(nodeIds.has(edge.target)).toBe(true);
      });
    });
  });

  it('requires editorial metadata for every shipped template', () => {
    STARTER_TEMPLATE_MANIFESTS.forEach((template) => {
      expect(template.name.length).toBeGreaterThan(1);
      expect(template.description.length).toBeGreaterThan(10);
      expect(template.useCase.length).toBeGreaterThan(10);
      expect(template.outcome.length).toBeGreaterThan(10);
      expect(template.replacementHints.length).toBeGreaterThanOrEqual(3);
      expect(template.launchPriority).toBeGreaterThan(0);
      expect(typeof template.featured).toBe('boolean');
      expect(['starter', 'intermediate', 'advanced']).toContain(template.difficulty);
    });
  });

  it('is consumable by template registry scaffold', () => {
    const registry = createStarterTemplateRegistry();

    expect(registry.listTemplates()).toHaveLength(8);
    expect(registry.getTemplate('leave-approval-flow')?.graph.nodes.length).toBe(6);
    expect(registry.getTemplate('online-hot-brief')?.name).toBe('联网热点简报');
    expect(registry.getTemplate('weekly-report-generator')?.category).toBe('workflow');
    expect(registry.getTemplate('docs-qa-assistant')?.graph.nodes.length).toBe(6);
    expect(registry.getTemplate('competitor-monitor-report')?.graph.nodes.length).toBe(8);
  });
});

