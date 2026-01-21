
import React from 'react';
import { X, Hexagon, Globe, Code, Heart, Layers } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md bg-black/80" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-md rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-white/20 shadow-2xl overflow-hidden relative animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 dark:text-white hover:rotate-90 transition-all z-20"
        >
            <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="relative pt-12 pb-8 px-6 bg-gradient-to-b from-sky-500/10 to-transparent flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 p-1 shadow-xl mb-4">
                <div className="w-full h-full bg-white dark:bg-black rounded-full flex items-center justify-center">
                    <Hexagon className="w-10 h-10 text-sky-600 dark:text-sky-400" />
                </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">PolyStudy</h2>
            <p className="text-sm font-bold text-slate-500 dark:text-neutral-400">Academic Companion v2.5</p>
        </div>

        {/* Developer Section */}
        <div className="px-8 pb-8 space-y-6">
            <div className="text-center">
                <p className="text-sm text-slate-600 dark:text-neutral-300 leading-relaxed font-medium">
                    Built to democratize education for Kerala Polytechnic students with premium, open-source resources.
                </p>
            </div>

            <div className="border-t border-slate-100 dark:border-white/10 pt-6">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center mb-4">Developed By</p>
                
                <a 
                    href="https://mohdnihadkp.netlify.app"
                    target="_blank"
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors group cursor-pointer border border-slate-100 dark:border-white/5"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-black dark:bg-white rounded-lg text-white dark:text-black">
                            <Code className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <h3 className="font-bold text-slate-900 dark:text-white">Mohammed Nihad KP</h3>
                            <p className="text-xs text-slate-500 dark:text-neutral-400">Full Stack Developer</p>
                        </div>
                    </div>
                    <Globe className="w-5 h-5 text-slate-400 group-hover:text-sky-500 transition-colors" />
                </a>
            </div>

            <div className="flex justify-center gap-4 text-slate-400 pt-2">
                <div className="flex flex-col items-center">
                    <Heart className="w-5 h-5 text-red-500 mb-1" />
                    <span className="text-[10px] font-bold">Open Source</span>
                </div>
                <div className="flex flex-col items-center">
                    <Layers className="w-5 h-5 text-indigo-500 mb-1" />
                    <span className="text-[10px] font-bold">React + Three.js</span>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
