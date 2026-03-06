import { isCollaborationOperationEnvelope } from './contracts';
import { mapPresenceFromAwarenessState } from './session';
import type { CollaborationOperationEnvelope, CollaborationPresenceState, CollaborationRoomConfig } from './types';
import type { CollaborationTransport } from './transport';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

interface AwarenessLike {
  on: (event: 'change', listener: AwarenessChangeListener) => void;
  off: (event: 'change', listener: AwarenessChangeListener) => void;
  setLocalStateField: (field: string, value: unknown) => void;
  getStates: () => Map<number, unknown>;
}

interface AwarenessChangeEvent {
  added: number[];
  updated: number[];
}

type AwarenessChangeListener = (event: AwarenessChangeEvent) => void;

interface RealtimeProviderLike {
  awareness: AwarenessLike;
  destroy: () => void;
  on?: (event: string, listener: (event: unknown) => void) => void;
  off?: (event: string, listener: (event: unknown) => void) => void;
  wsconnected?: boolean;
  synced?: boolean;
}

interface RealtimeProviderOptions {
  signaling: string[];
}

type RealtimeProviderFactory = (
  roomId: string,
  doc: Y.Doc,
  options: RealtimeProviderOptions
) => RealtimeProviderLike;

interface RealtimeTransportOptions {
  createProvider?: RealtimeProviderFactory;
  createDoc?: () => Y.Doc;
}

interface YArrayDeltaInsert {
  insert?: unknown[];
}

interface YArrayChangeEvent {
  changes: {
    delta: YArrayDeltaInsert[];
  };
}

function createDefaultProvider(
  roomId: string,
  doc: Y.Doc,
  _options: RealtimeProviderOptions
): RealtimeProviderLike {
  return new WebsocketProvider('wss://demos.yjs.dev', roomId, doc);
}

export function isRealtimeCollaborationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  if (typeof window.WebSocket === 'undefined') return false;
  return true;
}

