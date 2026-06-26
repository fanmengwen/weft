import type {
  AgentResponseMode,
  FlowpilotCopyKey,
  FlowpilotPreviewDetailKey,
  FlowpilotSkillId,
} from './types';

export const FLOWPILOT_THREAD_I18N_PREFIX = 'commandBar.aiStudio.thread';

export type PlanCardVariant = 'minimal' | 'full';

export type TranslateFn = (
  key: string,
  options?: { defaultValue?: string; count?: number }
) => string;

export function threadKey(...segments: string[]): string {
  return `${FLOWPILOT_THREAD_I18N_PREFIX}.${segments.join('.')}`;
}

export function getPlanCardVariant(mode: AgentResponseMode): PlanCardVariant {
  return mode === 'diagram_preview' || mode === 'diagram_apply_ready' ? 'minimal' : 'full';
}

export function getPlanTitleKey(mode: AgentResponseMode): string {
  return mode === 'diagram_preview' || mode === 'diagram_apply_ready'
    ? threadKey('planTitleDiagram')
    : threadKey('planTitle');
}

export function getPlanSummaryKey(mode: AgentResponseMode, skillId: FlowpilotSkillId): string {
  if (mode === 'diagram_preview' || mode === 'diagram_apply_ready') {
    return threadKey('planSummary', 'diagramPreview');
  }
  if (mode === 'plan') {
    return threadKey('planSummary', 'plan');
  }
  if (mode === 'asset_suggestions') {
    return threadKey('planSummary', 'assetSuggestions');
  }
  if (mode === 'answer' && skillId === 'explain_existing_diagram') {
    return threadKey('planSummary', 'explainDiagram');
  }
  if (skillId === 'edit_selected_nodes') {
    return threadKey('planSummary', 'editSelected');
  }
  return threadKey('planSummary', 'answer');
}

export function getResponseModeLabelKey(mode: AgentResponseMode): string | null {
  if (mode === 'diagram_preview') return threadKey('mode', 'diagram_preview');
  if (mode === 'plan') return threadKey('mode', 'plan');
  if (mode === 'answer') return threadKey('mode', 'answer');
  if (mode === 'asset_suggestions') return threadKey('mode', 'asset_suggestions');
  return null;
}

export function getPlanStepKeys(
  skillId: FlowpilotSkillId,
  selectedNodeCount: number
): Array<{ key: string; count?: number }> {
  switch (skillId) {
    case 'answer_question':
      return [
        { key: threadKey('step', 'inspectCanvas') },
        { key: threadKey('step', 'draftAnswer') },
      ];
    case 'plan_diagram':
      return [
        { key: threadKey('step', 'inspectCanvas') },
        { key: threadKey('step', 'outlineStructure') },
      ];
    case 'create_architecture':
      return [
        { key: threadKey('step', 'inspectCanvas') },
        { key: threadKey('step', 'searchAssets') },
        { key: threadKey('step', 'draftPreview') },
      ];
    case 'edit_selected_nodes':
      return [
        { key: threadKey('step', 'inspectSelection'), count: selectedNodeCount || 1 },
        { key: threadKey('step', 'planScopedEdit') },
        { key: threadKey('step', 'draftPreview') },
      ];
    case 'upgrade_codebase_import':
      return [
        { key: threadKey('step', 'inspectImport') },
        { key: threadKey('step', 'groundServices') },
        { key: threadKey('step', 'prepareUpgradePreview') },
      ];
    case 'suggest_assets':
      return [
        { key: threadKey('step', 'searchAssets') },
        { key: threadKey('step', 'rankMatches') },
      ];
    case 'explain_existing_diagram':
      return [
        { key: threadKey('step', 'inspectDiagram') },
        { key: threadKey('step', 'explainFindings') },
      ];
    default:
      return [
        { key: threadKey('step', 'inspectRequest') },
        { key: threadKey('step', 'draftResponse') },
      ];
  }
}

export function resolveThreadCopy(
  t: TranslateFn,
  copyKey?: FlowpilotCopyKey,
  fallback?: string
): string {
  if (copyKey) {
    return t(threadKey(copyKey), { defaultValue: fallback ?? copyKey });
  }
  return fallback ?? '';
}

export function resolvePreviewDetailCopy(
  t: TranslateFn,
  previewDetailKey?: FlowpilotPreviewDetailKey,
  fallback?: string
): string | undefined {
  if (previewDetailKey) {
    return t(threadKey('previewDetail', previewDetailKey), { defaultValue: fallback });
  }
  return fallback;
}

const LEGACY_PREVIEW_TITLE_COPY_KEYS: Record<string, FlowpilotCopyKey> = {
  'Import ready — review changes before applying.': 'importReady',
  'Import ready - review changes': 'importReady',
  'Codebase enhancement ready — review the upgraded diagram.': 'codeEnhancementReady',
};

export function inferCopyKeyFromPreviewTitle(previewTitle?: string): FlowpilotCopyKey | undefined {
  if (!previewTitle) {
    return undefined;
  }
  return LEGACY_PREVIEW_TITLE_COPY_KEYS[previewTitle];
}

export function resolvePreviewTitleCopy(
  t: TranslateFn,
  options: {
    copyKey?: FlowpilotCopyKey;
    previewTitle?: string;
  }
): string {
  const copyKey = options.copyKey ?? inferCopyKeyFromPreviewTitle(options.previewTitle);
  if (copyKey) {
    return resolveThreadCopy(t, copyKey, options.previewTitle);
  }
  return options.previewTitle ?? '';
}