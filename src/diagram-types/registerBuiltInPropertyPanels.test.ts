import { describe, expect, it } from 'vitest';
import {
  getDiagramNodeProperties,
  resetDiagramNodePropertiesRegistryForTests,
} from '@/diagram-types/core';
import {
  registerBuiltInPropertyPanels,
  resetBuiltInPropertyPanelRegistrationForTests,
} from './registerBuiltInPropertyPanels';

describe('registerBuiltInPropertyPanels', () => {
  it('registers built-in node properties components', () => {
    resetBuiltInPropertyPanelRegistrationForTests();
    resetDiagramNodePropertiesRegistryForTests();
    registerBuiltInPropertyPanels();
    expect(getDiagramNodeProperties('architecture')).toBeDefined();
    expect(getDiagramNodeProperties('architecture')).toBeDefined();
  });
});
