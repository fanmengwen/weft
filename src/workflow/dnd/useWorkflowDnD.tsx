import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';

interface WorkflowDnDContextValue {
  draggingKind: WorkflowNodeKind | null;
  ghostPosition: { x: number; y: number };
  startDrag: (kind: WorkflowNodeKind, clientX: number, clientY: number) => void;
  cancelDrag: () => void;
}

const WorkflowDnDContext = createContext<WorkflowDnDContextValue | null>(null);

export function WorkflowDnDProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [draggingKind, setDraggingKind] = useState<WorkflowNodeKind | null>(null);
  const [ghostPosition, setGhostPosition] = useState({ x: 0, y: 0 });

  const cancelDrag = useCallback(() => {
    setDraggingKind(null);
  }, []);

  const startDrag = useCallback((kind: WorkflowNodeKind, clientX: number, clientY: number) => {
    setDraggingKind(kind);
    setGhostPosition({ x: clientX, y: clientY });
  }, []);

  useEffect(() => {
    if (!draggingKind) {
      return;
    }
    const onPointerMove = (event: PointerEvent) => {
      setGhostPosition({ x: event.clientX, y: event.clientY });
    };
    window.addEventListener('pointermove', onPointerMove);
    return () => window.removeEventListener('pointermove', onPointerMove);
  }, [draggingKind]);

  const value = useMemo(
    () => ({ draggingKind, ghostPosition, startDrag, cancelDrag }),
    [cancelDrag, draggingKind, ghostPosition, startDrag]
  );

  return <WorkflowDnDContext.Provider value={value}>{children}</WorkflowDnDContext.Provider>;
}

export function useWorkflowDnD(): WorkflowDnDContextValue {
  const context = useContext(WorkflowDnDContext);
  if (!context) {
    throw new Error('useWorkflowDnD must be used within WorkflowDnDProvider');
  }
  return context;
}
