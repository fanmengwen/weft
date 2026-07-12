import type { NodeColorKey } from '@/theme';

export type AnnotationStickyColor = 'yellow' | 'green' | 'blue';

export interface AnnotationStickyTheme {
  background: string;
  borderColor: string;
  iconColor: string;
  bodyText: string;
  dot: string;
}

export const ANNOTATION_STICKY_THEMES: Record<AnnotationStickyColor, AnnotationStickyTheme> = {
  yellow: {
    background: 'linear-gradient(180deg, #FEFAEB, #FDF6DC)',
    borderColor: '#EFE2B6',
    iconColor: '#A8862B',
    bodyText: '#6B5A1D',
    dot: '#D4B85C',
  },
  green: {
    background: 'linear-gradient(180deg, #EBFAEB, #DCF6DC)',
    borderColor: '#B6E2B6',
    iconColor: '#2B8838',
    bodyText: '#1D5A24',
    dot: '#5CB86A',
  },
  blue: {
    background: 'linear-gradient(180deg, #EBF3FA, #DCEEFD)',
    borderColor: '#B6D4EF',
    iconColor: '#2B5F88',
    bodyText: '#1D3F5A',
    dot: '#5C9FD4',
  },
};

const ANNOTATION_COLOR_RENDER_MAP: Record<string, AnnotationStickyColor> = {
  yellow: 'yellow',
  amber: 'yellow',
  orange: 'yellow',
  pink: 'yellow',
  violet: 'yellow',
  purple: 'yellow',
  red: 'yellow',
  rose: 'yellow',
  slate: 'yellow',
  white: 'yellow',
  emerald: 'green',
  green: 'green',
  blue: 'blue',
  cyan: 'blue',
  indigo: 'blue',
  sky: 'blue',
};

export function normalizeAnnotationColorKey(color?: string): AnnotationStickyColor {
  if (!color) {
    return 'yellow';
  }
  return ANNOTATION_COLOR_RENDER_MAP[color] ?? 'yellow';
}

export function resolveAnnotationStickyTheme(color?: string): AnnotationStickyTheme {
  return ANNOTATION_STICKY_THEMES[normalizeAnnotationColorKey(color)];
}

export const ANNOTATION_COLOR_OPTIONS = [
  { id: 'yellow', label: 'Yellow' },
  { id: 'emerald', label: 'Green' },
  { id: 'blue', label: 'Blue' },
] as const satisfies ReadonlyArray<{ id: Exclude<NodeColorKey, 'custom'>; label: string }>;

