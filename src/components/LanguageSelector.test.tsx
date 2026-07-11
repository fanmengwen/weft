import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LanguageSelector } from './LanguageSelector';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (_key: string, fallback?: string) => fallback ?? _key,
    i18n: {
      language: 'en',
      changeLanguage: vi.fn(),
    },
  }),
}));

describe('LanguageSelector', () => {
  it('uses settings.closeLanguageSelector for the backdrop close aria-label', () => {
    render(<LanguageSelector />);

    fireEvent.click(screen.getByRole('button'));

    expect(
      screen.getByRole('button', { name: 'settings.closeLanguageSelector' })
    ).toBeInTheDocument();
  });
});
