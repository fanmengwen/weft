import React from 'react';
import { NamedIcon } from './IconMap';
import { type ChartNodeTone, chartNodeToneVars } from './nodeHelpers';

export interface ChartNodeToneChipProps {
  tone: ChartNodeTone;
  chipIcon: string;
  resolvedAssetIconUrl: string | null | undefined;
  isCircular: boolean;
  lodPreserveClassName: string;
}

export function ChartNodeToneChip({
  tone,
  chipIcon,
  resolvedAssetIconUrl,
  isCircular,
  lodPreserveClassName,
}: ChartNodeToneChipProps): React.ReactElement {
  const toneVars = chartNodeToneVars(tone);
  return (
    <div
      data-chart-node-tone-chip="1"
      data-tone={tone}
      className={`shrink-0 flex h-[30px] w-[30px] items-center justify-center flow-lod-far-target flow-lod-far-flex-target flow-lod-shadow ${lodPreserveClassName} ${isCircular ? 'rounded-full' : ''}`}
      style={{
        background: toneVars.background,
        color: toneVars.color,
        borderRadius: isCircular ? '999px' : '8px',
      }}
    >
      {resolvedAssetIconUrl ? (
        <img
          src={resolvedAssetIconUrl}
          alt=""
          className="h-4 w-4 object-contain"
        />
      ) : (
        <NamedIcon
          name={chipIcon}
          fallbackName="Square"
          className="h-4 w-4"
          style={{ color: toneVars.color }}
        />
      )}
    </div>
  );
}
