import React from 'react';
import type { DesignPreviewTone } from './designFlowPreviewModel';

export function DesignPreviewToneIcon({
  tone,
  size,
}: {
  tone: DesignPreviewTone;
  size: number;
}): React.ReactElement {
  if (tone === 'start') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path d="M8 5.5 L18.5 12 L8 18.5 Z" fill="currentColor" />
      </svg>
    );
  }
  if (tone === 'end') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="2.2" fill="none" />
        <path
          d="M8.5 12.2 L11 14.7 L15.5 9.7"
          stroke="currentColor"
          strokeWidth="2.2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tone === 'decision') {
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
  if (tone === 'input') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M5 6 H19 M12 6 V19"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tone === 'llm') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 3.5 L13.8 10.2 L20.5 12 L13.8 13.8 L12 20.5 L10.2 13.8 L3.5 12 L10.2 10.2 Z"
          fill="currentColor"
        />
      </svg>
    );
  }
  if (tone === 'kb') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
        <path d="M9.5 4 V20" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  if (tone === 'web') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="2" fill="none" />
        <path
          d="M4 12 H20 M12 4 C15 8 15 16 12 20 M12 4 C9 8 9 16 12 20"
          stroke="currentColor"
          strokeWidth="1.7"
          fill="none"
        />
      </svg>
    );
  }
  if (tone === 'code') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M9 8.5 L5.5 12 L9 15.5 M15 8.5 L18.5 12 L15 15.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  if (tone === 'out') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M12 4 V12.5 M8.5 9.5 L12 13 L15.5 9.5 M4.5 14.5 V17.5 A2 2 0 0 0 6.5 19.5 H17.5 A2 2 0 0 0 19.5 17.5 V14.5"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4.5" y="5.5" width="15" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M4.5 9.5 H19.5" stroke="currentColor" strokeWidth="2" fill="none" />
    </svg>
  );
}
