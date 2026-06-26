import React from 'react';
import { useTranslation } from 'react-i18next';

interface ToolGroupDef {
  labelKey: string;
  tools: { name: string; descKey: string }[];
}

const TOOL_GROUP_DEFS: ToolGroupDef[] = [
  {
    labelKey: 'mcpSettings.toolGroups.author',
    tools: [
      { name: 'validate_openflow_dsl', descKey: 'mcpSettings.toolGroups.validateDsl' },
      { name: 'create_viewer_url', descKey: 'mcpSettings.toolGroups.createViewerUrl' },
    ],
  },
  {
    labelKey: 'mcpSettings.toolGroups.inspect',
    tools: [
      { name: 'analyze_codebase', descKey: 'mcpSettings.toolGroups.analyzeCodebase' },
      { name: 'find_icon', descKey: 'mcpSettings.toolGroups.findIcon' },
    ],
  },
  {
    labelKey: 'mcpSettings.toolGroups.discover',
    tools: [
      { name: 'list_starter_templates', descKey: 'mcpSettings.toolGroups.listStarterTemplates' },
      { name: 'get_starter_template', descKey: 'mcpSettings.toolGroups.getStarterTemplate' },
      { name: 'list_diagram_node_types', descKey: 'mcpSettings.toolGroups.listDiagramNodeTypes' },
      { name: 'server_info', descKey: 'mcpSettings.toolGroups.serverInfo' },
    ],
  },
];

interface MCPSettingsProps {
  /** 'page' hides the intro header (the standalone page supplies its own); 'panel' is the in-Settings tab. */
  variant?: 'page' | 'panel';
}

export function MCPSettings({ variant = 'panel' }: MCPSettingsProps = {}): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="space-y-8">
      {variant === 'panel' ? (
        <header className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-background)]/60 p-5">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--brand-primary)]">
            {t('mcpSettings.eyebrow')}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--brand-text)]">
            {t('mcpSettings.title')}
          </h3>
          <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-[var(--brand-secondary)]">
            {t('mcpSettings.intro')}
          </p>
        </header>
      ) : null}

      <div className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-background)]/60 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-[var(--brand-secondary)]">
          {t('mcpSettings.comingSoon')}
        </p>
      </div>

      <section aria-labelledby="mcp-tools-heading">
        <h4 id="mcp-tools-heading" className="text-[13px] font-semibold tracking-tight text-[var(--brand-text)]">
          {t('mcpSettings.toolsHeading')}
        </h4>
        <p className="mt-2 text-[12px] text-[var(--brand-secondary)]">
          {t('mcpSettings.toolsIntro')}
        </p>
        <div className="mt-4 divide-y divide-[var(--color-brand-border)] overflow-hidden rounded-lg border border-[var(--color-brand-border)] bg-[var(--brand-surface)]">
          {TOOL_GROUP_DEFS.map((group) => (
            <section key={group.labelKey} className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
              <header className="border-b border-[var(--color-brand-border)] bg-[var(--brand-background)]/40 px-4 py-3 sm:border-b-0 sm:border-r">
                <h5 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-text)]">
                  {t(group.labelKey)}
                </h5>
                <p className="mt-0.5 text-[10.5px] text-[var(--brand-secondary)]">
                  {t('mcpSettings.toolCount', { count: group.tools.length })}
                </p>
              </header>
              <ul className="divide-y divide-[var(--color-brand-border)]/60">
                {group.tools.map((tool) => (
                  <li
                    key={tool.name}
                    className="grid grid-cols-1 gap-0.5 px-4 py-2.5 sm:grid-cols-[1fr_auto] sm:items-baseline sm:gap-3"
                  >
                    <code className="font-mono text-[11.5px] font-semibold text-[var(--brand-text)]">
                      {tool.name}
                    </code>
                    <span className="text-[11.5px] text-[var(--brand-secondary)]">{t(tool.descKey)}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </div>
  );
}
