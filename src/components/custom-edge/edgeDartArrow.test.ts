import { describe, expect, it } from 'vitest';
import {
  buildDartArrowTransform,
  computePathEndpoint,
  DART_ARROW_PATH,
  type PathLengthMeasurable,
} from './edgeDartArrow';

function createHorizontalLineStub(): PathLengthMeasurable {
  return {
    getTotalLength: () => 100,
    getPointAtLength: (distance: number) => ({ x: distance, y: 0 }),
  };
}

function createVerticalLineStub(): PathLengthMeasurable {
  return {
    getTotalLength: () => 100,
    getPointAtLength: (distance: number) => ({ x: 0, y: distance }),
  };
}

describe('edgeDartArrow', () => {
  it('exposes the dart arrow path literal from the design spec', () => {
    expect(DART_ARROW_PATH).toBe('M0 0 L-10 -3.7 L-8 0 L-10 3.7 Z');
  });

  it('computes endpoint tangent rotation for horizontal and vertical paths', () => {
    const horizontal = createHorizontalLineStub();
    const vertical = createVerticalLineStub();

    expect(computePathEndpoint(horizontal, 'end').angleDeg).toBeCloseTo(0, 4);
    expect(computePathEndpoint(vertical, 'end').angleDeg).toBeCloseTo(90, 4);
    expect(buildDartArrowTransform(computePathEndpoint(horizontal, 'end'))).toContain('rotate(0');
    expect(buildDartArrowTransform(computePathEndpoint(vertical, 'end'))).toContain('rotate(90');
  });
});
