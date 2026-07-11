import { describe, expect, it } from 'vitest';
import {
  getDiagramPlugin,
  listDiagramPlugins,
  resetDiagramPluginRegistryForTests,
} from '@/diagram-types/core';
import {
  registerBuiltInDiagramPlugins,
  resetBuiltInDiagramPluginRegistrationForTests,
} from './registerBuiltInPlugins';

describe('registerBuiltInDiagramPlugins', () => {
  it('registers flowchart plugin', () => {
    resetBuiltInDiagramPluginRegistrationForTests();
    resetDiagramPluginRegistryForTests();
    registerBuiltInDiagramPlugins();

    const flowchart = getDiagramPlugin('flowchart');
    const stateDiagram = getDiagramPlugin('stateDiagram');
    const architecture = getDiagramPlugin('architecture');
    expect(flowchart).toBeDefined();
    expect(flowchart?.id).toBe('flowchart');
    expect(stateDiagram).toBeDefined();
    expect(stateDiagram?.id).toBe('stateDiagram');
    expect(architecture).toBeDefined();
    expect(architecture?.id).toBe('architecture');
    expect(listDiagramPlugins().some((candidate) => candidate.id === 'flowchart')).toBe(true);
    expect(listDiagramPlugins().some((candidate) => candidate.id === 'stateDiagram')).toBe(true);
    expect(listDiagramPlugins().some((candidate) => candidate.id === 'architecture')).toBe(true);
  });

  it('is idempotent', () => {
    resetBuiltInDiagramPluginRegistrationForTests();
    resetDiagramPluginRegistryForTests();
    registerBuiltInDiagramPlugins();
    registerBuiltInDiagramPlugins();

    const flowchartPlugins = listDiagramPlugins().filter((candidate) => candidate.id === 'flowchart');
    const statePlugins = listDiagramPlugins().filter((candidate) => candidate.id === 'stateDiagram');
    const architecturePlugins = listDiagramPlugins().filter((candidate) => candidate.id === 'architecture');
    expect(flowchartPlugins).toHaveLength(1);
    expect(statePlugins).toHaveLength(1);
    expect(architecturePlugins).toHaveLength(1);
  });
});
