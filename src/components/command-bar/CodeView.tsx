import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Code2, FileCode, AlertCircle, BookOpen, Loader2, Play } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ViewHeader } from './ViewHeader';
import { toMermaid } from '../../services/exportService';
import { toOpenFlowDSL } from '../../services/openFlowDSLExporter';
import {
    getLineSelectionRange,
    groupArchitectureStrictModeDiagnostics,
} from '@/services/mermaid/strictModeDiagnosticsPresentation';
import { buildArchitectureStrictModeGuidance } from '@/services/mermaid/strictModeGuidance';
import { type ParseDiagnostic } from '@/lib/openFlowDSLParser';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { useFlowStore } from '../../store';
import { useToast } from '../ui/ToastContext';
import { ROLLOUT_FLAGS } from '@/config/rolloutFlags';
import type { FlowEdge, FlowNode } from '@/lib/types';
import { applyCodeChanges } from './applyCodeChanges';

interface CodeViewProps {
    mode: 'mermaid' | 'flowmind';
    nodes: FlowNode[];
    edges: FlowEdge[];
    onApply: (nodes: FlowNode[], edges: FlowEdge[]) => void;
    onClose: () => void;
    handleBack: () => void;
}

export const CodeView = ({
    mode,
    nodes,
    edges,
    onApply,
    onClose,
    handleBack
}: CodeViewProps) => {
    const { t } = useTranslation();
    const {
        brandConfig,
        activeTabId,
        updateTab,
        viewSettings,
        setMermaidDiagnostics,
        clearMermaidDiagnostics,
    } = useFlowStore();
    const { addToast } = useToast();
    const [code, setCode] = useState(() => {
        const liveModeEnabled = mode === 'mermaid' && ROLLOUT_FLAGS.mermaidSyncV1;
        return liveModeEnabled ? toMermaid(nodes, edges) : '';
    });
    const [error, setError] = useState<string | null>(null);
    const [diagnostics, setDiagnostics] = useState<ParseDiagnostic[]>([]);
    const [isApplying, setIsApplying] = useState(false);
    const [liveStatus, setLiveStatus] = useState<'idle' | 'typing' | 'applying' | 'synced' | 'error'>('idle');
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const liveApplyTimerRef = useRef<number | undefined>(undefined);
    const liveApplyRequestRef = useRef(0);
    const isLiveMermaidEnabled = mode === 'mermaid' && ROLLOUT_FLAGS.mermaidSyncV1;

    useEffect(() => {
        return () => {
            if (liveApplyTimerRef.current !== undefined) {
                window.clearTimeout(liveApplyTimerRef.current);
            }
        };
    }, []);

    const handleChange = (val: string) => {
        setCode(val);
        if (error) {
            setError(null);
            setDiagnostics([]);
        }
        if (isLiveMermaidEnabled) {
            setLiveStatus(val.trim().length === 0 ? 'idle' : 'typing');
        }
    };

    const handleApply = useCallback(async (
        options: {
            closeOnSuccess: boolean;
            source: 'manual' | 'live';
            liveRequestId?: number;
        } = { closeOnSuccess: true, source: 'manual' }
    ) => {
        await applyCodeChanges({
            mode,
            code,
            architectureStrictMode: viewSettings.architectureStrictMode,
            onApply,
            onClose,
            activeTabId,
            updateTab,
            setMermaidDiagnostics,
            clearMermaidDiagnostics,
            addToast,
            setError,
            setDiagnostics,
            setIsApplying,
            setLiveStatus,
            isLiveRequestStale: (requestId, source) => {
                if (source !== 'live' || typeof requestId !== 'number') return false;
                return requestId !== liveApplyRequestRef.current;
            },
            options,
        });
    }, [
        mode,
        code,
        viewSettings.architectureStrictMode,
        clearMermaidDiagnostics,
        setMermaidDiagnostics,
        onApply,
        updateTab,
        activeTabId,
        addToast,
        onClose,
    ]);

    useEffect(() => {
        if (!isLiveMermaidEnabled) return;
        if (code.trim().length === 0) {
            return;
        }
        if (liveApplyTimerRef.current !== undefined) {
            window.clearTimeout(liveApplyTimerRef.current);
        }
        const requestId = liveApplyRequestRef.current + 1;
        liveApplyRequestRef.current = requestId;
        liveApplyTimerRef.current = window.setTimeout(() => {
            void handleApply({ closeOnSuccess: false, source: 'live', liveRequestId: requestId });
        }, 700);
    }, [code, isLiveMermaidEnabled, handleApply]);

    // prevent propagation for critical keys
    const handleKeyDown = (e: React.KeyboardEvent) => {
        // Allow navigation and deletion within the textarea without bubbling
        if (['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.stopPropagation();
        }
        // Allow copy/paste/select-all
        if ((e.metaKey || e.ctrlKey) && ['a', 'c', 'v', 'x', 'z', 'y'].includes(e.key.toLowerCase())) {
            e.stopPropagation();
        }

        // Apply
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            void handleApply({ closeOnSuccess: true, source: 'manual' });
        }
    };

    const isArchitectureStrictModeError = mode === 'mermaid' && Boolean(error?.includes('strict mode rejected'));
    const strictModeGuidance = isArchitectureStrictModeError
        ? buildArchitectureStrictModeGuidance(diagnostics)
        : [];
    const groupedStrictDiagnostics = useMemo(
        () => (isArchitectureStrictModeError ? groupArchitectureStrictModeDiagnostics(diagnostics) : []),
        [isArchitectureStrictModeError, diagnostics]
    );

    const jumpToDiagnosticLine = useCallback((line: number) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const range = getLineSelectionRange(code, line);
        if (!range) return;

        textarea.focus();
        textarea.setSelectionRange(range.start, range.end);
    }, [code]);

    const liveStatusLabel = useMemo(() => {
        if (!isLiveMermaidEnabled) return null;
        if (liveStatus === 'typing') {
            return t('commandBar.code.liveStatus.typing', { defaultValue: 'Typing...' });
        }
        if (liveStatus === 'applying') {
            return t('commandBar.code.liveStatus.applying', { defaultValue: 'Applying...' });
        }
        if (liveStatus === 'synced') {
            return t('commandBar.code.liveStatus.synced', { defaultValue: 'Synced' });
        }
        if (liveStatus === 'error') {
            return t('commandBar.code.liveStatus.error', { defaultValue: 'Needs fixes' });
        }
        return t('commandBar.code.liveStatus.idle', { defaultValue: 'Idle' });
    }, [isLiveMermaidEnabled, liveStatus, t]);

    return (
        <div className="flex flex-col h-full">
            <ViewHeader
                title={mode === 'mermaid' ? t('commandBar.code.mermaidTitle') : t('commandBar.code.dslTitle', { appName: brandConfig.appName })}
                icon={mode === 'mermaid' ? <Code2 className="w-4 h-4 text-[var(--brand-primary)]" /> : <FileCode className="w-4 h-4 text-[var(--brand-primary)]" />}
                onBack={handleBack}
            />
            <div className="p-4 flex-1 relative flex flex-col gap-4">
                <div className="relative flex-1">
                    <Textarea
                        ref={textareaRef}
                        value={code}
                        onChange={e => handleChange(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={mode === 'mermaid' ? t('commandBar.code.mermaidPlaceholder') : t('commandBar.code.dslPlaceholder', { appName: brandConfig.appName })}
                        className={`h-full font-mono leading-relaxed resize-none transition-all
                                ${error ? 'border-amber-300 bg-amber-50/30' : 'bg-slate-50/50'}
                            `}
                        spellCheck={false}
                        autoFocus
                    />
                </div>

                {error && (
                    <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-xs shadow-sm space-y-2">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                            <span className="font-medium">{error}</span>
                        </div>
                        {diagnostics.length > 0 && (
                            <div className="space-y-1">
                                {groupedStrictDiagnostics.length > 0 ? (
                                    groupedStrictDiagnostics.map((group) => (
                                        <div key={group.id} className="rounded-md border border-amber-200/70 bg-amber-100/35 p-2">
                                            <p className="mb-1 text-[11px] font-semibold text-amber-900">
                                                {t(group.titleKey, { defaultValue: group.defaultTitle })}
                                            </p>
                                            <div className="space-y-1">
                                                {group.diagnostics.slice(0, 3).map((diagnostic, index) => (
                                                    <div key={`${group.id}-${diagnostic.message}-${index}`} className="text-[11px] leading-relaxed text-amber-800 whitespace-pre-wrap">
                                                        {typeof diagnostic.line === 'number'
                                                            ? t('commandBar.code.linePrefix', { line: diagnostic.line, defaultValue: 'Line {{line}}: ' })
                                                            : ''}
                                                        {diagnostic.message}
                                                        {diagnostic.snippet ? `\n> ${diagnostic.snippet}` : ''}
                                                        {diagnostic.hint
                                                            ? `\n${t('commandBar.code.hintPrefix', { defaultValue: 'Hint:' })} ${diagnostic.hint}`
                                                            : ''}
                                                        {typeof diagnostic.line === 'number' && (
                                                            <button
                                                                type="button"
                                                                className="mt-1 block text-[11px] font-medium text-amber-900 underline decoration-amber-400/80 underline-offset-2 hover:text-amber-950"
                                                                onClick={() => jumpToDiagnosticLine(diagnostic.line)}
                                                            >
                                                                {t('commandBar.code.jumpToLine', {
                                                                    line: diagnostic.line,
                                                                    defaultValue: 'Jump to line {{line}}',
                                                                })}
                                                            </button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))
                                ) : diagnostics.slice(0, 3).map((diagnostic, index) => (
                                    <div key={`${diagnostic.message}-${index}`} className="text-[11px] leading-relaxed text-amber-800 whitespace-pre-wrap">
                                        {typeof diagnostic.line === 'number'
                                            ? t('commandBar.code.linePrefix', { line: diagnostic.line, defaultValue: 'Line {{line}}: ' })
                                            : ''}
                                        {diagnostic.message}
                                        {diagnostic.snippet ? `\n> ${diagnostic.snippet}` : ''}
                                        {diagnostic.hint
                                            ? `\n${t('commandBar.code.hintPrefix', { defaultValue: 'Hint:' })} ${diagnostic.hint}`
                                            : ''}
                                    </div>
                                ))}
                            </div>
                        )}
                        {strictModeGuidance.length > 0 && (
                            <div className="rounded-md border border-amber-200 bg-amber-100/50 p-2 text-[11px] text-amber-900">
                                <p className="font-semibold">
                                    {t('commandBar.code.quickFixes', { defaultValue: 'Quick fixes' })}
                                </p>
                                <ul className="mt-1 list-disc pl-4 space-y-0.5">
                                    {strictModeGuidance.map((item) => (
                                        <li key={item.key}>
                                            {t(item.key, { defaultValue: item.defaultText })}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <span className="text-xs text-slate-400">{t('commandBar.code.applyShortcut')}</span>
                        {isLiveMermaidEnabled && (
                            <span className={`text-xs ${liveStatus === 'error' ? 'text-amber-600' : 'text-slate-500'}`}>
                                {liveStatusLabel}
                            </span>
                        )}
                        {mode === 'flowmind' && (
                            <a
                                href="#/docs/openflow-dsl"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1.5 text-xs font-medium text-[var(--brand-primary)] hover:text-[var(--brand-primary-700)] transition-colors"
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                {t('commandBar.code.syntaxGuide')}
                            </a>
                        )}
                    </div>
                    <Button
                        onClick={() => void handleApply({ closeOnSuccess: true, source: 'manual' })}
                        disabled={isApplying}
                        variant="primary"
                        className="bg-[var(--brand-primary)] hover:bg-[var(--brand-primary-600)] border-transparent text-white"
                        isLoading={isApplying}
                        icon={!isApplying && <Play className="w-4 h-4" />}
                    >
                        Apply Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};