export function createYjsWebRtcCollaborationTransport(
  options: RealtimeTransportOptions = {}
): CollaborationTransport {
  const createProvider = options.createProvider ?? createDefaultProvider;
  const createDoc = options.createDoc ?? (() => new Y.Doc());

  let roomConfig: CollaborationRoomConfig | null = null;
  let provider: RealtimeProviderLike | null = null;
  let doc: Y.Doc | null = null;
  let operationsArray: Y.Array<unknown> | null = null;
  let operationsListener: ((event: YArrayChangeEvent) => void) | null = null;
  let awarenessListener: AwarenessChangeListener | null = null;
  let docUpdateListener: (() => void) | null = null;
  let statusListener: ((event: unknown) => void) | null = null;
  let syncedListener: ((event: unknown) => void) | null = null;
  let peersListener: ((event: unknown) => void) | null = null;
  let seenOperationIds = new Set<string>();
  let latestStatus: { connected: boolean; peerCount?: number; synced?: boolean } = { connected: false };
  const statusSubscribers = new Set<(status: { connected: boolean; peerCount?: number; synced?: boolean }) => void>();

  function notifyStatus(): void {
    for (const subscriber of statusSubscribers) {
      subscriber(latestStatus);
    }
  }

  function setStatusPatch(patch: Partial<{ connected: boolean; peerCount?: number; synced?: boolean }>): void {
    latestStatus = {
      ...latestStatus,
      ...patch,
    };
    notifyStatus();
  }

  function emitOperationCandidate(
    candidate: unknown,
    config: CollaborationRoomConfig,
    onEvent: (event: { type: 'operation'; fromClientId: string; operation: CollaborationOperationEnvelope }) => void
  ): void {
    if (!isCollaborationOperationEnvelope(candidate)) {
      return;
    }
    if (candidate.clientId === config.clientId) {
      return;
    }
    if (seenOperationIds.has(candidate.opId)) {
      return;
    }
    seenOperationIds.add(candidate.opId);
    onEvent({
      type: 'operation',
      fromClientId: candidate.clientId,
      operation: candidate,
    });
  }

  function emitOperationArraySnapshot(
    config: CollaborationRoomConfig,
    onEvent: (event: { type: 'operation'; fromClientId: string; operation: CollaborationOperationEnvelope }) => void
  ): void {
    if (!operationsArray) {
      return;
    }
    for (const candidate of operationsArray.toArray()) {
      emitOperationCandidate(candidate, config, onEvent);
    }
  }

  function disconnect(): void {
    if (operationsArray && operationsListener) {
      operationsArray.unobserve(operationsListener as (event: unknown) => void);
    }
    if (doc && docUpdateListener) {
      doc.off('update', docUpdateListener);
    }
    if (provider && awarenessListener) {
      provider.awareness.off('change', awarenessListener);
    }
    if (provider && statusListener) {
      provider.off?.('status', statusListener);
    }
    if (provider && syncedListener) {
      provider.off?.('synced', syncedListener);
      provider.off?.('sync', syncedListener);
    }
    if (provider && peersListener) {
      provider.off?.('peers', peersListener);
    }
    if (provider) {
      provider.destroy();
    }
    if (doc) {
      doc.destroy();
    }
    roomConfig = null;
    provider = null;
    doc = null;
    operationsArray = null;
    operationsListener = null;
    awarenessListener = null;
    docUpdateListener = null;
    statusListener = null;
    syncedListener = null;
    peersListener = null;
    seenOperationIds = new Set<string>();
    latestStatus = { connected: false };
    notifyStatus();
  }

  return {
    connect: (config, onEvent) => {
      disconnect();
      roomConfig = config;
      doc = createDoc();
      operationsArray = doc.getArray('operations');
      provider = createProvider(config.roomId, doc, {
        signaling: config.signalingServers,
      });

      operationsListener = (event) => {
        const deltas = event.changes.delta;
        for (const delta of deltas) {
          if (!Array.isArray(delta.insert)) {
            continue;
          }
          for (const candidate of delta.insert) {
            emitOperationCandidate(candidate, config, onEvent);
          }
        }
      };
      operationsArray.observe(operationsListener as (event: unknown) => void);
      docUpdateListener = () => {
        emitOperationArraySnapshot(config, onEvent);
      };
      doc.on('update', docUpdateListener);
      emitOperationArraySnapshot(config, onEvent);

      statusListener = (event) => {
        const candidate = event as { connected?: unknown; status?: unknown };
        const connected = candidate.connected === true || candidate.status === 'connected';
        setStatusPatch({
          connected,
        });
      };
      syncedListener = (event) => {
        if (typeof event === 'boolean') {
          setStatusPatch({
            synced: event,
          });
          return;
        }
        const candidate = event as { synced?: unknown };
        if (typeof candidate.synced !== 'boolean') {
          return;
        }
        setStatusPatch({
          synced: candidate.synced,
        });
      };
      peersListener = (event) => {
        const candidate = event as { webrtcPeers?: unknown[] };
        if (!Array.isArray(candidate.webrtcPeers)) {
          return;
        }
        setStatusPatch({
          peerCount: candidate.webrtcPeers.length,
        });
      };
      provider.on?.('status', statusListener);
      provider.on?.('synced', syncedListener);
      provider.on?.('sync', syncedListener);
      provider.on?.('peers', peersListener);
      // Seed status from provider state in case events fired before listeners were attached.
      if (typeof provider.wsconnected === 'boolean') {
        setStatusPatch({ connected: provider.wsconnected });
      }
      if (typeof provider.synced === 'boolean') {
        setStatusPatch({ synced: provider.synced });
      }

      awarenessListener = (event) => {
        const changed = new Set<number>([...event.added, ...event.updated]);
        const states = provider?.awareness.getStates();
        if (!states) {
          return;
        }
        for (const stateKey of changed) {
          const awarenessState = states.get(stateKey);
          if (typeof awarenessState !== 'object' || awarenessState === null) {
            continue;
          }
          const rawPresence = (awarenessState as { presence?: unknown }).presence;
          const presence = mapPresenceFromAwarenessState(rawPresence);
          if (!presence) {
            continue;
          }
          if (presence.clientId === config.clientId) {
            continue;
          }
          onEvent({
            type: 'presence',
            fromClientId: presence.clientId,
            presence,
          });
        }
      };
      provider.awareness.on('change', awarenessListener);
    },
    disconnect,
    publishOperation: (operation: CollaborationOperationEnvelope) => {
      if (!operationsArray || !roomConfig) {
        return;
      }
      if (operation.roomId !== roomConfig.roomId) {
        return;
      }
      operationsArray.push([operation]);
    },
    publishPresence: (presence: CollaborationPresenceState) => {
      if (!provider || !roomConfig) {
        return;
      }
      if (presence.clientId !== roomConfig.clientId) {
        return;
      }
      provider.awareness.setLocalStateField('presence', presence);
    },
    subscribeStatus: (listener) => {
      statusSubscribers.add(listener);
      listener(latestStatus);
      return () => {
        statusSubscribers.delete(listener);
      };
    },
  };
}
