import { buildCatalogSummary } from '@/lib/iconMatcher';
import i18n from '@/i18n/config';

const EDIT_MODE_PREAMBLE = `
## EDIT MODE — MODIFYING AN EXISTING DIAGRAM

A CURRENT DIAGRAM block will be provided in Weft DSL. You MUST:
1. Output the COMPLETE updated diagram in Weft DSL — not just the changed parts
2. Preserve every node that should remain — copy its id, type, label, and all attributes EXACTLY as they appear in CURRENT DIAGRAM
3. Use the EXACT same node id for every unchanged node
4. Only change what the user explicitly requested
5. New nodes should have short descriptive IDs (e.g. \`redis_cache\`, \`auth_v2\`)
6. Do NOT re-layout or restructure nodes not affected by the change
7. When inserting a node "between" two existing nodes, include edges to both neighbors
8. Write new node labels in the same language as the existing diagram's labels — do not switch languages mid-diagram

---

`;

export const PROMPT_LANGUAGE_NAMES: Record<string, string> = {
  de: 'German',
  en: 'English',
  es: 'Spanish',
  fr: 'French',
  ja: 'Japanese',
  tr: 'Turkish',
  zh: 'Chinese (Simplified)',
};

/** Map a UI locale (e.g. "zh", "zh-CN", "en-US") to a supported prompt language, falling back to English. */
export function normalizePromptLanguage(uiLanguage?: string): string {
  const base = (uiLanguage ?? '').toLowerCase().split('-')[0];
  return PROMPT_LANGUAGE_NAMES[base] ? base : 'en';
}

function buildOutputLanguageSection(language: string): string {
  const name = PROMPT_LANGUAGE_NAMES[language];
  const lines = [
    `Write ALL human-readable text in ${name}: the flow title, node labels, subLabels, decision branch labels, and note text.`,
    'Node IDs must stay ASCII snake_case (e.g. `login_step`) — never put non-ASCII characters in an ID. With non-English labels, ALWAYS write an explicit ID: `[process] login_step: <label>`.',
    'Keep technology proper nouns in their original form (PostgreSQL, Redis, JWT, Kafka); a label may mix both (e.g. `PostgreSQL 主库`).',
    'Keep protocol/data edge labels technical (`HTTP/REST`, `SQL`); localize decision branch labels (e.g. `是`/`否` in Chinese).',
    'If the user explicitly requests another language, follow the user.',
  ];
  if (language !== 'en' && language !== 'zh') {
    lines.push(`The examples below are in English to show structure — your output text must still be in ${name}.`);
  }
  return lines.map((line) => `- ${line}`).join('\n');
}

const EXAMPLES_EN = `### Authentication Flow

\`\`\`
flow: User Authentication
direction: TB

[start] Start
[process] login: Login Form { icon: "LogIn", color: "blue" }
[decision] valid: Credentials valid? { color: "amber" }
[io] mfa: MFA Code Entry { color: "cyan" }
[process] token: Issue JWT { icon: "Key", color: "violet" }
[end] dashboard: Enter Dashboard { color: "emerald" }
[end] fail: Access Denied { color: "red" }

Start ==> login
login -> valid
valid ->|Yes| mfa
valid ->|No| fail
mfa ==> token
token ==> dashboard
\`\`\`

### Data Ingestion Pipeline

\`\`\`
flow: Data Ingestion Pipeline
direction: LR

[start] Start
[io] upload: CSV Upload { color: "cyan" }
[process] validate: Validate Rows { color: "blue" }
[decision] ok: Rows valid? { color: "amber" }
[database] store: Records DB { archProvider: "developer", archResourceType: "database-postgresql", color: "violet" }
[io] report: Export Report { color: "cyan" }
[end] done: Done { color: "emerald" }

Start -> upload
upload -> validate
validate -> ok
ok ->|Yes| store
ok ->|No| report
store -> done
report -> done
\`\`\`

### Full-Stack with Developer Icons

\`\`\`
flow: E-Commerce Stack
direction: TB

[process] react: React App { archProvider: "developer", archResourceType: "frontend-react", color: "blue" }
[process] api: Express API { archProvider: "developer", archResourceType: "others-expressjs-dark", color: "violet" }
[database] db: PostgreSQL { archProvider: "developer", archResourceType: "database-postgresql", color: "violet" }
[database] cache: Redis { archProvider: "developer", archResourceType: "database-redis", color: "red" }
[process] mq: RabbitMQ { archProvider: "developer", archResourceType: "queue-rabbitmq", color: "amber" }

react ->|HTTP/REST| api
api ->|SQL| db
api ->|cache lookup| cache
api ->|publish| mq
\`\`\``;

