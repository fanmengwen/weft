import type { DesignSystem, GlobalEdgeOptions } from '@/lib/types';
import { isAIProvider, sanitizeAISettings } from './aiSettings';
import type { AIProvider, AISettings, Layer, ViewSettings } from './types';

export const DEFAULT_DESIGN_SYSTEM: DesignSystem = {
    id: 'default',
    name: 'Weft Default',
    description: 'The default Weft design system.',
    colors: {
        primary: '#6366f1',
        secondary: '#64748b',
        accent: '#f43f5e',
        background: '#f8fafc',
        surface: '#ffffff',
        border: '#e2e8f0',
        text: {
            primary: '#0f172a',
            secondary: '#475569',
        },
        nodeBackground: '#ffffff',
        nodeBorder: '#e2e8f0',
        nodeText: '#0f172a',
        edge: '#94a3b8',
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
        fontSize: {
            sm: '12px',
            md: '14px',
            lg: '16px',
            xl: '20px',
        },
    },
    components: {
        node: {
            borderRadius: '8px',
            borderWidth: '1px',
            boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.08), 0 4px 8px -2px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(0 0 0 / 0.04)',
            padding: '1rem',
        },
        edge: {
            strokeWidth: 2,
        },
    },
};

// The provider selected on a fresh load (empty storage). Seeded from
// VITE_DEFAULT_AI_PROVIDER so a deployment can be usable on startup with no
// in-app configuration; falls back to gemini for unset or invalid values.
export function resolveDefaultAIProvider(value: unknown): AIProvider {
    return isAIProvider(value) ? value : 'gemini';
}

function readStringEnv(value: unknown): string | undefined {
    return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

interface AISettingsEnv {
    VITE_DEFAULT_AI_PROVIDER?: unknown;
    VITE_CUSTOM_AI_BASE_URL?: unknown;
    VITE_CUSTOM_AI_MODEL?: unknown;
    VITE_CUSTOM_AI_API_KEY?: unknown;
    // Accept the broader import.meta.env shape (whose DEV/PROD are booleans)
    // without tripping TypeScript's weak-type check on the call site.
    [key: string]: unknown;
}

// Seed the initial AI settings from env so a deployment can generate on startup
// with no in-app configuration. For the custom provider we hydrate the
// OpenAI-compatible endpoint (base URL / model / key) from VITE_CUSTOM_AI_* — the
// same fields the readiness gate and aiService read — so generation is unblocked.
export function buildDefaultAISettings(env: AISettingsEnv): AISettings {
    const provider = resolveDefaultAIProvider(env.VITE_DEFAULT_AI_PROVIDER);
    const seed: Partial<AISettings> = { provider };
    if (provider === 'custom') {
        seed.customBaseUrl = readStringEnv(env.VITE_CUSTOM_AI_BASE_URL);
        seed.model = readStringEnv(env.VITE_CUSTOM_AI_MODEL);
        seed.apiKey = readStringEnv(env.VITE_CUSTOM_AI_API_KEY);
    }
    return sanitizeAISettings(seed, {
        provider: 'gemini',
        storageMode: 'local',
        apiKey: undefined,
        model: undefined,
        customBaseUrl: undefined,
        customHeaders: [],
    });
}

export const DEFAULT_AI_SETTINGS: AISettings = buildDefaultAISettings(import.meta.env);

export const INITIAL_VIEW_SETTINGS: ViewSettings = {
    showGrid: true,
    snapToGrid: true,
    alignmentGuidesEnabled: true,
    isShortcutsHelpOpen: false,
    defaultIconsEnabled: true,
    smartRoutingEnabled: true,
    smartRoutingProfile: 'standard',
    smartRoutingBundlingEnabled: false,
    architectureStrictMode: false,
    mermaidImportMode: 'renderer_first',
    largeGraphSafetyMode: 'auto',
    largeGraphSafetyProfile: 'balanced',
    exportSerializationMode: 'deterministic',
    language: 'en',
    lintRules: '',
};

export const INITIAL_GLOBAL_EDGE_OPTIONS: GlobalEdgeOptions = {
    // Mermaid-parity default: smooth B-spline through the routing corridor.
    // Matches Mermaid's `flowchart.curve = 'basis'` baseline so a fresh diagram
    // looks like the Mermaid render users compare us against.
    type: 'bezier',
    curve: 'basis',
    animated: false,
    strokeWidth: 1.5,
};

export const INITIAL_LAYERS: Layer[] = [
    {
        id: 'default',
        name: 'Default',
        visible: true,
        locked: false,
    },
];