import React from 'react';
import { CHART_NODE_TONES, type ChartNodeTone } from '../nodeHelpers';

const TONE_LABELS: Record<ChartNodeTone, string> = {
  out: '起点',
  end: '终点',
  web: '处理',
  cond: '判断',
  kb: '输入输出',
  llm: '数据库',
  note: '注释',
};

export interface ToneSwatchProps {
  selectedTone: ChartNodeTone;
  onSelect: (tone: ChartNodeTone) => void;
}

/** Seven-tone appearance palette for chart-mode node styling. */
export function ToneSwatch({ selectedTone, onSelect }: ToneSwatchProps): React.ReactElement {
  return (
    <div className="flex flex-wrap gap-2">
      {CHART_NODE_TONES.map((tone) => {
        const isSelected = tone === selectedTone;
        return (
          <button
            key={tone}
            type="button"
            onClick={() => onSelect(tone)}
            aria-label={TONE_LABELS[tone]}
            aria-pressed={isSelected}
            className={`flex items-center justify-center rounded-full p-0.5 ${
              isSelected ? 'ring-2 ring-[var(--wf-acc)]' : 'ring-1 ring-[#E1E4EA]'
            }`}
          >
            <span
              className="h-6 w-6 rounded-full border-2 border-white"
              style={{ background: `var(--wf-t-${tone}-fg)` }}
            />
          </button>
        );
      })}
    </div>
  );
}
