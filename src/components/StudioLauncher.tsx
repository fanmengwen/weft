import React from 'react';
import { Sparkles } from 'lucide-react';

interface StudioLauncherProps {
  onOpen: () => void;
}

export function StudioLauncher({ onOpen }: StudioLauncherProps): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onOpen}
      data-testid="studio-launcher"
      className="absolute right-4 top-[14px] z-40 inline-flex h-8 items-center gap-1.5 rounded-full border border-[var(--wf-border)] bg-[var(--wf-surface)] px-3 text-[13px] font-medium text-[var(--wf-text)] shadow-[0_2px_8px_rgba(16,24,40,0.08)] transition-colors hover:bg-[var(--wf-hover)]"
    >
      <Sparkles aria-hidden className="h-3.5 w-3.5 text-[var(--wf-acc)]" />
      Studio
    </button>
  );
}
