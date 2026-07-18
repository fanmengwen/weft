import React from 'react';
import type { DocumentKind } from './documentKindStorage';

const DOT_BG =
  'radial-gradient(circle, #DEE1E7 1px, transparent 1px)';

export function ExamplePreview({ kind }: { kind: DocumentKind }): React.ReactElement {
  return (
    <div
      className="relative h-[84px] overflow-hidden rounded-[9px] border border-[color-mix(in_srgb,var(--color-brand-border),transparent_20%)] bg-[#F6F7F9] dark:bg-[color-mix(in_srgb,var(--brand-background),white_4%)]"
      style={{ backgroundImage: DOT_BG, backgroundSize: '16px 16px' }}
      aria-hidden="true"
    >
      {kind === 'chart' ? <ChartPreviewShapes /> : <WorkflowPreviewShapes />}
    </div>
  );
}

function ChartPreviewShapes(): React.ReactElement {
  return (
    <>
      <svg className="absolute inset-0 h-full w-full">
        <path d="M84 42 H128 M196 42 H240" stroke="#C3C9D3" strokeWidth="1.4" fill="none" />
      </svg>
      <div className="absolute left-7 top-8 h-5 w-14 rounded-full border border-[#E1E4EA] bg-white" />
      <div className="absolute left-[148px] top-7 h-7 w-7 rotate-45 rounded-[7px] border border-[#E1E4EA] bg-white" />
      <div className="absolute left-60 top-8 h-5 w-14 rounded-full border border-[#E1E4EA] bg-white" />
    </>
  );
}

function WorkflowPreviewShapes(): React.ReactElement {
  return (
    <>
      <svg className="absolute inset-0 h-full w-full">
        <path d="M88 42 H124 M188 42 H224" stroke="#C3C9D3" strokeWidth="1.4" fill="none" />
      </svg>
      <div className="absolute left-6 top-8 h-5 w-16 rounded-md border border-[#E1E4EA] bg-white" />
      <div className="absolute left-[124px] top-8 h-5 w-16 rounded-md border border-[#E1E4EA] bg-white" />
      <div className="absolute left-56 top-8 h-5 w-16 rounded-md border border-[#E1E4EA] bg-white" />
    </>
  );
}

export function KindBadge({ kind, label }: { kind: DocumentKind; label: string }): React.ReactElement {
  const isChart = kind === 'chart';
  return (
    <span
      className={
        isChart
          ? 'rounded-full bg-[#E4EBFA] px-2 py-[2.5px] text-[10.5px] font-semibold text-[#3663C9] dark:bg-[color-mix(in_srgb,#3663C9_22%,transparent)] dark:text-[#93b4f5]'
          : 'rounded-full bg-[#ECE9FA] px-2 py-[2.5px] text-[10.5px] font-semibold text-[#6250C9] dark:bg-[color-mix(in_srgb,#6250C9_22%,transparent)] dark:text-[#b5a8f0]'
      }
    >
      {label}
    </span>
  );
}
