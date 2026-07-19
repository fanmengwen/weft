import React, { useState } from 'react';
import { LayoutTemplate } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CommandBar } from '@/components/CommandBar';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { FlowTemplate } from '@/services/templates';
import { useWorkflowRunStore } from './store/workflowRunStore';
import { useWorkflowStore } from './store/workflowStore';

interface WorkflowEmptyCanvasProps {
  nodes: FlowNode[];
  edges: FlowEdge[];
  onTemplateApplied: () => void;
}

function installWorkflowTemplate(template: FlowTemplate): void {
  const store = useWorkflowStore.getState();
  store.setWorkflowNodes(template.nodes.map((node) => ({ ...node, selected: false })));
  store.setWorkflowEdges(template.edges.map((edge) => ({ ...edge, selected: false })));
  store.setSelectedNodeId(null);
  store.setSelectedEdgeId(null);
  useWorkflowRunStore.getState().clearRunState();
}

export function WorkflowEmptyCanvas({
  nodes,
  edges,
  onTemplateApplied,
}: WorkflowEmptyCanvasProps): React.ReactElement {
  const { t } = useTranslation();
  const [templatesOpen, setTemplatesOpen] = useState(false);

  function handleTemplate(template: FlowTemplate): void {
    installWorkflowTemplate(template);
    onTemplateApplied();
  }

  return (
    <>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
        <p className="text-base font-semibold text-[var(--wf-text)]">
          {t('workflowMode.canvas.emptyTitle')}
        </p>
        <p className="mt-2 text-sm text-[var(--wf-text-muted)]">
          {t('workflowMode.canvas.emptyHint')}
        </p>
        <button
          type="button"
          onClick={() => setTemplatesOpen(true)}
          data-testid="workflow-empty-browse-templates"
          className="pointer-events-auto mt-6 inline-flex h-10 items-center gap-2 rounded-[var(--brand-radius)] border border-[var(--brand-border)] bg-[var(--brand-surface)] px-[18px] text-[13.5px] font-medium text-[var(--brand-text)] shadow-[var(--shadow-sm)] transition-colors hover:bg-[var(--brand-background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]"
        >
          <LayoutTemplate className="h-[15px] w-[15px] text-[var(--brand-secondary)]" />
          {t('flowEditor.emptyState.browseTemplates')}
        </button>
      </div>
      <CommandBar
        isOpen={templatesOpen}
        onClose={() => setTemplatesOpen(false)}
        nodes={nodes}
        edges={edges}
        initialView="templates"
        templateCategory="workflow"
        onSelectTemplate={handleTemplate}
      />
    </>
  );
}
