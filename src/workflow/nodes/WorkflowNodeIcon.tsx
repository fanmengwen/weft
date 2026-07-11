import React from 'react';
import type { WorkflowNodeKind } from './nodeCatalog';

const STROKE_PROPS = {
  stroke: 'currentColor',
  strokeWidth: 2,
  fill: 'none',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
} as const;

/** Glyphs lifted verbatim from the "Workflow 新版" design file (24px viewBox). */
const ICONS: Record<WorkflowNodeKind, React.ReactElement> = {
  textInput: <path d="M5 6 H19 M12 6 V19" {...STROKE_PROPS} />,
  llm: (
    <path
      d="M12 3.5 L13.8 10.2 L20.5 12 L13.8 13.8 L12 20.5 L10.2 13.8 L3.5 12 L10.2 10.2 Z"
      fill="currentColor"
    />
  ),
  webSearch: (
    <>
      <circle cx={10.5} cy={10.5} r={6} stroke="currentColor" strokeWidth={2} fill="none" />
      <path d="M15 15 L20 20" {...STROKE_PROPS} />
    </>
  ),
  knowledgeRetrieval: (
    <>
      <rect x={5} y={4} width={14} height={16} rx={2} stroke="currentColor" strokeWidth={2} fill="none" />
      <path d="M9.5 4 V20" stroke="currentColor" strokeWidth={2} fill="none" />
    </>
  ),
  ifElse: <path d="M12 4.5 L19.5 12 L12 19.5 L4.5 12 Z" {...STROKE_PROPS} />,
  code: <path d="M9 8.5 L5.5 12 L9 15.5 M15 8.5 L18.5 12 L15 15.5" {...STROKE_PROPS} />,
  output: (
    <path
      d="M12 4 V12.5 M8.5 9.5 L12 13 L15.5 9.5 M4.5 14.5 V17.5 A2 2 0 0 0 6.5 19.5 H17.5 A2 2 0 0 0 19.5 17.5 V14.5"
      {...STROKE_PROPS}
    />
  ),
};

interface WorkflowNodeIconProps {
  kind: WorkflowNodeKind;
  className?: string;
}

export function WorkflowNodeIcon({ kind, className }: WorkflowNodeIconProps): React.ReactElement {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} style={{ display: 'block' }}>
      {ICONS[kind]}
    </svg>
  );
}
