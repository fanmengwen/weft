import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HomePage } from './HomePage';
import { useFlowStore } from '@/store';
import type { FlowTab } from '@/lib/types';
import type { FlowDocument } from '@/services/storage/flowDocumentModel';
import { WELCOME_MODAL_ENABLED_STORAGE_KEY, WELCOME_SEEN_STORAGE_KEY } from './home/welcomeModalState';
import { recordOnboardingEvent } from '@/services/onboarding/events';

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
