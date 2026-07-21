import React from 'react';

export function ChartKindIcon({
  size = 12,
  className = '',
}: {
  size?: number;
  className?: string;
}): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 4.5 L19.5 12 L12 19.5 L4.5 12 Z"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function WorkflowKindIcon({
  size = 12,
  className = '',
}: {
  size?: number;
  className?: string;
}): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 3.5 L13.8 10.2 L20.5 12 L13.8 13.8 L12 20.5 L10.2 13.8 L3.5 12 L10.2 10.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function FilesMoreIcon(): React.ReactElement {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="5.5" cy="12" r="1.6" fill="currentColor" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function FilesSearchIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" className="shrink-0 text-[#8B93A0]" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M15 15 L20 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function FilesGridIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.9" fill="none" />
      <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.9" fill="none" />
      <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.9" fill="none" />
      <rect x="13.5" y="13.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.9" fill="none" />
    </svg>
  );
}

export function FilesListIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4.5 6.5 H19.5 M4.5 12 H19.5 M4.5 17.5 H19.5"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
