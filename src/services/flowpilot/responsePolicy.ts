import { inferPlanSteps } from './skills';
import type { AgentPlan, AgentResponseMode, FlowpilotPolicyContext, FlowpilotSkillId } from './types';

// Chinese keywords use plain substrings, not \b word boundaries: \b is
// ASCII-based and does not delimit CJK, which has no inter-word spaces.
const EXPLANATION_PATTERNS = [
  /\bexplain\b/i,
  /\bwhat('?s| is) wrong\b/i,
  /\bwhy\b/i,
  /\breview\b/i,
  /\banalyze\b/i,
  /\bcompare\b/i,
  /解释/,
  /说明/,
  /为什么/,
  /为何/,
  /分析/,
  /审查/,
  /检查/,
  /评审/,
  /对比/,
  /比较/,
];

const PLANNING_PATTERNS = [
  /\bplan\b/i,
  /\bstrategy\b/i,
  /\boptions\b/i,
  /\bbefore drawing\b/i,
  /\boutline\b/i,
  // Plan-request words. These also occur as subject nouns inside draw requests
  // ("画项目计划流程图"), but the plan branch is gated on !hasDiagramIntent, so an
  // explicit diagram keyword wins and only diagram-free prompts plan here.
  /计划/,
  /思路/,
  /步骤/,
  /大纲/,
  /提纲/,
];

const ASSET_PATTERNS = [
  /\bicon\b/i,
  /\basset\b/i,
  /\bcomponent\b/i,
  /\bwhich service\b/i,
  /\bwhat should i use\b/i,
  /图标/,
  /素材/,
  /组件/,
  /用什么服务/,
  /该用哪个/,
];

const DIAGRAM_PATTERNS = [
  /\bdiagram\b/i,
  /\bdraw\b/i,
  /\bgenerate\b/i,
  /\bcreate\b/i,
  /\bshow\b/i,
  /\bmap\b/i,
  /画/,
  /绘制/,
  /流程图/,
  /架构图/,
  /思维导图/,
  /时序图/,
  /序列图/,
  /状态图/,
  /类图/,
  /关系图/,
  /实体关系/,
  /ER图/i,
  /用例图/,
  /旅程图/,
  /用户旅程/,
  /图表/,
  /示意图/,
  /拓扑图/,
  /框图/,
];

const EDIT_PATTERNS = [
  /\bchange\b/i,
  /\bupdate\b/i,
  /\bedit\b/i,
  /\brefine\b/i,
  /\breplace\b/i,
  /修改/,
  /更新/,
  /编辑/,
  /调整/,
  /替换/,
  /改成/,
  /改为/,
  /换成/,
  /优化/,
];

const ARCHITECTURE_PATTERNS = [
  /\barchitecture\b/i,
  /\baws\b/i,
  /\bazure\b/i,
  /\bgcp\b/i,
  /\bkubernetes\b/i,
  /\bcncf\b/i,
  /\binfra\b/i,
  /\bservice\b/i,
  /架构/,
  /部署/,
  /微服务/,
  /集群/,
  /拓扑/,
  /基础设施/,
  /云原生/,
  /阿里云/,
  /腾讯云/,
  /华为云/,
];

function matchesAny(prompt: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(prompt));
}

function clampConfidence(value: number): number {
  return Math.max(0.1, Math.min(0.98, Math.round(value * 100) / 100));
}

// CJK Unified (incl. Ext-A) + Japanese kana + Hangul syllables.
const CJK_CHAR = /[㐀-鿿぀-ヿ가-힯]/g;

// CJK has no inter-word spaces, so split(/\s+/) collapses an entire Chinese
// sentence into a single "word" and the underspecified-prompt heuristic would
// fire on every Chinese request. Count CJK characters individually and
// whitespace-delimited runs for everything else. Intentionally not
// Intl.Segmenter: its word boundaries vary by ICU version across runtimes,
// which would make the < 10 threshold non-deterministic across environments.
function estimateWordCount(text: string): number {
  const trimmed = text.trim();
  if (trimmed.length === 0) {
    return 0;
  }
  const cjkCount = trimmed.match(CJK_CHAR)?.length ?? 0;
  const nonCjkCount = trimmed.replace(CJK_CHAR, ' ').split(/\s+/).filter(Boolean).length;
  return cjkCount + nonCjkCount;
}

