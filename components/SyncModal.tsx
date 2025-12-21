import React, { useState } from 'react';
import { X, Download, Upload, Copy, Check, RefreshCw, AlertCircle } from 'lucide-react';

interface SyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  progressData: Record<string, number>;
  onImport: (data: Record<string, number>) => void;
}

const SyncModal: React.FC<SyncModalProps> = ({ isOpen, onClose, progressData, onImport }) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importCode, setImportCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const exportCode = btoa(JSON.stringify(progressData));

  const handleCopy = () => {
    navigator.clipboard.writeText(exportCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleImport = () => {
    setError(null);
    setSuccessMsg(null);

    if (!importCode.trim()) {
        setError("Please paste a valid sync code.");
        return;
    }

    try {
      const decoded = atob(importCode.trim());
      const data = JSON.parse(decoded);
      
      if (typeof data === 'object' && data !== null) {
        onImport(data);
        setSuccessMsg("Progress synchronized successfully!");
        setImportCode('');
        setTimeout(() => {
            onClose();
            setSuccessMsg(null);
        }, 1500);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (e) {
      setError('Invalid sync code. Please ensure you copied the entire code correctly.');
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-lg rounded-[2.5rem] overflow-hidden bg-white dark:bg-black border border-black dark:border-white shadow-2xl relative flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-black/10 dark:border-white/10 flex justify-between items-center bg-white/50 dark:bg-black/50 backdrop-blur-md">
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400">
                    <RefreshCw className="w-5 h-5" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Sync Progress</h3>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        {/* Tabs */}
        <div className="flex p-2 gap-2 bg-slate-50 dark:bg-neutral-900/50">
            <button
                onClick={() => setActiveTab('export')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${activeTab === 'export' ? 'bg-white dark:bg-neutral-800 shadow-md text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
                <Download className="w-4 h-4" />
                <span>Export / Backup</span>
            </button>
            <button
                onClick={() => setActiveTab('import')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold flex items-center justify-center space-x-2 transition-all ${activeTab === 'import' ? 'bg-white dark:bg-neutral-800 shadow-md text-sky-600 dark:text-sky-400' : 'text-slate-500 dark:text-neutral-400 hover:bg-black/5 dark:hover:bg-white/5'}`}
            >
                <Upload className="w-4 h-4" />
                <span>Import / Restore</span>
            </button>
        </div>

        {/* Content */}
        <div className="p-6">
            {activeTab === 'export' ? (
                <div className="space-y-4">
                    <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
                        Copy this code to transfer your study progress to another device or browser.
                    </p>
                    
                    <div className="relative">
                        <textarea 
                            readOnly
                            value={exportCode}
                            className="w-full h-32 p-4 glass-input rounded-2xl text-xs font-mono text-slate-600 dark:text-neutral-300 resize-none bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-neutral-800 focus:ring-0"
                        />
                        <button
                            onClick={handleCopy}
                            className="absolute top-2 right-2 p-2 bg-white dark:bg-neutral-800 rounded-lg shadow-sm border border-slate-200 dark:border-neutral-700 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-600 dark:text-neutral-300 transition-all"
                            title="Copy Code"
                        >
                            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="flex items-center justify-center text-xs text-slate-400 font-medium bg-slate-100 dark:bg-neutral-900 py-2 rounded-lg">
                        <Check className="w-3 h-3 mr-1.5" />
                        {Object.keys(progressData).length} subjects tracked
                    </div>
                </div>
            ) : (
                <div className="space-y-4">
                     <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">
                        Paste your sync code below to merge progress from another device.
                    </p>
                    
                    <textarea 
                        value={importCode}
                        onChange={(e) => setImportCode(e.target.value)}
                        placeholder="Paste sync code here..."
                        className="w-full h-32 p-4 glass-input rounded-2xl text-xs font-mono text-slate-900 dark:text-white resize-none bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-neutral-800 focus:ring-2 focus:ring-sky-500/20 outline-none"
                    />
                    
                    {error && (
                        <div className="flex items-center text-xs text-red-500 font-bold bg-red-50 dark:bg-red-500/10 p-3 rounded-xl border border-red-100 dark:border-red-500/20">
                            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                            {error}
                        </div>
                    )}
                    
                    {successMsg && (
                         <div className="flex items-center text-xs text-green-500 font-bold bg-green-50 dark:bg-green-500/10 p-3 rounded-xl border border-green-100 dark:border-green-500/20">
                            <Check className="w-4 h-4 mr-2 flex-shrink-0" />
                            {successMsg}
                        </div>
                    )}

                    <button
                        onClick={handleImport}
                        className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Sync Now
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default SyncModal;