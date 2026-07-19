import React from 'react';

export {
  SettingsGhostButton,
  SettingsNavItem,
  SettingsSegmentedControl,
  SettingsSelectTrigger,
  SettingsToggle,
} from './settingsControls';

export function SettingsCard({ children }: { children: React.ReactNode }): React.ReactElement {
  return (
    <div className="rounded-[14px] border border-[#E6E8EC] bg-white px-[18px] py-1.5 dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]">
      {children}
    </div>
  );
}

export function SettingsSection({
  children,
  bordered = false,
  className = '',
}: {
  children: React.ReactNode;
  bordered?: boolean;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={`py-3.5 ${bordered ? 'border-t border-[#F0F2F5] dark:border-[var(--color-brand-border)]' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function SettingsFieldTitle({ children }: { children: React.ReactNode }): React.ReactElement {
  return <div className="text-[13px] font-semibold text-[var(--brand-text)]">{children}</div>;
}

export function SettingsFieldHint({ children }: { children: React.ReactNode }): React.ReactElement {
  return <div className="mt-[3px] text-xs text-[#8B93A0] dark:text-[var(--brand-secondary)]">{children}</div>;
}
