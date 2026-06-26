import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { RouteLoadingFallback } from './RouteLoadingFallback';
import { ROUTE_LOADING_I18N_KEYS } from './routeLoadingCopy';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('RouteLoadingFallback', () => {
  it('renders branded route-loading copy', () => {
    render(<RouteLoadingFallback />);

    expect(screen.getByRole('status')).toBeTruthy();
    expect(screen.getByText(ROUTE_LOADING_I18N_KEYS.title)).toBeTruthy();
    expect(screen.getByText(ROUTE_LOADING_I18N_KEYS.description)).toBeTruthy();
  });

  it('renders custom loading copy when provided', () => {
    render(<RouteLoadingFallback title="Opening docs" description="Loading documentation content." />);

    expect(screen.getByText('Opening docs')).toBeTruthy();
    expect(screen.getByText('Loading documentation content.')).toBeTruthy();
  });
});
