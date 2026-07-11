import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import ArchitectureNode from './ArchitectureNode';

vi.mock('@/lib/reactflowCompat', async () => {
  const actual = await vi.importActual<typeof import('@/lib/reactflowCompat')>('@/lib/reactflowCompat');
  return {
    ...actual,
    Handle: ({ id, type, position, className, style }: {
      id?: string;
      type?: string;
      position?: string;
      className?: string;
      style?: React.CSSProperties;
    }) => (
      <div
        data-testid={`handle-${id ?? 'default'}`}
        data-handle-type={type}
        data-handle-position={position}
        className={className}
        style={style}
      />
    ),
  };
});

describe('VisualNodes handle interaction', () => {
  it('keeps selected ArchitectureNode handles connectable in visualQualityV2', () => {
    const { container } = render(
      <ArchitectureNode
        id="arch-1"
        type="architecture"
        selected
        data={{ label: 'Service', color: 'blue' }}
        xPos={0}
        yPos={0}
        zIndex={0}
        dragging={false}
      />
    );

    const handles = container.querySelectorAll('[data-handle-type="source"]');
    expect(handles.length).toBeGreaterThan(0);
  });

  it('keeps unselected ArchitectureNode handles discoverable', () => {
    const { container } = render(
      <ArchitectureNode
        id="arch-2"
        type="architecture"
        selected={false}
        data={{ label: 'Service', color: 'blue' }}
        xPos={0}
        yPos={0}
        zIndex={0}
        dragging={false}
      />
    );

    const handles = container.querySelectorAll('[data-handle-type="source"]');
    expect(handles.length).toBeGreaterThan(0);
  });
});
