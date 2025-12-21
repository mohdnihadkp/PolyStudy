import React from 'react';
import { X, Hexagon, Heart, Globe, Shield, Zap, Code } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 dark:bg-white/5 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-2xl rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-black/5 dark:border-white/10 shadow-2xl relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400 transition-colors z-20"
        >
            <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col h-[85vh] md:h-auto md:max-h-[85vh]">
            
            {/* Header Section */}
            <div className="relative p-8 md:p-10 bg-slate-50 dark:bg-neutral-900 border-b border-slate-200 dark:border-white/5 overflow-hidden shrink-0">
                <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
                
                <div className="relative z-10 flex flex-col items-center text-center">
                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-4 rounded-2xl shadow-xl shadow-sky-500/20 mb-6">
                        <Hexagon className="w-10 h-10 text-white fill-current" />
                    </div>
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                        Poly<span className="font-light text-slate-500 dark:text-neutral-500">Study</span>
                    </h2>
                    <p className="text-sm font-bold text-sky-500 uppercase tracking-widest">
                        Academic Companion
                    </p>
                </div>
            </div>

            {/* Content Scroll */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
                <div className="prose dark:prose-invert max-w-none">
                    <p className="text-lg text-slate-600 dark:text-neutral-300 font-medium leading-relaxed text-center mb-10">
                        PolyStudy is an open-source educational platform designed to democratize access to high-quality study resources for Polytechnic Diploma students.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                            <Globe className="w-6 h-6 text-sky-500 mb-3" />
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Accessibility</h3>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Free access to curriculum-aligned notes and videos anywhere.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                             <Zap className="w-6 h-6 text-amber-500 mb-3" />
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">AI-Powered</h3>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Integrated Gemini AI tutor for instant doubt resolution.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                             <Shield className="w-6 h-6 text-emerald-500 mb-3" />
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Privacy Focused</h3>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">No login required for basic access. Your data stays yours.</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                             <Heart className="w-6 h-6 text-rose-500 mb-3" />
                            <h3 className="font-bold text-slate-900 dark:text-white mb-1">Community</h3>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Built by students, for students. Open for contributions.</p>
                        </div>
                    </div>

                    <div className="text-center pt-6 border-t border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-4">Developed By</p>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-white/5 rounded-full">
                            <Code className="w-4 h-4 text-slate-500" />
                            <span className="font-bold text-slate-700 dark:text-neutral-300">Mohammed Nihad KP</span>
                        </div>
                        <p className="text-xs text-slate-400 mt-4">
                            Version 2.5.0 (Beta)
                        </p>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;