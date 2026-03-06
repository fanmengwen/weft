import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { createId } from '@/lib/id';
import type { FlowEdge, FlowNode } from '@/lib/types';
import type { ToastType } from '@/components/ui/ToastContext';
import { useFlowStore } from '@/store';
import { createCollaborationSessionBootstrap } from '@/services/collaboration/session';
import { createCollaborationRuntimeController } from '@/services/collaboration/runtimeController';
import { applyCollaborationDocumentStateToCanvas, createCollaborationDocumentStateFromCanvas } from '@/services/collaboration/storeBridge';
import { buildCollaborationPresenceViewModel } from '@/services/collaboration/presenceViewModel';
import type { CollaborationPresenceState } from '@/services/collaboration/types';
import { createCollaborationTransportFactory } from '@/services/collaboration/transportFactory';
import { computeCollaborationOperationsFromCanvasChange, type CollaborationCanvasSnapshot } from '@/services/collaboration/canvasDiff';
import { buildCollaborationInviteUrl, COLLAB_ROOM_QUERY_PARAM, resolveCollaborationRoomId } from '@/services/collaboration/roomLink';

type SetFlowNodes = (payload: FlowNode[] | ((nodes: FlowNode[]) => FlowNode[])) => void;
type SetFlowEdges = (payload: FlowEdge[] | ((edges: FlowEdge[]) => FlowEdge[])) => void;

export interface FlowEditorCollaborationTopNavState {
    roomId: string;
    viewerCount: number;
    status: 'realtime' | 'waiting' | 'fallback';
    onCopyInvite: () => void;
}

export type CollaborationRemotePresence = ReturnType<typeof buildCollaborationPresenceViewModel>['remotePresence'][number];

interface UseFlowEditorCollaborationParams {
    collaborationEnabled: boolean;
    activeTabId: string;
    nodes: FlowNode[];
    edges: FlowEdge[];
    setNodes: SetFlowNodes;
    setEdges: SetFlowEdges;
    addToast: (message: string, type?: ToastType, duration?: number) => void;
}

interface UseFlowEditorCollaborationResult {
    collaborationTopNavState: FlowEditorCollaborationTopNavState | undefined;
    remotePresence: CollaborationRemotePresence[];
}

function resolveLocalCollaborationClientId(collaborationEnabled: boolean, roomId: string): string | null {
    if (!collaborationEnabled) {
        return null;
    }

    const storageKey = `flowmind:collab-client-id:${roomId}`;
    const existingClientId = window.sessionStorage.getItem(storageKey);
    if (existingClientId) {
        return existingClientId;
    }

    const createdClientId = createId('collab-client');
    window.sessionStorage.setItem(storageKey, createdClientId);
    return createdClientId;
}

