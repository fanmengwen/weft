import React, { useEffect, useRef, useState } from 'react';
import { Check, Download, LogOut, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '@/context/ThemeContext';
import type { CinematicExportRequest } from '@/services/export/cinematicExport';
import { ExportMenu } from '@/components/ExportMenu';

interface TopNavActionsProps {
  onGoHome: () => void;
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

const SAVE_FLASH_MS = 1800;

const outlineButtonClass =
  'inline-flex h-8 items-center gap-1.5 rounded-lg border border-[#D8DCE2] bg-white px-[13px] text-[13px] font-medium leading-none text-[#3E4753] transition-colors hover:bg-[#F3F5F8]';

export function TopNavActions({
  onGoHome,
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
  const [savedFlash, setSavedFlash] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, []);

  function handleSave(): void {
    setSavedFlash(true);
    if (saveTimerRef.current) {
      clearTimeout(saveTimerRef.current);
    }
    saveTimerRef.current = setTimeout(() => {
      setSavedFlash(false);
      saveTimerRef.current = null;
    }, SAVE_FLASH_MS);
  }

  const saveLabel = savedFlash
    ? t('saveStatus.saved', 'Saved')
    : t('common.save', 'Save');
  const exitLabel = t('nav.exit', 'Exit');

  return (
    <div className="flex min-w-0 items-center justify-end gap-1.5">
      <button
        type="button"
        onClick={handleSave}
        data-testid="topnav-save"
        className={[
          'inline-flex h-8 items-center gap-1.5 rounded-lg border px-[13px] text-[13px] font-medium leading-none transition-colors',
          savedFlash
            ? 'border-[#BFE3CC] bg-[#E2F2E8] text-[#1F7D4D]'
            : 'border-[#D8DCE2] bg-white text-[#3E4753] hover:bg-[#F3F5F8]',
        ].join(' ')}
      >
        {savedFlash ? (
          <Check className="h-[13px] w-[13px]" strokeWidth={2.2} aria-hidden />
        ) : (
          <Save className="h-[13px] w-[13px]" strokeWidth={1.9} aria-hidden />
        )}
        <span className="hidden sm:inline">{saveLabel}</span>
      </button>

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
        triggerClassName={outlineButtonClass}
        triggerIcon={<Download className="h-[13px] w-[13px]" strokeWidth={2} aria-hidden />}
      />

      <div className="mx-1 h-4 w-px shrink-0 bg-[var(--wf-border)]" aria-hidden />

      <button
        type="button"
        onClick={onGoHome}
        data-testid="topnav-exit"
        title={t('nav.exitToHome', 'Exit and return home')}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg px-3 text-[13px] font-medium leading-none text-[#4A5361] transition-colors hover:bg-[#F3F5F8] hover:text-[var(--wf-text)]"
      >
        <LogOut className="h-[13px] w-[13px]" strokeWidth={1.9} aria-hidden />
        <span className="hidden sm:inline">{exitLabel}</span>
      </button>
    </div>
  );
}
