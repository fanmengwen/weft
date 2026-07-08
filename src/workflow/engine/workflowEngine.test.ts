import { describe, expect, it } from 'vitest';
import type { FlowEdge } from '@/lib/types';
import type { WorkflowNodeKind } from '../nodes/nodeCatalog';
import { createWorkflowNode } from '../dnd/createWorkflowNode';
import { getWorkflowHandler } from '../handlers/registry';
import type { WorkflowNodeHandler, WorkflowRunEvent } from './types';
import { runWorkflow } from './workflowEngine';

function makeEdge(source: string, target: string, sourceHandle = 'out'): FlowEdge {
  return {
    id: `${source}->${target}:${sourceHandle}`,
    source,
    target,
    sourceHandle,
    targetHandle: 'in',
  } as FlowEdge;
}

async function collectEvents(run: AsyncGenerator<WorkflowRunEvent>): Promise<WorkflowRunEvent[]> {
  const events: WorkflowRunEvent[] = [];
  for await (const event of run) {
    events.push(event);
  }
  return events;
}

function stubHandlers(
  overrides: Partial<Record<WorkflowNodeKind, WorkflowNodeHandler>>
): (kind: WorkflowNodeKind) => WorkflowNodeHandler {
  return (kind) => overrides[kind] ?? getWorkflowHandler(kind);
}

describe('runWorkflow', () => {
  it('runs a linear chain in order and aggregates the output text', async () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    (input.data as { text?: string }).text = 'hello';
    const llm = createWorkflowNode('llm', { x: 1, y: 0 });
    const output = createWorkflowNode('output', { x: 2, y: 0 });

    const events = await collectEvents(
      runWorkflow(
        {
          nodes: [input, llm, output],
          edges: [makeEdge(input.id, llm.id), makeEdge(llm.id, output.id)],
          signal: new AbortController().signal,
        },
        {
          resolveHandler: stubHandlers({
            llm: {
              async run({ pool, incomers, emitStream }) {
                const upstream = String(pool.getNodeOutputs(incomers[0].id)?.text ?? '');
                emitStream(upstream.toUpperCase());
                return { outputs: { text: upstream.toUpperCase() } };
              },
            },
          }),
        }
      )
    );

    const types = events.map((event) => event.type);
    expect(types).toEqual([
      'runStarted',
      'nodeStarted',
      'nodeSucceeded',
      'nodeStarted',
      'nodeStream',
      'nodeSucceeded',
      'nodeStarted',
      'nodeSucceeded',
      'runFinished',
    ]);

    const finished = events.at(-1);
    expect(finished).toEqual({ type: 'runFinished', status: 'succeeded', finalText: 'HELLO' });
  });

  it('marks downstream nodes skipped after a failure', async () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    (input.data as { text?: string }).text = 'boom';
    const llm = createWorkflowNode('llm', { x: 1, y: 0 });
    const output = createWorkflowNode('output', { x: 2, y: 0 });

    const events = await collectEvents(
      runWorkflow(
        {
          nodes: [input, llm, output],
          edges: [makeEdge(input.id, llm.id), makeEdge(llm.id, output.id)],
          signal: new AbortController().signal,
        },
        {
          resolveHandler: stubHandlers({
            llm: {
              async run() {
                throw new Error('provider exploded');
              },
            },
          }),
        }
      )
    );

    expect(events).toContainEqual({
      type: 'nodeFailed',
      nodeId: llm.id,
      kind: 'llm',
      error: { raw: 'provider exploded' },
    });
    expect(events).toContainEqual({
      type: 'nodeSkipped',
      nodeId: output.id,
      kind: 'output',
      reason: 'upstreamDead',
    });
    expect(events.at(-1)).toEqual({ type: 'runFinished', status: 'failed', finalText: '' });
  });

  it('follows the selected branch and skips the other one', async () => {
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    (input.data as { text?: string }).text = 'seed';
    const branching = createWorkflowNode('webSearch', { x: 1, y: 0 });
    const truthy = createWorkflowNode('output', { x: 2, y: 0 });
    const falsy = createWorkflowNode('output', { x: 2, y: 1 });

    const events = await collectEvents(
      runWorkflow(
        {
          nodes: [input, branching, truthy, falsy],
          edges: [
            makeEdge(input.id, branching.id),
            makeEdge(branching.id, truthy.id, 'true'),
            makeEdge(branching.id, falsy.id, 'false'),
          ],
          signal: new AbortController().signal,
        },
        {
          resolveHandler: stubHandlers({
            webSearch: {
              async run() {
                return { outputs: { text: 'took true' }, branch: 'true' };
              },
            },
          }),
        }
      )
    );

    expect(events).toContainEqual({
      type: 'nodeSkipped',
      nodeId: falsy.id,
      kind: 'output',
      reason: 'branchNotTaken',
    });
    expect(events.at(-1)).toEqual({
      type: 'runFinished',
      status: 'succeeded',
      finalText: 'took true',
    });
  });

  it('stops with aborted status when the signal fires mid-run', async () => {
    const controller = new AbortController();
    const input = createWorkflowNode('textInput', { x: 0, y: 0 });
    (input.data as { text?: string }).text = 'x';
    const llm = createWorkflowNode('llm', { x: 1, y: 0 });
    const output = createWorkflowNode('output', { x: 2, y: 0 });

    const events = await collectEvents(
      runWorkflow(
        {
          nodes: [input, llm, output],
          edges: [makeEdge(input.id, llm.id), makeEdge(llm.id, output.id)],
          signal: controller.signal,
        },
        {
          resolveHandler: stubHandlers({
            llm: {
              async run() {
                controller.abort();
                return { outputs: { text: 'late' } };
              },
            },
          }),
        }
      )
    );

    expect(events.at(-1)).toEqual({ type: 'runFinished', status: 'aborted', finalText: '' });
    expect(
      events.filter((event) => event.type === 'nodeStarted').map((event) => event.nodeId)
    ).toEqual([input.id, llm.id]);
  });
});