export function useFlowEditorCollaboration({
    collaborationEnabled,
    activeTabId,
    nodes,
    edges,
    setNodes,
    setEdges,
    addToast,
}: UseFlowEditorCollaborationParams): UseFlowEditorCollaborationResult {
    const navigate = useNavigate();
    const location = useLocation();
    const [collaborationPresence, setCollaborationPresence] = useState<CollaborationPresenceState[]>([]);
    const [collaborationTransportStatus, setCollaborationTransportStatus] = useState<'realtime' | 'waiting' | 'fallback'>('fallback');
    const collaborationControllerRef = useRef<ReturnType<typeof createCollaborationRuntimeController> | null>(null);
    const previousCollaborationCanvasRef = useRef<CollaborationCanvasSnapshot | null>(null);
    const applyingRemoteCollaborationStateRef = useRef(false);

    const collaborationRoom = useMemo(
        () => resolveCollaborationRoomId(location.search, activeTabId),
        [location.search, activeTabId]
    );
    const collaborationRoomId = collaborationRoom.roomId;
    const localCollaborationClientId = useMemo(
        () => resolveLocalCollaborationClientId(collaborationEnabled, collaborationRoomId),
        [collaborationEnabled, collaborationRoomId]
    );
    const presenceViewModel = useMemo(
        () => buildCollaborationPresenceViewModel(collaborationPresence, localCollaborationClientId),
        [collaborationPresence, localCollaborationClientId]
    );

    useEffect(() => {
        if (!collaborationEnabled || !collaborationRoom.shouldWriteToUrl) {
            return;
        }

        const params = new URLSearchParams(location.search);
        params.set(COLLAB_ROOM_QUERY_PARAM, collaborationRoomId);
        navigate(
            {
                pathname: location.pathname,
                search: `?${params.toString()}`,
                hash: location.hash,
            },
            { replace: true }
        );
    }, [
        collaborationEnabled,
        collaborationRoom.shouldWriteToUrl,
        collaborationRoomId,
        location.hash,
        location.pathname,
        location.search,
        navigate,
    ]);

    useEffect(() => {
        if (!collaborationEnabled) {
            return;
        }

        const clientId = localCollaborationClientId;
        if (!clientId) {
            return;
        }

        const { nodes: currentNodes, edges: currentEdges } = useFlowStore.getState();
        const transportFactory = createCollaborationTransportFactory('realtime');
        const runtimeController = createCollaborationRuntimeController({
            transport: transportFactory.transport,
            session: createCollaborationSessionBootstrap({
                roomId: collaborationRoomId,
                clientId,
                name: 'Local User',
                color: '#6366f1',
            }),
            initialDocumentState: createCollaborationDocumentStateFromCanvas(collaborationRoomId, 0, currentNodes, currentEdges),
            onDocumentStateChange: (state) => {
                applyingRemoteCollaborationStateRef.current = true;
                applyCollaborationDocumentStateToCanvas(state, setNodes, setEdges);
            },
            onPresenceChange: (presence) => {
                setCollaborationPresence(presence);
            },
        });

        collaborationControllerRef.current = runtimeController;
        previousCollaborationCanvasRef.current = {
            nodes: currentNodes,
            edges: currentEdges,
        };
        runtimeController.start();
        for (const node of currentNodes) {
            runtimeController.submitLocalOperation({
                type: 'node.upsert',
                payload: { node },
            });
        }
        for (const edge of currentEdges) {
            runtimeController.submitLocalOperation({
                type: 'edge.upsert',
                payload: { edge },
            });
        }

        const unsubscribeTransportStatus = transportFactory.transport.subscribeStatus?.((status) => {
            if (transportFactory.resolvedMode !== 'realtime') {
                setCollaborationTransportStatus('fallback');
                return;
            }
            setCollaborationTransportStatus(status.connected ? 'realtime' : 'waiting');
        });
        let fallbackStatusTimer: number | null = null;
        if (!unsubscribeTransportStatus) {
            fallbackStatusTimer = window.setTimeout(() => {
                setCollaborationTransportStatus(transportFactory.resolvedMode === 'realtime' ? 'waiting' : 'fallback');
            }, 0);
        }

        return () => {
            unsubscribeTransportStatus?.();
            if (fallbackStatusTimer !== null) {
                window.clearTimeout(fallbackStatusTimer);
            }
            runtimeController.stop();
            if (collaborationControllerRef.current === runtimeController) {
                collaborationControllerRef.current = null;
            }
            setCollaborationPresence([]);
            previousCollaborationCanvasRef.current = null;
            applyingRemoteCollaborationStateRef.current = false;
        };
    }, [collaborationRoomId, collaborationEnabled, localCollaborationClientId, setEdges, setNodes]);

    useEffect(() => {
        if (!collaborationEnabled) {
            previousCollaborationCanvasRef.current = null;
            return;
        }

        const controller = collaborationControllerRef.current;
        const currentSnapshot: CollaborationCanvasSnapshot = { nodes, edges };
        if (!controller || !controller.isRunning()) {
            previousCollaborationCanvasRef.current = currentSnapshot;
            return;
        }

        if (applyingRemoteCollaborationStateRef.current) {
            applyingRemoteCollaborationStateRef.current = false;
            previousCollaborationCanvasRef.current = currentSnapshot;
            return;
        }

        const previousSnapshot = previousCollaborationCanvasRef.current;
        if (!previousSnapshot) {
            previousCollaborationCanvasRef.current = currentSnapshot;
            return;
        }

        const operations = computeCollaborationOperationsFromCanvasChange(previousSnapshot, currentSnapshot);
        for (const operation of operations) {
            controller.submitLocalOperation(operation);
        }
        previousCollaborationCanvasRef.current = currentSnapshot;
    }, [nodes, edges, collaborationEnabled]);

    useEffect(() => {
        if (!collaborationEnabled) {
            return;
        }

        let frameId: number | null = null;
        let latestPoint: { x: number; y: number } | null = null;

        function flushPresenceCursor(): void {
            frameId = null;
            if (!latestPoint) {
                return;
            }
            collaborationControllerRef.current?.updateLocalPresenceCursor(latestPoint.x, latestPoint.y);
            latestPoint = null;
        }

        function handlePointerMove(event: PointerEvent): void {
            latestPoint = { x: event.clientX, y: event.clientY };
            if (frameId !== null) {
                return;
            }
            frameId = window.requestAnimationFrame(flushPresenceCursor);
        }

        window.addEventListener('pointermove', handlePointerMove, { passive: true });
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            if (frameId !== null) {
                window.cancelAnimationFrame(frameId);
            }
        };
    }, [collaborationEnabled]);

    const handleCopyInvite = useCallback(async (): Promise<void> => {
        const inviteUrl = buildCollaborationInviteUrl(window.location.href, collaborationRoomId);
        try {
            await navigator.clipboard.writeText(inviteUrl);
            addToast('Invite link copied.', 'success');
        } catch {
            addToast('Unable to copy invite link.', 'error');
        }
    }, [addToast, collaborationRoomId]);

    const collaborationTopNavState = useMemo<FlowEditorCollaborationTopNavState | undefined>(() => {
        if (!collaborationEnabled) {
            return undefined;
        }

        return {
            status: collaborationTransportStatus,
            roomId: collaborationRoomId,
            viewerCount: presenceViewModel.viewerCount,
            onCopyInvite: () => {
                void handleCopyInvite();
            },
        };
    }, [
        collaborationEnabled,
        collaborationTransportStatus,
        collaborationRoomId,
        handleCopyInvite,
        presenceViewModel.viewerCount,
    ]);

    return {
        collaborationTopNavState,
        remotePresence: presenceViewModel.remotePresence,
    };
}
