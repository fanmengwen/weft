import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';
import { useFlowStore } from '@/store';
import type { FlowTab } from '@/lib/types';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';
import { WELCOME_MODAL_ENABLED_STORAGE_KEY, WELCOME_SEEN_STORAGE_KEY } from './home/welcomeModalState';
import { recordOnboardingEvent } from '@/services/onboarding/events';
import { useWorkflowRunHistoryStore } from '@/workflow/history/workflowRunHistoryStore';

vi.mock('react-i18next', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-i18next')>();
    return {
        ...actual,
        useTranslation: () => ({
            t: (key: string, fallbackOrOptions?: string | Record<string, unknown>) => {
                if (typeof fallbackOrOptions === 'string') {
                    return fallbackOrOptions;
                }
                if (fallbackOrOptions && typeof fallbackOrOptions.defaultValue === 'string') {
                    let text = fallbackOrOptions.defaultValue;
                    for (const [name, value] of Object.entries(fallbackOrOptions)) {
                        if (name === 'defaultValue') {
                            continue;
                        }
                        text = text.replaceAll(`{{${name}}}`, String(value));
                    }
                    return text;
                }
                return key;
            },
            i18n: {
                language: 'en',
                changeLanguage: vi.fn(),
            },
        }),
    };
});

vi.mock('./LanguageSelector', () => ({
    LanguageSelector: () => null,
}));

