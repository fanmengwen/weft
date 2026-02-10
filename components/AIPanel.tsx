import React, { useState } from 'react';
import { Sparkles, Loader2, Send, X } from 'lucide-react';

interface AIPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (prompt: string) => Promise<void>;
  isGenerating: boolean;
}

export const AIPanel: React.FC<AIPanelProps> = ({ isOpen, onClose, onGenerate, isGenerating }) => {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim()) {
      onGenerate(prompt);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden ring-1 ring-black/5">
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-indigo-600">
            <Sparkles className="w-5 h-5" />
            <h3 className="font-semibold">AI Architect</h3>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4">
            <p className="text-sm text-slate-600 mb-4">
                Describe the flow you want to build. Be specific about steps, decisions, and outcomes.
            </p>
            <form onSubmit={handleSubmit} className="relative">
                <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g. Create a user registration flow with email verification and error handling..."
                    className="w-full h-32 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none text-slate-700 text-sm"
                    disabled={isGenerating}
                />
                <div className="flex justify-end mt-3">
                    <button
                        type="submit"
                        disabled={!prompt.trim() || isGenerating}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                            ${!prompt.trim() || isGenerating 
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed' 
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md hover:shadow-lg'
                            }
                        `}
                    >
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Designing...
                            </>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                Generate Flow
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
        
        {/* Quick Suggestions */}
        <div className="bg-slate-50 p-4 border-t border-slate-100 flex gap-2 overflow-x-auto no-scrollbar">
            <button 
                onClick={() => setPrompt("Authentication flow with OAuth and Email")}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
                Auth Flow
            </button>
            <button 
                onClick={() => setPrompt("E-commerce checkout process with inventory check")}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
                Checkout Process
            </button>
             <button 
                onClick={() => setPrompt("Git feature branch workflow")}
                className="whitespace-nowrap px-3 py-1.5 bg-white border border-slate-200 rounded-full text-xs text-slate-600 hover:border-indigo-300 hover:text-indigo-600 transition-colors"
            >
                Git Workflow
            </button>
        </div>
      </div>
    </div>
  );
};