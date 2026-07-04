import { describe, expect, it } from 'vitest';
import { containsTemplate, VariablePool } from './variablePool';

describe('VariablePool', () => {
  it('stores and reads node outputs by selector', () => {
    const pool = new VariablePool();
    pool.setNodeOutputs('wf-textInput-1', { text: 'hello' });

    expect(pool.getValue('wf-textInput-1', 'text')).toBe('hello');
    expect(pool.getValue('wf-textInput-1', 'nope')).toBeUndefined();
    expect(pool.getValue('missing', 'text')).toBeUndefined();
  });

  it('resolves {{nodeId.key}} templates', () => {
    const pool = new VariablePool();
    pool.setNodeOutputs('wf-textInput-1', { text: '深圳' });

    const resolution = pool.resolveTemplate('介绍一下 {{wf-textInput-1.text}} 的历史');
    expect(resolution.value).toBe('介绍一下 深圳 的历史');
    expect(resolution.missing).toEqual([]);
  });

  it('replaces missing selectors with empty text and reports them', () => {
    const pool = new VariablePool();
    const resolution = pool.resolveTemplate('a {{gone.text}} b {{gone.other}}');
    expect(resolution.value).toBe('a  b ');
    expect(resolution.missing).toEqual(['gone.text', 'gone.other']);
  });

  it('serializes non-string values as JSON', () => {
    const pool = new VariablePool();
    pool.setNodeOutputs('n1', { results: [{ title: 't' }], count: 2 });

    expect(pool.resolveTemplate('{{n1.count}}').value).toBe('2');
    expect(pool.resolveTemplate('{{n1.results}}').value).toBe('[{"title":"t"}]');
  });

  it('seeds from initial outputs and snapshots defensively', () => {
    const pool = new VariablePool({ n1: { text: 'seed' } });
    const snapshot = pool.snapshot();
    snapshot.n1.text = 'mutated';

    expect(pool.getValue('n1', 'text')).toBe('seed');
  });

  it('detects template syntax', () => {
    expect(containsTemplate('plain text')).toBe(false);
    expect(containsTemplate('has {{node.key}} inside')).toBe(true);
    expect(containsTemplate('has {{node.key}} inside')).toBe(true);
  });
});
