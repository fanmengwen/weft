import { useState } from 'react';
import { isWorkflowEnabled, setWorkflowEnabled } from '../workflowEnabledStorage';

interface UseWorkflowEnabledToggleResult {
  enabled: boolean;
  /** Enabling applies immediately; disabling opens the confirm dialog instead. */
  requestToggle: () => void;
  pendingDisable: boolean;
  confirmDisable: () => void;
  cancelDisable: () => void;
}

export function useWorkflowEnabledToggle(documentId: string): UseWorkflowEnabledToggleResult {
  const [enabled, setEnabled] = useState(() => isWorkflowEnabled(documentId));
  const [pendingDisable, setPendingDisable] = useState(false);

  function requestToggle(): void {
    if (enabled) {
      setPendingDisable(true);
      return;
    }
    setWorkflowEnabled(documentId, true);
    setEnabled(true);
  }

  function confirmDisable(): void {
    setWorkflowEnabled(documentId, false);
    setEnabled(false);
    setPendingDisable(false);
  }

  function cancelDisable(): void {
    setPendingDisable(false);
  }

  return { enabled, requestToggle, pendingDisable, confirmDisable, cancelDisable };
}
