import React, { Suspense, lazy, useState } from 'react';
import { Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import {
  createDefaultCinematicExportRequest,
  type CinematicExportRequest,
  type CinematicExportResolution,
  type CinematicExportSpeed,
  type CinematicThemeMode,
} from '@/services/export/cinematicExport';
import { Tooltip } from './Tooltip';
import { useExportMenu } from './useExportMenu';

const LazyExportMenuPanel = lazy(async () => {
  const module = await import('./ExportMenuPanel');
  return { default: module.ExportMenuPanel };
});

interface ExportMenuProps {
  onExportPNG: (format: 'png' | 'jpeg', options?: { transparentBackground?: boolean }) => void;
  onCopyImage: (format: 'png' | 'jpeg', options?: { transparentBackground?: boolean }) => void;
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
  cinematicSpeed?: CinematicExportSpeed;
  onCinematicSpeedChange?: (speed: CinematicExportSpeed) => void;
  cinematicResolution?: CinematicExportResolution;
  onCinematicResolutionChange?: (res: CinematicExportResolution) => void;
  cinematicThemeMode: CinematicThemeMode;
}

export const ExportMenu: React.FC<ExportMenuProps> = ({
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
  cinematicSpeed,
  onCinematicSpeedChange,
  cinematicResolution,
  onCinematicResolutionChange,
  cinematicThemeMode,
}) => {
  const { t } = useTranslation();
  // Canvas.dc.html primary CTA: solid accent, 32h, px14, 13/600 + download icon.
  const exportLabel = t('export.title', 'Export');
  const defaultRequest = createDefaultCinematicExportRequest(cinematicThemeMode);
  const [cinematicSpeedState, setCinematicSpeedState] = useState<CinematicExportSpeed>(
    defaultRequest.speed
  );
  const [cinematicResolutionState, setCinematicResolutionState] =
    useState<CinematicExportResolution>(defaultRequest.resolution);
  const effectiveSpeed = cinematicSpeed ?? cinematicSpeedState;
  const effectiveSpeedChange = onCinematicSpeedChange ?? setCinematicSpeedState;
  const effectiveResolution = cinematicResolution ?? cinematicResolutionState;
  const effectiveResolutionChange = onCinematicResolutionChange ?? setCinematicResolutionState;
  const cinematicExportRequest: CinematicExportRequest = {
    format: 'cinematic-video',
    speed: effectiveSpeed,
    resolution: effectiveResolution,
    themeMode: cinematicThemeMode,
  };
  const {
    isOpen,
    menuRef,
    toggleMenu,
    handleSelect,
  } = useExportMenu({
    onExportPNG,
    onCopyImage,
    onExportSVG,
    onCopySVG,
    onExportPDF,
    onExportCinematic,
    getCinematicExportRequest: () => cinematicExportRequest,
    onExportJSON,
    onCopyJSON,
    onExportMermaid,
    onDownloadMermaid,
    onDownloadPlantUML,
    onExportOpenFlowDSL,
    onDownloadOpenFlowDSL,
    onExportFigma,
    onDownloadFigma,
  });

  return (
    <div className="relative" ref={menuRef}>
      <Tooltip text={t('export.exportDiagram', 'Export Diagram')} side="bottom">
        <button
          type="button"
          onClick={toggleMenu}
          data-testid="topnav-export"
          aria-label={exportLabel}
          className="inline-flex h-8 items-center gap-1.5 rounded-[8px] bg-[var(--wf-acc)] px-3.5 text-[13px] font-semibold leading-none text-white transition-[filter] hover:brightness-[0.94]"
        >
          <Download className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />
          <span className="hidden sm:inline">{exportLabel}</span>
        </button>
      </Tooltip>

      {isOpen && (
        <Suspense fallback={null}>
          <LazyExportMenuPanel
            onSelect={handleSelect}
            cinematicSpeed={effectiveSpeed}
            onCinematicSpeedChange={effectiveSpeedChange}
            cinematicResolution={effectiveResolution}
            onCinematicResolutionChange={effectiveResolutionChange}
          />
        </Suspense>
      )}
    </div>
  );
};
