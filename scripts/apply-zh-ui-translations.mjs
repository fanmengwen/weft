/**
 * One-shot script: apply zh UI translations + new i18n keys (en/zh).
 * Run: node scripts/apply-zh-ui-translations.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const EN_FILE = path.join(ROOT, 'src/i18n/locales/en/translation.json');
const ZH_FILE = path.join(ROOT, 'src/i18n/locales/zh/translation.json');

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, ''));
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function setPath(obj, dotted, value) {
  const parts = dotted.split('.');
  let cursor = obj;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const key = parts[i];
    if (!cursor[key] || typeof cursor[key] !== 'object' || Array.isArray(cursor[key])) {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[parts[parts.length - 1]] = value;
}

/** New keys added to both en and zh */
const NEW_KEYS = {
  'mcpSettings.toolGroups.author': 'Author',
  'mcpSettings.toolGroups.inspect': 'Inspect',
  'mcpSettings.toolGroups.discover': 'Discover',
  'mcpSettings.toolGroups.validateDsl': 'Lint and validate agent-authored DSL',
  'mcpSettings.toolGroups.createViewerUrl': 'Turn DSL into a shareable Weft link',
  'mcpSettings.toolGroups.analyzeCodebase': 'Summarize codebase structure for diagramming',
  'mcpSettings.toolGroups.findIcon': 'Find exact cloud and developer icon slugs',
  'mcpSettings.toolGroups.listStarterTemplates': 'List available diagram templates',
  'mcpSettings.toolGroups.getStarterTemplate': 'Fetch a specific template by name',
  'mcpSettings.toolGroups.listDiagramNodeTypes': 'List supported node types and shapes',
  'mcpSettings.toolGroups.serverInfo': 'Server version and capability info',
  'mcpSettings.toolCount': '{{count}} tool',
  'mcpSettings.toolCount_plural': '{{count}} tools',
  'settingsModal.ai.risk.custom.label': 'Custom setup',
  'settingsModal.ai.risk.custom.title': 'You control the gateway behavior',
  'settingsModal.ai.risk.custom.detail':
    'Use the exact model ID and base URL exposed by your endpoint. Local tools often work without an API key, but hosted gateways may still require one.',
  'settingsModal.ai.risk.browserFriendly.label': 'Browser-friendly',
  'settingsModal.ai.risk.browserFriendly.title': 'Usually works well from a local browser session',
  'settingsModal.ai.risk.browserFriendly.detail':
    'Good default for a local-first app. You still need a valid key and should expect the model to work best on targeted changes, not magic rewrites.',
  'settingsModal.ai.risk.proxyLikely.label': 'Proxy likely',
  'settingsModal.ai.risk.proxyLikely.title': 'Often needs a server-side proxy',
  'settingsModal.ai.risk.proxyLikely.detail':
    'Browser-originated requests are commonly blocked or rate-limited. Plan to route this provider through your own backend if requests fail immediately.',
  'settingsModal.ai.risk.setupVaries.label': 'Setup varies',
  'settingsModal.ai.risk.setupVaries.title': 'May require a proxy or account-specific setup',
  'settingsModal.ai.risk.setupVaries.detail':
    'Some accounts work directly in the browser, while others need a proxy, allowlist, or custom gateway.',
  'settingsModal.ai.temperature.label': 'Generation temperature',
  'settingsModal.ai.temperature.hint':
    'Lower = more precise and consistent. Higher = more creative and varied. Default: 0.2',
  'settingsModal.ai.keyStorage.label': 'Key storage',
  'settingsModal.ai.keyStorage.persistent': 'Persistent',
  'settingsModal.ai.keyStorage.persistentDesc':
    'Keep this key on this browser until you clear it manually.',
  'settingsModal.ai.keyStorage.session': 'Session only',
  'settingsModal.ai.keyStorage.sessionDesc':
    'Forget this key when the browser session closes. Better for shared or temporary machines.',
  'settingsModal.ai.keyStorage.sessionNote':
    'Session-only mode stores AI settings in session storage and clears them when the browser session ends.',
  'settingsModal.ai.keyStorage.persistentNote':
    'Persistent mode stores AI settings in local browser storage until you remove them or clear site data.',
  'settingsModal.ai.keyStorage.forgetHint':
    'Clear the saved API key from this browser without resetting the selected provider or model.',
  'settingsModal.ai.keyStorage.forgetKey': 'Forget key',
  'settingsModal.ai.keyStorage.goToConsole': 'Go to {{console}}',
  'settingsModal.ai.keyStorage.byokBadge': 'BYOK',
  'settingsModal.ai.customModelPlaceholder': 'e.g. llama3-70b-8192 or gpt-4o',
  'settingsModal.ai.customBaseUrlPlaceholder': 'https://localhost:11434/v1',
  'settingsModal.ai.customBaseUrlHelper': 'Use a full http:// or https:// base URL.',
  'settingsModal.ai.privacySessionFooter':
    'AI settings stay only for this browser session. Close the browser to clear them, or clear the key manually if you are handing the machine to someone else.',
  'settingsModal.ai.privacyPersistentFooter':
    'AI settings stay on this browser and device until you remove them. Treat shared browsers as untrusted and clear or rotate keys when needed.',
  'settingsModal.ai.selectProviderAria': 'Select {{name}} as AI provider',
  'settingsModal.canvas.safetyProfileLabel': 'Safety Profile (100 / 300 / 500)',
  'settingsModal.canvas.safetyProfilePerformance': 'Performance',
  'settingsModal.canvas.safetyProfileBalanced': 'Balanced',
  'settingsModal.canvas.safetyProfileQuality': 'Quality',
  'settingsModal.canvas.safetyProfileHint':
    'Performance starts safety at 100 nodes, Balanced at 300, Quality at 500.',
  'studioPlayback.defaultStepDuration': 'Default step duration',
  'studioPlayback.defaultStepDurationHint': 'Used for new presets and fallback timing',
  'studioPlayback.noTimeline': 'No playback timeline yet',
  'studioPlayback.noTimelineHint':
    'Generate a preset to create scenes and stable step order from the current graph.',
  'shareEmbed.title': 'Share and embed diagram',
  'shareEmbed.description': 'Viewer links are read-only and encode the diagram directly in the URL.',
  'shareEmbed.closeAria': 'Close share dialog',
  'shareEmbed.viewerLink': 'Viewer link',
  'shareEmbed.markdownLink': 'Markdown link',
  'shareEmbed.readmeLink': 'README link',
  'shareEmbed.embedIframe': 'Embed iframe',
  'shareEmbed.openCardViewer': 'Open card viewer',
  'shareEmbed.footer':
    'GitHub README usage should prefer the Markdown link. Blog posts and docs can use the iframe snippet with `size=card` or `size=badge`.',
  'shareEmbed.copy': 'Copy',
  'shareEmbed.copied': 'Copied',
  'lintRules.title': 'Architecture Linting',
  'lintRules.subtitle': 'Enforce architecture constraints in real time — like ESLint for diagrams.',
  'lintRules.ruleFileError': 'Rule file error',
  'lintRules.allPass': 'All rules pass',
  'lintRules.nodesChecked': '{{count}} node checked, no violations found.',
  'lintRules.nodesChecked_plural': '{{count}} nodes checked, no violations found.',
  'lintRules.violationCount': '{{count}} violation',
  'lintRules.violationCount_plural': '{{count}} violations',
  'lintRules.export': 'Export',
  'lintRules.diagramRules': 'Diagram rules',
  'lintRules.workspaceRules': 'Workspace rules',
  'lintRules.noDiagramRules': 'No diagram-level rules yet.',
  'lintRules.workspaceRulesEmpty':
    'Workspace rules apply to all diagrams. Good for org-wide standards.',
  'lintRules.noRulesTitle': 'No rules defined yet',
  'lintRules.noRulesHint': 'Add rules to automatically detect architecture violations as you draw.',
  'lintRules.browseTemplates': 'Browse templates',
  'flowEditor.viewShortcuts': 'View keyboard shortcuts',
  'properties.addProviderIcon': 'Add provider icon',
  'properties.uploadImage': 'Click to Upload Image',
  'properties.uploadedIcon': 'Uploaded icon',
};

