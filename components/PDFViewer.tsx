
import React, { useState, useEffect, useRef } from 'react';
import { X, Share2, Check, ExternalLink, Download, Loader2, FileText, Maximize2, Minimize2, RotateCw, AlertTriangle, Search, ZoomIn, ZoomOut, ChevronUp, ChevronDown, PenTool, ArrowUp, ArrowDown } from 'lucide-react';

declare global {
  interface Window {
    find: (text?: string, caseSensitive?: boolean, backwards?: boolean, wrapAround?: boolean, wholeWord?: boolean, searchInFrames?: boolean, showDialog?: boolean) => boolean;
  }
}

interface PDFViewerProps {
  url: string;
  title: string;
  onClose: () => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ url, title, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [key, setKey] = useState(0); // Used to force iframe reload
  const [showSlowMsg, setShowSlowMsg] = useState(false);
  
  // Viewer Controls State
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [page, setPage] = useState(1); // Visual simulation

  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [pdfSearchQuery, setPdfSearchQuery] = useState('');
  const [debouncedPdfSearch, setDebouncedPdfSearch] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search opens
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
        setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  // Debounce Mechanism for Search
  useEffect(() => {
    const handler = setTimeout(() => {
        setDebouncedPdfSearch(pdfSearchQuery);
    }, 500); // 500ms delay

    return () => clearTimeout(handler);
  }, [pdfSearchQuery]);

  // Execute Search on Debounce
  useEffect(() => {
    if (debouncedPdfSearch && window.find) {
        // Param 1: text, 2: caseSensitive, 3: backwards, 4: wrapAround, 5: wholeWord, 6: searchInFrames, 7: showDialog
        window.find(debouncedPdfSearch, false, false, true, false, false, false);
    }
  }, [debouncedPdfSearch]);

  const handleNextMatch = () => {
      if (window.find && pdfSearchQuery) {
          window.find(pdfSearchQuery, false, false, true, false, false, false);
      }
  };

