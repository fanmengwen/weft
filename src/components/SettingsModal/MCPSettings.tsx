import React from 'react';
import { useTranslation } from 'react-i18next';

interface ToolGroup {
  label: string;
  tools: { name: string; desc: string }[];
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    label: 'Author',
    tools: [
      { name: 'validate_openflow_dsl', desc: 'Lint and validate agent-authored DSL' },
      { name: 'create_viewer_url', desc: 'Turn DSL into a shareable Weft link' },
    ],
  },
  {
    label: 'Inspect',
    tools: [
      { name: 'analyze_codebase', desc: 'Summarize codebase structure for diagramming' },
      { name: 'find_icon', desc: 'Find exact cloud and developer icon slugs' },
    ],
  },
  {
    label: 'Discover',
    tools: [
      { name: 'list_starter_templates', desc: 'List available diagram templates' },
      { name: 'get_starter_template', desc: 'Fetch a specific template by name' },
      { name: 'list_diagram_node_types', desc: 'List supported node types and shapes' },
      { name: 'server_info', desc: 'Server version and capability info' },
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
            {t('mcpSettings.eyebrow', 'Model Context Protocol')}
          </p>
          <h3 className="mt-1 text-base font-semibold tracking-tight text-[var(--brand-text)]">
            {t('mcpSettings.title', 'Connect AI tools (MCP)')}
          </h3>
          <p className="mt-2 max-w-prose text-[13px] leading-relaxed text-[var(--brand-secondary)]">
            {t(
              'mcpSettings.intro',
              'Give Claude, Cursor, Windsurf, or any MCP client first-class diagramming tools. Your assistant authors diagrams while Weft supplies local validation, templates, icon lookup, and viewer links.',
            )}
          </p>
        </header>
      ) : null}

      <div className="rounded-xl border border-[var(--color-brand-border)] bg-[var(--brand-background)]/60 px-4 py-3">
        <p className="text-[13px] leading-relaxed text-[var(--brand-secondary)]">
          {t(
            'mcpSettings.comingSoon',
            'MCP integration is on the roadmap. This release focuses on in-canvas AI generation, editing, and export — connect external agents when the server ships.',
          )}
        </p>
      </div>

      <section aria-labelledby="mcp-tools-heading">
        <h4 id="mcp-tools-heading" className="text-[13px] font-semibold tracking-tight text-[var(--brand-text)]">
          {t('mcpSettings.toolsHeading', 'Tools your assistant will use')}
        </h4>
        <p className="mt-2 text-[12px] text-[var(--brand-secondary)]">
          {t(
            'mcpSettings.toolsIntro',
            'Planned capabilities for agent-driven diagramming. Your assistant picks the right tool based on your request.',
          )}
        </p>
        <div className="mt-4 divide-y divide-[var(--color-brand-border)] overflow-hidden rounded-lg border border-[var(--color-brand-border)] bg-[var(--brand-surface)]">
          {TOOL_GROUPS.map((group) => (
            <section key={group.label} className="grid grid-cols-1 sm:grid-cols-[140px_1fr]">
              <header className="border-b border-[var(--color-brand-border)] bg-[var(--brand-background)]/40 px-4 py-3 sm:border-b-0 sm:border-r">
                <h5 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--brand-text)]">
                  {group.label}
                </h5>
                <p className="mt-0.5 text-[10.5px] text-[var(--brand-secondary)]">
                  {group.tools.length} {group.tools.length === 1 ? 'tool' : 'tools'}
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
                    <span className="text-[11.5px] text-[var(--brand-secondary)]">{tool.desc}</span>
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
