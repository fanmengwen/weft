import { describe, expect, it } from 'vitest';
import type { DiagramNodePropertiesComponent } from './propertyPanels';
import {
  getDiagramNodeProperties,
  registerDiagramNodeProperties,
  resetDiagramNodePropertiesRegistryForTests,
} from './propertyPanels';

describe('diagram property panel registry', () => {
  it('registers and resolves a diagram-specific node properties component', () => {
    resetDiagramNodePropertiesRegistryForTests();
    const component = (() => null) as DiagramNodePropertiesComponent;
    registerDiagramNodeProperties('journey', component);

    expect(getDiagramNodeProperties('journey')).toBe(component);
  });

  it('returns undefined when no component is registered', () => {
    resetDiagramNodePropertiesRegistryForTests();
    expect(getDiagramNodeProperties('mindmap')).toBeUndefined();
  });
});
