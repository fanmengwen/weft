import React from 'react';
import { useTranslation } from 'react-i18next';
import type { HomeFilesKindTab, HomeFilesLayout } from './homeFilesModel';
import { FilesGridIcon, FilesListIcon } from './FilesKindIcons';

interface FilesTabBarProps {
  tab: HomeFilesKindTab;
  onTabChange: (tab: HomeFilesKindTab) => void;
  layout: HomeFilesLayout;
  onLayoutChange: (layout: HomeFilesLayout) => void;
}

export function FilesTabBar({
  tab,
  onTabChange,
  layout,
  onLayoutChange,
}: FilesTabBarProps): React.ReactElement {
  const { t } = useTranslation();
  const tabs: { id: HomeFilesKindTab; label: string }[] = [
    { id: 'all', label: t('home.filterAll', 'All') },
    { id: 'chart', label: t('home.kind.chart', 'Flowchart') },
    { id: 'workflow', label: t('home.kind.workflow', 'Workflow') },
  ];

  return (
    <div className="mt-5 flex items-end justify-between border-b border-[#E6E8EC] dark:border-[var(--color-brand-border)]">
      <div className="flex gap-5" role="tablist" aria-label={t('nav.files', 'My files')}>
        {tabs.map((entry) => {
          const active = tab === entry.id;
          return (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={active}
              data-testid={`files-tab-${entry.id}`}
              onClick={() => onTabChange(entry.id)}
              className={
                active
                  ? '-mb-px border-b-2 border-[var(--brand-primary)] pb-[9px] text-[13.5px] font-semibold text-[var(--brand-text)]'
                  : '-mb-px border-b-2 border-transparent pb-[9px] text-[13.5px] text-[#6B7484] hover:text-[var(--brand-text)]'
              }
            >
              {entry.label}
            </button>
          );
        })}
      </div>
      <div className="flex items-center gap-2.5 pb-2">
        <div className="hidden items-center gap-[5px] rounded-md px-1.5 py-0.5 text-[12.5px] text-[#4A5361] sm:inline-flex">
          <span>{t('homeFiles.sortRecent', 'Recently modified')}</span>
          <svg width="12" height="12" viewBox="0 0 24 24" className="text-[#8B93A0]" aria-hidden="true">
            <path
              d="M6.5 9.5 L12 15 L17.5 9.5"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div className="hidden h-3.5 w-px bg-[#E6E8EC] sm:block dark:bg-[var(--color-brand-border)]" />
        <div className="flex gap-0.5" role="group" aria-label={t('homeFiles.layoutAria', 'Layout')}>
          <LayoutButton
            active={layout === 'grid'}
            label={t('homeFiles.layoutGrid', 'Grid')}
            testId="files-layout-grid"
            onClick={() => onLayoutChange('grid')}
          >
            <FilesGridIcon />
          </LayoutButton>
          <LayoutButton
            active={layout === 'list'}
            label={t('homeFiles.layoutList', 'List')}
            testId="files-layout-list"
            onClick={() => onLayoutChange('list')}
          >
            <FilesListIcon />
          </LayoutButton>
        </div>
      </div>
    </div>
  );
}

function LayoutButton({
  active,
  label,
  testId,
  onClick,
  children,
}: {
  active: boolean;
  label: string;
  testId: string;
  onClick: () => void;
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      data-testid={testId}
      onClick={onClick}
      className={
        active
          ? 'flex h-[26px] w-[26px] items-center justify-center rounded-md bg-[color-mix(in_srgb,var(--brand-primary)_10%,#FFFFFF)] text-[var(--brand-primary)]'
          : 'flex h-[26px] w-[26px] items-center justify-center rounded-md text-[#8B93A0] hover:bg-[#F0F2F5]'
      }
    >
      {children}
    </button>
  );
}
