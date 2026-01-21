
import React from 'react';
import { X, ExternalLink, Calendar, BellRing } from 'lucide-react';
import { APP_NOTICES } from '../constants';

interface NoticesModalProps {
  onClose: () => void;
}

const NoticesModal: React.FC<NoticesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-sm bg-black/60" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl bg-white/90 dark:bg-black/80 border border-slate-200 dark:border-white/10 shadow-2xl relative overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-200 dark:border-white/10 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
            <div className="flex items-center gap-3">
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-xl">
                    <BellRing className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">Notice Board</h2>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 font-bold">Latest Updates from PolyStudy</p>
                </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-500 dark:text-white" />
            </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-3 space-y-8">
                {APP_NOTICES.map((notice, idx) => (
                    <div key={notice.id} className="relative pl-8 group">
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white dark:border-black ${notice.isNew ? 'bg-red-500 animate-pulse' : 'bg-slate-300 dark:bg-neutral-600'}`}></div>
                        
                        <div className="flex flex-col gap-1 mb-2">
                            <span className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                                <Calendar className="w-3 h-3 mr-1" />
                                {notice.date}
                                {notice.isNew && (
                                    <span className="ml-2 px-2 py-0.5 bg-red-500 text-white text-[10px] rounded-full">New</span>
                                )}
                            </span>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">
                                {notice.title}
                            </h3>
                        </div>
                        
                        <div className="glass-panel p-4 rounded-xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-sm leading-relaxed text-slate-600 dark:text-neutral-300">
                            {notice.content}
                        </div>

                        {notice.links && notice.links.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">
                                {notice.links.map((link, lIdx) => (
                                    <a 
                                        key={lIdx}
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 text-xs font-bold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors"
                                    >
                                        <ExternalLink className="w-3 h-3 mr-1.5" />
                                        {link.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default NoticesModal;
