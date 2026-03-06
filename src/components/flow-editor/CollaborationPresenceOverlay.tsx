import React from 'react';
import type { CollaborationRemotePresence } from '@/hooks/useFlowEditorCollaboration';

interface CollaborationPresenceOverlayProps {
    remotePresence: CollaborationRemotePresence[];
}

export function CollaborationPresenceOverlay({
    remotePresence,
}: CollaborationPresenceOverlayProps): React.ReactElement {
    return (
        <div className="pointer-events-none absolute right-4 top-16 z-40 flex flex-col items-end gap-2">
            {remotePresence.map((presence) => (
                <div
                    key={presence.clientId}
                    className="pointer-events-none absolute"
                    style={{
                        left: `${presence.cursor.x}px`,
                        top: `${presence.cursor.y}px`,
                        transform: 'translate(8px, 8px)',
                    }}
                >
                    <div className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white/95 px-2 py-0.5 text-[11px] shadow">
                        <span
                            className="h-2 w-2 rounded-full"
                            style={{ backgroundColor: presence.color }}
                        />
                        <span className="text-slate-700">{presence.name}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}
