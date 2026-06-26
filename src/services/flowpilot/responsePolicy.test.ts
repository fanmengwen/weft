import { describe, expect, it } from 'vitest';
import { buildFlowpilotPlan, chooseFlowpilotResponseMode } from './responsePolicy';

const USER_STRUCTURAL_PROMPT =
  '随便两个方块，第一个方块是开始，第二个方块是结束。然后第一个方块指向第二个方块。';

describe('flowpilot response policy', () => {
  it('selects answer mode for explanatory prompts', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: "Explain what's wrong with this architecture",
      nodeCount: 8,
      selectedNodeCount: 0,
    });

    expect(result.mode).toBe('answer');
    expect(result.skillId).toBe('explain_existing_diagram');
  });

  it('selects plan mode for planning prompts', () => {
    const plan = buildFlowpilotPlan({
      prompt: 'Plan a better version before drawing it',
      nodeCount: 5,
      selectedNodeCount: 0,
    });

    expect(plan.mode).toBe('plan');
    expect(plan.steps.length).toBeGreaterThan(1);
  });

  it('selects preview mode for explicit architecture creation', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: 'Create an AWS architecture diagram for a payments platform',
      nodeCount: 0,
      selectedNodeCount: 0,
    });

    expect(result.mode).toBe('diagram_preview');
    expect(result.requiresApproval).toBe(true);
  });
});

describe('flowpilot response policy — Chinese (CJK) routing', () => {
  it.each([
    '画一个用户注册登录的流程图',
    '生成一张电商下单的架构图',
    '帮我画用户认证流程',
    '绘制一张微服务部署的架构图',
    '做一个项目排期的思维导图',
    '生成项目计划流程图',
    '画一个项目计划的甘特图',
    '把这个实现思路画成流程图',
    '用流程图展示部署步骤',
  ])('routes a Chinese diagram request to a draft: %s', (prompt) => {
    const result = chooseFlowpilotResponseMode({ prompt, nodeCount: 0, selectedNodeCount: 0 });

    expect(result.mode).toBe('diagram_preview');
    expect(result.confidence).not.toBe(0.66);
  });

  it('routes structural node descriptions to a diagram preview', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: USER_STRUCTURAL_PROMPT,
      nodeCount: 0,
      selectedNodeCount: 0,
      preferDiagram: true,
    });

    expect(result.mode).toBe('diagram_preview');
    expect(result.requiresApproval).toBe(true);
  });

  it('lets an explicit diagram keyword win over an explanation subject noun (说明) even with nodes', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '为这份说明书画一张流程图',
      nodeCount: 8,
      selectedNodeCount: 0,
    });

    expect(result.mode).toBe('diagram_preview');
  });

  it('treats a Chinese architecture request as an architecture draft needing approval', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '设计一套电商平台的架构图,包含网关和缓存',
      nodeCount: 0,
      selectedNodeCount: 0,
    });

    expect(result.mode).toBe('diagram_preview');
    expect(result.skillId).toBe('create_architecture');
    expect(result.requiresApproval).toBe(true);
  });

  it('still selects plan mode for a diagram-free Chinese planning request', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '先给我一个数据迁移的思路和步骤',
      nodeCount: 0,
      selectedNodeCount: 0,
    });

    expect(result.mode).toBe('plan');
  });

  it('selects answer mode for a Chinese explanation of the existing diagram', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '解释一下这张图里哪里有问题',
      nodeCount: 8,
      selectedNodeCount: 0,
    });

    expect(result.mode).toBe('answer');
    expect(result.skillId).toBe('explain_existing_diagram');
  });

  it('selects answer mode when the user explicitly asks for chat-only guidance', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '先别画，只说说这个方案的优缺点',
      nodeCount: 0,
      selectedNodeCount: 0,
      preferDiagram: true,
    });

    expect(result.mode).toBe('answer');
    expect(result.skillId).toBe('answer_question');
  });

  it('routes a Chinese edit on selected nodes to a preview rather than a plan', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '把选中的这些节点颜色统一改成蓝色并加粗标题',
      nodeCount: 12,
      selectedNodeCount: 3,
    });

    expect(result.mode).toBe('diagram_preview');
    expect(result.skillId).toBe('edit_selected_nodes');
  });

  it('routes a SHORT edit on selected nodes to a preview (edit branch precedes plan)', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '改成蓝色',
      nodeCount: 12,
      selectedNodeCount: 3,
    });

    expect(result.mode).toBe('diagram_preview');
    expect(result.skillId).toBe('edit_selected_nodes');
  });

  it('routes a short edit-verb prompt without a selection to a diagram preview', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: '改成蓝色',
      nodeCount: 12,
      selectedNodeCount: 0,
      preferDiagram: true,
    });

    expect(result.mode).toBe('diagram_preview');
    expect(result.skillId).toBe('plan_diagram');
  });

  it('defaults ambiguous studio prompts to diagram preview', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: 'tell me everything you happen to know about this particular topic right now please',
      nodeCount: 0,
      selectedNodeCount: 0,
      preferDiagram: true,
    });

    expect(result.mode).toBe('diagram_preview');
  });
});

describe('preferDiagram studio routing', () => {
  it('uses diagram preview as the studio default for underspecified prompts', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: 'microservices checkout flow',
      nodeCount: 0,
      selectedNodeCount: 0,
      preferDiagram: true,
    });

    expect(result.mode).toBe('diagram_preview');
    expect(result.requiresApproval).toBe(true);
  });

  it('still honors explicit plan requests in studio mode', () => {
    const result = chooseFlowpilotResponseMode({
      prompt: 'Give me a plan before drawing a payments architecture',
      nodeCount: 0,
      selectedNodeCount: 0,
      preferDiagram: true,
    });

    expect(result.mode).toBe('plan');
  });
});