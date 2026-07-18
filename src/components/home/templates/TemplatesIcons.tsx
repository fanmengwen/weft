import React from 'react';

export function TemplatesSearchIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" className="shrink-0 text-[#8B93A0]" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M15 15 L20 20" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function TemplatesChartIcon({ size = 14 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
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

export function TemplatesWorkflowIcon({ size = 14 }: { size?: number }): React.ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 3.5 L13.8 10.2 L20.5 12 L13.8 13.8 L12 20.5 L10.2 13.8 L3.5 12 L10.2 10.2 Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function TemplatesPlusIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5 V19 M5 12 H19"
        stroke="currentColor"
        strokeWidth="2.2"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function TemplatesEyeIcon(): React.ReactElement {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M2.5 12 C4.5 7.5 8 5.5 12 5.5 C16 5.5 19.5 7.5 21.5 12 C19.5 16.5 16 18.5 12 18.5 C8 18.5 4.5 16.5 2.5 12 Z"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.8" fill="none" />
    </svg>
  );
}

export function TemplatesArrowIcon(): React.ReactElement {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 12 H17 M13 8 L17 12 L13 16"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
