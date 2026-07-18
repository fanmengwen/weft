import type { TemplateManifest } from './types';
import {
  createWorkflowTemplate,
  createWorkflowTemplateEdge,
  createWorkflowTemplateNode,
} from './workflowTemplateFactories';

/**
 * Four Chinese workflow starters matching the product design templates.
 *
 * Layout notes:
 * - Prefer left→right flow (side handles), with true/false forks on ifElse.
 * - Card width is WORKFLOW_TEMPLATE_NODE_WIDTH; keep gutters ≥ MIN_GAP.
 * - Variable selectors use engine keys (`*.text`), not design mock `*.output`.
 */
export const STARTER_WORKFLOW_TEMPLATE_MANIFESTS: TemplateManifest[] = [
  // 1 · 联网热点简报 — linear 4-node chain, zero-config demo
  createWorkflowTemplate(
    'online-hot-brief',
    '联网热点简报',
    '输入一个主题，自动联网搜索并生成一份带来源的要点简报。示例已预填，打开即可直接运行，10 秒看到第一份结果。',
    ['简报', '搜索', 'LLM', '零配置'],
    [
      createWorkflowTemplateNode('hot-input', 'textInput', '简报主题', 40, 80, {
        text: '最近一周的 AI 编程工具动态',
      }),
      createWorkflowTemplateNode('hot-search', 'webSearch', '联网搜索', 340, 80, {
        query: '{{hot-input.text}}',
      }),
      createWorkflowTemplateNode('hot-llm', 'llm', '生成简报', 640, 80, {
        systemPrompt:
          '你是一名专业的资讯编辑，擅长把零散的搜索结果整理成结构清晰的简报。只依据给定的搜索结果撰写，不要编造信息。',
        prompt: [
          '主题：{{hot-input.text}}',
          '',
          '以下是联网搜索结果：',
          '{{hot-search.text}}',
          '',
          '请生成一份 Markdown 格式的简报，要求：',
          '1. 开头用 2-3 句话概括整体趋势',
          '2. 正文按子话题分组，每组给出要点（每条要点末尾附来源链接）',
          '3. 过滤掉与主题无关及纯营销性质的内容',
          '4. 结尾给出「值得关注」的 1-2 条前瞻判断',
        ].join('\n'),
      }),
      createWorkflowTemplateNode('hot-out', 'output', '简报结果', 940, 80, {
        text: '{{hot-llm.text}}',
      }),
    ],
    [
      createWorkflowTemplateEdge('hot-input', 'hot-search'),
      createWorkflowTemplateEdge('hot-search', 'hot-llm'),
      createWorkflowTemplateEdge('hot-llm', 'hot-out'),
    ],
    {
      audience: 'builders',
      useCase: '按主题联网检索并生成带来源的要点简报',
      launchPriority: 9,
      featured: true,
      difficulty: 'starter',
      outcome: '四步可跑的搜索→简报链，改主题即可复用',
      replacementHints: ['简报主题', '搜索范围', '简报结构', '语气风格'],
    }
  ),

  // 2 · 智能周报生成器 — linear 3-node polish chain
  createWorkflowTemplate(
    'weekly-report-generator',
    '智能周报生成器',
    '几句流水账，扩写成结构完整、措辞专业的周报。',
    ['周报', '写作', 'LLM', '办公'],
    [
      createWorkflowTemplateNode('wr-input', 'textInput', '本周工作要点', 40, 100, {
        text: '修完了编辑器三个渲染 bug；和后端对齐了导出接口的字段；写了模板功能的技术方案初稿；帮新同事做了两次 code review；下周准备开始开发模板功能',
      }),
      createWorkflowTemplateNode('wr-llm', 'llm', '周报润色', 340, 100, {
        systemPrompt:
          '你是一名资深职场写作助手，擅长把口语化的工作记录改写成专业、简洁、有条理的周报。保持事实不变，不夸大、不编造。',
        prompt: [
          '以下是我本周工作的流水账记录：',
          '{{wr-input.text}}',
          '',
          '请改写成一份 Markdown 格式的周报，结构如下：',
          '## 本周完成',
          '（按重要性排序，合并同类项，每条一行，动词开头）',
          '## 进行中 / 风险',
          '（如流水账中没有相关内容，写「无」）',
          '## 下周计划',
          '（从记录中提取，如没有则根据本周工作合理推断 1-2 条）',
          '',
          '语气专业但不堆砌套话，总长度控制在 200 字以内。',
        ].join('\n'),
      }),
      createWorkflowTemplateNode('wr-out', 'output', '周报成稿', 640, 100, {
        text: '{{wr-llm.text}}',
      }),
    ],
    [
      createWorkflowTemplateEdge('wr-input', 'wr-llm'),
      createWorkflowTemplateEdge('wr-llm', 'wr-out'),
    ],
    {
      audience: 'builders',
      useCase: '把口语化工作记录扩写成结构化周报',
      launchPriority: 8,
      featured: true,
      difficulty: 'starter',
      outcome: '三步零配置润色链，预填示例可直接运行',
      replacementHints: ['本周工作要点', '周报结构', '润色语气', '篇幅限制'],
    }
  ),

  // 3 · 文档问答助手 — retrieve → branch on empty → answer or fixed empty message
  createWorkflowTemplate(
    'docs-qa-assistant',
    '文档问答助手',
    '仅依据你上传的文档作答，查不到明确说没有。',
    ['RAG', '知识库', '问答', '分支'],
    [
      createWorkflowTemplateNode('doc-input', 'textInput', '你的问题', 40, 160, {
        text: '这份文档的核心结论是什么？',
      }),
      createWorkflowTemplateNode('doc-kb', 'knowledgeRetrieval', '检索资料', 340, 160, {
        query: '{{doc-input.text}}',
        knowledgeTopK: 5,
      }),
      createWorkflowTemplateNode('doc-cond', 'ifElse', '是否检索到内容', 640, 100, {
        conditionLogic: 'and',
        conditions: [
          {
            id: 'doc-cond-1',
            variable: 'doc-kb.text',
            operator: 'isNotEmpty',
            value: '',
          },
        ],
      }),
      createWorkflowTemplateNode('doc-llm', 'llm', '依据资料作答', 960, 20, {
        systemPrompt:
          '你是一个严谨的文档问答助手。你只能依据用户提供的资料片段回答问题：资料里有的，准确回答并保持原意；资料里没有的，明确说明「资料中未提及」，绝对不允许编造。',
        prompt: [
          '参考资料（来自知识库检索）：',
          '{{doc-kb.text}}',
          '',
          '问题：{{doc-input.text}}',
          '',
          '请依据参考资料回答。要求：',
          '1. 先直接给出答案，再简要说明依据',
          '2. 如果资料只覆盖了问题的一部分，明确指出哪部分资料中未提及',
          '3. 回答末尾标注引用了哪几条资料片段',
        ].join('\n'),
      }),
      createWorkflowTemplateNode('doc-out-ok', 'output', '回答', 1260, 20, {
        text: '{{doc-llm.text}}',
      }),
      createWorkflowTemplateNode('doc-out-empty', 'output', '未找到资料', 960, 320, {
        text: '知识库中没有找到与该问题相关的资料。请换个问法，或先在知识库中上传相关文档。',
      }),
    ],
    [
      createWorkflowTemplateEdge('doc-input', 'doc-kb'),
      createWorkflowTemplateEdge('doc-kb', 'doc-cond'),
      createWorkflowTemplateEdge('doc-cond', 'doc-llm', {
        label: 'true',
        sourceHandle: 'true',
      }),
      createWorkflowTemplateEdge('doc-cond', 'doc-out-empty', {
        label: 'false',
        sourceHandle: 'false',
      }),
      createWorkflowTemplateEdge('doc-llm', 'doc-out-ok'),
    ],
    {
      audience: 'builders',
      useCase: '基于上传文档作答，检索为空时走兜底文案',
      launchPriority: 7,
      featured: true,
      difficulty: 'intermediate',
      outcome: '含真假分支的文档问答链，绑定知识库后即可试问',
      replacementHints: ['问题样例', '知识库文档', '作答提示词', '空结果文案'],
    }
  ),

  // 4 · 竞品动态监控报告 — search → clean → analyze → branch → report
  createWorkflowTemplate(
    'competitor-monitor-report',
    '竞品动态监控报告',
    '搜索、清洗、分析动态；无实质更新时明确告知。',
    ['竞品', '搜索', '代码', '报告'],
    [
      createWorkflowTemplateNode('mon-input', 'textInput', '监控对象', 40, 160, {
        text: 'Dify、Coze、n8n',
      }),
      createWorkflowTemplateNode('mon-search', 'webSearch', '搜索最新动态', 340, 160, {
        query: '{{mon-input.text}} 最新版本 更新 发布',
      }),
      createWorkflowTemplateNode('mon-code', 'code', '清洗搜索结果', 640, 160, {
        code: [
          '// input: Web search node outputs (results array)',
          '// Deduplicate by URL → sort by date desc → take top 10',
          'const list = Array.isArray(inputs.input)',
          '  ? inputs.input',
          '  : Array.isArray(inputs.input?.results)',
          '    ? inputs.input.results',
          '    : [];',
          'const seen = new Set();',
          'const deduped = list.filter((item) => {',
          '  const key = item.url || item.link || item.title;',
          '  if (!key || seen.has(key)) return false;',
          '  seen.add(key);',
          '  return true;',
          '});',
          'deduped.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));',
          'return deduped',
          '  .slice(0, 10)',
          '  .map((item, i) => (i + 1) + ". " + item.title + "\\n来源: " + (item.url || item.link || ""))',
          '  .join("\\n\\n");',
        ].join('\n'),
      }),
      createWorkflowTemplateNode('mon-analyze', 'llm', '动态分析', 940, 160, {
        systemPrompt:
          '你是一名竞品分析师。你的任务是从搜索结果中甄别「实质性动态」（版本发布、新功能、融资、重大合作、价格调整）并剔除噪音（教程、测评、营销软文、旧闻）。',
        prompt: [
          '监控对象：{{mon-input.text}}',
          '',
          '清洗后的搜索结果：',
          '{{mon-code.text}}',
          '',
          '请完成两件事：',
          '1. 你的回答第一行必须且只能是 HAS_UPDATE 或 NO_UPDATE：存在至少一条实质性动态输出 HAS_UPDATE，否则输出 NO_UPDATE',
          '2. 若为 HAS_UPDATE，从第二行开始按监控对象分组列出实质性动态，每条附带来源链接',
        ].join('\n'),
      }),
      createWorkflowTemplateNode('mon-cond', 'ifElse', '有无实质更新', 1240, 90, {
        conditionLogic: 'and',
        conditions: [
          {
            id: 'mon-cond-1',
            variable: 'mon-analyze.text',
            operator: 'contains',
            value: 'HAS_UPDATE',
          },
        ],
      }),
      createWorkflowTemplateNode('mon-report', 'llm', '生成报告', 1560, 20, {
        systemPrompt:
          '你是一名报告撰写专家，擅长把分析结论写成简洁、可直接转发给团队的监控报告。',
        prompt: [
          '以下是今天的竞品动态分析结论：',
          '{{mon-analyze.text}}',
          '',
          '请忽略第一行的 HAS_UPDATE 标记，将其余内容整理成 Markdown 报告，结构：',
          '# 竞品动态监控报告',
          '## 一句话总览',
          '## 分对象详情',
          '（每个对象一个小节：动态要点 + 影响判断 + 来源链接）',
          '## 建议关注',
          '（对我方产品可能有借鉴或威胁的 1-2 点）',
        ].join('\n'),
      }),
      createWorkflowTemplateNode('mon-out-report', 'output', '监控报告', 1860, 20, {
        text: '{{mon-report.text}}',
      }),
      createWorkflowTemplateNode('mon-out-none', 'output', '无重要动态', 1560, 320, {
        text: '今日监控完成：所监控对象近期无重要动态。',
      }),
    ],
    [
      createWorkflowTemplateEdge('mon-input', 'mon-search'),
      createWorkflowTemplateEdge('mon-search', 'mon-code'),
      createWorkflowTemplateEdge('mon-code', 'mon-analyze'),
      createWorkflowTemplateEdge('mon-analyze', 'mon-cond'),
      createWorkflowTemplateEdge('mon-cond', 'mon-report', {
        label: 'true',
        sourceHandle: 'true',
      }),
      createWorkflowTemplateEdge('mon-cond', 'mon-out-none', {
        label: 'false',
        sourceHandle: 'false',
      }),
      createWorkflowTemplateEdge('mon-report', 'mon-out-report'),
    ],
    {
      audience: 'builders',
      useCase: '搜索并清洗竞品动态，有实质更新时生成报告',
      launchPriority: 6,
      featured: true,
      difficulty: 'advanced',
      outcome: '搜索→清洗→分析→分支报告全链路，监控对象已预填',
      replacementHints: ['监控对象', '搜索词', '清洗规则', '报告结构'],
    }
  ),
];
