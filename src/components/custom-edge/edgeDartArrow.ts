import { MarkerType } from '@/lib/reactflowCompat';

export const DART_ARROW_PATH = 'M0 0 L-10 -3.7 L-8 0 L-10 3.7 Z';
export const EDGE_ARROW_TRIM_PX = 6;

export interface PathEndpoint {
  x: number;
  y: number;
  angleDeg: number;
}

interface MarkerConfigLike {
  type?: MarkerType | string;
}

export function computePathEndpoint(
  pathElement: SVGPathElement,
  side: 'start' | 'end'
): PathEndpoint {
  const length = pathElement.getTotalLength();
  if (side === 'end') {
    const tip = pathElement.getPointAtLength(length);
    const near = pathElement.getPointAtLength(Math.max(0, length - EDGE_ARROW_TRIM_PX));
    const angleRad = Math.atan2(tip.y - near.y, tip.x - near.x);
    return { x: tip.x, y: tip.y, angleDeg: (angleRad * 180) / Math.PI };
  }

  const tip = pathElement.getPointAtLength(0);
  const near = pathElement.getPointAtLength(Math.min(length, EDGE_ARROW_TRIM_PX));
  const angleRad = Math.atan2(tip.y - near.y, tip.x - near.x);
  return { x: tip.x, y: tip.y, angleDeg: (angleRad * 180) / Math.PI };
}

export function buildDartArrowTransform(endpoint: PathEndpoint): string {
  return `translate(${endpoint.x}, ${endpoint.y}) rotate(${endpoint.angleDeg})`;
}

export function shouldRenderDartMarker(config: MarkerConfigLike | undefined): boolean {
  if (!config) {
    return true;
  }

  return config.type === MarkerType.ArrowClosed || config.type === 'arrowclosed';
}
