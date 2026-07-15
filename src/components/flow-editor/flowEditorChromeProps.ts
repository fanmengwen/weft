import { useMemo } from 'react';
import type { FlowEditorChromeProps } from './FlowEditorChrome';
import type {
  BuildTopNavParams,
  BuildToolbarParams,
  BuildPlaybackParams,
  BuildEmptyStateParams,
  UseFlowEditorChromePropsParams,
} from './chromePropTypes';

export function buildFlowEditorTopNavProps({
  handleSwitchPage,
  handleAddPage,
  handleClosePage,
  handleRenamePage,
  handleReorderPage,
  handleExport,
  handleCopyImage,
  handleSvgExport,
  handleCopySvg,
  handlePdfExport,
  handleCinematicExport,
  handleExportJSON,
  handleCopyJSON,
  handleExportMermaid,
  handleDownloadMermaid,
  handleDownloadPlantUML,
  handleExportOpenFlowDSL,
  handleDownloadOpenFlowDSL,
  handleExportFigma,
  handleDownloadFigma,
  handleImportJSON,
  openHistory,
  onGoHome,
  startPlayback,
}: BuildTopNavParams): FlowEditorChromeProps['topNav'] {
  return {
    onSwitchPage: handleSwitchPage,
    onAddPage: handleAddPage,
    onClosePage: handleClosePage,
    onRenamePage: handleRenamePage,
    onReorderPage: handleReorderPage,
    onExportPNG: handleExport,
    onCopyImage: handleCopyImage,
    onExportSVG: handleSvgExport,
    onCopySVG: handleCopySvg,
    onExportPDF: handlePdfExport,
    onExportCinematic: handleCinematicExport,
    onExportJSON: handleExportJSON,
    onCopyJSON: handleCopyJSON,
    onExportMermaid: handleExportMermaid,
    onDownloadMermaid: handleDownloadMermaid,
    onDownloadPlantUML: handleDownloadPlantUML,
    onExportOpenFlowDSL: handleExportOpenFlowDSL,
    onDownloadOpenFlowDSL: handleDownloadOpenFlowDSL,
    onExportFigma: handleExportFigma,
    onDownloadFigma: handleDownloadFigma,
    onImportJSON: handleImportJSON,
    onHistory: openHistory,
    onGoHome,
    onPlay: startPlayback,
  };
}

export function buildFlowEditorToolbarProps({
  currentStepIndex,
  openCommandBar,
  editorMode,
  handleAddShape,
  handleAddAnnotation,
  handleAddSection,
  undo,
  redo,
  handleLayoutWithContext,
  canUndo,
  canRedo,
  isSelectMode,
  enableSelectMode,
  isCommandBarOpen,
  enablePanMode,
  isElementPaletteOpen,
  toggleElementPalette,
  closeElementPalette,
  getCenter,
}: BuildToolbarParams): FlowEditorChromeProps['toolbar'] {
  return {
    isVisible: currentStepIndex === -1,
    onOpenAssets: () => openCommandBar('assets'),
    onAddShape: handleAddShape,
    onAddAnnotation: handleAddAnnotation,
    onAddSection: handleAddSection,
    onUndo: undo,
    onRedo: redo,
    onLayout: handleLayoutWithContext,
    canUndo,
    canRedo,
    isSelectMode,
    onToggleSelectMode: enableSelectMode,
    isCommandBarOpen,
    editorMode,
    onTogglePanMode: enablePanMode,
    isElementPaletteOpen,
    onToggleElementPalette: toggleElementPalette,
    onCloseElementPalette: closeElementPalette,
    getCenter,
  };
}

export function buildFlowEditorPlaybackProps({
  currentStepIndex,
  totalSteps,
  isPlaying,
  togglePlay,
  nextStep,
  prevStep,
  stopPlayback,
}: BuildPlaybackParams): FlowEditorChromeProps['playback'] {
  return {
    currentStepIndex,
    totalSteps,
    isPlaying,
    onPlayPause: togglePlay,
    onNext: nextStep,
    onPrev: prevStep,
    onStop: stopPlayback,
  };
}

export function buildFlowEditorEmptyStateProps({
  nodes,
  editorMode,
  isCommandBarOpen,
  t,
  openStudioPanel,
  openCommandBar,
  handleAddNode,
  setPendingAIPrompt,
}: BuildEmptyStateParams): FlowEditorChromeProps['emptyState'] | undefined {
  // Keep the empty-canvas overlay while Studio is open so the flat CTA and
  // "AI is ready" hint stay visible next to the AI panel (design empty state).
  if (nodes.length > 0 || isCommandBarOpen) {
    return undefined;
  }

  return {
    title: t('flowEditor.emptyState.title', { defaultValue: 'Your canvas is empty' }),
    description: t('flowEditor.emptyState.description', {
      defaultValue:
        'Use Studio on the right to generate a diagram with AI,\nor start manually with the options below.',
    }),
    templatesLabel: t('flowEditor.emptyState.browseTemplates', {
      defaultValue: 'Browse templates',
    }),
    addNodeLabel: t('flowEditor.emptyState.addBlankNode', {
      defaultValue: 'Add blank shape',
    }),
    onTemplates: () => openCommandBar('templates'),
    onAddNode: () => handleAddNode(),
    showStudioHint: editorMode === 'studio',
    studioHintLabel: t('flowEditor.emptyState.studioReady', {
      defaultValue: 'AI is ready',
    }),
    onSuggestionClick: (prompt) => {
      setPendingAIPrompt(prompt);
      openStudioPanel('ai');
    },
  };
}

