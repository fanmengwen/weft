import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
    ArrowRight,
    Compass,
    Import,
    Search,
    Settings,
    Shield,
    WandSparkles,
    Workflow,
} from 'lucide-react';
import { useFlowStore } from '@/store';
import { AI_ASSISTANT_NAME } from '@/lib/brand';
import type { CommandItem, CommandBarProps } from './types';
import { AssetsIcon } from '../icons/AssetsIcon';

interface UseCommandBarCommandsParams {
    settings?: CommandBarProps['settings'];
    onUndo?: CommandBarProps['onUndo'];
    onRedo?: CommandBarProps['onRedo'];
    onOpenStudioAI?: CommandBarProps['onOpenStudioAI'];
    onOpenArchitectureRules?: CommandBarProps['onOpenArchitectureRules'];
    hasImport?: boolean;
}

export function useCommandBarCommands({
    settings,
    onUndo,
    onRedo,
    onOpenStudioAI,
    onOpenArchitectureRules,
    hasImport = false,
}: UseCommandBarCommandsParams): CommandItem[] {
    const { t } = useTranslation();

    return useMemo(() => {
        const importCommands: CommandItem[] = hasImport
            ? [{
                id: 'import',
                label: 'Import from data',
                icon: <Import className="w-4 h-4 text-violet-500" />,
                tier: 'core',
                type: 'navigation',
                view: 'import',
                description: 'SQL -> ERD, Terraform -> Cloud, OpenAPI -> Sequence, Code -> Architecture',
                badge: 'Beta',
            }]
            : [];

        const settingsCommands: CommandItem[] = settings
            ? [
                {
                    id: 'toggle-grid',
                    label: 'Show Grid',
                    icon: <Settings className="w-4 h-4 text-[var(--brand-secondary)]" />,
                    tier: 'advanced',
                    type: 'toggle',
                    value: settings.showGrid,
                    action: settings.onToggleGrid,
                    description: settings.showGrid ? 'On' : 'Off',
                    hidden: true,
                },
                {
                    id: 'toggle-snap',
                    label: 'Snap to Grid',
                    icon: <Settings className="w-4 h-4 text-[var(--brand-secondary)]" />,
                    tier: 'advanced',
                    type: 'toggle',
                    value: settings.snapToGrid,
                    action: settings.onToggleSnap,
                    description: settings.snapToGrid ? 'On' : 'Off',
                    hidden: true,
                },
            ]
            : [];

        return [
            {
                id: 'studio-ai',
                label: t('commandBar.commands.openAIAssistant', {
                    defaultValue: `Open ${AI_ASSISTANT_NAME}`,
                }),
                icon: <WandSparkles className="w-4 h-4 text-[var(--brand-primary)]" />,
                tier: 'core',
                type: 'action',
                description: t('commandBar.commands.openAIAssistantDesc', {
                    defaultValue: 'Open the AI assistant in the right rail',
                }),
                action: onOpenStudioAI,
            },
            ...importCommands,
            {
                id: 'templates',
                label: 'Start from Template',
                icon: <Compass className="w-4 h-4 text-blue-500" />,
                tier: 'core',
                type: 'navigation',
                description: 'Browse pre-built flows and starter layouts',
                view: 'templates',
            },
            {
                id: 'assets',
                label: 'Assets',
                icon: <AssetsIcon className="w-4 h-4 text-[var(--brand-primary)]" />,
                tier: 'advanced',
                type: 'navigation',
                view: 'assets',
                description: 'Notes, sections, and media',
            },
            {
                id: 'search-nodes',
                label: 'Search Nodes',
                icon: <Search className="w-4 h-4 text-[var(--brand-primary-400)]" />,
                tier: 'core',
                shortcut: '⌘F',
                type: 'navigation',
                view: 'search',
                description: 'Find nodes already on the canvas',
            },
            {
                id: 'layout',
                label: 'Auto Layout',
                icon: <Workflow className="w-4 h-4 text-sky-500" />,
                tier: 'core',
                type: 'navigation',
                view: 'layout',
                description: 'Arrange the current flow automatically',
            },
            {
                id: 'architecture-rules',
                label: 'Architecture Rules',
                icon: <Shield className="w-4 h-4 text-amber-500" />,
                tier: 'advanced',
                type: 'action',
                description: 'Open architecture guardrails and rule templates',
                action: onOpenArchitectureRules,
            },
            ...settingsCommands,
            {
                id: 'undo',
                label: 'Undo',
                icon: <ArrowRight className="w-4 h-4 rotate-180 text-[var(--brand-secondary)]" />,
                tier: 'advanced',
                shortcut: '⌘Z',
                type: 'action',
                action: onUndo,
                hidden: true,
            },
            {
                id: 'redo',
                label: 'Redo',
                icon: <ArrowRight className="w-4 h-4 text-[var(--brand-secondary)]" />,
                tier: 'advanced',
                shortcut: '⌘Y',
                type: 'action',
                action: onRedo,
                hidden: true,
            },
            {
                id: 'select-all-edges',
                label: 'Select All Edges',
                icon: <ArrowRight className="w-4 h-4 text-cyan-500" />,
                tier: 'advanced',
                type: 'action',
                description: 'Highlight all connections',
                action: () => {
                    const { edges, setEdges } = useFlowStore.getState();
                    setEdges(edges.map((edge) => ({ ...edge, selected: true })));
                },
                hidden: true,
            },
        ];
    }, [
        hasImport,
        onOpenArchitectureRules,
        onOpenStudioAI,
        onRedo,
        onUndo,
        settings,
        t,
    ]);
}