  const handlePrevMatch = () => {
      if (window.find && pdfSearchQuery) {
          window.find(pdfSearchQuery, false, true, true, false, false, false);
      }
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isSearchOpen) {
            setIsSearchOpen(false);
            setPdfSearchQuery('');
        } else if (isFullscreen) {
            setIsFullscreen(false);
        } else {
            onClose();
        }
      }
      // Basic zoom shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key === '=') {
          e.preventDefault();
          handleZoomIn();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === '-') {
          e.preventDefault();
          handleZoomOut();
      }
      // Toggle search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, isFullscreen, isSearchOpen]);

  // Slow Loading Detection
  useEffect(() => {
    let timer: any;
    if (isLoading) {
        setShowSlowMsg(false);
        timer = setTimeout(() => {
            setShowSlowMsg(true);
        }, 5000); 
    }
    return () => clearTimeout(timer);
  }, [isLoading, key]);

  // Enhanced URL Handling
  const getEmbedUrl = (originalUrl: string) => {
    try {
      if (originalUrl.includes('drive.google.com')) {
          if (originalUrl.includes('/view')) return originalUrl.replace('/view', '/preview');
          if (originalUrl.includes('/open?id=')) {
              const id = new URL(originalUrl).searchParams.get('id');
              if (id) return `https://drive.google.com/file/d/${id}/preview`;
          }
          return originalUrl; 
      }
      
      if (originalUrl.toLowerCase().endsWith('.pdf')) {
          return `https://docs.google.com/viewer?url=${encodeURIComponent(originalUrl)}&embedded=true`;
      }
      return originalUrl;
    } catch (e) {
      return originalUrl;
    }
  };

  const embedUrl = getEmbedUrl(url);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, text: `Study Material: ${title}`, url });
      } catch (err) { console.debug(err); }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleReload = () => {
      setIsLoading(true);
      setKey(prev => prev + 1);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 25, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 25, 50));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  return (
    <div className={`fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-md animate-fade-in ${isFullscreen ? 'p-0' : 'p-2 md:p-6'}`}>
      <div className={`glass-panel w-full ${isFullscreen ? 'h-full rounded-none border-0' : 'max-w-6xl h-[92vh] rounded-[2rem] border border-white/10'} shadow-2xl flex flex-col overflow-hidden relative bg-white dark:bg-[#080808] transition-all duration-300`}>
        
        {/* Toolbar Header */}
        <div className="flex flex-col border-b border-black/5 dark:border-white/5 bg-white/90 dark:bg-[#111]/90 backdrop-blur-xl z-20">
            
            {/* Top Bar: Title & Window Controls */}
            <div className="flex justify-between items-center p-3 md:p-4 relative">
                <div className="flex items-center space-x-3 w-full sm:w-auto overflow-hidden">
                    <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg text-red-600 dark:text-red-400 flex-shrink-0">
                        <FileText className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                        <h3 className="text-sm md:text-lg font-bold text-slate-900 dark:text-white truncate max-w-[150px] sm:max-w-md" title={title}>
                            {title}
                        </h3>
                        <p className="text-[10px] text-slate-500 dark:text-neutral-500 font-mono hidden sm:block truncate max-w-[300px]">
                            {new URL(url).hostname}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-1 md:gap-2 pl-2">
                    <button onClick={handleShare} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 transition-colors" title="Share">
                        {copied ? <Check className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                    </button>
                    <button onClick={() => window.open(url, '_blank')} className="hidden sm:flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-neutral-200 text-xs font-bold hover:bg-sky-500 hover:text-white dark:hover:bg-sky-600 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Original</span>
                    </button>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 dark:text-slate-400 transition-colors" title="Close (Esc)">
                        <X className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Secondary Toolbar: PDF Controls */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 dark:bg-neutral-900 border-t border-black/5 dark:border-white/5 overflow-x-auto no-scrollbar relative">
                <div className="flex items-center space-x-1 md:space-x-2">
                    <button onClick={handleZoomOut} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300" title="Zoom Out">
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-mono font-bold w-12 text-center text-slate-600 dark:text-slate-400">{zoom}%</span>
                    <button onClick={handleZoomIn} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300" title="Zoom In">
                        <ZoomIn className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-2"></div>
                    <button onClick={handleRotate} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300" title="Rotate">
                        <RotateCw className="w-4 h-4" />
                    </button>
                </div>

                {/* Simulated Page Navigation (Visual Only) */}
                <div className="flex items-center space-x-2 bg-white dark:bg-black rounded-md border border-slate-200 dark:border-white/10 px-2 py-0.5 shadow-sm mx-4">
                    <button onClick={() => setPage(p => Math.max(1, p-1))} className="p-1 hover:text-sky-500 text-slate-400">
                        <ChevronUp className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200 min-w-[30px] text-center">
                        {page} / --
                    </span>
                    <button onClick={() => setPage(p => p + 1)} className="p-1 hover:text-sky-500 text-slate-400">
                        <ChevronDown className="w-3 h-3" />
                    </button>
                </div>

                <div className="flex items-center space-x-1 md:space-x-2">
                     <button onClick={() => setIsSearchOpen(prev => !prev)} className={`p-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${isSearchOpen ? 'bg-sky-500 text-white shadow-lg' : 'hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300'}`} title="Search Text (Ctrl+F)">
                         <Search className="w-4 h-4" />
                         <span className="text-xs font-bold hidden md:inline">Find</span>
                     </button>
                     
                     <button onClick={() => alert('Use the native tools in "Open Original" for annotation.')} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300" title="Annotation Tools">
                        <PenTool className="w-4 h-4" />
                    </button>
                    <div className="w-px h-4 bg-slate-300 dark:bg-white/10 mx-2"></div>
                    <button onClick={() => setIsFullscreen(!isFullscreen)} className="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-white/10 text-slate-600 dark:text-slate-300">
                        {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                </div>

                {/* Expanded Search Bar Overlay */}
                {isSearchOpen && (
                    <div className="absolute top-full right-4 mt-2 z-30 animate-fade-in-up">
                        <div className="glass-panel p-2 flex items-center gap-2 bg-white/95 dark:bg-[#151515]/95 shadow-2xl border border-slate-200 dark:border-white/10 rounded-xl w-[280px] sm:w-[320px]">
                            <Search className="w-4 h-4 text-slate-400 ml-2" />
                            <input 
                                ref={searchInputRef}
                                type="text" 
                                value={pdfSearchQuery}
                                onChange={(e) => setPdfSearchQuery(e.target.value)}
                                placeholder="Find in document..."
                                className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400 h-8"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        if (e.shiftKey) handlePrevMatch();
                                        else handleNextMatch();
                                    }
                                }}
                            />
                            <div className="flex items-center border-l border-slate-200 dark:border-white/10 pl-1">
                                <button onClick={handlePrevMatch} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500" title="Previous Match">
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button onClick={handleNextMatch} className="p-1.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-slate-500" title="Next Match">
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                            </div>
                            <button onClick={() => { setIsSearchOpen(false); setPdfSearchQuery(''); }} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>

        {/* Iframe Container */}
        <div className="flex-1 bg-slate-100 dark:bg-[#202020] relative w-full h-full overflow-hidden flex justify-center items-center">
             
             {/* Loading State Overlay */}
             {isLoading && (
                 <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50 dark:bg-[#050505] animate-fade-in">
                     <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
                     <p className="text-sm font-bold text-slate-600 dark:text-slate-400">Loading document...</p>
                     
                     {showSlowMsg && (
                         <div className="mt-6 flex flex-col items-center animate-fade-in">
                            <p className="text-xs text-amber-500 font-medium mb-3 flex items-center">
                                <AlertTriangle className="w-3 h-3 mr-1" /> 
                                Taking longer than usual?
                            </p>
                            <a 
                                href={url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-105 flex items-center"
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download PDF Directly
                            </a>
                         </div>
                     )}
                 </div>
             )}

             {/* Wrapper for Zoom/Rotate Transforms */}
             <div 
                className="w-full h-full transition-transform duration-200 ease-out origin-top"
                style={{ 
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    // Ensure iframe doesn't overflow oddly when rotated
                    width: rotation % 180 !== 0 ? '100vh' : '100%',
                    height: rotation % 180 !== 0 ? '100vw' : '100%',
                }}
             >
                <iframe 
                    key={key}
                    src={embedUrl} 
                    className={`w-full h-full border-0 transition-opacity duration-700 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    title={title}
                    onLoad={() => setIsLoading(false)}
                    onError={() => {
                        setIsLoading(false);
                        setShowSlowMsg(true);
                    }}
                    allow="autoplay; fullscreen; clipboard-write"
                >
                </iframe>
             </div>
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;
