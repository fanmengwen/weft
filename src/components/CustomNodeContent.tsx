import React from 'react';
import MemoizedMarkdown from './MemoizedMarkdown';
import { InlineTextEditSurface } from './InlineTextEditSurface';
import { ChartNodeToneChip } from './ChartNodeToneChip';
import { type ChartNodeSurfaceVariant, type ChartNodeTone } from './nodeHelpers';

interface InlineEditState {
  isEditing: boolean;
  draft: string;
  beginEdit: () => void;
  setDraft: (value: string) => void;
  commit: () => void;
  handleKeyDown: React.KeyboardEventHandler;
}

interface CustomNodeContentProps {
  data: {
    label?: string;
    subLabel?: string;
    imageUrl?: string;
  };
  hasSubLabel: boolean;
  resolvedAssetIconUrl: string | null | undefined;
  chipIcon: string;
  tone: ChartNodeTone;
  surfaceVariant: ChartNodeSurfaceVariant | null;
  textAlignStyle: React.CSSProperties;
  textClassName: string;
  textStyle: React.CSSProperties;
  subTextClassName: string;
  subTextStyle: React.CSSProperties;
  displayLabel: React.ReactNode;
  labelEdit: InlineEditState;
  subLabelEdit: InlineEditState;
  hasLabelSelection: boolean;
  hasSubLabelSelection: boolean;
  lodPreserveClassName: string;
  isDivShape: boolean;
  isSvgComplexShape: boolean;
  complexShapePaddingClassName: string;
  contentPadding: string;
}

export function CustomNodeContent({
  data,
  hasSubLabel,
  resolvedAssetIconUrl,
  chipIcon,
  tone,
  surfaceVariant,
  textAlignStyle,
  textClassName,
  textStyle,
  subTextClassName,
  subTextStyle,
  displayLabel,
  labelEdit,
  subLabelEdit,
  hasLabelSelection,
  hasSubLabelSelection,
  lodPreserveClassName,
  isDivShape,
  isSvgComplexShape,
  complexShapePaddingClassName,
  contentPadding,
}: CustomNodeContentProps): React.ReactElement {
  const isStadium = surfaceVariant === 'stadium';
  const isCircularChip = isStadium || isSvgComplexShape;
  const layoutClassName = isStadium
    ? 'flex-row items-center gap-[10px]'
    : `flex-col items-center ${isDivShape || isSvgComplexShape ? 'gap-1.5' : 'gap-2'}`;

  return (
    <div
      data-chart-node-content="1"
      className={`relative z-10 flex h-full w-full min-h-0 justify-center ${layoutClassName} ${isSvgComplexShape ? complexShapePaddingClassName : ''}`}
      style={!isDivShape && !isSvgComplexShape ? { padding: contentPadding } : undefined}
    >
      <ChartNodeToneChip
        tone={tone}
        chipIcon={chipIcon}
        resolvedAssetIconUrl={resolvedAssetIconUrl}
        isCircular={isCircularChip}
        chipSize={isDivShape ? 'compact' : 'default'}
        lodPreserveClassName={lodPreserveClassName}
      />

      <div
        className={`flex min-w-0 flex-col overflow-hidden ${isStadium ? 'flex-1' : 'max-w-full w-full'}`}
        style={textAlignStyle}
      >
        <InlineTextEditSurface
          isEditing={labelEdit.isEditing}
          draft={labelEdit.draft}
          displayValue={displayLabel}
          onBeginEdit={labelEdit.beginEdit}
          onDraftChange={labelEdit.setDraft}
          onCommit={labelEdit.commit}
          onKeyDown={labelEdit.handleKeyDown}
          className={textClassName}
          style={textStyle}
          inputMode="multiline"
          inputClassName={isStadium ? 'text-left' : 'text-center'}
          isSelected={hasLabelSelection}
        />
        {hasSubLabel && !isStadium ? (
          <div data-chart-node-sublabel="1" style={subTextStyle}>
            <InlineTextEditSurface
              isEditing={subLabelEdit.isEditing}
              draft={subLabelEdit.draft}
              displayValue={<MemoizedMarkdown content={data.subLabel} />}
              onBeginEdit={subLabelEdit.beginEdit}
              onDraftChange={subLabelEdit.setDraft}
              onCommit={subLabelEdit.commit}
              onKeyDown={subLabelEdit.handleKeyDown}
              className={subTextClassName}
              style={{ fontSize: 'inherit', color: 'inherit' }}
              inputClassName="text-center"
              isSelected={hasSubLabelSelection}
            />
          </div>
        ) : null}
      </div>

      {data.imageUrl ? (
        <div className="mt-3 w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 flow-lod-far-target">
          <img
            src={data.imageUrl}
            alt="attachment"
            className="h-auto max-h-[200px] w-full object-cover"
          />
        </div>
      ) : null}
    </div>
  );
}

