import type { FlowNode } from '@/lib/types';
import { WorkflowHandlerError, type WorkflowNodeHandler } from '../engine/types';
import type { VariablePool } from '../engine/variablePool';
import { firstUpstreamText } from './llm';

const CODE_TIMEOUT_MS = 5000;

// Runs inside the Worker: evaluate the user function and post back a
// structured-cloneable verdict, covering sync throws and rejected promises.
const WORKER_SOURCE = `
self.onmessage = (event) => {
  const { code, inputs } = event.data;
  try {
    const fn = new Function('inputs', code);
    Promise.resolve(fn(inputs)).then(
      (value) => self.postMessage({ ok: true, value: value === undefined ? null : value }),
      (error) => self.postMessage({ ok: false, error: String((error && error.message) || error) })
    );
  } catch (error) {
    self.postMessage({ ok: false, error: String((error && error.message) || error) });
  }
};
`;

export function buildCodeInputs(
  pool: VariablePool,
  incomers: FlowNode[]
): Record<string, unknown> {
  const inputs: Record<string, unknown> = {};
  for (const incomer of incomers) {
    inputs[incomer.id] = pool.getNodeOutputs(incomer.id) ?? {};
  }
  // Node ids are wf-<kind>-<uuid>, so the convenience key cannot collide.
  inputs.text = firstUpstreamText(pool, incomers);
  return inputs;
}

export function normalizeCodeResult(value: unknown): { text: string; value: unknown } {
  if (value === undefined || value === null) {
    return { text: '', value: null };
  }
  return {
    text: typeof value === 'string' ? value : JSON.stringify(value),
    value,
  };
}

// A Worker is the actual sandbox here: no DOM access, and a hung loop dies
// with terminate() instead of freezing the tab.
function runInWorker(
  code: string,
  inputs: Record<string, unknown>,
  signal: AbortSignal
): Promise<unknown> {
  if (typeof Worker === 'undefined' || typeof URL.createObjectURL !== 'function') {
    return Promise.reject(new WorkflowHandlerError('workflowMode.log.codeWorkerUnavailable'));
  }

  const blobUrl = URL.createObjectURL(new Blob([WORKER_SOURCE], { type: 'text/javascript' }));
  const worker = new Worker(blobUrl);

  return new Promise<unknown>((resolve, reject) => {
    const cleanup = () => {
      clearTimeout(timer);
      signal.removeEventListener('abort', onAbort);
      worker.terminate();
      URL.revokeObjectURL(blobUrl);
    };
    const timer = setTimeout(() => {
      cleanup();
      reject(
        new WorkflowHandlerError('workflowMode.log.codeTimeout', {
          seconds: CODE_TIMEOUT_MS / 1000,
        })
      );
    }, CODE_TIMEOUT_MS);
    const onAbort = () => {
      cleanup();
      reject(new DOMException('Aborted', 'AbortError'));
    };
    signal.addEventListener('abort', onAbort);

    worker.onmessage = (event: MessageEvent<{ ok: boolean; value?: unknown; error?: string }>) => {
      cleanup();
      if (event.data.ok) {
        resolve(event.data.value);
      } else {
        reject(new Error(event.data.error ?? 'code execution failed'));
      }
    };
    worker.onerror = (event) => {
      cleanup();
      reject(new Error(event.message || 'code execution failed'));
    };

    worker.postMessage({ code, inputs });
  });
}

export const codeHandler: WorkflowNodeHandler = {
  async run({ data, pool, incomers, signal }) {
    const value = await runInWorker(data.code ?? '', buildCodeInputs(pool, incomers), signal);
    const normalized = normalizeCodeResult(value);
    return { outputs: { text: normalized.text, value: normalized.value } };
  },
};
