import type { ElkNode } from 'elkjs/lib/elk.bundled.js';
import elkWorkerUrl from 'elkjs/lib/elk-worker.min.js?url';
import { createLogger } from '@/lib/logger';

export interface ElkLayoutEngine {
  layout: (graph: ElkNode) => Promise<ElkNode>;
}

interface ElkModuleLike {
  default?: new (args?: { workerUrl?: string; workerFactory?: (url?: string) => Worker }) => unknown;
}

const logger = createLogger({ scope: 'elkLayout' });
const WORKER_PROBE_TIMEOUT_MS = 4000;
let elkInstancePromise: Promise<ElkLayoutEngine> | null = null;

function canUseElkWorker(): boolean {
  if (typeof window === 'undefined' || typeof Worker === 'undefined') return false;
  // Vitest exposes MODE='test'; skip worker path in unit tests (jsdom Worker stub).
  const mode = (import.meta as { env?: { MODE?: string } }).env?.MODE;
  return mode !== 'test';
}

async function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<T>((_, reject) => {
        timer = setTimeout(() => {
          reject(new Error(`${label} timed out after ${ms}ms`));
        }, ms);
      }),
    ]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}

async function loadBundledElk(): Promise<ElkLayoutEngine> {
  // Only reachable in dev/test; production builds use the worker path exclusively
  // so the bundled engine (~1.4MB) is tree-shaken from the prod bundle.
  const module = (await import('elkjs/lib/elk.bundled.js')) as ElkModuleLike;
  if (typeof module.default !== 'function') {
    throw new Error('ELK module did not expose a constructor.');
  }
  const candidate = new module.default();
  if (!candidate || typeof (candidate as ElkLayoutEngine).layout !== 'function') {
    throw new Error('ELK instance does not implement layout().');
  }
  return candidate as ElkLayoutEngine;
}

async function loadWorkerElk(): Promise<ElkLayoutEngine> {
  const module = (await import('elkjs/lib/elk-api.js')) as ElkModuleLike;
  if (typeof module.default !== 'function') {
    throw new Error('ELK worker module did not expose a constructor.');
  }
  // Vite resolves `?url` to a serveable asset. In git worktrees, raw
  // `new URL('elkjs/...', import.meta.url)` becomes /@fs/<main-repo>/... which
  // 403s unless server.fs.allow includes that path — and even then a hung worker
  // would leave auto-layout spinning forever without a probe below.
  const Ctor = module.default as new (args: { workerUrl: string }) => ElkLayoutEngine;
  const candidate = new Ctor({ workerUrl: elkWorkerUrl });
  if (!candidate || typeof candidate.layout !== 'function') {
    throw new Error('ELK worker instance does not implement layout().');
  }

  // Broken worker scripts (403 HTML, network errors) construct without throwing
  // but never answer postMessage — prove readiness with a tiny layout.
  await withTimeout(
    candidate.layout({
      id: 'root',
      children: [{ id: 'probe', width: 10, height: 10 }],
    }),
    WORKER_PROBE_TIMEOUT_MS,
    'ELK worker probe'
  );

  return candidate;
}

async function createElkInstance(): Promise<ElkLayoutEngine> {
  if (canUseElkWorker()) {
    try {
      return await loadWorkerElk();
    } catch (error) {
      logger.warn('ELK worker init failed; falling back to in-process layout.', { error });
    }
  }
  // Vite replaces `import.meta.env.PROD` at build time so the bundled-engine
  // import below is unreachable in prod and gets tree-shaken (~1.4MB savings).
  if (import.meta.env.PROD) {
    throw new Error('ELK worker failed to initialize and no in-process fallback is shipped.');
  }
  return loadBundledElk();
}

export async function getElkInstance(): Promise<ElkLayoutEngine> {
  if (!elkInstancePromise) {
    elkInstancePromise = createElkInstance().catch((error) => {
      // Allow a later click to retry after a transient worker failure.
      elkInstancePromise = null;
      throw error;
    });
  }
  return elkInstancePromise;
}

/** Reset the cached ELK instance — useful in tests or when the instance may have become stale. */
export function resetElkInstance(): void {
  elkInstancePromise = null;
}
