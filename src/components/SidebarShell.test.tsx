import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { SidebarBody } from './SidebarShell';

function getSidebarBodyElement(container: HTMLElement): HTMLElement {
  const body = container.firstElementChild;
  if (!(body instanceof HTMLElement)) {
    throw new Error('SidebarBody root element not found');
  }
  return body;
}

describe('SidebarBody', () => {
  it('applies default padding when padded is omitted', () => {
    const { container } = render(<SidebarBody>x</SidebarBody>);
    const body = getSidebarBodyElement(container);
    expect(body.className).toContain('px-4');
    expect(body.className).toContain('py-3');
  });

  it('omits default padding when padded is false', () => {
    const { container } = render(<SidebarBody padded={false}>x</SidebarBody>);
    const body = getSidebarBodyElement(container);
    expect(body.className).not.toContain('px-4');
    expect(body.className).not.toContain('py-3');
  });
});
