import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

export interface SelectOption {
    value: string;
    label: string;
    hint?: string;
    badge?: string;
    group?: string;
}

interface SelectProps {
    value: string;
    onChange: (value: string) => void;
    options: SelectOption[];
    placeholder?: string;
    className?: string;
}

const GROUP_ORDER = ['Flagship', 'Reasoning', 'Speed', 'Legacy', 'Custom', 'Other'];

function sortGroups(a: string, b: string): number {
    const idxA = GROUP_ORDER.indexOf(a);
    const idxB = GROUP_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b);
}

export function Select({ value, onChange, options, placeholder = 'Select...', className = '' }: SelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const selectedOption = options.find(o => o.value === value);

    const groupedOptions = options.reduce((acc, option) => {
        const group = option.group ?? 'Other';
        if (!acc[group]) acc[group] = [];
        acc[group].push(option);
        return acc;
    }, {} as Record<string, SelectOption[]>);

    const groups = Object.keys(groupedOptions);
    const hasGroups = groups.length > 1 || (groups.length === 1 && groups[0] !== 'Other');
    const sortedGroups = hasGroups ? [...groups].sort(sortGroups) : [];

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full flex items-center justify-between px-3 py-2.5 bg-white border rounded-lg text-sm text-left transition-all
                    ${isOpen ? 'border-[var(--brand-primary)] ring-1 ring-[var(--brand-primary)]/20' : 'border-slate-300 hover:border-slate-400'}
                `}
            >
                <div className="flex flex-col items-start overflow-hidden">
                    <span className={`block truncate ${selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'}`}>
                        {selectedOption ? selectedOption.label : placeholder}
                    </span>
                    {selectedOption?.hint && (
                        <span className="text-[10px] text-slate-500 truncate block max-w-full">
                            {selectedOption.hint}
                        </span>
                    )}
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -5, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -5, scale: 0.98 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-64 overflow-y-auto no-scrollbar focus:outline-none"
                    >
                        <div className="py-1">
                            {hasGroups ? (
                                sortedGroups.map(group => {
                                    const groupItems = groupedOptions[group];
                                    if (!groupItems?.length) return null;
                                    return (
                                        <div key={group}>
                                            <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-50/50 sticky top-0 backdrop-blur-sm">
                                                {group}
                                            </div>
                                            {groupItems.map(option => (
                                                <OptionItem
                                                    key={option.value}
                                                    option={option}
                                                    isSelected={value === option.value}
                                                    onClick={() => { onChange(option.value); setIsOpen(false); }}
                                                />
                                            ))}
                                        </div>
                                    );
                                })
                            ) : (
                                options.map(option => (
                                    <OptionItem
                                        key={option.value}
                                        option={option}
                                        isSelected={value === option.value}
                                        onClick={() => { onChange(option.value); setIsOpen(false); }}
                                    />
                                ))
                            )}

                            {options.length === 0 && (
                                <div className="px-3 py-8 text-center text-sm text-slate-400">
                                    No options available
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

function OptionItem({ option, isSelected, onClick }: { option: SelectOption; isSelected: boolean; onClick: () => void }) {
    const itemClass = isSelected
        ? 'bg-[var(--brand-primary)]/5 text-[var(--brand-primary)]'
        : 'text-slate-700 hover:bg-slate-50';

    const badgeClass = isSelected
        ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] border-[var(--brand-primary)]/20'
        : 'bg-slate-100 text-slate-500 border-slate-200';

    const hintClass = isSelected ? 'text-[var(--brand-primary)]/70' : 'text-slate-400';

    return (
        <button
            type="button"
            onClick={onClick}
            className={`w-full flex items-center justify-between px-3 py-2 text-left text-sm transition-colors ${itemClass}`}
        >
            <div className="flex flex-col overflow-hidden">
                <div className="flex items-center gap-2">
                    <span className={`truncate ${isSelected ? 'font-medium' : ''}`}>
                        {option.label}
                    </span>
                    {option.badge && (
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-medium border ${badgeClass}`}>
                            {option.badge}
                        </span>
                    )}
                </div>
                {option.hint && (
                    <span className={`text-[10px] truncate ${hintClass}`}>
                        {option.hint}
                    </span>
                )}
            </div>
            {isSelected && <Check className="w-4 h-4 shrink-0 ml-2" />}
        </button>
    );
}
