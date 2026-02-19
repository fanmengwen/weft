import React from 'react';
import { useFlowStore } from '../../store';
import { Switch } from '../ui/Switch';
import { Grid, Magnet, Map } from 'lucide-react';

export const GeneralSettings = () => {
    const { viewSettings, toggleGrid, toggleSnap, toggleMiniMap } = useFlowStore();

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Canvas</h3>
                <div className="space-y-2">
                    <SettingRow
                        icon={<Grid className="w-4 h-4" />}
                        label="Show Grid"
                        description="Display a dot grid on the canvas"
                        checked={viewSettings.showGrid}
                        onChange={toggleGrid}
                    />
                    <SettingRow
                        icon={<Magnet className="w-4 h-4" />}
                        label="Snap to Grid"
                        description="Snap nodes to the grid when moving"
                        checked={viewSettings.snapToGrid}
                        onChange={toggleSnap}
                    />
                    <SettingRow
                        icon={<Map className="w-4 h-4" />}
                        label="Mini Map"
                        description="Show mini-map in bottom right"
                        checked={viewSettings.showMiniMap}
                        onChange={toggleMiniMap}
                    />
                </div>
            </div>
        </div>
    );
};

const SettingRow = ({
    icon, label, description, checked, onChange
}: {
    icon: React.ReactNode;
    label: string;
    description: string;
    checked: boolean;
    onChange: (v: boolean) => void;
}) => (
    <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
        <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-slate-700">{label}</p>
                <p className="text-[11px] text-slate-400">{description}</p>
            </div>
        </div>
        <Switch checked={checked} onCheckedChange={onChange} />
    </div>
);
