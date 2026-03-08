import { parseMermaid } from '@/lib/mermaidParser';
import type { DiagramPlugin } from '@/diagram-types/core';

function normalizeStateTransitionLabels(input: string): string {
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  const normalized = lines.map((rawLine) => {
    const line = rawLine.trim();
    if (line.includes('|')) return rawLine;
    const transitionMatch = line.match(/^(.+?)\s+(<-->|<--|-->|==>|-.->)\s+(.+?)\s*:\s*(.+)$/);
    if (!transitionMatch) return rawLine;

    const source = transitionMatch[1].trim();
    const arrow = transitionMatch[2];
    const target = transitionMatch[3].trim();
    const label = transitionMatch[4].trim();
    if (!source || !target || !label) return rawLine;
    return `  ${source} ${arrow}|${label}| ${target}`;
  });

  return normalized.join('\n');
}

function collectStateDiagramDiagnostics(input: string): { diagnostics: string[]; direction?: 'TB' | 'LR' } {
  const diagnostics: string[] = [];
  const lines = input.replace(/\r\n/g, '\n').split('\n');
  let hasHeader = false;
  let compositeDepth = 0;
  let direction: 'TB' | 'LR' | undefined;

  for (const [index, rawLine] of lines.entries()) {
    const lineNumber = index + 1;
    const line = rawLine.trim();
    if (!line || line.startsWith('%%')) continue;

    if (/^stateDiagram(?:-v2)?\b/i.test(line)) {
      hasHeader = true;
      continue;
    }
    if (!hasHeader) continue;

    if (/^direction\b/i.test(line)) {
      const directionMatch = line.match(/^direction\s+(LR|TB)\s*$/i);
      if (!directionMatch) {
        diagnostics.push(`Invalid stateDiagram direction syntax at line ${lineNumber}: "${line}"`);
        continue;
      }
      direction = directionMatch[1].toUpperCase() as 'TB' | 'LR';
      continue;
    }

    if (/^note\b/i.test(line)) {
      diagnostics.push(`Unsupported stateDiagram note syntax at line ${lineNumber}: "${line}"`);
      continue;
    }

    if (/^state\s+.+\{\s*$/i.test(line)) {
      compositeDepth += 1;
      continue;
    }

    if (/^}\s*$/.test(line) || /^end\s*$/i.test(line)) {
      if (compositeDepth === 0) {
        diagnostics.push(`Unexpected stateDiagram composite block closer at line ${lineNumber}: "${line}"`);
      } else {
        compositeDepth -= 1;
      }
      continue;
    }

    if (/\s->\s/.test(line)) {
      diagnostics.push(`Invalid stateDiagram transition syntax at line ${lineNumber}: "${line}"`);
    }
  }

  if (compositeDepth > 0) {
    diagnostics.push(`Unclosed stateDiagram composite block detected (${compositeDepth} block(s) not closed).`);
  }

  return { diagnostics, direction };
}

function parseStateDiagram(input: string) {
  const { diagnostics, direction } = collectStateDiagramDiagnostics(input);
  const normalizedInput = normalizeStateTransitionLabels(input);
  const parsed = parseMermaid(normalizedInput);
  if (direction) {
    parsed.direction = direction;
  }
  if (diagnostics.length === 0) {
    return parsed;
  }
  return {
    ...parsed,
    diagnostics,
  };
}

export const STATE_DIAGRAM_PLUGIN: DiagramPlugin = {
  id: 'stateDiagram',
  displayName: 'State Diagram',
  parseMermaid: parseStateDiagram,
};
