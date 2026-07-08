// Mirrors Dify's VariablePool: every executed node deposits its outputs under
// its node id, and downstream config strings reference them as {{nodeId.key}}.
const TEMPLATE_PATTERN = /\{\{\s*([A-Za-z0-9_-]+)\.([A-Za-z0-9_]+)\s*\}\}/g;

export interface TemplateResolution {
  value: string;
  // Selectors that referenced nodes/keys absent from the pool ("nodeId.key").
  missing: string[];
}

export class VariablePool {
  private readonly outputs = new Map<string, Record<string, unknown>>();

  constructor(initial?: Record<string, Record<string, unknown>>) {
    if (initial) {
      for (const [nodeId, nodeOutputs] of Object.entries(initial)) {
        this.outputs.set(nodeId, { ...nodeOutputs });
      }
    }
  }

  setNodeOutputs(nodeId: string, nodeOutputs: Record<string, unknown>): void {
    this.outputs.set(nodeId, { ...nodeOutputs });
  }

  getNodeOutputs(nodeId: string): Record<string, unknown> | undefined {
    return this.outputs.get(nodeId);
  }

  getValue(nodeId: string, key: string): unknown {
    return this.outputs.get(nodeId)?.[key];
  }

  resolveTemplate(template: string): TemplateResolution {
    const missing: string[] = [];
    const value = template.replace(TEMPLATE_PATTERN, (_match, nodeId: string, key: string) => {
      const resolved = this.getValue(nodeId, key);
      if (resolved === undefined || resolved === null) {
        missing.push(`${nodeId}.${key}`);
        return '';
      }
      return typeof resolved === 'string' ? resolved : JSON.stringify(resolved);
    });
    return { value, missing };
  }

  snapshot(): Record<string, Record<string, unknown>> {
    const result: Record<string, Record<string, unknown>> = {};
    for (const [nodeId, nodeOutputs] of this.outputs) {
      result[nodeId] = { ...nodeOutputs };
    }
    return result;
  }
}

export function containsTemplate(text: string): boolean {
  TEMPLATE_PATTERN.lastIndex = 0;
  return TEMPLATE_PATTERN.test(text);
}
