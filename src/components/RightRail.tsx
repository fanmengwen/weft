import React from 'react';

interface RightRailProps {
  children: React.ReactNode;
}

export function RightRail({ children }: RightRailProps): React.ReactElement {
  return (
    <aside className="h-full min-h-0 w-[320px] shrink-0 border-l border-[var(--wf-border)] bg-[var(--wf-surface)] animate-in slide-in-from-right duration-200">
      <div className="flex h-full min-h-0 flex-col overflow-hidden">{children}</div>
    </aside>
  );
}
