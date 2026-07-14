import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CHART_NODE_TONES } from '../nodeHelpers';
import { ToneSwatch } from './ToneSwatch';

const TONE_LABELS: Record<(typeof CHART_NODE_TONES)[number], string> = {
  out: '起点',
  end: '终点',
  web: '处理',
  cond: '判断',
  kb: '输入输出',
  llm: '数据库',
  note: '注释',
};

describe('ToneSwatch', () => {
  it('renders seven swatches with tone foreground CSS variables', () => {
    const { container } = render(
      <ToneSwatch selectedTone="web" onSelect={vi.fn()} />
    );

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);

    CHART_NODE_TONES.forEach((tone, index) => {
      const swatch = buttons[index].firstElementChild as HTMLElement;
      expect(swatch.style.getPropertyValue('background')).toBe(`var(--wf-t-${tone}-fg)`);
    });

    expect(container.querySelectorAll('[aria-pressed="true"]')).toHaveLength(1);
  });

  it('marks the selected tone as pressed', () => {
    render(<ToneSwatch selectedTone="cond" onSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: TONE_LABELS.cond })).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    expect(screen.getByRole('button', { name: TONE_LABELS.web })).toHaveAttribute(
      'aria-pressed',
      'false'
    );
  });

  it('calls onSelect with the clicked tone', () => {
    const onSelect = vi.fn();
    render(<ToneSwatch selectedTone="web" onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: TONE_LABELS.kb }));

    expect(onSelect).toHaveBeenCalledWith('kb');
  });
});
