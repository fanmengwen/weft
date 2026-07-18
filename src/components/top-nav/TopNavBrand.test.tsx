import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TopNavBrand } from './TopNavBrand';

describe('TopNavBrand', () => {
  it('calls onGoHome when the brand is clicked', () => {
    const onGoHome = vi.fn();
    render(
      <TopNavBrand appName="Weft" logoUrl={null} logoStyle="text" onGoHome={onGoHome} />
    );

    fireEvent.click(screen.getByRole('button', { name: /home|首页/i }));
    expect(onGoHome).toHaveBeenCalledTimes(1);
  });

  it('renders a non-interactive brand when onGoHome is omitted', () => {
    render(<TopNavBrand appName="Weft" logoUrl={null} logoStyle="text" />);

    expect(screen.queryByRole('button', { name: /home|首页/i })).toBeNull();
    expect(screen.getByText('Weft')).toBeTruthy();
  });
});
