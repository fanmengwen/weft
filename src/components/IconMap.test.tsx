import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ICON_NAMES, ICON_PICKER_PRIORITY_NAMES, NamedIcon, resolveIconName } from './IconMap';

describe('IconMap', () => {
    it('keeps the curated icon registry intentionally small', () => {
        expect(ICON_NAMES.length).toBeLessThan(80);
        expect(ICON_NAMES).toContain('Settings');
        expect(ICON_NAMES).toContain('Database');
        expect(ICON_NAMES).toContain('Server');
    });

    it('resolves lowercase and aliased icon names', () => {
        expect(resolveIconName('database')).toBe('Database');
        expect(resolveIconName('image')).toBe('ImageIcon');
        expect(resolveIconName('log_in')).toBe('LogIn');
    });

    it('falls back to Settings for unknown or disabled icon names', () => {
        expect(resolveIconName('none')).toBe('Settings');
        expect(resolveIconName('totallyUnknownIcon')).toBe('Settings');
    });

    it('resolves chart node chip icon names', () => {
        expect(resolveIconName('Play')).toBe('Play');
        expect(resolveIconName('Square')).toBe('Square');
        expect(resolveIconName('Download')).toBe('Download');
    });

    it('renders chart node chip icons without Settings fallback', () => {
        const playView = render(<NamedIcon name="Play" data-testid="play-icon" />);
        const squareView = render(<NamedIcon name="Square" data-testid="square-icon" />);
        const downloadView = render(<NamedIcon name="Download" data-testid="download-icon" />);

        expect(playView.getByTestId('play-icon').classList.contains('lucide-play')).toBe(true);
        expect(squareView.getByTestId('square-icon').classList.contains('lucide-square')).toBe(true);
        expect(downloadView.getByTestId('download-icon').classList.contains('lucide-download')).toBe(true);
        expect(playView.getByTestId('play-icon').classList.contains('lucide-settings')).toBe(false);
    });

    it('renders a named icon element', () => {
        const view = render(<NamedIcon name="Database" data-testid="icon" />);
        const svg = view.getByTestId('icon');

        expect(svg.tagName.toLowerCase()).toBe('svg');
    });

    it('keeps picker priorities within the curated set', () => {
        expect(ICON_PICKER_PRIORITY_NAMES.every((name) => ICON_NAMES.includes(name))).toBe(true);
    });
});
