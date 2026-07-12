import { describe, expect, it } from 'vitest';
import { bucketAnnotationFontSize } from './annotationTheme';

describe('bucketAnnotationFontSize', () => {
  it('maps missing or small values to small bucket', () => {
    expect(bucketAnnotationFontSize(undefined)).toBe('small');
    expect(bucketAnnotationFontSize('')).toBe('small');
    expect(bucketAnnotationFontSize('12')).toBe('small');
    expect(bucketAnnotationFontSize('11')).toBe('small');
    expect(bucketAnnotationFontSize('10')).toBe('small');
  });

  it('maps medium-range values to medium bucket', () => {
    expect(bucketAnnotationFontSize('13')).toBe('medium');
    expect(bucketAnnotationFontSize('14')).toBe('medium');
    expect(bucketAnnotationFontSize('15')).toBe('medium');
  });

  it('maps large values to large bucket', () => {
    expect(bucketAnnotationFontSize('16')).toBe('large');
    expect(bucketAnnotationFontSize('18')).toBe('large');
    expect(bucketAnnotationFontSize('24')).toBe('large');
  });
});