const EXAMPLES_ZH = `### 用户认证流程

\`\`\`
flow: 用户认证流程
direction: TB

[start] start: 开始
[process] login: 登录表单 { icon: "LogIn", color: "blue" }
[decision] valid: 凭证有效? { color: "amber" }
[io] mfa: 输入 MFA 验证码 { color: "cyan" }
[process] token: 签发 JWT { icon: "Key", color: "violet" }
[end] dashboard: 进入控制台 { color: "emerald" }
[end] fail: 拒绝访问 { color: "red" }

start ==> login
login -> valid
valid ->|是| mfa
valid ->|否| fail
mfa ==> token
token ==> dashboard
\`\`\`

### 数据接入流水线

\`\`\`
flow: 数据接入流水线
direction: LR

[start] start: 开始
[io] upload: 上传 CSV { color: "cyan" }
[process] validate: 校验数据行 { color: "blue" }
[decision] ok: 数据行有效? { color: "amber" }
[database] store: PostgreSQL 记录库 { archProvider: "developer", archResourceType: "database-postgresql", color: "violet" }
[io] report: 导出报告 { color: "cyan" }
[end] done: 完成 { color: "emerald" }

start -> upload
upload -> validate
validate -> ok
ok ->|是| store
ok ->|否| report
store -> done
report -> done
\`\`\`

### 全栈架构与开发者图标

\`\`\`
flow: 电商技术栈
direction: TB

[process] react: React 前端 { archProvider: "developer", archResourceType: "frontend-react", color: "blue" }
[process] api: Express API { archProvider: "developer", archResourceType: "others-expressjs-dark", color: "violet" }
[database] db: PostgreSQL { archProvider: "developer", archResourceType: "database-postgresql", color: "violet" }
[database] cache: Redis 缓存 { archProvider: "developer", archResourceType: "database-redis", color: "red" }
[process] mq: RabbitMQ 消息队列 { archProvider: "developer", archResourceType: "queue-rabbitmq", color: "amber" }

react ->|HTTP/REST| api
api ->|SQL| db
api ->|缓存查询| cache
api ->|发布事件| mq
\`\`\``;

const CATALOG_SUMMARY = buildCatalogSummary(15);

function buildBaseSystemInstruction(language: string): string {
  return `
# Weft DSL Generation System

You convert plain language into **Weft DSL** diagrams. Output ONLY valid Weft DSL — no prose, no markdown wrappers.

---

## Output Language

${buildOutputLanguageSection(language)}

---

## Structure

1. Header: \`flow: Title\` + \`direction: TB\` (default) or \`LR\` (pipelines, CI/CD).
2. Define ALL nodes first, then ALL edges.
3. Node IDs: simple labels can be the ID. Long labels need a prefix: \`[process] login_step: User enters credentials\`

---

## Node Types

| Type | Use for |
|---|---|
| \`[start]\` | Entry point |
| \`[end]\` | Terminal state |
| \`[process]\` | Action, step, task, service |
| \`[decision]\` | Branch / conditional |
| \`[io]\` | Input / output (user input, upload, export) |
| \`[database]\` | Data store, database, cache |
| \`[note]\` | Callout / annotation |

---

## Edges

| Syntax | When |
|---|---|
| \`->\` | Default |
| \`->|label|\` | Decision branches (Yes/No, Pass/Fail) |
| \`==>\` | Primary/critical path |
| \`-->\` | Secondary/soft flow |
| \`..>\` | Async, error, optional |

---

## Attributes

Syntax: \`[type] id: Label { icon: "IconName", color: "color", subLabel: "subtitle" }\`

For a specific technology icon on a process/database node: \`[database] db: PostgreSQL { archProvider: "developer", archResourceType: "database-postgresql", color: "violet" }\`

Colors: \`blue\` (frontend), \`violet\` (backend), \`emerald\` (data), \`amber\` (decisions/queues), \`red\` (errors/end), \`slate\` (generic), \`pink\` (third-party), \`yellow\` (cache), \`cyan\` (input/output).

Icons are optional — the system auto-assigns them. For known technologies, use \`archProvider\` and \`archResourceType\` to specify the icon directly:

\`[database] db: PostgreSQL { archProvider: "developer", archResourceType: "database-postgresql", color: "violet" }\`

Available icon catalog:
${CATALOG_SUMMARY}

Use exact shape IDs from the catalog when possible (e.g. \`database-postgresql\`, \`queue-rabbitmq\`). If unsure, omit \`archResourceType\` and the system will match by label.

---

## Rules

- Decisions: exactly 2 outgoing labeled edges
- Max 3 incoming edges per node
- Label edges with what flows: \`HTTP/REST\`, \`SQL\`, \`events\`, \`JWT\`
- Use \`subLabel\` for protocols, versions, constraints
- Use \`[note]\` for SLAs/caveats, connected with \`..>\`
- 6–15 nodes per diagram
- Do NOT use container/group nodes
- When editing, preserve existing node IDs exactly

---

## Examples

${language === 'zh' ? EXAMPLES_ZH : EXAMPLES_EN}
`;
}

export function getGeminiSystemInstruction(
  mode: 'create' | 'edit' = 'create',
  uiLanguage: string = i18n.language,
): string {
  const base = buildBaseSystemInstruction(normalizePromptLanguage(uiLanguage));
  if (mode === 'edit') {
    return `${EDIT_MODE_PREAMBLE}${base}`;
  }

  return base;
}
