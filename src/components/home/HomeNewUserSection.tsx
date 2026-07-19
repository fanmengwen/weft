import React from 'react';
import { Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ExamplePreview, KindBadge } from './HomeExamplePreviews';
import { HOME_EXAMPLE_CARDS } from './homeShowcase';
import { HomeShowcaseTemplateGroups } from './HomeShowcaseTemplateGroups';
import type { DocumentKind } from './documentKindStorage';

interface HomeNewUserSectionProps {
  onOpenTemplates: () => void;
  onUseTemplate: (templateId: string) => void;
  onCreate: (kind: DocumentKind) => void;
}

export function HomeNewUserSection({
  onOpenTemplates,
  onUseTemplate,
  onCreate,
}: HomeNewUserSectionProps): React.ReactElement {
  const { t } = useTranslation();

  function handleShowcase(kind: DocumentKind, templateId?: string): void {
    if (templateId) {
      onUseTemplate(templateId);
      return;
    }
    onCreate(kind);
  }

  return (
    <div data-testid="home-empty-state">
      <div className="mt-8 text-sm font-semibold text-[var(--brand-text)]">
        {t('home.examples.title', 'See what Weft can do')}
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3.5 sm:grid-cols-2">
        {HOME_EXAMPLE_CARDS.map((example) => {
          const kindLabel =
            example.kind === 'chart'
              ? t('home.kind.chart', 'Flowchart')
              : t('home.kind.workflow', 'Workflow');
          return (
            <div
              key={example.id}
              className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-surface)] p-3.5 transition-all duration-150 hover:border-[color-mix(in_srgb,var(--color-brand-border),var(--brand-text)_12%)] hover:shadow-[0_4px_12px_rgba(16,24,40,0.07)]"
            >
              <ExamplePreview kind={example.kind} />
              <div className="mt-3 flex items-center gap-1.5">
                <span className="text-[13.5px] font-semibold text-[var(--brand-text)]">
                  {t(example.titleKey)}
                </span>
                <span className="rounded-full border border-[var(--color-brand-border)] px-[7px] py-0.5 text-[10.5px] font-medium text-[var(--brand-secondary)]">
                  {t('home.examples.sample', 'Sample')}
                </span>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <KindBadge kind={example.kind} label={kindLabel} />
                <button
                  type="button"
                  data-testid={`home-example-${example.id}`}
                  onClick={() => handleShowcase(example.kind, example.templateId)}
                  className="inline-flex items-center gap-1 text-[12.5px] font-medium text-[var(--brand-primary)] transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:underline"
                >
                  {example.kind === 'workflow' ? (
                    <Play className="h-2.5 w-2.5 fill-current" />
                  ) : null}
                  {t(example.actionKey)}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm font-semibold text-[var(--brand-text)]">
          {t('home.templatesOrStart', 'Or start from a template')}
        </span>
        <button
          type="button"
          data-testid="home-open-templates"
          onClick={onOpenTemplates}
          className="text-[12.5px] font-medium text-[var(--brand-primary)] transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:underline"
        >
          {t('home.allTemplates', 'All templates')}
        </button>
      </div>

      <HomeShowcaseTemplateGroups onSelect={handleShowcase} />
    </div>
  );
}
