import React from 'react';
import type { HomeShowcaseTemplate } from './homeShowcase';

export function FlowGroupIcon(): React.ReactElement {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden className="block">
      <path
        d="M12 4.5 L19.5 12 L12 19.5 L4.5 12 Z"
        stroke="currentColor"
        strokeWidth={2.2}
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WorkflowGroupIcon(): React.ReactElement {
  return (
    <svg width={12} height={12} viewBox="0 0 24 24" aria-hidden className="block">
      <path
        d="M12 3.5 L13.8 10.2 L20.5 12 L13.8 13.8 L12 20.5 L10.2 13.8 L3.5 12 L10.2 10.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

function FlowRowIcon(): React.ReactElement {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden className="block">
      <path
        d="M4.5 8 L12 4.5 L19.5 8 L12 11.5 Z M4.5 8 V16 L12 19.5 M19.5 8 V16 L12 19.5 M12 11.5 V19.5"
        stroke="currentColor"
        strokeWidth={1.7}
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function FlowTreeIcon(): React.ReactElement {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden className="block">
      <rect x={4.5} y={4.5} width={15} height={5.5} rx={1.5} stroke="currentColor" strokeWidth={1.7} fill="none" />
      <rect x={4.5} y={14} width={6.5} height={5.5} rx={1.5} stroke="currentColor" strokeWidth={1.7} fill="none" />
      <rect x={13} y={14} width={6.5} height={5.5} rx={1.5} stroke="currentColor" strokeWidth={1.7} fill="none" />
    </svg>
  );
}

function ChatRowIcon(): React.ReactElement {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden className="block">
      <path
        d="M4.5 7 A2.5 2.5 0 0 1 7 4.5 H17 A2.5 2.5 0 0 1 19.5 7 V13 A2.5 2.5 0 0 1 17 15.5 H10 L6 19 V15.5 H7 A2.5 2.5 0 0 1 4.5 13 Z"
        stroke="currentColor"
        strokeWidth={1.7}
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DocRowIcon(): React.ReactElement {
  return (
    <svg width={15} height={15} viewBox="0 0 24 24" aria-hidden className="block">
      <path
        d="M7 4.5 H14.5 L19 9 V19.5 H7 Z M14 4.5 V9.5 H19"
        stroke="currentColor"
        strokeWidth={1.7}
        fill="none"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 13.5 H16.5 M9.5 16.5 H14"
        stroke="currentColor"
        strokeWidth={1.7}
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function showcaseRowIcon(item: HomeShowcaseTemplate): React.ReactElement {
  if (item.kind === 'workflow') {
    return item.id === 'weekly-report' ? <DocRowIcon /> : <ChatRowIcon />;
  }
  return item.id === 'system-architecture' ? <FlowTreeIcon /> : <FlowRowIcon />;
}
