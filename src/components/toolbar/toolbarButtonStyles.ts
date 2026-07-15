export const TOOLBAR_CONTAINER_CLASS = 'absolute left-4 top-1/2 z-40 -translate-y-1/2';

export const TOOLBAR_RAIL_CLASS =
  'flex flex-col items-center gap-0.5 rounded-[12px] border border-[#E6E8EC] bg-[#FFFFFF] p-1 shadow-[0_2px_8px_rgba(16,24,40,0.08)]';

export const TOOLBAR_BUTTON_BASE_CLASS =
  'group inline-flex h-[34px] w-[34px] items-center justify-center rounded-[8px] transition-colors hover:bg-[#F3F5F8] disabled:pointer-events-none';

export const TOOLBAR_BUTTON_ACTIVE_CLASS =
  'bg-[color-mix(in_srgb,var(--wf-acc)_10%,transparent)] text-[var(--wf-acc)]';

export const TOOLBAR_ICON_CLASS = 'h-4 w-4';

export const TOOLBAR_ICON_DISABLED_CLASS = 'text-[#C6CCD6]';

export const TOOLBAR_DIVIDER_CLASS = 'mx-auto h-px w-[18px] bg-[#EEF0F4]';

const TOOLBAR_ADD_BUTTON_BASE_CLASS =
  'group inline-flex h-9 w-9 items-center justify-center rounded-[9px] transition-[background-color,color,filter,transform] disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color-mix(in_srgb,var(--wf-acc)_25%,transparent)]';

/** Closed: solid accent CTA. Explicit hover colors override Button ghost. */
export const TOOLBAR_ADD_BUTTON_CLASS = [
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  'bg-[var(--wf-acc)] text-white',
  'hover:bg-[var(--wf-acc)] hover:text-white hover:brightness-[0.94]',
  'active:brightness-[0.9]',
].join(' ');

/**
 * Open (palette visible): muted pressed/close control — not solid blue.
 * Neutral rail fill + secondary X so it matches other toolbar chrome.
 */
export const TOOLBAR_ADD_BUTTON_OPEN_CLASS = [
  TOOLBAR_ADD_BUTTON_BASE_CLASS,
  'bg-[var(--wf-hover)] text-[var(--brand-secondary)]',
  'hover:bg-[#EEF0F4] hover:text-[var(--brand-text)]',
  'active:bg-[#E6E8EC]',
].join(' ');

export const TOOLBAR_PALETTE_OFFSET_CLASS = 'absolute left-[46px] top-1/2 -translate-y-1/2';

export function getToolbarIconButtonClass(options?: {
  active?: boolean;
  disabled?: boolean;
}): string {
  const { active = false, disabled = false } = options ?? {};
  const activeClass = active ? TOOLBAR_BUTTON_ACTIVE_CLASS : 'text-[var(--brand-secondary)]';
  const disabledClass = disabled ? TOOLBAR_ICON_DISABLED_CLASS : '';

  return [TOOLBAR_BUTTON_BASE_CLASS, activeClass, disabledClass].filter(Boolean).join(' ');
}

export function getToolbarAddButtonClasses(options: {
  open: boolean;
  interactive: boolean;
}): { button: string; icon: string } {
  const { open, interactive } = options;

  return {
    button: open ? TOOLBAR_ADD_BUTTON_OPEN_CLASS : TOOLBAR_ADD_BUTTON_CLASS,
    icon: [
      TOOLBAR_ICON_CLASS,
      'transition-transform duration-200',
      open ? 'rotate-45 text-[var(--brand-secondary)] group-hover:text-[var(--brand-text)]' : 'text-white',
      !interactive ? TOOLBAR_ICON_DISABLED_CLASS : '',
    ]
      .filter(Boolean)
      .join(' '),
  };
}
