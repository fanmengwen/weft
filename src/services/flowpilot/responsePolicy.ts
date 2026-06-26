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

const CHAT_ONLY_PATTERNS = [
  /\bjust answer\b/i,
  /\bdon'?t draw\b/i,
  /\bdo not draw\b/i,
  /\bno diagram\b/i,
  /先别画/,
  /不要画/,
  /别画/,
  /不要生成图/,
  /不用画图/,
  /只回答/,
  /只聊天/,
  /只说说/,
];

const EXPLICIT_PLAN_PATTERNS = [
  /\bbefore drawing\b/i,
  /\bgive me a plan\b/i,
  /\bplan first\b/i,
  /先给/,
  /先不要画/,
  /思路和步骤/,
  /大纲再画/,
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
  /\badd\b/i,
  /\bmake\b/i,
  /\bbuild\b/i,
  /画/,
  /绘制/,
  /生成图/,
  /做图/,
  /生成/,
  /做一个/,
  /加一个/,
  /添加/,
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

const STRUCTURAL_DIAGRAM_PATTERNS = [
  /\bnode\b/i,
  /\bedge\b/i,
  /\bconnect\b/i,
  /\bconnection\b/i,
  /\barrow\b/i,
  /\blink\b/i,
  /\bflow from\b/i,
  /\bstart\b/i,
  /\bend\b/i,
  /方块/,
  /节点/,
  /连线/,
  /连接/,
  /指向/,
  /箭头/,
  /从开始/,
  /到结束/,
  /开始/,
  /结束/,
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

function hasCanvasMutationIntent(
  hasDiagramIntent: boolean,
  hasStructuralIntent: boolean,
  hasArchitectureIntent: boolean
): boolean {
  return hasDiagramIntent || hasStructuralIntent || hasArchitectureIntent;
}

function buildDiagramPreviewPolicy(
  hasArchitectureIntent: boolean,
  skillId: FlowpilotSkillId = 'plan_diagram'
): {
  mode: AgentResponseMode;
  confidence: number;
  requiresApproval: boolean;
  reasoningSummary: string;
  skillId: FlowpilotSkillId;
} {
  return {
    mode: 'diagram_preview',
    confidence: clampConfidence(hasArchitectureIntent ? 0.92 : 0.84),
    requiresApproval: true,
    reasoningSummary: hasArchitectureIntent
      ? 'The request is architecture-oriented and should ground itself in provider assets before drafting.'
      : 'The request should produce a diagram preview for review before applying to the canvas.',
    skillId: hasArchitectureIntent ? 'create_architecture' : skillId,
  };
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
  const hasChatOnlyIntent = matchesAny(normalizedPrompt, CHAT_ONLY_PATTERNS);
  const hasExplanationIntent = matchesAny(normalizedPrompt, EXPLANATION_PATTERNS);
  const hasExplicitPlanIntent = matchesAny(normalizedPrompt, EXPLICIT_PLAN_PATTERNS);
  const hasAssetIntent = matchesAny(normalizedPrompt, ASSET_PATTERNS);
  const hasDiagramIntent = matchesAny(normalizedPrompt, DIAGRAM_PATTERNS);
  const hasStructuralIntent = matchesAny(normalizedPrompt, STRUCTURAL_DIAGRAM_PATTERNS);
  const hasEditIntent = matchesAny(normalizedPrompt, EDIT_PATTERNS);
  const hasArchitectureIntent = matchesAny(normalizedPrompt, ARCHITECTURE_PATTERNS);
  const wantsCanvasMutation = hasCanvasMutationIntent(
    hasDiagramIntent,
    hasStructuralIntent,
    hasArchitectureIntent
  );

  if (hasChatOnlyIntent) {
    return {
      mode: 'answer',
      confidence: 0.86,
      requiresApproval: false,
      reasoningSummary: 'The request explicitly asks for chat-only guidance without changing the canvas.',
      skillId: 'answer_question',
    };
  }

  if (hasAssetIntent && !hasDiagramIntent && !hasStructuralIntent) {
    return {
      mode: 'asset_suggestions',
      confidence: 0.9,
      requiresApproval: false,
      reasoningSummary: 'The request is asking for asset or component guidance before changing the canvas.',
      skillId: 'suggest_assets',
    };
  }

  if (hasExplanationIntent && !hasDiagramIntent && !hasStructuralIntent && context.nodeCount > 0) {
    return {
      mode: 'answer',
      confidence: 0.87,
      requiresApproval: false,
      reasoningSummary: 'The request is asking for analysis of the current diagram rather than a new draft.',
      skillId: 'explain_existing_diagram',
    };
  }

  if (hasExplicitPlanIntent && !hasDiagramIntent && !hasStructuralIntent) {
    return {
      mode: 'plan',
      confidence: 0.88,
      requiresApproval: false,
      reasoningSummary: 'The request explicitly asks for a plan before drafting.',
      skillId: 'plan_diagram',
    };
  }

  if (context.selectedNodeCount > 0 && hasEditIntent) {
    return {
      mode: 'diagram_preview',
      confidence: 0.9,
      requiresApproval: true,
      reasoningSummary: 'The request is a scoped edit on selected nodes, so a preview is safer than applying directly.',
      skillId: 'edit_selected_nodes',
    };
  }

  if (hasEditIntent) {
    return buildDiagramPreviewPolicy(false, 'plan_diagram');
  }

  if (wantsCanvasMutation) {
    return buildDiagramPreviewPolicy(hasArchitectureIntent);
  }

  if (context.preferDiagram) {
    return buildDiagramPreviewPolicy(false);
  }

  return buildDiagramPreviewPolicy(false);
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