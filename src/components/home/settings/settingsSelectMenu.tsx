import React from 'react';
import { Check } from 'lucide-react';

export function SettingsSelectMenu({
  items,
  onSelect,
  onClose,
}: {
  items: Array<{ id: string; label: string; active: boolean }>;
  onSelect: (id: string) => void;
  onClose: () => void;
}): React.ReactElement {
  return (
    <>
      <button type="button" className="fixed inset-0 z-40" aria-label="Close" onClick={onClose} />
      <div className="absolute left-0 top-full z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-[#D8DCE2] bg-white p-1 shadow-md dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)]">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onSelect(item.id)}
            className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-[13px] ${
              item.active
                ? 'bg-[color-mix(in_srgb,var(--brand-primary)_9%,white)] font-medium text-[var(--brand-primary)]'
                : 'text-[var(--brand-text)] hover:bg-[#F3F5F8] dark:hover:bg-[var(--brand-background)]'
            }`}
          >
            <span className="truncate">{item.label}</span>
            {item.active ? <Check className="h-3.5 w-3.5 shrink-0" /> : null}
          </button>
        ))}
      </div>
    </>
  );
}
