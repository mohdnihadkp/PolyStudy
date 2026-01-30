
import React, { useEffect, useState, useRef } from 'react';
import { Department, Subject, VideoLecture, SearchResultItem } from '../types';
import { ArrowRight, Book, Video, GraduationCap, Star, ChevronRight, CornerDownLeft } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResultItem[];
  onSelectResult: (result: SearchResultItem) => void;
  onClose: () => void;
  query: string;
}

const SearchResults: React.FC<SearchResultsProps> = ({ results, onSelectResult, onClose, query }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Group results by type
  const groupedResults = {
    dept: results.filter(r => r.type === 'dept'),
    subject: results.filter(r => r.type === 'subject'),
    video: results.filter(r => r.type === 'video')
  };

  const flatList = [...groupedResults.dept, ...groupedResults.subject, ...groupedResults.video];

  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % flatList.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + flatList.length) % flatList.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatList[selectedIndex]) {
          onSelectResult(flatList[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [flatList, selectedIndex, onSelectResult]);

  // Scroll active item into view
  useEffect(() => {
    const activeItem = listRef.current?.children[selectedIndex] as HTMLElement;
    if (activeItem) {
        activeItem.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);
  
  // Helper to highlight matched text
  const HighlightText = ({ text, highlight }: { text: string; highlight: string }) => {
    if (!highlight.trim()) return <span className="truncate">{text}</span>;
    
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span className="truncate">
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="text-sky-600 dark:text-sky-400 font-extrabold bg-sky-100 dark:bg-sky-900/30 px-0.5 rounded-[2px]">
              {part}
            </span>
          ) : (
            <span key={i}>{part}</span>
          )
        )}
      </span>
    );
  };

  const renderSection = (title: string, items: SearchResultItem[], icon: React.ReactNode, baseIndex: number) => {
    if (items.length === 0) return null;
    return (
        <div className="mb-4 last:mb-0">
            <h4 className="px-4 mb-2 text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                {icon} {title}
            </h4>
            <div className="space-y-1">
                {items.map((result, idx) => {
                    const globalIndex = baseIndex + idx;
                    const isSelected = globalIndex === selectedIndex;
                    return (
                        <div 
                            key={`${result.type}-${idx}`}
                            onClick={() => onSelectResult(result)}
                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                            className={`flex items-center px-4 py-3 mx-2 rounded-xl cursor-pointer transition-all border ${
                                isSelected 
                                ? 'bg-sky-50 dark:bg-sky-900/20 border-sky-200 dark:border-sky-500/30 shadow-sm transform scale-[1.01]' 
                                : 'bg-transparent border-transparent hover:bg-slate-50 dark:hover:bg-white/5'
                            }`}
                        >
                            <div className={`p-2 rounded-lg mr-4 flex-shrink-0 ${
                                isSelected 
                                ? 'bg-sky-500 text-white' 
                                : 'bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400'
                            }`}>
                                {result.type === 'dept' ? <GraduationCap className="w-5 h-5" /> : 
                                result.type === 'subject' ? <Book className="w-5 h-5" /> : 
                                <Video className="w-5 h-5" />}
                            </div>
                            
                            <div className="flex-grow min-w-0 pr-4">
                                <h4 className={`font-bold truncate text-sm md:text-base ${isSelected ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-200'}`}>
                                    <HighlightText text={'name' in result.item ? result.item.name : result.item.title} highlight={query} />
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-neutral-500 mt-0.5 truncate flex items-center gap-1.5">
                                    {result.type === 'dept' ? 'Department View' : 
                                    <>
                                        <span>{result.dept?.name}</span>
                                        <ChevronRight className="w-3 h-3 opacity-50" />
                                        <span>{result.sem}</span>
                                    </>
                                    }
                                </p>
                            </div>

                            {isSelected && (
                                <div className="hidden sm:flex items-center text-slate-400 animate-fade-in">
                                    <span className="text-[10px] mr-2 font-medium">Select</span>
                                    <CornerDownLeft className="w-4 h-4" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/40 dark:bg-black/60 backdrop-blur-md flex justify-center items-start pt-[15vh] px-4 animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[70vh] relative animate-scale-in"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-white dark:bg-[#0a0a0a]">
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span className="text-lg">Command Center</span>
            {results.length > 0 && (
                <span className="text-xs font-bold bg-slate-100 dark:bg-white/10 px-2 py-0.5 rounded-full text-slate-500 dark:text-slate-400">
                    {results.length} results
                </span>
            )}
          </h3>
          <div className="flex items-center gap-2">
              <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">Use arrows to navigate</span>
              <button onClick={onClose} className="text-[10px] font-bold bg-slate-100 dark:bg-white/10 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md hover:bg-slate-200 dark:hover:bg-white/20 transition-colors">
                ESC
              </button>
          </div>
        </div>
        
        <div ref={listRef} className="overflow-y-auto p-2 custom-scrollbar bg-white dark:bg-[#0a0a0a] flex-1">
          {flatList.length === 0 ? (
            <div className="text-center py-16 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Star className="w-8 h-8 text-slate-300 dark:text-neutral-700" />
              </div>
              <p className="text-slate-900 dark:text-white font-bold mb-1">No results found</p>
              <p className="text-slate-500 dark:text-neutral-500 text-sm">We couldn't find anything for "{query}"</p>
            </div>
          ) : (
            <>
                {renderSection('Departments', groupedResults.dept, <GraduationCap className="w-3 h-3" />, 0)}
                {renderSection('Subjects', groupedResults.subject, <Book className="w-3 h-3" />, groupedResults.dept.length)}
                {renderSection('Videos', groupedResults.video, <Video className="w-3 h-3" />, groupedResults.dept.length + groupedResults.subject.length)}
            </>
          )}
        </div>
        
        {/* Footer Hint */}
        {flatList.length > 0 && (
            <div className="p-2 border-t border-slate-100 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] text-center">
                <p className="text-[10px] text-slate-400 dark:text-slate-500">
                    Press <kbd className="font-sans font-bold text-slate-600 dark:text-slate-400">↵ Enter</kbd> to select
                </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;
