import React from 'react';
import { useTranslation } from 'react-i18next';
import type { DocumentKind } from './documentKindStorage';
import {
  getShowcaseTemplatesByKind,
  type HomeShowcaseTemplate,
} from './homeShowcase';
import {
  FlowGroupIcon,
  WorkflowGroupIcon,
  showcaseRowIcon,
} from './homeShowcaseIcons';

interface HomeShowcaseTemplateGroupsProps {
  onSelect: (kind: DocumentKind, templateId?: string) => void;
}

const TONE = {
  chart: { fg: '#3663C9', bg: '#E4EBFA' },
  workflow: { fg: '#6250C9', bg: '#ECE9FA' },
} as const;

function ShowcaseGroup({
  kind,
  titleKey,
  headerIcon,
  items,
  onSelect,
}: {
  kind: DocumentKind;
  titleKey: string;
  headerIcon: React.ReactElement;
  items: readonly HomeShowcaseTemplate[];
  onSelect: (kind: DocumentKind, templateId?: string) => void;
}): React.ReactElement {
  const { t } = useTranslation();
  const tone = TONE[kind];

  return (
    <div className="overflow-hidden rounded-xl border border-[#E6E8EC] bg-white">
      <div className="flex h-[42px] items-center gap-2 border-b border-[#EEF0F4] px-3.5">
        <div
          className="flex h-[22px] w-[22px] items-center justify-center rounded-md"
          style={{ backgroundColor: tone.bg, color: tone.fg }}
        >
          {headerIcon}
        </div>
        <span className="text-[13px] font-semibold text-[var(--brand-text)]">{t(titleKey)}</span>
      </div>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          data-testid={`home-showcase-${item.id}`}
          onClick={() => onSelect(item.kind, item.templateId)}
          className={[
            'flex w-full items-center gap-[11px] px-3.5 py-3 text-left text-[var(--brand-text)] transition-colors hover:bg-[#F8F9FB] focus-visible:bg-[#F8F9FB] focus-visible:outline-none',
            index > 0 ? 'border-t border-[#F3F5F8]' : '',
          ].join(' ')}
        >
          <div
            className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: tone.bg, color: tone.fg }}
          >
            {showcaseRowIcon(item)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[13px] font-semibold leading-[1.35]">{t(item.titleKey)}</div>
            <div className="mt-px text-[11.5px] text-[#98A1AE]">{t(item.descriptionKey)}</div>
          </div>
          <span className="shrink-0 text-[12.5px] font-medium text-[var(--brand-primary)]">
            {t('home.useTemplate', 'Use')}
          </span>
        </button>
      ))}
    </div>
  );
}

export function HomeShowcaseTemplateGroups({
  onSelect,
}: HomeShowcaseTemplateGroupsProps): React.ReactElement {
  return (
    <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
      <ShowcaseGroup
        kind="chart"
        titleKey="home.showcase.flowGroup"
        headerIcon={<FlowGroupIcon />}
        items={getShowcaseTemplatesByKind('chart')}
        onSelect={onSelect}
      />
      <ShowcaseGroup
        kind="workflow"
        titleKey="home.showcase.workflowGroup"
        headerIcon={<WorkflowGroupIcon />}
        items={getShowcaseTemplatesByKind('workflow')}
        onSelect={onSelect}
      />
    </div>
  );
}