const NEW_KEYS_ZH = {
  'mcpSettings.toolGroups.author': '创作',
  'mcpSettings.toolGroups.inspect': '检查',
  'mcpSettings.toolGroups.discover': '发现',
  'mcpSettings.toolGroups.validateDsl': '校验并验证代理编写的 DSL',
  'mcpSettings.toolGroups.createViewerUrl': '将 DSL 转为可分享的 Weft 链接',
  'mcpSettings.toolGroups.analyzeCodebase': '汇总代码库结构以辅助绘图',
  'mcpSettings.toolGroups.findIcon': '查找精确的云服务与开发者图标标识',
  'mcpSettings.toolGroups.listStarterTemplates': '列出可用的图表模板',
  'mcpSettings.toolGroups.getStarterTemplate': '按名称获取指定模板',
  'mcpSettings.toolGroups.listDiagramNodeTypes': '列出支持的节点类型与形状',
  'mcpSettings.toolGroups.serverInfo': '服务器版本与能力信息',
  'mcpSettings.toolCount': '{{count}} 个工具',
  'mcpSettings.toolCount_plural': '{{count}} 个工具',
  'settingsModal.ai.risk.custom.label': '自定义配置',
  'settingsModal.ai.risk.custom.title': '由您控制网关行为',
  'settingsModal.ai.risk.custom.detail':
    '请使用端点暴露的准确模型 ID 与 base URL。本地工具通常无需 API key，但托管网关可能仍需要。',
  'settingsModal.ai.risk.browserFriendly.label': '浏览器友好',
  'settingsModal.ai.risk.browserFriendly.title': '通常在本地浏览器会话中运行良好',
  'settingsModal.ai.risk.browserFriendly.detail':
    '本地优先应用的理想默认选项。您仍需要有效 key，且模型更适合针对性修改，而非一键重写。',
  'settingsModal.ai.risk.proxyLikely.label': '可能需要代理',
  'settingsModal.ai.risk.proxyLikely.title': '通常需要服务端代理',
  'settingsModal.ai.risk.proxyLikely.detail':
    '浏览器发起的请求常被拦截或限流。若请求立即失败，请通过自己的后端路由该提供商。',
  'settingsModal.ai.risk.setupVaries.label': '配置因环境而异',
  'settingsModal.ai.risk.setupVaries.title': '可能需要代理或账户专属配置',
  'settingsModal.ai.risk.setupVaries.detail':
    '部分账户可直接在浏览器使用，其他则需要代理、白名单或自定义网关。',
  'settingsModal.ai.temperature.label': '生成温度',
  'settingsModal.ai.temperature.hint': '越低越精确一致，越高越有创意与变化。默认：0.2',
  'settingsModal.ai.keyStorage.label': '密钥存储',
  'settingsModal.ai.keyStorage.persistent': '持久保存',
  'settingsModal.ai.keyStorage.persistentDesc': '将此 key 保留在本浏览器，直到您手动清除。',
  'settingsModal.ai.keyStorage.session': '仅当前会话',
  'settingsModal.ai.keyStorage.sessionDesc': '浏览器会话结束时清除 key，适合共享或临时设备。',
  'settingsModal.ai.keyStorage.sessionNote':
    '仅会话模式将 AI 设置存入 session storage，浏览器会话结束时清除。',
  'settingsModal.ai.keyStorage.persistentNote':
    '持久模式将 AI 设置存入本地浏览器存储，直到您删除或清除站点数据。',
  'settingsModal.ai.keyStorage.forgetHint': '清除本浏览器中已保存的 API key，不重置已选提供商或模型。',
  'settingsModal.ai.keyStorage.forgetKey': '清除密钥',
  'settingsModal.ai.keyStorage.goToConsole': '前往 {{console}}',
  'settingsModal.ai.keyStorage.byokBadge': 'BYOK',
  'settingsModal.ai.customModelPlaceholder': '例如 llama3-70b-8192 或 gpt-4o',
  'settingsModal.ai.customBaseUrlPlaceholder': 'https://localhost:11434/v1',
  'settingsModal.ai.customBaseUrlHelper': '请使用完整的 http:// 或 https:// base URL。',
  'settingsModal.ai.privacySessionFooter':
    'AI 设置仅保留在当前浏览器会话。关闭浏览器即可清除，或将设备交给他人前请手动清除 key。',
  'settingsModal.ai.privacyPersistentFooter':
    'AI 设置保留在本浏览器与设备，直到您删除。共享浏览器视为不可信环境，请及时清除或轮换 key。',
  'settingsModal.ai.selectProviderAria': '选择 {{name}} 作为 AI 提供商',
  'settingsModal.canvas.safetyProfileLabel': '安全档位（100 / 300 / 500）',
  'settingsModal.canvas.safetyProfilePerformance': '性能',
  'settingsModal.canvas.safetyProfileBalanced': '均衡',
  'settingsModal.canvas.safetyProfileQuality': '质量',
  'settingsModal.canvas.safetyProfileHint': '性能档在 100 个节点启用保护，均衡档 300，质量档 500。',
  'studioPlayback.defaultStepDuration': '默认步骤时长',
  'studioPlayback.defaultStepDurationHint': '用于新预设与回退时序',
  'studioPlayback.noTimeline': '尚无播放时间线',
  'studioPlayback.noTimelineHint': '生成预设以从当前图创建场景与稳定的步骤顺序。',
  'shareEmbed.title': '分享与嵌入图表',
  'shareEmbed.description': '查看器链接为只读，图表数据直接编码在 URL 中。',
  'shareEmbed.closeAria': '关闭分享对话框',
  'shareEmbed.viewerLink': '查看器链接',
  'shareEmbed.markdownLink': 'Markdown 链接',
  'shareEmbed.readmeLink': 'README 链接',
  'shareEmbed.embedIframe': '嵌入 iframe',
  'shareEmbed.openCardViewer': '打开卡片查看器',
  'shareEmbed.footer':
    'GitHub README 建议优先使用 Markdown 链接。博客与文档可使用带 `size=card` 或 `size=badge` 的 iframe 片段。',
  'shareEmbed.copy': '复制',
  'shareEmbed.copied': '已复制',
  'lintRules.title': '架构 Lint',
  'lintRules.subtitle': '实时强制执行架构约束——图表版的 ESLint。',
  'lintRules.ruleFileError': '规则文件错误',
  'lintRules.allPass': '全部规则通过',
  'lintRules.nodesChecked': '已检查 {{count}} 个节点，未发现违规。',
  'lintRules.nodesChecked_plural': '已检查 {{count}} 个节点，未发现违规。',
  'lintRules.violationCount': '{{count}} 项违规',
  'lintRules.violationCount_plural': '{{count}} 项违规',
  'lintRules.export': '导出',
  'lintRules.diagramRules': '图表规则',
  'lintRules.workspaceRules': '工作区规则',
  'lintRules.noDiagramRules': '尚无图表级规则。',
  'lintRules.workspaceRulesEmpty': '工作区规则适用于所有图表，适合组织级标准。',
  'lintRules.noRulesTitle': '尚未定义规则',
  'lintRules.noRulesHint': '添加规则以在绘图时自动检测架构违规。',
  'lintRules.browseTemplates': '浏览模板',
  'flowEditor.viewShortcuts': '查看键盘快捷键',
  'properties.addProviderIcon': '添加提供商图标',
  'properties.uploadImage': '点击上传图片',
  'properties.uploadedIcon': '已上传图标',
};

