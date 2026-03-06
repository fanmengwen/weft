import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import { createShapePackRegistry, type ShapePackRegistry } from './registry';
import { STARTER_SHAPE_PACKS } from './starterPacks';

let runtimeRegistry: ShapePackRegistry | null = null;

export function createRuntimeShapePackRegistry(shapeLibraryEnabled: boolean): ShapePackRegistry {
    if (!shapeLibraryEnabled) {
        return createShapePackRegistry();
    }
    return createShapePackRegistry(STARTER_SHAPE_PACKS);
}

export function getRuntimeShapePackRegistry(): ShapePackRegistry {
    if (!runtimeRegistry) {
        runtimeRegistry = createRuntimeShapePackRegistry(ROLLOUT_FLAGS.shapeLibraryV1);
    }
    return runtimeRegistry;
}

export function resetRuntimeShapePackRegistryForTests(): void {
    runtimeRegistry = null;
}
