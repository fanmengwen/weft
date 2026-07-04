import { create } from 'zustand';
import { createId } from '@/lib/id';
import type { KnowledgeChunk, KnowledgeDocument } from './types';

export const BUILTIN_DOC_ID = 'builtin-weft-guide';

const BUILTIN_DOC_TEXT = `# Weft 产品说明

## 产品定位
Weft 是一个 AI 驱动的可视化画布平台,把「自然语言画图」和「可视化 AI 工作流编排」放在同一块画布上。产品面向需要快速表达想法的工程师与产品经理:打开即用,无需注册登录,所有数据保留在浏览器本地。

## 图表模式
图表模式支持用一句自然语言生成流程图、架构图、思维导图、时序图等八种图表。生成过程是流式的:节点逐个出现在画布上,随时可以打断。已有图表可以增量修改,AI 会保留原有节点的位置与 ID,只改动需要变化的部分。生成失败时会把解析错误回喂给模型自动重试。

## 工作流模式
工作流模式提供七种节点:文本输入、LLM 调用、Web 搜索、知识库检索、条件判断、代码执行和输出。节点之间用连线组成有向无环图,支持 if-else 条件分支。点击运行后,引擎在浏览器内按拓扑顺序逐节点执行,变量通过 {{节点.字段}} 模板在节点间流动,底部日志面板实时展示每一步进度和 LLM 的流式输出。

## 技术架构
前端使用 React 19、TypeScript、Vite 与 React Flow 画布,状态管理用 Zustand,样式用 Tailwind CSS。整个产品没有后端服务:工作流执行引擎、知识库检索、文档切分和向量计算全部运行在浏览器里。

## 隐私与 BYOK
Weft 采用 BYOK(Bring Your Own Key)模式:用户在设置里填入自己的 AI 服务商 API Key,请求从浏览器直接发往服务商,平台不经手、不存储任何密钥或对话内容。支持 OpenAI、Claude、Gemini、DashScope 等十余家服务商的接入。`;

interface KnowledgeState {
  documents: KnowledgeDocument[];
  addDocument: (name: string, text: string) => string;
}

export const useKnowledgeStore = create<KnowledgeState>()((set) => ({
  documents: [
    { id: BUILTIN_DOC_ID, name: 'Weft 产品说明.md', text: BUILTIN_DOC_TEXT, source: 'builtin' },
  ],
  addDocument: (name, text) => {
    const id = createId('wf-doc');
    set((state) => ({
      documents: [...state.documents, { id, name, text, source: 'upload' }],
    }));
    return id;
  },
}));

export function getKnowledgeDocument(docId?: string): KnowledgeDocument | undefined {
  const { documents } = useKnowledgeStore.getState();
  return documents.find((doc) => doc.id === docId) ?? documents.find((doc) => doc.id === BUILTIN_DOC_ID);
}

const MAX_CHUNK_LENGTH = 400;

// Paragraph-based chunking: merge short paragraphs up to the limit, hard-split
// oversized ones. No overlap — plenty for a demo-scale corpus.
export function chunkDocument(doc: KnowledgeDocument): KnowledgeChunk[] {
  const paragraphs = doc.text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  const pieces: string[] = [];
  let current = '';
  for (const paragraph of paragraphs) {
    if (paragraph.length > MAX_CHUNK_LENGTH) {
      if (current) {
        pieces.push(current);
        current = '';
      }
      for (let start = 0; start < paragraph.length; start += MAX_CHUNK_LENGTH) {
        pieces.push(paragraph.slice(start, start + MAX_CHUNK_LENGTH));
      }
      continue;
    }
    if (current && current.length + paragraph.length + 1 > MAX_CHUNK_LENGTH) {
      pieces.push(current);
      current = paragraph;
    } else {
      current = current ? `${current}\n${paragraph}` : paragraph;
    }
  }
  if (current) {
    pieces.push(current);
  }

  return pieces.map((text, index) => ({
    id: `${doc.id}#${index}`,
    docId: doc.id,
    index,
    text,
  }));
}
