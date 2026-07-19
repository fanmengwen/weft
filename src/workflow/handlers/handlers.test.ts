import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useFlowStore } from '@/store';
import type { FlowNode } from '@/lib/types';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import type { WorkflowLogMessage, WorkflowRunContext } from '../engine/types';
import { VariablePool } from '../engine/variablePool';
import type { WorkflowCondition, WorkflowNodeData } from '../nodes/workflowNodeData';
import { buildCodeInputs, normalizeCodeResult } from './code';
import { ifElseHandler } from './ifElse';
import { llmHandler } from './llm';
import { outputHandler } from './output';
import { textInputHandler } from './textInput';
import { webSearchHandler } from './webSearch';

interface ContextSetup {
  context: WorkflowRunContext;
  logs: WorkflowLogMessage[];
}

function makeContext(
  node: FlowNode,
  overrides: Partial<Pick<WorkflowRunContext, 'pool' | 'incomers'>> = {}
): ContextSetup {
  const logs: WorkflowLogMessage[] = [];
  return {
    logs,
    context: {
      node,
      data: node.data as unknown as WorkflowNodeData,
      pool: overrides.pool ?? new VariablePool(),
      incomers: overrides.incomers ?? [],
      signal: new AbortController().signal,
      emitStream: () => {},
      log: (log) => logs.push(log),
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  useFlowStore.setState({
    aiSettings: { provider: 'gemini', storageMode: 'local', customHeaders: [] },
  });
});

describe('textInputHandler', () => {
  it('emits the configured text and warns when empty', async () => {
    const node = createWorkflowNode('textInput', { x: 0, y: 0 });
    (node.data as { text?: string }).text = 'seed text';
    const { context } = makeContext(node);
    await expect(textInputHandler.run(context)).resolves.toEqual({
      outputs: { text: 'seed text' },
    });

    const empty = createWorkflowNode('textInput', { x: 0, y: 0 });
    const { context: emptyContext, logs } = makeContext(empty);
    await textInputHandler.run(emptyContext);
    expect(logs).toContainEqual({
      level: 'warn',
      messageKey: 'workflowMode.log.emptyTextInput',
    });
  });
});

describe('outputHandler', () => {
  it('aggregates upstream text from the pool', async () => {
    const upstream = createWorkflowNode('llm', { x: 0, y: 0 });
    const node = createWorkflowNode('output', { x: 1, y: 0 });
    const pool = new VariablePool({ [upstream.id]: { text: 'final answer' } });
    const { context } = makeContext(node, { pool, incomers: [upstream] });

    await expect(outputHandler.run(context)).resolves.toEqual({
      outputs: { text: 'final answer' },
    });
  });

  it('resolves an explicit content template before falling back to upstream', async () => {
    const upstream = createWorkflowNode('llm', { x: 0, y: 0 });
    const node = createWorkflowNode('output', { x: 1, y: 0 });
    (node.data as { text?: string }).text = `Answer: {{${upstream.id}.text}}`;
    const pool = new VariablePool({ [upstream.id]: { text: 'resolved' } });
    const { context } = makeContext(node, { pool, incomers: [upstream] });

    await expect(outputHandler.run(context)).resolves.toEqual({
      outputs: { text: 'Answer: resolved' },
    });
  });

  it('emits fixed copy for empty-branch style outputs', async () => {
    const node = createWorkflowNode('output', { x: 0, y: 0 });
    (node.data as { text?: string }).text = '知识库中没有找到相关资料。';
    const { context } = makeContext(node);

    await expect(outputHandler.run(context)).resolves.toEqual({
      outputs: { text: '知识库中没有找到相关资料。' },
    });
  });
});

describe('llmHandler', () => {
  it('fails with the provider error when no API key is configured', async () => {
    const node = createWorkflowNode('llm', { x: 0, y: 0 });
    (node.data as { prompt?: string }).prompt = 'say hi';
    const { context } = makeContext(node);

    await expect(llmHandler.run(context)).rejects.toThrow(/API key is missing/);
  });

  it('fails fast when neither prompt nor upstream text exists', async () => {
    const node = createWorkflowNode('llm', { x: 0, y: 0 });
    const { context } = makeContext(node);

    await expect(llmHandler.run(context)).rejects.toMatchObject({
      messageKey: 'workflowMode.log.emptyPrompt',
    });
  });
});

describe('webSearchHandler', () => {
  it('uses DashScope native search when the configured custom endpoint supports it', async () => {
    useFlowStore.setState({
      aiSettings: {
        provider: 'custom',
        storageMode: 'local',
        apiKey: 'test-key',
        model: 'qwen-plus',
        customBaseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        customHeaders: [],
      },
    });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        output: {
          choices: [{ message: { content: '搜索摘要[ref_1]' } }],
          search_info: {
            search_results: [{ title: '来源', url: 'https://example.com/source' }],
          },
        },
      }),
    });
    vi.stubGlobal('fetch', fetchMock);
    const node = createWorkflowNode('webSearch', { x: 0, y: 0 });
    Object.assign(node.data, { query: '最近动态', searchFreshnessDays: 7 });
    const { context, logs } = makeContext(node);

    const result = await webSearchHandler.run(context);

    expect(result.outputs.text).toContain('https://example.com/source');
    expect(result.outputs.results).toHaveLength(1);
    expect(logs).toContainEqual({
      level: 'info',
      messageKey: 'workflowMode.log.searchHits',
      messageParams: { count: 1 },
    });
  });

  it('returns wikipedia hits and logs the count', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        pages: [
          { title: '深圳', key: '深圳', excerpt: '<span>深圳</span>是一座城市', description: null },
        ],
      }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const node = createWorkflowNode('webSearch', { x: 0, y: 0 });
    (node.data as { query?: string }).query = '深圳';
    const { context, logs } = makeContext(node);

    const result = await webSearchHandler.run(context);
    expect(fetchMock.mock.calls[0][0]).toContain('zh.wikipedia.org');
    expect(result.outputs.text).toContain('深圳是一座城市');
    expect(logs).toContainEqual({
      level: 'info',
      messageKey: 'workflowMode.log.searchHits',
      messageParams: { count: 1 },
    });
  });

  it('degrades to echoing the query when the request fails', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('network down')));

    const node = createWorkflowNode('webSearch', { x: 0, y: 0 });
    (node.data as { query?: string }).query = 'offline query';
    const { context, logs } = makeContext(node);

    const result = await webSearchHandler.run(context);
    expect(result.outputs).toEqual({ text: 'offline query', results: [] });
    expect(logs.some((log) => log.messageKey === 'workflowMode.log.searchDegraded')).toBe(true);
  });

  it('fails fast without a query or upstream text', async () => {
    const node = createWorkflowNode('webSearch', { x: 0, y: 0 });
    const { context } = makeContext(node);

    await expect(webSearchHandler.run(context)).rejects.toMatchObject({
      messageKey: 'workflowMode.log.emptyQuery',
    });
  });
});

