import { describe, expect, it } from 'vitest';
import { getHomePagePath, getHomePageTab } from './homeTabs';

describe('homeTabs', () => {
  it('maps design sidebar paths to tabs', () => {
    expect(getHomePageTab('/home')).toBe('home');
    expect(getHomePageTab('/files')).toBe('files');
    expect(getHomePageTab('/templates')).toBe('templates');
    expect(getHomePageTab('/runs')).toBe('runs');
    expect(getHomePageTab('/trash')).toBe('trash');
    expect(getHomePageTab('/account')).toBe('account');
    expect(getHomePageTab('/settings')).toBe('settings');
    expect(getHomePageTab('/mcp')).toBe('mcp');
  });

  it('maps tabs back to paths', () => {
    expect(getHomePagePath('home')).toBe('/home');
    expect(getHomePagePath('files')).toBe('/files');
    expect(getHomePagePath('runs')).toBe('/runs');
    expect(getHomePagePath('trash')).toBe('/trash');
    expect(getHomePagePath('account')).toBe('/account');
  });
});
