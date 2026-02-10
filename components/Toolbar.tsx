import React from 'react';
import {
  Download,
  Trash2,
  Sparkles,
  Maximize,
  PlusCircle,
  MousePointer2,
  Undo2,
  Redo2,
  Workflow,
  StickyNote,
  Group,
  Save,
  FolderOpen,
  Layout,
  Clock
} from 'lucide-react';

interface ToolbarProps {
  onExport: () => void;
  onExportJSON: () => void;
  onImportJSON: () => void;
  onClear: () => void;
  onAI: () => void;
  onFitView: () => void;
  onAddNode: () => void;
  onAddAnnotation: () => void;
  onAddSection: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onLayout: () => void;
  onTemplates: () => void;
  onHistory: () => void;
  onExportMermaid: () => void;
  onExportPlantUML: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ children, text }) => (
  <div className="group relative flex items-center justify-center">
    {children}
    <span className="absolute bottom-full mb-2 px-2 py-1 text-xs text-white bg-slate-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
      {text}
    </span>
  </div>
);

export const Toolbar: React.FC<ToolbarProps> = ({
  onExport,
  onExportJSON,
  onImportJSON,
  onClear,
  onAI,
  onFitView,
  onAddNode,
  onAddAnnotation,
  onAddSection,
  onUndo,
  onRedo,
  onLayout,
  onTemplates,
  onHistory,
  onExportMermaid,
  onExportPlantUML,
  canUndo,
  canRedo
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  return (
    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-center gap-1 p-2 bg-white/90 backdrop-blur-md shadow-2xl rounded-2xl border border-slate-200/60 ring-1 ring-slate-900/5">

        {/* Editing Actions */}
        <Tooltip text="Undo (Ctrl+Z)">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-2 rounded-xl transition-colors ${!canUndo ? 'text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Undo2 className="w-5 h-5" />
          </button>
        </Tooltip>

        <Tooltip text="Redo (Ctrl+Y)">
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-2 rounded-xl transition-colors ${!canRedo ? 'text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}
          >
            <Redo2 className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <Tooltip text="Add Node">
          <button onClick={onAddNode} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <PlusCircle className="w-5 h-5" />
          </button>
        </Tooltip>

        <Tooltip text="Add Sticky Note">
          <button onClick={onAddAnnotation} className="p-2 hover:bg-yellow-50 rounded-xl transition-colors text-yellow-600">
            <StickyNote className="w-5 h-5" />
          </button>
        </Tooltip>

        <Tooltip text="Add Section">
          <button onClick={onAddSection} className="p-2 hover:bg-blue-50 rounded-xl transition-colors text-blue-500">
            <Group className="w-5 h-5" />
          </button>
        </Tooltip>

        <Tooltip text="AI Assistant">
          <button onClick={onAI} className="p-2 hover:bg-indigo-50 rounded-xl transition-colors text-indigo-600 hover:text-indigo-700">
            <Sparkles className="w-5 h-5" />
          </button>
        </Tooltip>

        <Tooltip text="Auto Layout">
          <button onClick={onLayout} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <Workflow className="w-5 h-5" />
          </button>
        </Tooltip>

        <Tooltip text="Templates">
          <button onClick={onTemplates} className="p-2 hover:bg-violet-50 rounded-xl transition-colors text-violet-600">
            <Layout className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <Tooltip text="Fit View">
          <button onClick={onFitView} className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-600">
            <Maximize className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="relative">
          <Tooltip text="Export Options">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className={`p-2 rounded-xl transition-colors ${showExportMenu ? 'bg-indigo-50 text-indigo-600' : 'hover:bg-slate-100 text-slate-600'}`}
            >
              <Download className="w-5 h-5" />
            </button>
          </Tooltip>

          {showExportMenu && (
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-48 bg-white rounded-xl shadow-xl border border-slate-100 p-1 flex flex-col gap-1 z-50 animate-in slide-in-from-bottom-2 duration-200">
              <button onClick={() => { onExport(); setShowExportMenu(false); }} className="px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-2">
                <Download className="w-4 h-4" /> PNG Image
              </button>
              <button onClick={() => { onExportJSON(); setShowExportMenu(false); }} className="px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-2">
                <Save className="w-4 h-4" /> JSON File
              </button>
              <div className="h-px bg-slate-100 my-0.5" />
              <button onClick={() => { onExportMermaid(); setShowExportMenu(false); }} className="px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-2">
                <span className="font-mono text-xs border border-slate-300 rounded px-1">M</span> Copy Mermaid
              </button>
              <button onClick={() => { onExportPlantUML(); setShowExportMenu(false); }} className="px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors flex items-center gap-2">
                <span className="font-mono text-xs border border-slate-300 rounded px-1">P</span> Copy PlantUML
              </button>
            </div>
          )}
        </div>

        <Tooltip text="Load JSON">
          <button onClick={onImportJSON} className="p-2 hover:bg-sky-50 rounded-xl transition-colors text-sky-600">
            <FolderOpen className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-px h-6 bg-slate-200 mx-1" />

        <Tooltip text="Clear Canvas">
          <button onClick={onClear} className="p-2 hover:bg-red-50 rounded-xl transition-colors text-red-500 hover:text-red-600">
            <Trash2 className="w-5 h-5" />
          </button>
        </Tooltip>
      </div>
    </div>
  );
};