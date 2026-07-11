import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { JourneyNodeProperties } from './JourneyNodeProperties';

const baseHandlers = {
  onChange: vi.fn(),
  onDuplicate: vi.fn(),
  onDelete: vi.fn(),
};

function expectSharedColorSection(title: string): void {
  fireEvent.click(screen.getByRole('button', { name: title }));
  expect(screen.getByRole('button', { name: 'Custom' })).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Filled' })).toBeTruthy();
}

describe('specialized node property panels', () => {
  it('shows the shared color section for journey nodes', () => {
    render(
      <JourneyNodeProperties
        selectedNode={{
          id: 'journey-1',
          type: 'journey',
          position: { x: 0, y: 0 },
          data: { label: 'Checkout', subLabel: 'Customer' },
        }}
        {...baseHandlers}
      />
    );

    expectSharedColorSection('Color');
  });
});
