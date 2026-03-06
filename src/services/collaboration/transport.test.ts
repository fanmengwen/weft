import { describe, expect, it, vi } from 'vitest';
import type { CollaborationOperationEnvelope, CollaborationPresenceState } from './types';
import { createInMemoryCollaborationTransport } from './transport';

function createOperation(clientId: string): CollaborationOperationEnvelope {
  return {
    opId: `op-${clientId}`,
    roomId: 'room-1',
    clientId,
    baseVersion: 1,
    timestamp: 1,
    type: 'node.delete',
    payload: { nodeId: 'n-1' },
  };
}

function createPresence(clientId: string): CollaborationPresenceState {
  return {
    clientId,
    name: clientId,
    color: '#6366f1',
    cursor: { x: 10, y: 20 },
  };
}

describe('in-memory collaboration transport', () => {
  it('broadcasts operation events to peers in same room', () => {
    const a = createInMemoryCollaborationTransport();
    const b = createInMemoryCollaborationTransport();
    const listenerA = vi.fn();
    const listenerB = vi.fn();

    a.connect({ roomId: 'room-1', clientId: 'client-a', signalingServers: [] }, listenerA);
    b.connect({ roomId: 'room-1', clientId: 'client-b', signalingServers: [] }, listenerB);

    a.publishOperation(createOperation('client-a'));

    expect(listenerA).toHaveBeenCalledTimes(0);
    expect(listenerB).toHaveBeenCalledTimes(1);
    expect(listenerB.mock.calls[0][0].type).toBe('operation');
  });

  it('broadcasts presence events to peers in same room', () => {
    const a = createInMemoryCollaborationTransport();
    const b = createInMemoryCollaborationTransport();
    const listenerB = vi.fn();

    a.connect({ roomId: 'room-1', clientId: 'client-a', signalingServers: [] }, vi.fn());
    b.connect({ roomId: 'room-1', clientId: 'client-b', signalingServers: [] }, listenerB);

    a.publishPresence(createPresence('client-a'));

    expect(listenerB).toHaveBeenCalledTimes(1);
    expect(listenerB.mock.calls[0][0].type).toBe('presence');
  });

  it('does not leak events across rooms and removes listeners on disconnect', () => {
    const a = createInMemoryCollaborationTransport();
    const b = createInMemoryCollaborationTransport();
    const c = createInMemoryCollaborationTransport();
    const listenerB = vi.fn();
    const listenerC = vi.fn();

    a.connect({ roomId: 'room-1', clientId: 'client-a', signalingServers: [] }, vi.fn());
    b.connect({ roomId: 'room-1', clientId: 'client-b', signalingServers: [] }, listenerB);
    c.connect({ roomId: 'room-2', clientId: 'client-c', signalingServers: [] }, listenerC);

    a.publishOperation(createOperation('client-a'));
    expect(listenerB).toHaveBeenCalledTimes(1);
    expect(listenerC).toHaveBeenCalledTimes(0);

    b.disconnect();
    a.publishOperation(createOperation('client-a'));
    expect(listenerB).toHaveBeenCalledTimes(1);
  });
});