describe('ifElseHandler', () => {
  function makeIfElseNode(
    conditions: WorkflowCondition[],
    logic: 'and' | 'or' = 'and'
  ): ReturnType<typeof createWorkflowNode> {
    const node = createWorkflowNode('ifElse', { x: 0, y: 0 });
    const data = node.data as unknown as WorkflowNodeData;
    data.conditions = conditions;
    data.conditionLogic = logic;
    return node;
  }

  it('routes to the true branch when a contains condition matches', async () => {
    const upstream = createWorkflowNode('knowledgeRetrieval', { x: 0, y: 0 });
    const node = makeIfElseNode([
      { id: 'c1', variable: '', operator: 'contains', value: '产品' },
    ]);
    const pool = new VariablePool({ [upstream.id]: { text: 'Weft 产品说明文档' } });
    const { context, logs } = makeContext(node, { pool, incomers: [upstream] });

    const result = await ifElseHandler.run(context);

    expect(result.branch).toBe('true');
    expect(result.outputs.result).toBe(true);
    expect(result.outputs.text).toBe('Weft 产品说明文档');
    expect(logs).toContainEqual({
      level: 'info',
      messageKey: 'workflowMode.log.ifElseResult',
      messageParams: { result: 'true' },
    });
  });

  it('combines conditions with OR and explicit variable selectors', async () => {
    const upstream = createWorkflowNode('textInput', { x: 0, y: 0 });
    const node = makeIfElseNode(
      [
        { id: 'c1', variable: `${upstream.id}.text`, operator: 'equals', value: 'nope' },
        { id: 'c2', variable: `${upstream.id}.text`, operator: 'regex', value: '^he' },
      ],
      'or'
    );
    const pool = new VariablePool({ [upstream.id]: { text: 'hello' } });
    const { context } = makeContext(node, { pool, incomers: [upstream] });

    const result = await ifElseHandler.run(context);
    expect(result.branch).toBe('true');
  });

  it('routes to the false branch when conditions fail', async () => {
    const upstream = createWorkflowNode('textInput', { x: 0, y: 0 });
    const node = makeIfElseNode([
      { id: 'c1', variable: '', operator: 'notContains', value: 'hello' },
    ]);
    const pool = new VariablePool({ [upstream.id]: { text: 'hello world' } });
    const { context } = makeContext(node, { pool, incomers: [upstream] });

    const result = await ifElseHandler.run(context);
    expect(result.branch).toBe('false');
    expect(result.outputs.result).toBe(false);
  });

  it('treats isNotEmpty as true for non-blank retrieved text', async () => {
    const upstream = createWorkflowNode('knowledgeRetrieval', { x: 0, y: 0 });
    const node = makeIfElseNode([
      { id: 'c1', variable: `${upstream.id}.text`, operator: 'isNotEmpty', value: '' },
    ]);
    const pool = new VariablePool({ [upstream.id]: { text: 'chunk A' } });
    const { context } = makeContext(node, { pool, incomers: [upstream] });

    const result = await ifElseHandler.run(context);
    expect(result.branch).toBe('true');
  });

  it('treats isNotEmpty as false for blank text', async () => {
    const upstream = createWorkflowNode('knowledgeRetrieval', { x: 0, y: 0 });
    const node = makeIfElseNode([
      { id: 'c1', variable: `${upstream.id}.text`, operator: 'isNotEmpty', value: '' },
    ]);
    const pool = new VariablePool({ [upstream.id]: { text: '   ' } });
    const { context } = makeContext(node, { pool, incomers: [upstream] });

    const result = await ifElseHandler.run(context);
    expect(result.branch).toBe('false');
  });

  it('defaults to the true branch with a warning when no conditions exist', async () => {
    const node = makeIfElseNode([]);
    const { context, logs } = makeContext(node);

    const result = await ifElseHandler.run(context);
    expect(result.branch).toBe('true');
    expect(logs.some((log) => log.messageKey === 'workflowMode.log.ifElseNoConditions')).toBe(true);
  });

  it('fails the node on an invalid regex', async () => {
    const upstream = createWorkflowNode('textInput', { x: 0, y: 0 });
    const node = makeIfElseNode([{ id: 'c1', variable: '', operator: 'regex', value: '(' }]);
    const pool = new VariablePool({ [upstream.id]: { text: 'anything' } });
    const { context } = makeContext(node, { pool, incomers: [upstream] });

    await expect(ifElseHandler.run(context)).rejects.toThrow();
  });
});

describe('code handler helpers', () => {
  it('builds inputs from direct incomers plus the text convenience key', () => {
    const upstream = createWorkflowNode('textInput', { x: 0, y: 0 });
    const pool = new VariablePool({ [upstream.id]: { text: 'payload' } });

    const inputs = buildCodeInputs(pool, [upstream]);

    expect(inputs[upstream.id]).toEqual({ text: 'payload' });
    expect(inputs.text).toBe('payload');
  });

  it('normalizes code results into text plus raw value', () => {
    expect(normalizeCodeResult('plain')).toEqual({ text: 'plain', value: 'plain' });
    expect(normalizeCodeResult({ a: 1 })).toEqual({ text: '{"a":1}', value: { a: 1 } });
    expect(normalizeCodeResult(undefined)).toEqual({ text: '', value: null });
  });
});
