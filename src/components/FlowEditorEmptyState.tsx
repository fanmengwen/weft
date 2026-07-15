import React from 'react';
import { useTranslation } from 'react-i18next';
import { useShortcutHelpActions } from '@/store/viewHooks';

interface FlowEditorEmptyStateProps {
  title: string;
  description: string;
  templatesLabel: string;
  addNodeLabel: string;
  onTemplates: () => void;
  onAddNode: () => void;
  showStudioHint?: boolean;
  studioHintLabel?: string;
}

function FlowchartIcon(): React.ReactElement {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden className="block">
      <rect
        x="9"
        y="3.5"
        width="6"
        height="5"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="3.5"
        y="15.5"
        width="6"
        height="5"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <rect
        x="14.5"
        y="15.5"
        width="6"
        height="5"
        rx="1.4"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M12 8.5 V12 M12 12 H6.5 V15.5 M12 12 H17.5 V15.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TemplatesIcon(): React.ReactElement {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="block">
      <rect x="4" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="4" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <rect x="4" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
      <rect x="13" y="13" width="7" height="7" rx="1.6" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}

function PlusIcon(): React.ReactElement {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden className="block">
      <path
        d="M12 5 V19 M5 12 H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HintArrowIcon(): React.ReactElement {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
      className="block animate-[hintFloat_1.8s_ease-in-out_infinite]"
    >
      <path
        d="M5 12 H18 M12.5 6.5 L19 12 L12.5 17.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const emptyActionButtonClass =
  'inline-flex h-10 items-center gap-2 rounded-[9px] border border-[#E1E4EA] bg-white px-[18px] text-[13.5px] font-medium text-[#3E4753] shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-colors hover:border-[#D3D7DE] hover:bg-[#F7F8FA] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--wf-acc)]/30';

export function FlowEditorEmptyState({
  title,
  description,
  templatesLabel,
  addNodeLabel,
  onTemplates,
  onAddNode,
  showStudioHint = false,
  studioHintLabel,
}: FlowEditorEmptyStateProps): React.ReactElement {
  const { t } = useTranslation();
  const { setShortcutsHelpOpen } = useShortcutHelpActions();

  const descriptionLines = description.split('\n').filter(Boolean);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center p-6 animate-[fadeIn_200ms_ease-out]">
      <div className="pointer-events-auto flex w-full max-w-[380px] flex-col items-center text-center">
        <div className="mb-[22px] flex h-[60px] w-[60px] items-center justify-center rounded-2xl border border-[color-mix(in_srgb,var(--wf-acc)_18%,#FFFFFF)] bg-[color-mix(in_srgb,var(--wf-acc)_10%,#FFFFFF)] text-[var(--wf-acc)]">
          <FlowchartIcon />
        </div>

        <h3 className="text-[20px] font-semibold tracking-[-0.01em] text-[var(--brand-text)]">
          {title}
        </h3>

        <p className="mt-2 text-[13.5px] leading-[1.6] text-[#6B7484]">
          {descriptionLines.map((line, index) => (
            <React.Fragment key={line}>
              {index > 0 ? <br /> : null}
              {line}
            </React.Fragment>
          ))}
        </p>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5">
          <button
            type="button"
            onClick={onTemplates}
            className={emptyActionButtonClass}
            data-testid="empty-browse-templates"
          >
            <span className="text-[#8B93A0]">
              <TemplatesIcon />
            </span>
            <span>{templatesLabel}</span>
          </button>

          <button
            type="button"
            onClick={onAddNode}
            className={emptyActionButtonClass}
            data-testid="empty-add-node"
          >
            <span className="text-[#8B93A0]">
              <PlusIcon />
            </span>
            <span>{addNodeLabel}</span>
          </button>
        </div>

        <div className="mt-5 text-[12px] text-[#98A1AE]">
          {t('flowEditor.emptyState.orPrefix', { defaultValue: 'or' })}{' '}
          <button
            type="button"
            onClick={() => setShortcutsHelpOpen(true)}
            className="font-medium text-[var(--wf-acc)] transition-colors hover:text-[color-mix(in_srgb,var(--wf-acc)_80%,#000)] focus-visible:outline-none"
            data-testid="empty-state-shortcuts"
          >
            {t('flowEditor.viewShortcuts')}
          </button>
        </div>
      </div>

      {showStudioHint ? (
        <div
          className="pointer-events-none absolute right-[22px] top-1/2 flex -translate-y-1/2 items-center gap-2 text-[12.5px] font-semibold text-[var(--wf-acc)]"
          data-testid="empty-studio-hint"
        >
          <span>
            {studioHintLabel ??
              t('flowEditor.emptyState.studioReady', { defaultValue: 'AI is ready' })}
          </span>
          <HintArrowIcon />
        </div>
      ) : null}
    </div>
  );
}
