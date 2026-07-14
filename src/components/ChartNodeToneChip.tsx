import React from 'react';
import { NamedIcon } from './IconMap';
import { type ChartNodeTone, chartNodeToneVars } from './nodeHelpers';

export interface ChartNodeToneChipProps {
  tone: ChartNodeTone;
  chipIcon: string;
  resolvedAssetIconUrl: string | null | undefined;
  isCircular: boolean;
  chipSize?: 'default' | 'compact';
  lodPreserveClassName: string;
}

export function ChartNodeToneChip({
  tone,
  chipIcon,
  resolvedAssetIconUrl,
  isCircular,
  chipSize = 'default',
  lodPreserveClassName,
}: ChartNodeToneChipProps): React.ReactElement {
  const toneVars = chartNodeToneVars(tone);
  const isCompact = chipSize === 'compact';
  const dimensionClass = isCompact ? 'h-[26px] w-[26px]' : 'h-[30px] w-[30px]';
  const iconClass = isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4';
  return (
    <div
      data-chart-node-tone-chip="1"
      data-tone={tone}
      className={`shrink-0 flex ${dimensionClass} items-center justify-center flow-lod-far-target flow-lod-far-flex-target flow-lod-shadow ${lodPreserveClassName} ${isCircular ? 'rounded-full' : ''}`}
      style={{
        background: toneVars.background,
        color: toneVars.color,
        borderRadius: isCircular ? '999px' : isCompact ? '7px' : '8px',
      }}
    >
      {resolvedAssetIconUrl ? (
        <img
          src={resolvedAssetIconUrl}
          alt=""
          className={`${iconClass} object-contain`}
        />
      ) : (
        <NamedIcon
          name={chipIcon}
          fallbackName="Square"
          className={iconClass}
          style={{ color: toneVars.color }}
        />
      )}
    </div>
  );
}