/** Patch existing zh keys that still match en */
const ZH_PATCH = {
  'common.clearSelection': '清除选择',
  'common.copyStyle': '复制样式',
  'common.pasteStyle': '粘贴样式',
  'common.mindmapAddChild': '思维导图：添加子主题',
  'common.mindmapAddSibling': '思维导图：添加同级主题',
  'common.quickCreateConnectedNode': '快速创建连接节点',
  'common.annotationColors': '标注颜色',
  'common.searchNodes': '搜索节点',
  'export.exportDiagram': '导出图表',
  'export.exportAs': '导出为',
  'export.jsonLabel': 'JSON 文件',
  'nodes.text': '文本',
  'nodes.image': '图片',
  'nodes.group': '分组',
  'nodes.items': '项',
  'welcome.feature1Title': '创建精美图表',
  'welcome.feature1Desc': '以可视化方式设计美观的企业级架构图。',
  'welcome.feature2Desc': '通过一条智能提示生成完整架构。',
  'welcome.feature3Title': '代码转图表',
  'welcome.feature3Desc': '从文本即时构建精美的可视化基础设施图。',
  'welcome.feature4Title': '多种格式导出',
  'welcome.feature4Desc': '导出为美观且带动画效果的演示图表。',
  'welcome.analyticsTitle': '匿名分析',
  'welcome.analyticsDesc': '我们收集诊断数据，绝不会读取您的图表或提示内容。',
  'welcome.getStarted': '开始使用',
  'share.copied': '链接已复制！',
  'share.close': '关闭',
  'share.openDialog': '分享对话框',
  'share.status.cache.syncing': ' 本地缓存同步中',
  'share.status.cache.ready': ' 本地缓存就绪',
  'share.status.cache.hydrated': ' 已从本地缓存恢复',
  'commandBar.search.showingCount': '显示：{{count}}',
  'commandBar.search.totalCount': '画布总计：{{count}}',
  'commandBar.import.parseNativeProject': '生成原生图表',
  'commandBar.import.categories.infra': '基础设施',
  'commandBar.import.categories.code': '代码',
  'settingsModal.canvas.title': '画布',
  'settingsModal.canvas.showGrid': '显示网格',
  'settingsModal.canvas.showGridDesc': '在画布上显示点状网格',
  'settingsModal.canvas.snapToGrid': '对齐网格',
  'settingsModal.canvas.snapToGridDesc': '移动节点时吸附到网格',
  'settingsModal.canvas.alignmentGuides': '对齐参考线',
  'settingsModal.canvas.alignmentGuidesDesc': '拖动节点时显示智能参考线',
  'settingsModal.canvas.routingProfile': '路由配置',
  'settingsModal.canvas.mermaidImportMode': 'Mermaid 导入模式',
  'settingsModal.canvas.mermaidImportModeRenderer': '保真优先',
  'settingsModal.canvas.mermaidImportModeEditable': '可编辑优先',
  'settingsModal.canvas.mermaidImportModeDesc': '控制 Mermaid 图表导入画布的方式。',
  'settingsModal.ai.byok.dataPrivacy': '您的数据不会经过我们的服务器',
  'settingsModal.ai.byok.control': '完全掌控成本与速率限制',
  'settingsModal.ai.byok.flexibility': '随时切换提供商，无需重新绑定',
  'settingsModal.ai.byok.cuttingEdge': '新模型发布后即可使用',
  'settingsModal.ai.customEndpoints.ollama.hint': '本地 · 免费',
  'settingsModal.ai.customEndpoints.lmStudio.hint': '本地 · 免费',
  'settingsModal.ai.customEndpoints.together.hint': '云端 · 快速',
  'settingsModal.ai.privacyTitle': '隐私与加密',
  'settingsModal.ai.models.custom.custom.label': '自定义模型',
  'settingsModal.ai.models.custom.custom.hint': '在下方输入您的模型 ID',
  'settingsModal.ai.models.custom.custom.category': '自定义',
  'settingsModal.brand.tabType': '字体',
  'settingsModal.brand.tabUI': '界面与形状',
  'settingsModal.brand.googleFontsHint': '从 Google Fonts 动态加载',
  'settingsModal.brand.cornerRadius': '圆角半径',
  'settingsModal.brand.glassmorphism': '玻璃拟态',
  'settingsModal.brand.beveledButtons': '斜面按钮',
  'settingsModal.brand.beveledButtonsHint': '为按钮添加深度与边框',
  'settingsModal.brand.showBetaBadge': '显示 Beta 徽章',
  'settingsModal.brand.showBetaBadgeHint': '在 Logo 旁显示 BETA 标签',
  'snapshotsPanel.undoTimelinePosition': '当前历史栈第 {{current}} 步，共 {{total}} 步。',
  'snapshotsPanel.undoTimelineScrubber': '浏览最近的撤销历史',
  'snapshotsPanel.undoTimeline': '撤销时间线',
  'snapshotsPanel.undoTimelineAtEarliest': '您已处于最早记录的状态。',
  'snapshotsPanel.undoTimelineAtLatest': '您已处于最新状态。',
  'connectionPanel.label': '标签',
  'mcp.pageTitle': '连接 AI 工具',
  'mcp.pageSubtitle': '为任意 MCP 客户端提供一流的绘图工具。本地优先，无需 API key。',
  'mcp.visualAlt': '您的 AI 客户端通过 stdio 连接 Weft MCP 服务器，获得本地绘图工具。',
  'mcp.visualClient': '您的 AI 客户端',
  'mcp.visualCaption': '本地 · stdio · 无需 API key',
};

