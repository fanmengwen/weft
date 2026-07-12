import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { StudioLauncher } from './StudioLauncher';

describe('StudioLauncher', () => {
  it('calls onOpen when clicked', () => {
    const onOpen = vi.fn();
    render(<StudioLauncher onOpen={onOpen} />);

    fireEvent.click(screen.getByTestId('studio-launcher'));

    expect(onOpen).toHaveBeenCalledTimes(1);
  });
});