export function chooseFlowpilotResponseMode(
  context: FlowpilotPolicyContext
): {
  mode: AgentResponseMode;
  confidence: number;
  requiresApproval: boolean;
  reasoningSummary: string;
  skillId: FlowpilotSkillId;
} {
  const normalizedPrompt = context.prompt.trim();
  const hasExplanationIntent = matchesAny(normalizedPrompt, EXPLANATION_PATTERNS);
  const hasPlanningIntent = matchesAny(normalizedPrompt, PLANNING_PATTERNS);
  const hasAssetIntent = matchesAny(normalizedPrompt, ASSET_PATTERNS);
  const hasDiagramIntent = matchesAny(normalizedPrompt, DIAGRAM_PATTERNS);
  const hasEditIntent = matchesAny(normalizedPrompt, EDIT_PATTERNS);
  const hasArchitectureIntent = matchesAny(normalizedPrompt, ARCHITECTURE_PATTERNS);

  if (hasAssetIntent && !hasDiagramIntent) {
    return {
      mode: 'asset_suggestions',
      confidence: 0.9,
      requiresApproval: false,
      reasoningSummary: 'The request is asking for asset or component guidance before changing the canvas.',
      skillId: 'suggest_assets',
    };
  }

  if (hasExplanationIntent && !hasDiagramIntent && context.nodeCount > 0) {
    return {
      mode: 'answer',
      confidence: 0.87,
      requiresApproval: false,
      reasoningSummary: 'The request is asking for analysis of the current diagram rather than a new draft.',
      skillId: 'explain_existing_diagram',
    };
  }

  // A scoped edit on a selection is checked BEFORE the plan branch: an explicit
  // edit verb on selected nodes ("改成蓝色") is a concrete edit, not an
  // underspecified request, so it must reach a preview rather than be hijacked
  // into plan mode by its short length or an incidental planning word.
  if (context.selectedNodeCount > 0 && hasEditIntent) {
    return {
      mode: 'diagram_preview',
      confidence: 0.9,
      requiresApproval: true,
      reasoningSummary: 'The request is a scoped edit on selected nodes, so a preview is safer than applying directly.',
      skillId: 'edit_selected_nodes',
    };
  }

  // An explicit diagram keyword is authoritative: it overrides planning- and
  // explanation-intent words so a draw request that merely *mentions* 计划/步骤/
  // 说明 as its subject ("生成项目计划流程图") still routes to a diagram instead of
  // being hijacked into plan/answer. Only genuinely diagram-free prompts reach
  // plan mode — either explicit planning intent or an underspecified short one.
  if (!hasDiagramIntent && (hasPlanningIntent || estimateWordCount(normalizedPrompt) < 10)) {
    return {
      mode: 'plan',
      confidence: clampConfidence(hasPlanningIntent ? 0.88 : 0.66),
      requiresApproval: false,
      reasoningSummary: 'The request is underspecified or explicitly asks for a plan before drafting.',
      skillId: 'plan_diagram',
    };
  }

  if (hasArchitectureIntent || hasDiagramIntent) {
    return {
      mode: 'diagram_preview',
      confidence: clampConfidence(hasArchitectureIntent ? 0.92 : 0.84),
      requiresApproval: true,
      reasoningSummary: hasArchitectureIntent
        ? 'The request is architecture-oriented and should ground itself in provider assets before drafting.'
        : 'The request clearly asks for a diagram draft, so a preview is the right next step.',
      skillId: hasArchitectureIntent ? 'create_architecture' : 'plan_diagram',
    };
  }

  return {
    mode: 'answer',
    confidence: 0.62,
    requiresApproval: false,
    reasoningSummary: 'The safest next step is to answer in chat first instead of changing the canvas.',
    skillId: 'answer_question',
  };
}

export function buildFlowpilotPlan(context: FlowpilotPolicyContext): AgentPlan {
  const policy = chooseFlowpilotResponseMode(context);
  const intendedOutput =
    policy.mode === 'diagram_preview'
      ? 'Canvas preview with review/apply controls'
      : policy.mode === 'asset_suggestions'
        ? 'Recommended local asset matches'
        : policy.mode === 'plan'
          ? 'Structured plan and next-step options'
          : 'Chat response';

  return {
    goal: context.prompt.trim(),
    mode: policy.mode,
    steps: inferPlanSteps(policy.skillId, context),
    requiresApproval: policy.requiresApproval,
    intendedOutput,
    confidence: policy.confidence,
    reasoningSummary: policy.reasoningSummary,
    skillId: policy.skillId,
  };
}
