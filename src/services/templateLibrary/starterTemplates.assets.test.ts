import { describe, expect, it } from 'vitest';
import { STARTER_TEMPLATE_MANIFESTS } from './starterTemplates';
import { loadProviderCatalog } from '@/services/shapeLibrary/providerCatalog';

describe('starter template provider assets', () => {
  it('uses only valid provider icon ids when asset-rich nodes exist', async () => {
    const assetNodes = STARTER_TEMPLATE_MANIFESTS.flatMap((template) => template.graph.nodes).filter(
      (node) => node.data.assetPresentation === 'icon'
    );

    // Current catalog is flowchart-only; keep the guard for future asset templates.
    if (assetNodes.length === 0) {
      expect(assetNodes).toHaveLength(0);
      return;
    }

    const providerCatalogs = await Promise.all([
      loadProviderCatalog('aws'),
      loadProviderCatalog('azure'),
      loadProviderCatalog('cncf'),
    ]);
    const validAssetIds = new Set(
      providerCatalogs.flatMap((items) =>
        items.map((item) => `${item.archIconPackId}:${item.archIconShapeId}`)
      )
    );

    assetNodes.forEach((node) => {
      expect(validAssetIds.has(`${node.data.archIconPackId}:${node.data.archIconShapeId}`)).toBe(
        true
      );
    });
  });
});