const CATEGORY_ZH = {
  Speed: '速度',
  Reasoning: '推理',
  Flagship: '旗舰',
  Legacy: '旧版',
  Performance: '性能',
  Coding: '编程',
  Multimodal: '多模态',
  Custom: '自定义',
};

const BADGE_ZH = {
  Default: '默认',
  New: '新',
  Free: '免费',
  Reasoning: '推理',
  Flagship: '旗舰',
  Performance: '性能',
  Code: '代码',
  Vision: '视觉',
  '🚀 Fastest': '🚀 最快',
};

const HINT_ZH = {
  'Fastest · Free tier default': '最快 · 免费档默认',
  'Best price/performance balance': '最佳性价比',
  'Best reasoning · Complex diagrams': '最佳推理 · 复杂图表',
  'Frontier speed + intelligence': '前沿速度 + 智能',
  'Most powerful · Multimodal': '最强 · 多模态',
  'Fast · Cost-efficient': '快速 · 成本低',
  'Flagship model · Most capable': '旗舰模型 · 能力最强',
  'Latest update · Improved reasoning': '最新更新 · 推理增强',
  'Advanced reasoning · Fast': '高级推理 · 快速',
  'Deep reasoning · Complex tasks': '深度推理 · 复杂任务',
  'Fastest · Most affordable': '最快 · 最实惠',
  'Balanced intelligence & speed': '智能与速度均衡',
  'Latest Sonnet · Best coding': '最新 Sonnet · 最佳编码',
  'Most intelligent · 1M token context': '最智能 · 100 万 token 上下文',
  'Free tier · Very fast': '免费档 · 极快',
  'More capable · Free tier': '更强能力 · 免费档',
  'Advanced reasoning · Tool use': '高级推理 · 工具调用',
  'Versatile model': '通用模型',
  'Efficient · Multi-modal': '高效 · 多模态',
  'Lightweight · Vision-language · Fast': '轻量 · 视觉语言 · 快速',
  'Latest · GPT-5 comparable': '最新 · 可比 GPT-5',
  'Strong reasoning model': '强推理模型',
  '120B params · Fast on WSE-3': '120B 参数 · WSE-3 上极速',
  '2,403 tok/s · Industry fastest': '2,403 tok/s · 行业最快',
  'Flagship · Best quality': '旗舰 · 最佳质量',
  'Fast · Cost-efficient · 32k context': '快速 · 成本低 · 32k 上下文',
  'Balanced quality-cost · Best default': '质量成本均衡 · 最佳默认',
  'Most capable · 128k context · Flagship': '最强 · 128k 上下文 · 旗舰',
  'Code-optimized · 256k context': '代码优化 · 256k 上下文',
  'Vision + reasoning · Multimodal': '视觉 + 推理 · 多模态',
  'Enter your model ID below': '在下方输入模型 ID',
  'Local · Free': '本地 · 免费',
  'Cloud · Fast': '云端 · 快速',
};

