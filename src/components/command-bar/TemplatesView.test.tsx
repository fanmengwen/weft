import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TemplatesView } from './TemplatesView';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return {
    ...actual,
    useTranslation: () => ({
      t: (_key: string, fallback?: string) => fallback ?? _key,
      i18n: {
        language: 'en',
        changeLanguage: vi.fn(),
      },
    }),
  };
});

describe('TemplatesView', () => {
  it('renders richer template cards and allows selecting a template', () => {
    const onSelectTemplate = vi.fn();

    render(
      <TemplatesView
        onSelectTemplate={onSelectTemplate}
        onClose={vi.fn()}
        handleBack={vi.fn()}
        templateCategory="workflow"
      />
    );

    expect(screen.getAllByText(/nodes?/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Domain events')).toBeNull();
    expect(screen.queryByText('软件发版')).toBeNull();

    const templateButton = screen.getByText('文档问答助手').closest('button');
    if (!templateButton) {
      throw new Error('Workflow template button was not rendered');
    }
    fireEvent.click(templateButton);

    expect(onSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'docs-qa-assistant' })
    );
  });

  it('searches across use cases and replacement hints, not just names', () => {
    render(
      <TemplatesView
        onSelectTemplate={vi.fn()}
        onClose={vi.fn()}
        handleBack={vi.fn()}
        templateCategory="flowchart"
      />
    );

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '灰度环境' } });

    expect(screen.getByText('软件发版')).toBeTruthy();
    expect(screen.queryByText('请假审批')).toBeNull();
  });

  it('does not expose category switching for a locked template set', () => {
    render(
      <TemplatesView
        onSelectTemplate={vi.fn()}
        onClose={vi.fn()}
        handleBack={vi.fn()}
        templateCategory="flowchart"
      />
    );

    expect(screen.queryByText('ALL')).toBeNull();
    expect(screen.queryByText('WORKFLOW')).toBeNull();
    expect(screen.getByText('软件发版')).toBeTruthy();
    expect(screen.queryByText('文档问答助手')).toBeNull();
  });
});
