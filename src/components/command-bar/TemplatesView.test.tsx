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
      <TemplatesView onSelectTemplate={onSelectTemplate} onClose={vi.fn()} handleBack={vi.fn()} />
    );

    expect(screen.getAllByText(/nodes?/i).length).toBeGreaterThan(0);
    expect(screen.queryByText('Domain events')).toBeNull();

    fireEvent.click(screen.getByText('请假审批').closest('button') as HTMLButtonElement);

    expect(onSelectTemplate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'leave-approval-flow' })
    );
  });

  it('searches across use cases and replacement hints, not just names', () => {
    render(<TemplatesView onSelectTemplate={vi.fn()} onClose={vi.fn()} handleBack={vi.fn()} />);

    fireEvent.change(screen.getByRole('textbox'), { target: { value: '灰度环境' } });

    expect(screen.getByText('软件发版上线')).toBeTruthy();
    expect(screen.queryByText('请假审批')).toBeNull();
  });
});
