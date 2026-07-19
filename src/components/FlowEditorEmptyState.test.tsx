import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { FlowEditorEmptyState } from './FlowEditorEmptyState';

describe('FlowEditorEmptyState', () => {
  it('offers only the template browser action', () => {
    render(
      <FlowEditorEmptyState
        title="Your canvas is empty"
        description="Start with a template"
        templatesLabel="Browse templates"
        onTemplates={vi.fn()}
      />
    );

    expect(screen.getByTestId('empty-browse-templates')).toBeTruthy();
    expect(screen.queryByTestId('empty-add-node')).toBeNull();
    expect(screen.queryByTestId('empty-state-shortcuts')).toBeNull();
  });
});
