import React, { useState } from 'react';
import { X, ExternalLink, FolderOpen, Maximize2, Minimize2, Share2, Check, RotateCw, Loader2, FileText, Grid, List } from 'lucide-react';

interface DriveFolderModalProps {
  url: string;
  title: string;
  onClose: () => void;
}

const DriveFolderModal: React.FC<DriveFolderModalProps> = ({ url, title, onClose }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [key, setKey] = useState(0); // Used to force refresh iframe

  // Helper to convert standard Drive URLs to Embeddable versions
  const getEmbedUrl = (originalUrl: string) => {
    try {
      // Handle Folder: "drive.google.com/drive/folders/ID"
      if (originalUrl.includes('/folders/')) {
        const folderId = originalUrl.split('/folders/')[1]?.split('?')[0]?.split('/')[0];
        if (folderId) {
          return `https://drive.google.com/embeddedfolderview?id=${folderId}#${viewMode}`;
        }
      }
      // Handle ID param: "drive.google.com/open?id=ID"
      if (originalUrl.includes('id=')) {
        const urlParams = new URLSearchParams(new URL(originalUrl).search);
        const id = urlParams.get('id');
        if (id) {
           return `https://drive.google.com/embeddedfolderview?id=${id}#${viewMode}`;
        }
      }
      // Handle File View (PDFs, Docs, etc): "drive.google.com/file/d/ID/view" -> Convert to preview
      if (originalUrl.includes('/file/d/')) {
          const fileId = originalUrl.split('/file/d/')[1]?.split('/')[0];
          if (fileId) {
              return `https://drive.google.com/file/d/${fileId}/preview`;
          }
      }
      
      return originalUrl;
    } catch (e) {
      return originalUrl;
    }
  };

  const embedUrl = getEmbedUrl(url);
  const isFile = embedUrl.includes('/preview');

  const handleShare = async () => {
     if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: url
        });
      } catch (err) { console.debug(err); }
    } else {
      navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    }
  };

  const toggleFullscreen = () => {
      setIsFullscreen(!isFullscreen);
  };

  const toggleViewMode = () => {
      setViewMode(prev => prev === 'list' ? 'grid' : 'list');
      setKey(prev => prev + 1); // Force reload to apply view mode
      setIsLoading(true);
  };

  const refreshIframe = () => {
      setIsLoading(true);
      setKey(prev => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className={`glass-panel flex flex-col overflow-hidden relative shadow-2xl bg-white dark:bg-[#1a1a1a] border border-black/5 dark:border-white/10 transition-all duration-300 ${isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-6xl h-[85vh] rounded-[2rem]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Brand Colors Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 flex z-30">
            <div className="flex-1 bg-[#4285F4]"></div> {/* Google Blue */}
            <div className="flex-1 bg-[#EA4335]"></div> {/* Google Red */}
            <div className="flex-1 bg-[#FBBC05]"></div> {/* Google Yellow */}
            <div className="flex-1 bg-[#34A853]"></div> {/* Google Green */}
        </div>

        {/* Header */}
        <div className="flex justify-between items-center p-4 md:p-5 border-b border-black/5 dark:border-white/5 bg-white dark:bg-[#202124] z-20 pt-6">
          <div className="flex items-center space-x-4 overflow-hidden">
            {/* Iconic Representation */}
            <div className={`p-2.5 rounded-xl flex-shrink-0 shadow-sm ${isFile ? 'bg-red-50 text-[#EA4335] dark:bg-red-900/20' : 'bg-blue-50 text-[#4285F4] dark:bg-blue-900/20'}`}>
                {isFile ? <FileText className="w-6 h-6" /> : <FolderOpen className="w-6 h-6" />}
            </div>
            <div className="min-w-0">
                <h3 className="text-base md:text-lg font-bold text-[#202124] dark:text-[#e8eaed] truncate pr-2 tracking-tight">
                    {title}
                </h3>
                <div className="flex items-center gap-2">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-3.5 h-3.5 opacity-80" />
                    <p className="text-[11px] md:text-xs text-[#5f6368] dark:text-[#9aa0a6] font-medium hidden sm:block">
                        {isFile ? 'File Preview' : 'Google Drive Folder'}
                    </p>
                </div>
            </div>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {!isFile && (
                <button 
                    onClick={toggleViewMode}
                    className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#5f6368] dark:text-[#9aa0a6] transition-colors hidden sm:block"
                    title={viewMode === 'list' ? "Switch to Grid View" : "Switch to List View"}
                >
                    {viewMode === 'list' ? <Grid className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </button>
            )}
            
            <button 
                onClick={refreshIframe}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#5f6368] dark:text-[#9aa0a6] transition-colors hidden sm:block"
                title="Refresh Content"
            >
                <RotateCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-[#4285F4]' : ''}`} />
            </button>
             <button 
                onClick={handleShare}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#5f6368] dark:text-[#9aa0a6] transition-colors"
                title="Share Link"
            >
                {isCopied ? <Check className="w-5 h-5 text-[#34A853]" /> : <Share2 className="w-5 h-5" />}
            </button>
             <button 
                onClick={toggleFullscreen}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#5f6368] dark:text-[#9aa0a6] transition-colors hidden sm:block"
                title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
            
            <div className="h-8 w-px bg-black/10 dark:bg-white/10 mx-1"></div>

            <button 
                onClick={() => window.open(url, '_blank')}
                className="p-2.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-[#5f6368] dark:text-[#9aa0a6] transition-colors sm:hidden"
                title="Open External"
            >
                <ExternalLink className="w-5 h-5" />
            </button>

            <button 
                onClick={() => window.open(url, '_blank')}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-full bg-[#4285F4] hover:bg-[#3367d6] text-white shadow-md transition-all hover:shadow-lg transform hover:-translate-y-0.5"
            >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Open in Drive</span>
            </button>
            
            <button 
                onClick={onClose}
                className="p-2.5 ml-1 rounded-full hover:bg-red-50 text-[#5f6368] hover:text-[#EA4335] dark:text-[#9aa0a6] transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-white dark:bg-[#1a1a1a] relative w-full h-full group">
             
             {isLoading && (
                 <div className="absolute inset-0 z-10 flex items-center justify-center bg-white dark:bg-[#1a1a1a]">
                     <div className="flex flex-col items-center">
                         <div className="relative w-12 h-12 mb-4">
                             <div className="absolute inset-0 rounded-full border-4 border-[#e8eaed] dark:border-[#3c4043]"></div>
                             <div className="absolute inset-0 rounded-full border-4 border-t-[#4285F4] border-r-[#EA4335] border-b-[#FBBC05] border-l-[#34A853] animate-spin border-transparent"></div>
                         </div>
                         <p className="text-sm font-bold text-[#5f6368] dark:text-[#9aa0a6] animate-pulse">Loading Drive content...</p>
                     </div>
                 </div>
             )}

             <iframe 
                key={key}
                src={embedUrl} 
                className={`w-full h-full border-0 transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                title="Google Drive Browser"
                allow="autoplay; fullscreen"
                onLoad={() => setIsLoading(false)}
             >
             </iframe>
             
             {/* Fallback info shown if iframe takes too long or fails (z-index -1) */}
             <div className="absolute inset-0 -z-10 flex flex-col items-center justify-center text-center p-8">
                 <div className="p-4 rounded-full mb-4 bg-slate-100 dark:bg-[#303134]">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/1/12/Google_Drive_icon_%282020%29.svg" alt="Drive" className="w-12 h-12 opacity-50 grayscale" />
                 </div>
                 <p className="text-[#5f6368] dark:text-[#9aa0a6] font-medium">Connecting to Google Drive...</p>
                 <button 
                    onClick={() => window.open(url, '_blank')}
                    className="mt-6 px-5 py-2.5 bg-[#4285F4] hover:bg-[#3367d6] text-white rounded-lg text-sm font-bold shadow-md"
                 >
                    Open Externally
                 </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default DriveFolderModal;