import React from 'react';
import { useTranslation } from 'react-i18next';
import { APP_NAME } from '@/lib/brand';
import type { HomePageTab } from './homeTabs';
import {
  SidebarBrandMark,
  SidebarFilesIcon,
  SidebarHomeIcon,
  SidebarRunsIcon,
  SidebarSettingsIcon,
  SidebarTemplatesIcon,
  SidebarTrashIcon,
} from './homeSidebarIcons';
import { SidebarNavButton, type SidebarNavEntry } from './homeSidebarNav';

interface HomeSidebarProps {
  activeTab: HomePageTab;
  onTabChange: (tab: HomePageTab) => void;
}

export function HomeSidebar({
  activeTab,
  onTabChange,
}: HomeSidebarProps): React.ReactElement {
  const { t } = useTranslation();
  const appName = t('home.appName', APP_NAME);

  const primaryItems: SidebarNavEntry[] = [
    {
      tab: 'home',
      label: t('nav.home', 'Home'),
      testId: 'sidebar-home',
      icon: <SidebarHomeIcon />,
    },
    {
      tab: 'files',
      label: t('nav.files', 'My files'),
      testId: 'sidebar-files',
      icon: <SidebarFilesIcon />,
    },
    {
      tab: 'templates',
      label: t('nav.templates', 'Templates'),
      testId: 'sidebar-templates',
      icon: <SidebarTemplatesIcon />,
    },
    {
      tab: 'runs',
      label: t('nav.runs', 'Run center'),
      testId: 'sidebar-runs',
      icon: <SidebarRunsIcon />,
      trailing: (
        <span
          className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#C4443C]"
          aria-hidden="true"
        />
      ),
    },
  ];

  const secondaryItems: SidebarNavEntry[] = [
    {
      tab: 'trash',
      label: t('nav.trash', 'Trash'),
      testId: 'sidebar-trash',
      icon: <SidebarTrashIcon />,
    },
    {
      tab: 'settings',
      label: t('nav.settings', 'Settings'),
      testId: 'sidebar-settings',
      icon: <SidebarSettingsIcon />,
    },
    {
      tab: 'account',
      label: t('nav.account', 'Account'),
      testId: 'sidebar-account',
      icon: (
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F0F2F5] text-[10.5px] font-semibold text-[#5C6572] dark:bg-[color-mix(in_srgb,var(--brand-secondary),transparent_85%)] dark:text-[var(--brand-secondary)]">
          {t('nav.accountInitial', 'F')}
        </span>
      ),
    },
  ];

  return (
    <aside
      className="sticky top-0 z-20 flex w-full flex-col border-b border-[#E6E8EC] bg-white dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)] md:fixed md:inset-y-0 md:left-0 md:w-[232px] md:border-b-0 md:border-r"
      data-testid="home-sidebar"
    >
      <div className="flex h-[52px] shrink-0 items-center gap-2 border-b border-[#EEF0F4] px-4 dark:border-[var(--color-brand-border)]">
        <SidebarBrandMark />
        <span className="truncate text-[15px] font-semibold text-[#171D26] dark:text-[var(--brand-text)]">
          {appName}
        </span>
        <span className="rounded-[5px] bg-[#F0F2F5] px-1.5 py-0.5 text-[10.5px] font-medium text-[#6B7484] dark:bg-[color-mix(in_srgb,var(--brand-secondary),transparent_85%)] dark:text-[var(--brand-secondary)]">
          V1.0
        </span>
      </div>

      <nav
        className="flex min-h-0 flex-1 flex-col gap-0.5 overflow-y-auto px-2.5 py-3"
        aria-label={t('nav.primaryNav', 'Primary')}
      >
        {primaryItems.map((item) => (
          <SidebarNavButton
            key={item.testId}
            item={item}
            isActive={activeTab === item.tab}
            onClick={() => onTabChange(item.tab)}
          />
        ))}
      </nav>

      <div className="flex shrink-0 flex-col gap-0.5 border-t border-[#EEF0F4] px-2.5 py-3 dark:border-[var(--color-brand-border)]">
        {secondaryItems.map((item) => (
          <SidebarNavButton
            key={item.testId}
            item={item}
            isActive={activeTab === item.tab}
            onClick={() => onTabChange(item.tab)}
          />
        ))}
      </div>
    </aside>
  );
}
