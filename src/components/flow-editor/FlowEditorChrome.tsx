import React, { Suspense, lazy } from 'react';
import type { AddShapeInput } from '@/components/add-items/addItemRegistry';
import type { FlowEditorPanelsProps } from '@/components/FlowEditorPanels';
import type { CinematicExportRequest } from '@/services/export/cinematicExport';
import type { CollaborationRemotePresence } from '@/hooks/useFlowEditorCollaboration';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { StudioLauncher } from '@/components/StudioLauncher';
import type { EditorPage } from '@/store/editorPageHooks';

const LazyFlowEditorPanels = lazy(async () => {
  const module = await import('@/components/FlowEditorPanels');
  return { default: module.FlowEditorPanels };
});

const LazyTopNav = lazy(async () => {
  const module = await import('@/components/TopNav');
  return { default: module.TopNav };
});

const LazyToolbar = lazy(async () => {
  const module = await import('@/components/Toolbar');
  return { default: module.Toolbar };
});

const LazyPlaybackControls = lazy(async () => {
  const module = await import('@/components/PlaybackControls');
  return { default: module.PlaybackControls };
});

const LazyFlowEditorLayoutOverlay = lazy(async () => {
  const module = await import('@/components/FlowEditorLayoutOverlay');
  return { default: module.FlowEditorLayoutOverlay };
});

const LazyFlowEditorEmptyState = lazy(async () => {
  const module = await import('@/components/FlowEditorEmptyState');
  return { default: module.FlowEditorEmptyState };
});

const LazyDiffModeBanner = lazy(async () => {
  const module = await import('@/components/diagram-diff/DiffModeBanner');
  return { default: module.DiffModeBanner };
});

const LazyCollaborationPresenceOverlay = lazy(async () => {
  const module = await import('@/components/flow-editor/CollaborationPresenceOverlay');
  return { default: module.CollaborationPresenceOverlay };
});

function TopNavFallback(): React.ReactElement {
  return (
    <div className="absolute top-0 left-0 right-0 z-50 h-[52px] border-b border-[var(--wf-border)] bg-[var(--wf-surface)]" />
  );
}

export interface FlowEditorChromeProps {
  pages: EditorPage[];
  activePageId: string;
  topNav: {
    onSwitchPage: (pageId: string) => void;
    onAddPage: () => void;
    onClosePage: (pageId: string) => void;
    onRenamePage: (pageId: string, newName: string) => void;
    onReorderPage: (draggedPageId: string, targetPageId: string) => void;
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
    onImportJSON: () => void;
    onHistory: () => void;
    onGoHome: () => void;
    onPlay: () => void;
  };
  canvas: React.ReactNode;
  shouldRenderPanels: boolean;
  panels: FlowEditorPanelsProps;
  collaborationEnabled: boolean;
  remotePresence: CollaborationRemotePresence[];
  collaborationNodePositions?: Map<string, { x: number; y: number; width: number; height: number }>;
  layoutMessage: string;
  isLayouting: boolean;
  playback: {
    currentStepIndex: number;
    totalSteps: number;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    onStop: () => void;
  };
  toolbar: {
    isVisible: boolean;
    onOpenAssets: () => void;
    onAddShape: (input: AddShapeInput, position: { x: number; y: number }) => void;
    onAddAnnotation: (position: { x: number; y: number }) => void;
    onAddSection: (position: { x: number; y: number }) => void;
    onUndo: () => void;
    onRedo: () => void;
    onLayout: () => void;
    canUndo: boolean;
    canRedo: boolean;
    isSelectMode: boolean;
    onToggleSelectMode: () => void;
    isCommandBarOpen: boolean;
    editorMode: 'canvas' | 'studio';
    onTogglePanMode: () => void;
    isElementPaletteOpen: boolean;
    onToggleElementPalette: () => void;
    onCloseElementPalette: () => void;
    getCenter: () => { x: number; y: number };
  };
  emptyState?: {
    title: string;
    description: string;
    templatesLabel: string;
    onTemplates: () => void;
    showStudioHint?: boolean;
    studioHintLabel?: string;
    onSuggestionClick?: (prompt: string) => void;
  };
  onOpenStudio: () => void;
}

