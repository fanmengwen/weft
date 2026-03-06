export type ShareRoute = 'url-hash' | 'gist' | 'manual-download';

export interface ShareRoutingResult {
  route: ShareRoute;
  encodedLength: number;
}

export const URL_HASH_MAX_LENGTH = 2000;
export const GIST_MAX_LENGTH = 50000;

export function encodeSharePayload(payload: unknown): string {
  return encodeURIComponent(JSON.stringify(payload));
}

export function selectShareRoute(encodedLength: number): ShareRoute {
  if (encodedLength < URL_HASH_MAX_LENGTH) {
    return 'url-hash';
  }
  if (encodedLength <= GIST_MAX_LENGTH) {
    return 'gist';
  }
  return 'manual-download';
}

export function resolveShareRouting(payload: unknown): ShareRoutingResult {
  const encoded = encodeSharePayload(payload);
  return {
    route: selectShareRoute(encoded.length),
    encodedLength: encoded.length,
  };
}
