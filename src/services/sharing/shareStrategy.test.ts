import { describe, expect, it } from 'vitest';
import { resolveShareRouting, selectShareRoute, URL_HASH_MAX_LENGTH, GIST_MAX_LENGTH } from './shareStrategy';

describe('share strategy', () => {
  it('routes tiny payloads to URL hash', () => {
    expect(selectShareRoute(URL_HASH_MAX_LENGTH - 1)).toBe('url-hash');
  });

  it('routes medium payloads to gist', () => {
    expect(selectShareRoute(URL_HASH_MAX_LENGTH)).toBe('gist');
    expect(selectShareRoute(GIST_MAX_LENGTH)).toBe('gist');
  });

  it('routes oversized payloads to manual download', () => {
    expect(selectShareRoute(GIST_MAX_LENGTH + 1)).toBe('manual-download');
  });

  it('resolves routing with encoded length metadata', () => {
    const result = resolveShareRouting({ nodes: [], edges: [] });
    expect(result.encodedLength).toBeGreaterThan(0);
    expect(['url-hash', 'gist', 'manual-download']).toContain(result.route);
  });
});