export function useFlowEditorChromeProps(
  params: UseFlowEditorChromePropsParams
): Pick<FlowEditorChromeProps, 'topNav' | 'toolbar' | 'playback' | 'emptyState'> {
  const {
    handleSwitchPage,
    handleAddPage,
    handleClosePage,
    handleRenamePage,
    handleReorderPage,
    handleExport,
    handleCopyImage,
    handleSvgExport,
    handleCopySvg,
    handlePdfExport,
    handleCinematicExport,
    handleExportJSON,
    handleCopyJSON,
    handleExportMermaid,
    handleDownloadMermaid,
    handleDownloadPlantUML,
    handleExportOpenFlowDSL,
    handleDownloadOpenFlowDSL,
    handleExportFigma,
    handleDownloadFigma,
    handleImportJSON,
    openHistory,
    onGoHome,
    startPlayback,
    currentStepIndex,
    editorMode,
    handleAddShape,
    handleAddAnnotation,
    handleAddSection,
    undo,
    redo,
    handleLayoutWithContext,
    canUndo,
    canRedo,
    isSelectMode,
    enableSelectMode,
    isCommandBarOpen,
    enablePanMode,
    isElementPaletteOpen,
    toggleElementPalette,
    closeElementPalette,
    getCenter,
    totalSteps,
    isPlaying,
    togglePlay,
    nextStep,
    prevStep,
    stopPlayback,
    nodes,
    t,
    openStudioPanel,
    openCommandBar,
    handleAddNode,
    setPendingAIPrompt,
  } = params;

  const topNav = useMemo(
    () =>
      buildFlowEditorTopNavProps({
        handleSwitchPage,
        handleAddPage,
        handleClosePage,
        handleRenamePage,
        handleReorderPage,
        handleExport,
        handleCopyImage,
        handleSvgExport,
        handleCopySvg,
        handlePdfExport,
        handleCinematicExport,
        handleExportJSON,
        handleCopyJSON,
        handleExportMermaid,
        handleDownloadMermaid,
        handleDownloadPlantUML,
        handleExportOpenFlowDSL,
        handleDownloadOpenFlowDSL,
        handleExportFigma,
        handleDownloadFigma,
        handleImportJSON,
        openHistory,
        onGoHome,
        startPlayback,
      }),
    [
      handleSwitchPage,
      handleAddPage,
      handleClosePage,
      handleRenamePage,
      handleReorderPage,
      handleExport,
      handleCopyImage,
      handleSvgExport,
      handleCopySvg,
      handlePdfExport,
      handleCinematicExport,
      handleExportJSON,
      handleCopyJSON,
      handleExportMermaid,
      handleDownloadMermaid,
      handleDownloadPlantUML,
      handleExportOpenFlowDSL,
      handleDownloadOpenFlowDSL,
      handleExportFigma,
      handleDownloadFigma,
      handleImportJSON,
      openHistory,
      onGoHome,
      startPlayback,
    ]
  );
  const toolbar = useMemo(
    () =>
      buildFlowEditorToolbarProps({
        currentStepIndex,
        openCommandBar,
        editorMode,
        handleAddShape,
        handleAddAnnotation,
        handleAddSection,
        undo,
        redo,
        handleLayoutWithContext,
        canUndo,
        canRedo,
        isSelectMode,
        enableSelectMode,
        isCommandBarOpen,
        enablePanMode,
        isElementPaletteOpen,
        toggleElementPalette,
        closeElementPalette,
        getCenter,
      }),
    [
      currentStepIndex,
      openCommandBar,
      editorMode,
      handleAddShape,
      handleAddAnnotation,
      handleAddSection,
      undo,
      redo,
      handleLayoutWithContext,
      canUndo,
      canRedo,
      isSelectMode,
      enableSelectMode,
      isCommandBarOpen,
      enablePanMode,
      isElementPaletteOpen,
      toggleElementPalette,
      closeElementPalette,
      getCenter,
    ]
  );
  const playback = useMemo(
    () =>
      buildFlowEditorPlaybackProps({
        currentStepIndex,
        totalSteps,
        isPlaying,
        togglePlay,
        nextStep,
        prevStep,
        stopPlayback,
      }),
    [currentStepIndex, totalSteps, isPlaying, togglePlay, nextStep, prevStep, stopPlayback]
  );
  const emptyState = useMemo(
    () =>
      buildFlowEditorEmptyStateProps({
        nodes,
        editorMode,
        isCommandBarOpen,
        t,
        openStudioPanel,
        openCommandBar,
        handleAddNode,
        setPendingAIPrompt,
      }),
    [nodes, editorMode, isCommandBarOpen, t, openStudioPanel, openCommandBar, handleAddNode, setPendingAIPrompt]
  );

  return {
    topNav,
    toolbar,
    playback,
    emptyState,
  };
}
