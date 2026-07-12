import { beforeAll, describe, expect, it } from 'vitest';
import {
  buildDartArrowTransform,
  computePathEndpoint,
  DART_ARROW_PATH,
} from './edgeDartArrow';

function installPathGeometryPolyfill(): void {
  const parseLine = (
    pathData: string
  ): { x1: number; y1: number; x2: number; y2: number } | null => {
    const match = pathData.match(/M\s*([\d.-]+)\s+([\d.-]+)\s+L\s*([\d.-]+)\s+([\d.-]+)/);
    if (!match) {
      return null;
    }

    return {
      x1: Number(match[1]),
      y1: Number(match[2]),
      x2: Number(match[3]),
      y2: Number(match[4]),
    };
  };

  const pathPrototype = Object.getPrototypeOf(
    document.createElementNS('http://www.w3.org/2000/svg', 'path')
  ) as SVGPathElement;

  pathPrototype.getTotalLength = function getTotalLength(this: SVGPathElement): number {
    const line = parseLine(this.getAttribute('d') ?? '');
    if (!line) {
      return 0;
    }

    return Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
  };

  pathPrototype.getPointAtLength = function getPointAtLength(this: SVGPathElement, length: number) {
    const line = parseLine(this.getAttribute('d') ?? '');
    if (!line) {
      return { x: 0, y: 0 } as DOMPoint;
    }

    const total = Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
    const ratio = total === 0 ? 0 : length / total;
    return {
      x: line.x1 + (line.x2 - line.x1) * ratio,
      y: line.y1 + (line.y2 - line.y1) * ratio,
    } as DOMPoint;
  };
}

function createPathElement(pathData: string): SVGPathElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', pathData);
  svg.appendChild(path);
  document.body.appendChild(svg);
  return path;
}

describe('edgeDartArrow', () => {
  beforeAll(() => {
    installPathGeometryPolyfill();
  });

  it('exposes the dart arrow path literal from the design spec', () => {
    expect(DART_ARROW_PATH).toBe('M0 0 L-10 -3.7 L-8 0 L-10 3.7 Z');
  });

  it('computes endpoint tangent rotation for horizontal and vertical paths', () => {
    const horizontal = createPathElement('M 0 0 L 100 0');
    const vertical = createPathElement('M 0 0 L 0 100');

    expect(computePathEndpoint(horizontal, 'end').angleDeg).toBeCloseTo(0, 4);
    expect(computePathEndpoint(vertical, 'end').angleDeg).toBeCloseTo(90, 4);
    expect(buildDartArrowTransform(computePathEndpoint(horizontal, 'end'))).toContain('rotate(0');
    expect(buildDartArrowTransform(computePathEndpoint(vertical, 'end'))).toContain('rotate(90');
  });
});
