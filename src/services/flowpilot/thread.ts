import { createId } from '@/lib/id';
import type { ChatMessage } from '@/services/aiService';
import type {
  AgentPlan,
  AssistantThreadItem,
  AssistantThreadItemType,
  AssetGroundingMatch,
  FlowpilotCopyKey,
  FlowpilotPreviewDetailKey,
} from './types';

function nowIso(): string {
  return new Date().toISOString();
}

export function createAssistantThreadItem(
  type: AssistantThreadItemType,
  role: AssistantThreadItem['role'],
  content: string,
  extra: Partial<Omit<AssistantThreadItem, 'id' | 'type' | 'role' | 'content' | 'createdAt'>> = {}
): AssistantThreadItem {
  return {
    id: createId(`flowpilot-${type}`),
    type,
    role,
    content,
    createdAt: nowIso(),
    ...extra,
  };
}

export function createUserThreadItem(prompt: string, imageBase64?: string): AssistantThreadItem {
  return createAssistantThreadItem(
    'user_message',
    'user',
    imageBase64 ? `${prompt} [Image Attached]` : prompt
  );
}

export function createPlanThreadItem(plan: AgentPlan): AssistantThreadItem {
  return createAssistantThreadItem('assistant_plan', 'model', plan.reasoningSummary, {
    responseMode: plan.mode,
    thinkingState: 'planning',
    summary: plan.reasoningSummary,
    plan,
  });
}

export function createAnswerThreadItem(
  content: string,
  mode: AssistantThreadItem['responseMode'],
  assetMatches?: AssetGroundingMatch[]
): AssistantThreadItem {
  const type = mode === 'asset_suggestions' ? 'assistant_recommendation' : 'assistant_lookup_result';
  return createAssistantThreadItem(type, 'model', content, {
    responseMode: mode,
    thinkingState: 'ready',
    assetMatches,
  });
}

export function createPreviewThreadItem(
  content: string,
  options: {
    copyKey: FlowpilotCopyKey;
    previewTitle?: string;
    previewDetailKey?: FlowpilotPreviewDetailKey;
    previewDetail?: string;
    previewStats?: string[];
    assetMatches?: AssetGroundingMatch[];
  }
): AssistantThreadItem {
  return createAssistantThreadItem('assistant_canvas_preview', 'model', content, {
    responseMode: 'diagram_preview',
    thinkingState: 'ready',
    copyKey: options.copyKey,
    previewTitle: options.previewTitle,
    previewDetailKey: options.previewDetailKey,
    previewDetail: options.previewDetail,
    previewStats: options.previewStats,
    assetMatches: options.assetMatches,
  });
}

export function createAppliedThreadItem(
  copyKey: FlowpilotCopyKey = 'appliedToCanvas',
  content = ''
): AssistantThreadItem {
  return createAssistantThreadItem('assistant_applied_result', 'model', content, {
    responseMode: 'diagram_apply_ready',
    thinkingState: 'ready',
    applied: true,
    copyKey,
  });
}

export function createErrorThreadItem(message: string): AssistantThreadItem {
  return createAssistantThreadItem('assistant_error', 'model', message, {
    thinkingState: 'error',
  });
}

export function assistantThreadToChatMessages(items: AssistantThreadItem[]): ChatMessage[] {
  return items
    .filter((item) => item.type !== 'assistant_plan' && item.type !== 'assistant_thinking')
    .map((item) => ({
      role: item.role,
      parts: [{ text: item.content }],
    }));
}
