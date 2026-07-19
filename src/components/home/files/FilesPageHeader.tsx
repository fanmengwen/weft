import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentKind } from '../documentKindStorage';
import { FilesSearchIcon } from './FilesKindIcons';
import { FilesNewMenu } from './FilesNewMenu';

interface FilesPageHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  onCreate: (kind: DocumentKind) => void;
}

export function FilesPageHeader({
  query,
  onQueryChange,
  onCreate,
}: FilesPageHeaderProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
      <h1 className="m-0 text-[21px] font-bold tracking-tight text-[var(--brand-text)]">
        {t('nav.files', 'My files')}
      </h1>
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex h-8 w-full max-w-[220px] items-center gap-[7px] rounded-lg border border-[#D8DCE2] bg-white px-2.5 dark:border-[var(--color-brand-border)] dark:bg-[var(--brand-surface)] sm:w-[220px]">
          <FilesSearchIcon />
          <span className="sr-only">{t('homeFiles.search', 'Search files')}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder={t('homeFiles.search', 'Search files')}
            data-testid="files-search"
            className="min-w-0 flex-1 border-none bg-transparent text-[13px] text-[var(--brand-text)] outline-none placeholder:text-[#9BA3AE]"
          />
        </label>
        <FilesNewMenu onCreate={onCreate} />
      </div>
    </div>
  );
}
