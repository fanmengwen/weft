import React, { Suspense, lazy, useEffect, useRef } from 'react';
import { AlignJustify } from 'lucide-react';

const LazyTopNavMenuPanel = lazy(async () => {
    const module = await import('./TopNavMenuPanel');
    return { default: module.TopNavMenuPanel };
});

interface TopNavMenuProps {
    isOpen: boolean;
    onToggle: () => void;
    onClose: () => void;
    onGoHome: () => void;
    onOpenSettings: () => void;
    onHistory: () => void;
    onImportJSON: () => void;
}

export function TopNavMenu({
    isOpen,
    onToggle,
    onClose,
    onGoHome,
    onOpenSettings,
    onHistory,
    onImportJSON,
}: TopNavMenuProps): React.ReactElement {
    const menuRef = useRef<HTMLDivElement>(null);
    const buttonClassName = `flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-[8px] transition-colors ${
        isOpen
            ? 'bg-[color-mix(in_srgb,var(--wf-acc)_10%,transparent)] text-[var(--wf-acc)]'
            : 'text-[var(--wf-text-label)] hover:bg-[var(--wf-hover)]'
    }`;

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        function handlePointerDownOutside(event: PointerEvent): void {
            const target = event.target as Node;
            if (menuRef.current?.contains(target)) {
                return;
            }
            onClose();
        }

        function handleEscape(event: KeyboardEvent): void {
            if (event.key === 'Escape') {
                onClose();
            }
        }

        document.addEventListener('pointerdown', handlePointerDownOutside, true);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('pointerdown', handlePointerDownOutside, true);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={onToggle}
                data-testid="topnav-menu-toggle"
                aria-label="Open main menu"
                className={buttonClassName}
            >
                <AlignJustify className="w-4 h-4" />
            </button>

            {isOpen && (
                <Suspense fallback={null}>
                    <LazyTopNavMenuPanel
                        onClose={onClose}
                        onGoHome={onGoHome}
                        onOpenSettings={onOpenSettings}
                        onHistory={onHistory}
                        onImportJSON={onImportJSON}
                    />
                </Suspense>
            )}
        </div>
    );
}
