import React from 'react';
import type { HomePageTab } from './homeTabs';

export interface SidebarNavEntry {
  tab: HomePageTab;
  label: string;
  testId: string;
  icon: React.ReactNode;
  trailing?: React.ReactNode;
}

export function SidebarNavButton({
  item,
  isActive,
  onClick,
}: {
  item: SidebarNavEntry;
  isActive: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      data-testid={item.testId}
      aria-current={isActive ? 'page' : undefined}
      onClick={onClick}
      className={
        isActive
          ? 'flex h-9 w-full items-center gap-[9px] rounded-lg bg-[color-mix(in_srgb,var(--brand-primary)_9%,white)] px-2.5 text-left text-[13px] font-semibold text-[var(--brand-primary)] dark:bg-[color-mix(in_srgb,var(--brand-primary)_18%,transparent)]'
          : 'flex h-9 w-full items-center gap-[9px] rounded-lg px-2.5 text-left text-[13px] font-normal text-[#4A5361] transition-colors hover:bg-[#F3F5F8] dark:text-[var(--brand-secondary)] dark:hover:bg-[color-mix(in_srgb,var(--brand-secondary),transparent_90%)] dark:hover:text-[var(--brand-text)]'
      }
    >
      <span className="flex shrink-0 items-center justify-center">{item.icon}</span>
      <span className="min-w-0 truncate">{item.label}</span>
      {item.trailing}
    </button>
  );
}
