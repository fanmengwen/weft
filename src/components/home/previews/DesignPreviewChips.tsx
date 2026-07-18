import React from 'react';
import type { DesignPreviewNode, DesignPreviewTone } from './designFlowPreviewModel';
import { toneStyles } from './designFlowPreviewModel';
import { DesignPreviewToneIcon } from './DesignPreviewToneIcon';
import type { DesignFlowPreviewDensity } from './DesignFlowPreview';

export function PreviewChip({
  node,
  density,
}: {
  node: DesignPreviewNode & { left: number; top: number };
  density: DesignFlowPreviewDensity;
}): React.ReactElement {
  const tones = toneStyles(node.tone);
  const iconSize = density === 'compact' ? 16 : density === 'hero' ? 22 : 20;
  const fontSize = density === 'compact' ? 10.5 : density === 'hero' ? 12 : 11.5;
  const padX = density === 'compact' ? 8 : 11;
  const padL = density === 'compact' ? 4 : 6;

  if (node.kind === 'diamond') {
    const size = Math.max(node.width, node.height);
    return (
      <div
        className="absolute"
        style={{ left: node.left, top: node.top, width: size, height: size }}
      >
        <div
          className="absolute inset-[14%]"
          style={{
            background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)',
            border: '1px solid #E1E4EA',
            borderRadius: 11,
            transform: 'rotate(45deg)',
            boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 2px 6px rgba(16,24,40,0.04)',
          }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
          <IconBadge tone={node.tone} size={iconSize} bg={tones.bg} fg={tones.fg} />
          <span
            className="max-w-[70px] truncate font-semibold leading-tight text-[#171D26]"
            style={{ fontSize: fontSize - 1 }}
          >
            {node.label}
          </span>
        </div>
      </div>
    );
  }

  const isCapsule = node.kind === 'capsule';
  return (
    <div
      className="absolute inline-flex items-center"
      style={{
        left: node.left,
        top: node.top,
        height: node.height,
        minWidth: node.width,
        gap: density === 'compact' ? 6 : 7,
        padding: `0 ${padX}px 0 ${padL}px`,
        borderRadius: isCapsule ? 999 : 8,
        background: 'linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)',
        border: '1px solid #E1E4EA',
        boxShadow: '0 1px 2px rgba(16,24,40,0.05), 0 2px 6px rgba(16,24,40,0.04)',
      }}
    >
      <IconBadge
        tone={node.tone}
        size={iconSize}
        bg={tones.bg}
        fg={tones.fg}
        round={isCapsule}
      />
      <span
        className="truncate font-semibold text-[#171D26]"
        style={{ fontSize, maxWidth: Math.max(48, node.width - 36) }}
      >
        {node.label}
      </span>
    </div>
  );
}

function IconBadge({
  tone,
  size,
  bg,
  fg,
  round = false,
}: {
  tone: DesignPreviewTone;
  size: number;
  bg: string;
  fg: string;
  round?: boolean;
}): React.ReactElement {
  return (
    <span
      className="flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: round ? 999 : Math.max(5, size * 0.28),
        background: bg,
        color: fg,
      }}
    >
      <DesignPreviewToneIcon tone={tone} size={Math.max(9, size * 0.55)} />
    </span>
  );
}