function patchModelMeta(zh) {
  function walk(obj, prefix = '') {
    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return;
    for (const [k, v] of Object.entries(obj)) {
      const key = prefix ? `${prefix}.${k}` : k;
      if (typeof v === 'string') {
        if (k === 'category' && CATEGORY_ZH[v]) {
          setPath(zh, key, CATEGORY_ZH[v]);
        } else if (k === 'badge' && BADGE_ZH[v]) {
          setPath(zh, key, BADGE_ZH[v]);
        } else if (k === 'hint' && HINT_ZH[v]) {
          setPath(zh, key, HINT_ZH[v]);
        }
      } else if (typeof v === 'object') {
        walk(v, key);
      }
    }
  }
  walk(zh.settingsModal?.ai?.models ?? {}, 'settingsModal.ai.models');
}

function main() {
  const en = readJson(EN_FILE);
  const zh = readJson(ZH_FILE);

  for (const [key, value] of Object.entries(NEW_KEYS)) {
    setPath(en, key, value);
    setPath(zh, key, NEW_KEYS_ZH[key] ?? value);
  }

  for (const [key, value] of Object.entries(ZH_PATCH)) {
    setPath(zh, key, value);
  }

  patchModelMeta(zh);

  writeJson(EN_FILE, en);
  writeJson(ZH_FILE, zh);
  console.log(`Patched zh: ${Object.keys(ZH_PATCH).length} keys, added ${Object.keys(NEW_KEYS).length} new keys.`);
}

main();
