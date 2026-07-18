import React from 'react';
import { ChevronDown } from 'lucide-react';

export function SettingsToggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className="relative h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors duration-150"
      style={{
        background: checked ? 'var(--brand-primary)' : '#D8DCE2',
      }}
    >
      <span
        className="absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-[0_1px_2px_rgba(16,24,40,0.2)] transition-[left] duration-150"
        style={{ left: checked ? 18 : 2 }}
      />
    </button>
  );
}

export function SettingsSegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: {
  options: Array<{ value: T; label: string }>;
  value: T;
  onChange: (value: T) => void;
}): React.ReactElement {
  return (
    <div className="mt-2.5 flex w-fit rounded-[9px] bg-[#F0F2F5] p-0.5 dark:bg-[color-mix(in_srgb,var(--brand-background),white_6%)]">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-[7px] px-3.5 py-[5px] text-[12.5px] transition-colors ${
              active
                ? 'bg-white font-semibold text-[#171D26] shadow-[0_1px_2px_rgba(16,24,40,0.10)] dark:bg-[var(--brand-surface)] dark:text-[var(--brand-text)]'
                : 'text-[#5C6572] dark:text-[var(--brand-secondary)]'
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SettingsSelectTrigger({
  label,
  onClick,
  open,
  widthClassName = 'w-[240px]',
}: {
  label: string;
  onClick: () => void;
  open?: boolean;
  widthClassName?: string;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`${widthClassName} mt-2.5 flex h-[34px] items-center justify-between rounded-lg border border-[#D8DCE2] bg-white px-2.5 text-[13px] text-[var(--brand-text)] transition-colors hover:border-[#C2C8D2] dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]`}
      aria-expanded={open}
    >
      <span className="truncate">{label}</span>
      <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[#8B93A0]" aria-hidden />
    </button>
  );
}

export function SettingsGhostButton({
  children,
  onClick,
  type = 'button',
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  disabled?: boolean;
}): React.ReactElement {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="inline-flex h-[34px] items-center rounded-lg border border-[#D8DCE2] bg-white px-3 text-[13px] font-medium text-[#4A5361] transition-colors hover:bg-[#F3F5F8] disabled:cursor-not-allowed disabled:opacity-60 dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)] dark:text-[var(--brand-secondary)] dark:hover:bg-[var(--brand-background)]"
    >
      {children}
    </button>
  );
}

export function SettingsNavItem({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}): React.ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-[34px] items-center rounded-lg px-3 text-[13px] transition-colors ${
        active
          ? 'bg-[color-mix(in_srgb,var(--brand-primary)_9%,white)] font-semibold text-[var(--brand-primary)] dark:bg-[color-mix(in_srgb,var(--brand-primary)_16%,transparent)]'
          : 'text-[#4A5361] hover:bg-[#F3F5F8] dark:text-[var(--brand-secondary)] dark:hover:bg-[var(--brand-background)]'
      }`}
    >
      {label}
    </button>
  );
}
