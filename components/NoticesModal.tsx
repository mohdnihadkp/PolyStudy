import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { APP_NOTICES } from '../constants';

interface NoticesModalProps {
  onClose: () => void;
}

const NoticesModal: React.FC<NoticesModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 sm:p-6" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" />

      {/* Notebook Container */}
      <div 
        className="relative w-full max-w-3xl h-[85vh] md:h-[750px] bg-transparent perspective-1000 transform transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The Notebook Itself */}
        <div className="relative w-full h-full flex rounded-r-[24px] rounded-l-[12px] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden bg-[#f3f4f6] dark:bg-[#1a1a1a]">
            
            {/* 1. Spiral Spine (Left) */}
            <div className="w-12 md:w-16 h-full bg-[#2d2d2d] relative z-20 flex flex-col justify-evenly py-6 shadow-2xl shrink-0">
                {/* Spiral Rings */}
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="relative w-full h-6 group">
                        {/* The Metal Ring */}
                        <div className="absolute left-1/2 -translate-x-1/2 w-[140%] h-3 bg-gradient-to-r from-zinc-600 via-zinc-300 to-zinc-600 rounded-full shadow-md transform -rotate-6 z-20"></div>
                        {/* Shadow on cover */}
                        <div className="absolute left-full top-1 w-4 h-2 bg-black/30 blur-[2px] rounded-full transform -skew-x-12"></div>
                    </div>
                ))}
            </div>

            {/* 2. The Paper Page */}
            <div className="flex-1 relative bg-[#fffdf5] dark:bg-[#262626] shadow-inner flex flex-col">
                
                {/* Paper Texture & Lines */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    {/* Horizontal Lines */}
                    <div 
                        className="w-full h-full"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(transparent, transparent 31px, #94a3b840 31px, #94a3b840 32px)',
                            backgroundAttachment: 'local'
                        }}
                    ></div>
                    {/* Vertical Margin Line */}
                    <div className="absolute top-0 bottom-0 left-12 md:left-20 w-px bg-red-400/40 border-r border-red-400/20"></div>
                </div>

                {/* Binding Shadow Overlay (Left edge of paper) */}
                <div className="absolute top-0 bottom-0 left-0 w-8 bg-gradient-to-r from-black/10 to-transparent pointer-events-none z-10"></div>

                {/* Header Section */}
                <div className="relative z-10 pt-8 pb-4 px-6 md:px-10 ml-4 md:ml-12 flex justify-between items-start border-b border-transparent">
                    <div>
                        <div className="inline-block px-4 py-1 bg-black/5 dark:bg-white/10 rounded-sm transform -rotate-1 mb-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">Classified</span>
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter mix-blend-multiply dark:mix-blend-normal font-serif">
                            Notice Board
                        </h2>
                    </div>
                    
                    <button 
                        onClick={onClose}
                        className="p-2 -mr-2 text-slate-400 hover:text-red-500 transition-colors transform hover:rotate-90 duration-300"
                    >
                        <X className="w-8 h-8" />
                    </button>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar relative z-10 px-4 md:px-8 pb-8 ml-0 md:ml-4">
                    {APP_NOTICES.length === 0 ? (
                        <div className="h-40 flex items-center justify-center ml-12 md:ml-20">
                            <span className="text-slate-400 font-handwriting text-xl -rotate-2">Nothing to see here yet...</span>
                        </div>
                    ) : (
                        <div className="space-y-10 pt-4">
                            {APP_NOTICES.map((notice, idx) => (
                                <div key={notice.id} className="relative group">
                                    {/* Date Stamp (In Margin) */}
                                    <div className="absolute left-0 md:left-2 top-1 w-10 md:w-14 text-center transform -rotate-3 md:-translate-x-full">
                                        <div className="text-[10px] font-black text-slate-400 uppercase leading-tight">
                                            {notice.date.split(' ')[0]}<br/>
                                            <span className="text-sm md:text-lg text-slate-600 dark:text-slate-300">
                                                {notice.date.split(' ')[1].replace(',', '')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notice Body */}
                                    <div className="ml-12 md:ml-20 pl-4 relative">
                                        {/* Pin/Sticker for New Items */}
                                        {notice.isNew && (
                                            <div className="absolute -right-2 -top-4 transform rotate-12 bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 shadow-md border-2 border-white dark:border-black z-20">
                                                NEW!
                                            </div>
                                        )}

                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 leading-tight decoration-sky-500/30 underline decoration-4 underline-offset-2">
                                            {notice.title}
                                        </h3>
                                        
                                        <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                                            {notice.content}
                                        </p>

                                        {/* Links / Attachments */}
                                        {notice.links && notice.links.length > 0 && (
                                            <div className="mt-4 flex flex-wrap gap-3">
                                                {notice.links.map((link, lIdx) => (
                                                    <a 
                                                        key={lIdx}
                                                        href={link.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="group/link relative inline-flex items-center px-4 py-2 bg-white dark:bg-[#333] border border-slate-200 dark:border-white/10 rounded-sm shadow-sm hover:shadow-md transition-all transform hover:-translate-y-0.5 hover:-rotate-1"
                                                    >
                                                        {/* Paperclip Graphic */}
                                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-slate-400">
                                                            <div className="w-1.5 h-4 bg-slate-300 dark:bg-slate-600 rounded-full ring-2 ring-white dark:ring-[#262626]"></div>
                                                        </div>
                                                        
                                                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center">
                                                            {link.label}
                                                            <ExternalLink className="w-3 h-3 ml-2 opacity-50 group-hover/link:opacity-100" />
                                                        </span>
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Page Number */}
                <div className="absolute bottom-4 right-6 text-slate-300 dark:text-slate-600 font-mono text-xs font-bold select-none">
                    Page 1
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default NoticesModal;