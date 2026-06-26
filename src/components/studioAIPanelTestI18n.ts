import { threadKey } from '@/services/flowpilot/flowpilotThreadCopy';

const THREAD_TRANSLATIONS: Record<string, string> = {
  [threadKey('planTitle')]: '处理步骤',
  [threadKey('planTitleDiagram')]: '图表生成',
  [threadKey('planSummary', 'diagramPreview')]: '图表草稿已就绪，请在上方确认后应用到画布。',
  [threadKey('planSummary', 'plan')]: '先整理实现思路，确认后再生成图表。',
  [threadKey('modeLabel')]: '模式',
  [threadKey('confidenceLabel')]: '置信度',
  [threadKey('mode', 'plan')]: '计划',
  [threadKey('step', 'inspectCanvas')]: '检查当前画布上下文',
  [threadKey('step', 'outlineStructure')]: '梳理推荐结构',
  [threadKey('importReady')]: '导入已就绪，请检查变更后再应用',
  [threadKey('codeEnhancementReady')]: '代码库增强预览已就绪，请检查升级后的图表',
  [threadKey('previewDetail', 'codeEnhancementWithChanges')]:
    '已基于原生仓库结构图叠加 AI 架构增强。',
  [threadKey('appliedToCanvas')]: '已应用到画布',
};

export function createStudioAIPanelTestT(
  key: string,
  fallbackOrOptions?: string | { defaultValue?: string; count?: number }
): string {
  if (THREAD_TRANSLATIONS[key]) {
    return THREAD_TRANSLATIONS[key];
  }

  if (typeof fallbackOrOptions === 'string') {
    return fallbackOrOptions;
  }

  if (key === threadKey('step', 'inspectSelection') && fallbackOrOptions?.count) {
    return `检查已选中的 ${fallbackOrOptions.count} 个节点`;
  }

  return fallbackOrOptions?.defaultValue ?? key;
}