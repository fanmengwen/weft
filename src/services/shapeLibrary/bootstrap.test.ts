import { describe, expect, it } from 'vitest';
import {
    createRuntimeShapePackRegistry,
    getRuntimeShapePackRegistry,
    resetRuntimeShapePackRegistryForTests,
} from './bootstrap';

describe('shape library bootstrap', () => {
    it('returns an empty runtime registry when flag is disabled', () => {
        const registry = createRuntimeShapePackRegistry(false);
        expect(registry.listPacks()).toEqual([]);
    });

    it('returns starter packs when flag is enabled', () => {
        const registry = createRuntimeShapePackRegistry(true);
        const packIds = registry.listPacks().map((pack) => pack.id);

        expect(packIds).toEqual(['starter-core-v1']);
    });

    it('keeps a singleton runtime registry instance', () => {
        resetRuntimeShapePackRegistryForTests();
        const registryA = getRuntimeShapePackRegistry();
        const registryB = getRuntimeShapePackRegistry();

        expect(registryA).toBe(registryB);
    });
});
