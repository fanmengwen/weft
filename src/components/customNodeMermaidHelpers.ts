export function getMermaidImportedFontSize(nodeHeightPx: number | undefined): number {
  if (typeof nodeHeightPx !== 'number') {
    return 15;
  }

  if (nodeHeightPx <= 56) {
    return 14;
  }

  if (nodeHeightPx >= 96) {
    return 16;
  }

  return 15;
}

export function getMermaidImportedContentPadding(nodeHeightPx: number | undefined): string {
  if (typeof nodeHeightPx !== 'number') {
    return '0.6rem 0.75rem';
  }

  if (nodeHeightPx <= 40) {
    return '0.4rem 0.6rem';
  }

  if (nodeHeightPx <= 60) {
    return '0.5rem 0.7rem';
  }

  return '0.65rem 0.9rem';
}

