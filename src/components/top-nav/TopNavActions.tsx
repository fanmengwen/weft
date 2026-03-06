import React from 'react';
import { Play, Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExportMenu } from '@/components/ExportMenu';
import { Tooltip } from '@/components/Tooltip';
import { Button } from '@/components/ui/Button';
import { ShareModal } from '@/components/ShareModal';

interface CollaborationState {
    roomId: string;
    viewerCount: number;
    status: 'realtime' | 'waiting' | 'fallback';
    onCopyInvite: () => void;
}

interface TopNavActionsProps {
    onPlay: () => void;
    onExportPNG: (format?: 'png' | 'jpeg') => void;
    onExportJSON: () => void;
    onExportMermaid: () => void;
    onExportPlantUML: () => void;
    onExportOpenFlowDSL: () => void;
    onExportFigma: () => void;
    collaboration?: CollaborationState;
    isBeveled: boolean;
}

function getAvatarInitial(index: number): string {
    return String.fromCharCode(65 + index);
}

function getCollaborationStatusLabel(status: CollaborationState['status']): string {
    switch (status) {
        case 'realtime':
            return 'Realtime Beta';
        case 'waiting':
            return 'Connecting...';
        default:
            return 'Fallback mode';
    }
}

function getCollaborationStatusDotClass(status: CollaborationState['status']): string {
    switch (status) {
        case 'realtime':
            return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]';
        case 'waiting':
            return 'bg-amber-400 animate-pulse';
        default:
            return 'bg-slate-400';
    }
}

export function TopNavActions({
    onPlay,
    onExportPNG,
    onExportJSON,
    onExportMermaid,
    onExportPlantUML,
    onExportOpenFlowDSL,
    onExportFigma,
    collaboration,
    isBeveled,
}: TopNavActionsProps): React.ReactElement {
    const { t } = useTranslation();
    const [isShareModalOpen, setIsShareModalOpen] = React.useState(false);
    const viewerCount = collaboration?.viewerCount ?? 1;
    const visibleViewerCount = Math.min(viewerCount, 4);

    return (
        <div className="flex items-center gap-3 min-w-[240px] justify-end">
            <div className="flex items-center gap-2">
                {collaboration && (
                    <div className="flex items-center gap-2 mr-1 border-r border-slate-200/60 pr-3">
                        {/* Status Indicator */}
                        <Tooltip text={getCollaborationStatusLabel(collaboration.status)} side="bottom">
                            <div className={`w-2 h-2 rounded-full ${getCollaborationStatusDotClass(collaboration.status)}`} />
                        </Tooltip>

                        {/* Avatars */}
                        <div className="flex -space-x-2 overflow-hidden px-1">
                            {Array.from({ length: visibleViewerCount }).map((_, i) => (
                                <div key={i} className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-br from-[var(--brand-primary-400)] to-[var(--brand-primary-600)] flex items-center justify-center text-white text-[11px] font-bold shadow-sm">
                                    {getAvatarInitial(i)}
                                </div>
                            ))}
                            {viewerCount > 4 && (
                                <div className="inline-flex h-8 w-8 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-slate-600 text-[10px] font-bold shadow-sm">
                                    +{viewerCount - 4}
                                </div>
                            )}
                        </div>

                        <Tooltip text="Share Dialog" side="bottom">
                            <Button
                                variant="icon"
                                size="icon"
                                onClick={() => setIsShareModalOpen(true)}
                                className={`h-8 w-8 ml-1 rounded-[var(--radius-md)] border text-slate-600 transition-all ${isBeveled
                                    ? 'btn-beveled-secondary'
                                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm hover:shadow'
                                    }`}
                                icon={<Share2 className="w-4 h-4" />}
                            />
                        </Tooltip>
                    </div>
                )}

                <Tooltip text={t('nav.playbackMode', 'Playback Mode')} side="bottom">
                    <Button
                        variant="secondary"
                        onClick={onPlay}
                        data-testid="topnav-play"
                        className="h-9 px-4 text-sm font-medium"
                        icon={<Play className="w-3.5 h-3.5 mr-1" />}
                    >
                        {t('common.play', 'Play')}
                    </Button>
                </Tooltip>

                <ExportMenu
                    onExportPNG={onExportPNG}
                    onExportJSON={onExportJSON}
                    onExportMermaid={onExportMermaid}
                    onExportPlantUML={onExportPlantUML}
                    onExportOpenFlowDSL={onExportOpenFlowDSL}
                    onExportFigma={onExportFigma}
                />
            </div>

            {collaboration && (
                <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    onCopyInvite={collaboration.onCopyInvite}
                    roomId={collaboration.roomId}
                />
            )}
        </div>
    );
}
