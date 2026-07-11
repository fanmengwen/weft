import type { FlowNode } from '@/lib/types';
import { mapFigmaTextLayerToAnnotationNode } from '@/services/figmaImport/figmaNodeMapping';

type ParseResultLike = {
  metadata?: { direction?: string };
  direction?: string;
};

export function isEditablePasteTarget(target: EventTarget | null): boolean {
  const element = target instanceof HTMLElement ? target : null;
  if (!element) return false;
  const tagName = element.tagName.toLowerCase();
  if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return true;
  if (element.isContentEditable) return true;
  return element.closest('[contenteditable="true"]') !== null;
}

export function resolveLayoutDirection(result: ParseResultLike): 'TB' | 'LR' | 'RL' | 'BT' {
  const direction = result.metadata?.direction || result.direction || 'TB';
  if (direction === 'LR' || direction === 'RL' || direction === 'BT' || direction === 'TB') {
    return direction;
  }
  return 'TB';
}

export function createPastedAnnotationFromText(
  text: string,
  position: { x: number; y: number },
  activeLayerId: string
): FlowNode {
  return mapFigmaTextLayerToAnnotationNode({
    text,
    position,
    layerId: activeLayerId,
  });
}
