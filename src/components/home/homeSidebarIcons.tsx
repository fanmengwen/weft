import React from 'react';

export function SidebarHomeIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="block">
      <path
        d="M5 10.8 L12 5 L19 10.8 M6.5 9.6 V19 H17.5 V9.6"
        stroke="currentColor"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarFilesIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="block">
      <path
        d="M4.5 7 A2 2 0 0 1 6.5 5 H10 L12 7.5 H17.5 A2 2 0 0 1 19.5 9.5 V17 A2 2 0 0 1 17.5 19 H6.5 A2 2 0 0 1 4.5 17 Z"
        stroke="currentColor"
        strokeWidth="1.9"
        fill="none"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarTemplatesIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="block">
      <rect x="4.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
      <rect x="13.5" y="4.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
      <rect x="4.5" y="13.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
      <rect x="13.5" y="13.5" width="6" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.7" fill="none" />
    </svg>
  );
}

export function SidebarRunsIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="block">
      <path
        d="M3.5 12 H7 L10 5.5 L14 18.5 L17 12 H20.5"
        stroke="currentColor"
        strokeWidth="1.9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarTrashIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="block">
      <path
        d="M5 7 H19 M9.5 7 V5 H14.5 V7 M7.5 7 L8.5 19 H15.5 L16.5 7"
        stroke="currentColor"
        strokeWidth="1.9"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function SidebarSettingsIcon(): React.ReactElement {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="block">
      <path
        d="M4.5 7.5 H19.5 M4.5 12 H19.5 M4.5 16.5 H19.5"
        stroke="currentColor"
        strokeWidth="1.8"
        fill="none"
        strokeLinecap="round"
      />
      <circle cx="9.5" cy="7.5" r="2" className="fill-white dark:fill-[var(--brand-surface)]" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="14.5" cy="12" r="2" className="fill-white dark:fill-[var(--brand-surface)]" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="8" cy="16.5" r="2" className="fill-white dark:fill-[var(--brand-surface)]" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

export function SidebarBrandMark(): React.ReactElement {
  return (
    <svg width="20" height="20" viewBox="0 0 32 32" aria-hidden="true" className="block shrink-0">
      <path
        d="M12 5 V18.3 M12 21.7 V27 M20 5 V10.3 M20 13.7 V27"
        stroke="#52525b"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M5 12 H10.3 M13.7 12 H27 M5 20 H18.3 M21.7 20 H27"
        stroke="#3b82f6"
        strokeWidth="3.4"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
