import React from 'react';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import type { CinematicExportRequest } from '@/services/export/cinematicExport';
import { ExportMenu } from '@/components/ExportMenu';
import { Tooltip } from '@/components/Tooltip';

interface TopNavActionsProps {
    onPlay: () => void;
    onExportPNG: (format?: 'png' | 'jpeg', options?: { transparentBackground?: boolean }) => void;
    onCopyImage: (format?: 'png' | 'jpeg', options?: { transparentBackground?: boolean }) => void;
    onExportSVG: () => void;
    onCopySVG: () => void;
    onExportPDF: () => void;
    onExportCinematic: (request: CinematicExportRequest) => void;
    onExportJSON: () => void;
    onCopyJSON: () => void;
    onExportMermaid: () => void;
    onDownloadMermaid: () => void;
    onDownloadPlantUML: () => void;
    onExportOpenFlowDSL: () => void;
    onDownloadOpenFlowDSL: () => void;
    onExportFigma: () => void;
    onDownloadFigma: () => void;
}

export function TopNavActions({
    onPlay,
    onExportPNG,
    onCopyImage,
    onExportSVG,
    onCopySVG,
    onExportPDF,
    onExportCinematic,
    onExportJSON,
    onCopyJSON,
    onExportMermaid,
    onDownloadMermaid,
    onDownloadPlantUML,
    onExportOpenFlowDSL,
    onDownloadOpenFlowDSL,
    onExportFigma,
    onDownloadFigma,
}: TopNavActionsProps): React.ReactElement {
    const { t } = useTranslation();
    const { resolvedTheme } = useTheme();
    const playLabel = t('common.play', 'Play');

    return (
        <div className="flex min-w-0 items-center justify-end">
            <div className="flex items-center gap-1">
                <Tooltip text={t('nav.playbackMode', 'Preview playback')} side="bottom">
                    <button
                        type="button"
                        onClick={onPlay}
                        data-testid="topnav-play"
                        aria-label={playLabel}
                        className="inline-flex h-8 items-center gap-1.5 rounded-[8px] px-3 text-[13px] font-medium leading-none text-[var(--wf-text-btn)] transition-colors hover:bg-[var(--wf-hover)]"
                    >
                        <Play className="h-[11px] w-[11px] fill-current stroke-none" aria-hidden />
                        <span className="hidden sm:inline">{playLabel}</span>
                    </button>
                </Tooltip>

                <div className="mx-2 h-4 w-px shrink-0 bg-[var(--wf-border)]" aria-hidden />

                <ExportMenu
                    onExportPNG={onExportPNG}
                    onCopyImage={onCopyImage}
                    onExportSVG={onExportSVG}
                    onCopySVG={onCopySVG}
                    onExportPDF={onExportPDF}
                    onExportCinematic={onExportCinematic}
                    onExportJSON={onExportJSON}
                    onCopyJSON={onCopyJSON}
                    onExportMermaid={onExportMermaid}
                    onDownloadMermaid={onDownloadMermaid}
                    onDownloadPlantUML={onDownloadPlantUML}
                    onExportOpenFlowDSL={onExportOpenFlowDSL}
                    onDownloadOpenFlowDSL={onDownloadOpenFlowDSL}
                    onExportFigma={onExportFigma}
                    onDownloadFigma={onDownloadFigma}
                    cinematicThemeMode={resolvedTheme}
                />
            </div>
        </div>
    );
}
