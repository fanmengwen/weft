import { useEffect } from 'react';

const NODE_LABEL_EDIT_REQUEST_EVENT = 'flowmind:node-label-edit-request';

interface NodeLabelEditRequestDetail {
  nodeId: string;
}

export function requestNodeLabelEdit(nodeId: string): void {
  window.dispatchEvent(
    new CustomEvent<NodeLabelEditRequestDetail>(NODE_LABEL_EDIT_REQUEST_EVENT, {
      detail: { nodeId },
    })
  );
}

export function useNodeLabelEditRequest(nodeId: string, onRequest: () => void): void {
  useEffect(() => {
    const handleRequest = (event: Event): void => {
      const customEvent = event as CustomEvent<NodeLabelEditRequestDetail>;
      if (customEvent.detail?.nodeId === nodeId) {
        onRequest();
      }
    };

    window.addEventListener(NODE_LABEL_EDIT_REQUEST_EVENT, handleRequest as EventListener);
    return () => {
      window.removeEventListener(NODE_LABEL_EDIT_REQUEST_EVENT, handleRequest as EventListener);
    };
  }, [nodeId, onRequest]);
}
