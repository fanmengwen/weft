import React, { useState } from 'react';
import type { Edge } from '@/lib/reactflowCompat';
import { useFlowStore } from '@/store';
import { ArrowRight, Network, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ArchitectureEdgeSemanticsSection } from './edge/ArchitectureEdgeSemanticsSection';
import { CollapsibleSection } from '../ui/CollapsibleSection';
import { InspectorSectionDivider } from './InspectorPrimitives';

interface EdgePropertiesProps {
    selectedEdge: Edge;
    onChange: (id: string, updates: Partial<Edge>) => void;
    onDelete: (id: string) => void;
}

export const EdgeProperties: React.FC<EdgePropertiesProps> = ({
    selectedEdge,
    onChange,
    onDelete
}) => {
    const { t } = useTranslation();
    const { nodes } = useFlowStore();
    const sourceNode = nodes.find((node) => node.id === selectedEdge.source);
    const targetNode = nodes.find((node) => node.id === selectedEdge.target);
    const isArchitectureEdge = sourceNode?.type === 'architecture' && targetNode?.type === 'architecture';
    const [isArchSectionOpen, setIsArchSectionOpen] = useState(isArchitectureEdge);
    const sourceName = sourceNode?.data?.label || sourceNode?.id || '—';
    const targetName = targetNode?.data?.label || targetNode?.id || '—';

    return (
        <>
            <InspectorSectionDivider />

            <div className="px-4 pt-2">
                <div className="text-[12px] font-medium text-[#5C6572] mb-[6px]">连接</div>
                <div className="flex items-center gap-2 rounded-[10px] border border-[#E9EBEF] bg-[#FCFCFD] px-3 py-2.5">
                    <span className="min-w-0 flex-1 truncate text-[13px] text-[#171D26]">{sourceName}</span>
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-[#8B93A0]" />
                    <span className="min-w-0 flex-1 truncate text-right text-[13px] text-[#171D26]">{targetName}</span>
                </div>
            </div>

            {isArchitectureEdge && (
                <CollapsibleSection
                    title={t('connectionPanel.architecture', 'Architecture')}
                    icon={<Network className="w-3.5 h-3.5" />}
                    isOpen={isArchSectionOpen}
                    onToggle={() => setIsArchSectionOpen((open) => !open)}
                >
                    <ArchitectureEdgeSemanticsSection selectedEdge={selectedEdge} onChange={onChange} />
                </CollapsibleSection>
            )}

            <div className="flex items-center px-3 py-2">
                <button
                    type="button"
                    onClick={() => onDelete(selectedEdge.id)}
                    className="inline-flex items-center gap-1.5 rounded-[7px] px-2 py-1.5 text-[12.5px] font-medium text-[#C4443C] hover:bg-[#FBEFEE]"
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    删除连线
                </button>
            </div>
        </>
    );
};
