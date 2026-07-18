import React, { useMemo } from 'react';
import type { FlowTemplate } from '@/services/templates';
import { DesignFlowPreview } from '@/components/home/previews/DesignFlowPreview';
import { graphFromFlowNodes } from '@/components/home/previews/designFlowPreviewModel';

interface TemplateDiagramPreviewProps {
  template: FlowTemplate;
  className?: string;
  density?: 'hero' | 'card';
}

export function TemplateDiagramPreview({
  template,
  className,
  density = 'card',
}: TemplateDiagramPreviewProps): React.ReactElement {
  const graph = useMemo(
    () => graphFromFlowNodes(template.nodes, template.edges),
    [template.nodes, template.edges]
  );

  if (graph.nodes.length === 0) {
    const Icon = template.icon;
    return (
      <div className={className ? `absolute inset-0 ${className}` : 'absolute inset-0'}>
        <div
          className="absolute inset-0 bg-[#F6F7F9]"
          style={{
            backgroundImage: 'radial-gradient(circle, #DEE1E7 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#E1E4EA] bg-white text-[#8B93A0] shadow-sm">
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <DesignFlowPreview
      graph={graph}
      density={density}
      className={className}
      showDotGrid
    />
  );
}