export function FlowEditorChrome({
  pages,
  activePageId,
  topNav,
  canvas,
  shouldRenderPanels,
  panels,
  collaborationEnabled,
  remotePresence,
  collaborationNodePositions,
  layoutMessage,
  isLayouting,
  playback,
  toolbar,
  emptyState,
  onOpenStudio,
}: FlowEditorChromeProps): React.ReactElement {
  const topNavProps = {
    pages,
    activePageId,
    onSwitchPage: topNav.onSwitchPage,
    onAddPage: topNav.onAddPage,
    onClosePage: topNav.onClosePage,
    onRenamePage: topNav.onRenamePage,
    onReorderPage: topNav.onReorderPage,
    onExportPNG: topNav.onExportPNG,
    onCopyImage: topNav.onCopyImage,
    onExportSVG: topNav.onExportSVG,
    onCopySVG: topNav.onCopySVG,
    onExportPDF: topNav.onExportPDF,
    onExportCinematic: topNav.onExportCinematic,
    onExportJSON: topNav.onExportJSON,
    onCopyJSON: topNav.onCopyJSON,
    onExportMermaid: topNav.onExportMermaid,
    onDownloadMermaid: topNav.onDownloadMermaid,
    onDownloadPlantUML: topNav.onDownloadPlantUML,
    onExportOpenFlowDSL: topNav.onExportOpenFlowDSL,
    onDownloadOpenFlowDSL: topNav.onDownloadOpenFlowDSL,
    onExportFigma: topNav.onExportFigma,
    onDownloadFigma: topNav.onDownloadFigma,
    onImportJSON: topNav.onImportJSON,
    onHistory: topNav.onHistory,
    onGoHome: topNav.onGoHome,
    onPlay: topNav.onPlay,
  };
  const toolbarProps = {
    onOpenAssets: toolbar.onOpenAssets,
    onAddShape: toolbar.onAddShape,
    onAddAnnotation: toolbar.onAddAnnotation,
    onAddSection: toolbar.onAddSection,
    onUndo: toolbar.onUndo,
    onRedo: toolbar.onRedo,
    onLayout: toolbar.onLayout,
    canUndo: toolbar.canUndo,
    canRedo: toolbar.canRedo,
    isSelectMode: toolbar.isSelectMode,
    onToggleSelectMode: toolbar.onToggleSelectMode,
    isCommandBarOpen: toolbar.isCommandBarOpen,
    editorMode: toolbar.editorMode,
    onTogglePanMode: toolbar.onTogglePanMode,
    isElementPaletteOpen: toolbar.isElementPaletteOpen,
    onToggleElementPalette: toolbar.onToggleElementPalette,
    onCloseElementPalette: toolbar.onCloseElementPalette,
    getCenter: toolbar.getCenter,
  };
  const playbackProps = {
    isPlaying: playback.isPlaying,
    currentStepIndex: playback.currentStepIndex,
    totalSteps: playback.totalSteps,
    onPlayPause: playback.onPlayPause,
    onNext: playback.onNext,
    onPrev: playback.onPrev,
    onStop: playback.onStop,
  };
  const emptyStateProps = emptyState
    ? {
        title: emptyState.title,
        description: emptyState.description,
        templatesLabel: emptyState.templatesLabel,
        onTemplates: emptyState.onTemplates,
        showStudioHint: emptyState.showStudioHint,
        studioHintLabel: emptyState.studioHintLabel,
      }
    : null;

  return (
    <>
      <Suspense fallback={<TopNavFallback />}>
        <LazyTopNav {...topNavProps} />
      </Suspense>

      <div className="flex min-h-0 flex-1 min-w-0 pt-[52px]">
        <div className="relative min-w-0 flex-1">
          <ErrorBoundary className="h-full">{canvas}</ErrorBoundary>
          <Suspense fallback={null}>
            <LazyDiffModeBanner />
          </Suspense>
          {emptyStateProps ? (
            <Suspense fallback={null}>
              <LazyFlowEditorEmptyState {...emptyStateProps} />
            </Suspense>
          ) : null}
          {toolbar.editorMode !== 'studio' ? (
            <StudioLauncher onOpen={onOpenStudio} />
          ) : null}
        </div>
        {shouldRenderPanels ? (
          <Suspense fallback={null}>
            <LazyFlowEditorPanels {...panels} />
          </Suspense>
        ) : null}
      </div>

      {collaborationEnabled ? (
        <Suspense fallback={null}>
          <LazyCollaborationPresenceOverlay
            remotePresence={remotePresence}
            nodePositions={collaborationNodePositions}
          />
        </Suspense>
      ) : null}

      {isLayouting ? (
        <Suspense fallback={null}>
          <LazyFlowEditorLayoutOverlay message={layoutMessage} />
        </Suspense>
      ) : null}

      {toolbar.isVisible ? (
        <Suspense fallback={null}>
          <LazyToolbar {...toolbarProps} />
        </Suspense>
      ) : (
        <Suspense fallback={null}>
          <LazyPlaybackControls {...playbackProps} />
        </Suspense>
      )}
    </>
  );
}
