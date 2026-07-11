import { useEffect, type RefObject } from 'react';

export function useMousedownOutside(
  ref: RefObject<HTMLElement | null>,
  onOutside: () => void,
  enabled = true,
): void {
  useEffect(() => {
    if (!enabled) {
      return;
    }

    const handleMouseDown = (event: MouseEvent): void => {
      const target = event.target;
      if (ref.current && target instanceof Node && !ref.current.contains(target)) {
        onOutside();
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [enabled, onOutside, ref]);
}