describe('HomePage integration flows', () => {
    function setEmptyHomeState(): void {
        useFlowStore.setState({
            documents: [],
            trashedDocuments: [],
            activeDocumentId: '',
            tabs: [],
            activeTabId: null,
            nodes: [],
            edges: [],
        });
    }

    beforeEach(() => {
        localStorage.clear();
        localStorage.setItem(WELCOME_MODAL_ENABLED_STORAGE_KEY, 'false');
        localStorage.setItem(WELCOME_SEEN_STORAGE_KEY, 'true');
        useFlowStore.setState({});
        useWorkflowRunHistoryStore.setState({ records: [] });
    });

    async function renderHomePage(props?: Partial<React.ComponentProps<typeof HomePage>>): Promise<void> {
        await act(async () => {
            render(
                <MemoryRouter>
                    <HomePage
                        onLaunch={vi.fn()}
                        onLaunchWithTemplates={vi.fn()}
                        onLaunchWithTemplate={vi.fn()}
                        onLaunchWithAI={vi.fn()}
                        onImportJSON={vi.fn()}
                        onOpenFlow={vi.fn()}
                        {...props}
                    />
                </MemoryRouter>
            );
        });
    }

    function createDocumentFromPages(id: string, name: string, pages: FlowTab[]): FlowDocument {
        return {
            id,
            name,
            createdAt: '2026-03-27T00:00:00.000Z',
            updatedAt: pages[0]?.updatedAt ?? '2026-03-27T00:00:00.000Z',
            activePageId: pages[0]?.id ?? '',
            pages,
        };
    }

    it('switches between home, templates, and settings views via sidebar', async () => {
        await renderHomePage();

        fireEvent.click(screen.getByTestId('sidebar-templates'));
        expect(screen.getByRole('heading', { name: 'Templates' })).toBeTruthy();
        expect(screen.getByTestId('home-templates-view')).toBeTruthy();
        expect(screen.getByTestId('templates-tab-all')).toBeTruthy();

        fireEvent.click(screen.getByTestId('sidebar-settings'));
        expect(screen.getByRole('heading', { name: 'Settings' })).toBeTruthy();
        expect(screen.getByTestId('home-settings-view')).toBeTruthy();
        expect(screen.getByTestId('home-settings-nav')).toBeTruthy();
        expect(screen.getByText('AI')).toBeTruthy();
        expect(screen.getByText('About')).toBeTruthy();

        expect(screen.queryByText('V1.0')).toBeNull();
        fireEvent.click(screen.getByTestId('sidebar-brand-home'));
        expect(screen.getByRole('heading', { name: 'Home' })).toBeTruthy();
    });

    it('shows persisted workflow results and logs in the run center', async () => {
        const onOpenFlow = vi.fn();
        useWorkflowRunHistoryStore.getState().addRecord(
                {
                    id: 'run-1',
                    documentId: 'doc-1',
                    documentName: '联网热点简报',
                    status: 'succeeded',
                    startedAt: 100,
                    finishedAt: 240,
                    durationMs: 140,
                    inputSummary: '最近一周的 AI 动态',
                    finalOutput: '# AI 热点\n来源：https://example.com/news',
                    nodeRunStates: { input: 'succeeded', output: 'succeeded' },
                    nodeSnapshots: {
                        input: {
                            label: '简报主题',
                            kind: 'textInput',
                            inputSnapshot: '最近一周的 AI 动态',
                            outputSnapshot: '{"text":"最近一周的 AI 动态"}',
                        },
                        output: {
                            label: '简报结果',
                            kind: 'output',
                            outputSnapshot: '{"text":"# AI 热点"}',
                        },
                    },
                    logEntries: [
                        {
                            id: 'log-1',
                            ts: 200,
                            level: 'info',
                            nodeId: 'output',
                            nodeLabel: '简报结果',
                            messageKey: 'workflowMode.log.nodeSucceeded',
                            messageParams: { label: '简报结果' },
                        },
                    ],
                }
        );

        await renderHomePage({ activeTab: 'runs', onOpenFlow });

        expect(screen.getByTestId('runs-list')).toBeTruthy();
        expect(screen.getByTestId('runs-detail')).toBeTruthy();
        expect(screen.getAllByText('联网热点简报').length).toBeGreaterThan(0);
        expect(screen.getByText('AI 热点')).toBeTruthy();
        expect(screen.getAllByText(/example.com\/news/).length).toBeGreaterThan(0);
        expect(screen.getAllByText(/简报结果/).length).toBeGreaterThan(0);

        fireEvent.click(screen.getByTestId('run-node-output'));
        expect(screen.getByText(/\{"text":"# AI 热点"\}/)).toBeTruthy();

        fireEvent.click(screen.getByTestId('runs-log-toggle'));
        expect(screen.getByTestId('runs-logs')).toBeTruthy();

        fireEvent.click(screen.getByTestId('runs-open-workflow'));
        expect(onOpenFlow).toHaveBeenCalledWith('doc-1');

        fireEvent.click(screen.getByTestId('runs-filter-failed'));
        expect(screen.getByText('homeRuns.filterEmpty')).toBeTruthy();
        fireEvent.click(screen.getByTestId('runs-filter-all'));

        fireEvent.click(screen.getByTestId('runs-delete-record'));
        expect(screen.getByTestId('runs-empty')).toBeTruthy();
    });

    it('opens the selected template flow from the homepage templates tab', async () => {
        const onLaunchWithTemplate = vi.fn();

        await renderHomePage({ onLaunchWithTemplate });

        fireEvent.click(screen.getByTestId('sidebar-templates'));
        fireEvent.click(screen.getByTestId('templates-hero-use-leave-approval-flow'));
        fireEvent.click(screen.getByRole('button', { name: 'Use Template' }));

        expect(onLaunchWithTemplate).toHaveBeenCalledTimes(1);
        expect(onLaunchWithTemplate).toHaveBeenCalledWith('leave-approval-flow');
    });

    it('shows only explicitly featured templates on the homepage templates tab', async () => {
        await renderHomePage();

        fireEvent.click(screen.getByTestId('sidebar-templates'));

        expect(screen.getByTestId('templates-hero-leave-approval-flow')).toBeTruthy();
        expect(screen.getByTestId('templates-card-order-fulfillment-flow')).toBeTruthy();
        expect(screen.queryByText(/AWS Event-Driven SaaS Platform/i)).toBeNull();
    });

    it('exposes chart, workflow, and template entry points in the empty dashboard state', async () => {
        const onLaunch = vi.fn();
        const onLaunchWithTemplates = vi.fn();
        setEmptyHomeState();

        await renderHomePage({ onLaunch, onLaunchWithTemplates });

        fireEvent.click(await screen.findByTestId('home-create-chart'));
        fireEvent.click(screen.getByTestId('home-create-workflow'));
        fireEvent.click(screen.getByTestId('home-open-templates'));

        expect(onLaunch).toHaveBeenNthCalledWith(1, 'chart');
        expect(onLaunch).toHaveBeenNthCalledWith(2, 'workflow');
        expect(onLaunchWithTemplates).toHaveBeenCalledTimes(1);
    });

    it('keeps the empty dashboard focused on the primary actions', async () => {
        setEmptyHomeState();
        recordOnboardingEvent('welcome_prompt_selected', { source: 'welcome-modal' });
        recordOnboardingEvent('welcome_template_selected', { source: 'welcome-modal' });

        await renderHomePage();

        expect(screen.queryByText('Continue with a recent action')).toBeNull();
        expect(screen.getByTestId('home-create-chart')).toBeTruthy();
        expect(screen.getByTestId('home-create-workflow')).toBeTruthy();
        expect(screen.getByTestId('home-open-templates')).toBeTruthy();
        expect(screen.getByTestId('home-empty-state')).toBeTruthy();
    });

    it('opens persisted flows from the dashboard list', async () => {
        const onOpenFlow = vi.fn();
        useFlowStore.setState({
            documents: [
                createDocumentFromPages('tab-1', 'My Flow', [
                    {
                        id: 'tab-1',
                        name: 'My Flow',
                        diagramType: 'flowchart',
                        nodes: [],
                        edges: [],
                        history: { past: [], future: [] },
                    },
                ]),
            ],
            activeDocumentId: 'tab-1',
            tabs: [
                {
                    id: 'tab-1',
                    name: 'My Flow',
                    diagramType: 'flowchart',
                    nodes: [],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-1',
            nodes: [],
            edges: [],
        });

        await renderHomePage({ onOpenFlow });

        fireEvent.click(await screen.findByText('My Flow'));
        expect(onOpenFlow).toHaveBeenCalledWith('tab-1');
    });

    it('duplicates and deletes flows from the dashboard actions', async () => {
        const onOpenFlow = vi.fn();
        useFlowStore.setState({
            documents: [
                createDocumentFromPages('tab-1', 'Flow One', [
                    {
                        id: 'tab-1',
                        name: 'Flow One',
                        diagramType: 'flowchart',
                        updatedAt: '2026-03-07T00:00:00.000Z',
                        nodes: [],
                        edges: [],
                        history: { past: [], future: [] },
                    },
                ]),
                createDocumentFromPages('tab-2', 'Flow Two', [
                    {
                        id: 'tab-2',
                        name: 'Flow Two',
                        diagramType: 'flowchart',
                        updatedAt: '2026-03-06T00:00:00.000Z',
                        nodes: [],
                        edges: [],
                        history: { past: [], future: [] },
                    },
                ]),
            ],
            activeDocumentId: 'tab-1',
            tabs: [
                {
                    id: 'tab-1',
                    name: 'Flow One',
                    diagramType: 'flowchart',
                    updatedAt: '2026-03-07T00:00:00.000Z',
                    nodes: [],
                    edges: [],
                    history: { past: [], future: [] },
                },
                {
                    id: 'tab-2',
                    name: 'Flow Two',
                    diagramType: 'flowchart',
                    updatedAt: '2026-03-06T00:00:00.000Z',
                    nodes: [],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-1',
            nodes: [],
            edges: [],
        });

        await renderHomePage({ onOpenFlow });

        fireEvent.click(screen.getAllByLabelText('Duplicate')[0]);
        expect(onOpenFlow).toHaveBeenCalledTimes(1);

        const flowOneCard = screen.getByText('Flow One').closest('.group') as HTMLElement;
        fireEvent.click(within(flowOneCard).getByLabelText('Delete'));
        const deleteDialog = screen.getByRole('dialog', { name: 'Move to trash' });
        fireEvent.click(within(deleteDialog).getByRole('button', { name: 'Move to trash' }));
        expect(useFlowStore.getState().tabs.some((tab) => tab.id === 'tab-1')).toBe(false);
        expect(useFlowStore.getState().trashedDocuments.some((entry) => entry.document.id === 'tab-1')).toBe(true);
    });

    it('renames flows from the dashboard actions with an app-native dialog', async () => {
        useFlowStore.setState({
            documents: [
                createDocumentFromPages('tab-1', 'Flow One', [
                    {
                        id: 'tab-1',
                        name: 'Flow One',
                        diagramType: 'flowchart',
                        updatedAt: '2026-03-07T00:00:00.000Z',
                        nodes: [],
                        edges: [],
                        history: { past: [], future: [] },
                    },
                ]),
            ],
            activeDocumentId: 'tab-1',
            tabs: [
                {
                    id: 'tab-1',
                    name: 'Flow One',
                    diagramType: 'flowchart',
                    updatedAt: '2026-03-07T00:00:00.000Z',
                    nodes: [],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-1',
            nodes: [],
            edges: [],
        });

        await renderHomePage();

        const flowCard = screen.getByText('Flow One').closest('.group') as HTMLElement;
        fireEvent.click(within(flowCard).getByLabelText('Rename'));

        const renameDialog = screen.getByRole('dialog', { name: 'Rename flow' });
        const renameInput = within(renameDialog).getByLabelText('Flow name');
        fireEvent.change(renameInput, { target: { value: '  Renamed Flow  ' } });
        fireEvent.click(within(renameDialog).getByRole('button', { name: 'Save' }));

        expect(useFlowStore.getState().tabs[0]?.name).toBe('Renamed Flow');
        expect(screen.getByText('Renamed Flow')).toBeTruthy();
    });

    it('removes the final remaining flow and shows the empty dashboard state when deleted', async () => {
        useFlowStore.setState({
            documents: [
                createDocumentFromPages('tab-1', 'Solo Flow', [
                    {
                        id: 'tab-1',
                        name: 'Solo Flow',
                        diagramType: 'flowchart',
                        updatedAt: '2026-03-07T00:00:00.000Z',
                        nodes: [],
                        edges: [],
                        history: { past: [], future: [] },
                    },
                ]),
            ],
            activeDocumentId: 'tab-1',
            tabs: [
                {
                    id: 'tab-1',
                    name: 'Solo Flow',
                    diagramType: 'flowchart',
                    updatedAt: '2026-03-07T00:00:00.000Z',
                    nodes: [],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-1',
            nodes: [],
            edges: [],
        });

        await renderHomePage();

        const flowCard = screen.getByText('Solo Flow').closest('.group') as HTMLElement;
        fireEvent.click(within(flowCard).getByLabelText('Delete'));

        const deleteDialog = screen.getByRole('dialog', { name: 'Move to trash' });
        fireEvent.click(within(deleteDialog).getByRole('button', { name: 'Move to trash' }));

        const { tabs, activeTabId, nodes, edges, trashedDocuments } = useFlowStore.getState();
        expect(tabs).toHaveLength(0);
        expect(activeTabId).toBe('');
        expect(nodes).toHaveLength(0);
        expect(edges).toHaveLength(0);
        expect(trashedDocuments).toHaveLength(1);
        expect(trashedDocuments[0]?.document.name).toBe('Solo Flow');
        expect(screen.queryByText('Solo Flow')).toBeNull();
        expect(screen.getByTestId('home-empty-state')).toBeTruthy();
        expect(screen.getByTestId('home-create-chart')).toBeTruthy();
    });

    it('lists soft-deleted flows in trash and restores them', async () => {
        useFlowStore.setState({
            documents: [
                createDocumentFromPages('tab-1', 'Trashable Flow', [
                    {
                        id: 'tab-1',
                        name: 'Trashable Flow',
                        diagramType: 'flowchart',
                        updatedAt: '2026-03-07T00:00:00.000Z',
                        nodes: [],
                        edges: [],
                        history: { past: [], future: [] },
                    },
                ]),
            ],
            trashedDocuments: [],
            activeDocumentId: 'tab-1',
            tabs: [
                {
                    id: 'tab-1',
                    name: 'Trashable Flow',
                    diagramType: 'flowchart',
                    updatedAt: '2026-03-07T00:00:00.000Z',
                    nodes: [],
                    edges: [],
                    history: { past: [], future: [] },
                },
            ],
            activeTabId: 'tab-1',
            nodes: [],
            edges: [],
        });

        await renderHomePage();

        const flowCard = screen.getByText('Trashable Flow').closest('.group') as HTMLElement;
        fireEvent.click(within(flowCard).getByLabelText('Delete'));
        fireEvent.click(
            within(screen.getByRole('dialog', { name: 'Move to trash' })).getByRole('button', {
                name: 'Move to trash',
            })
        );

        fireEvent.click(screen.getByTestId('sidebar-trash'));
        expect(screen.getByTestId('home-trash-item-tab-1')).toBeTruthy();
        fireEvent.click(screen.getByTestId('home-trash-restore-tab-1'));

        expect(useFlowStore.getState().documents.some((doc) => doc.id === 'tab-1')).toBe(true);
        expect(useFlowStore.getState().trashedDocuments).toHaveLength(0);
    });
});
