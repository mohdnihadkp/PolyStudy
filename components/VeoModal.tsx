import React, { useState, useRef } from 'react';
import { X, Upload, Film, Loader2, Play, Download, Image as ImageIcon, Sparkles, AlertCircle, Wand2 } from 'lucide-react';
import { generateVeoVideo } from '../services/geminiService';

interface VeoModalProps {
  onClose: () => void;
}

const VeoModal: React.FC<VeoModalProps> = ({ onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setVideoUrl(null); // Reset previous video
      setError(null);
    }
  };

  const handleGenerate = async () => {
    if (!file) return;

    setIsGenerating(true);
    setError(null);
    setVideoUrl(null);

    try {
      const url = await generateVeoVideo(file, prompt, aspectRatio);
      setVideoUrl(url);
    } catch (err: any) {
      setError(err.message || "Failed to generate video. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadVideo = () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `veo-generated-${Date.now()}.mp4`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-4xl rounded-[2.5rem] bg-black/80 border border-white/10 shadow-[0_0_50px_rgba(124,58,237,0.15)] relative flex flex-col md:flex-row overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-50 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left / Top Side: Controls */}
        <div className="flex-1 p-6 md:p-8 flex flex-col overflow-y-auto custom-scrollbar border-b md:border-b-0 md:border-r border-white/10 bg-gradient-to-b from-slate-900 to-black">
            <div className="mb-6">
                <div className="flex items-center space-x-2 mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30">
                        <Film className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">Veo Animator</h2>
                </div>
                <p className="text-sm text-slate-400 font-medium">Bring your images to life with AI-powered video generation.</p>
            </div>

            <div className="space-y-6">
                {/* Upload Section */}
                <div>
                    <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">Source Image</label>
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className={`relative group aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300 overflow-hidden ${file ? 'border-violet-500/50 bg-black' : 'border-white/10 hover:border-violet-500/50 hover:bg-white/5'}`}
                    >
                        {preview ? (
                            <>
                                <img src={preview} alt="Upload" className="w-full h-full object-contain opacity-50 group-hover:opacity-30 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-full text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 border border-white/10">
                                        <Upload className="w-3 h-3" /> Change Image
                                    </span>
                                </div>
                            </>
                        ) : (
                            <div className="text-center p-4">
                                <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-violet-400" />
                                </div>
                                <p className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">Click to upload image</p>
                            </div>
                        )}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleFileChange} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                </div>

                {/* Settings */}
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">Prompt (Optional)</label>
                        <div className="relative">
                            <input 
                                type="text"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder="E.g., Cinematic slow motion, neon lights..."
                                className="w-full pl-4 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-slate-600 transition-all"
                            />
                            <Wand2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-500 opacity-50" />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 block">Aspect Ratio</label>
                        <div className="flex gap-3">
                            <button 
                                onClick={() => setAspectRatio('16:9')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${aspectRatio === '16:9' ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/50' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                            >
                                Landscape (16:9)
                            </button>
                            <button 
                                onClick={() => setAspectRatio('9:16')}
                                className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold border transition-all ${aspectRatio === '9:16' ? 'bg-violet-600 border-violet-500 text-white shadow-lg shadow-violet-900/50' : 'bg-white/5 border-transparent text-slate-400 hover:bg-white/10'}`}
                            >
                                Portrait (9:16)
                            </button>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center text-xs text-red-400 font-medium">
                        <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                        {error}
                    </div>
                )}

                <button
                    onClick={handleGenerate}
                    disabled={!file || isGenerating}
                    className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center transition-all ${
                        !file || isGenerating 
                        ? 'bg-white/5 text-slate-500 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg hover:shadow-violet-500/25 hover:scale-[1.02]'
                    }`}
                >
                    {isGenerating ? (
                        <>
                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                            Generating Video...
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5 mr-2 fill-current" />
                            Generate Video
                        </>
                    )}
                </button>
                
                <p className="text-[10px] text-center text-slate-500">
                    Uses Google Veo model. Generation may take 1-2 minutes.
                </p>
            </div>
        </div>

        {/* Right / Bottom Side: Result */}
        <div className="flex-1 bg-black flex items-center justify-center relative min-h-[300px] md:min-h-0 p-4 md:p-8">
            {/* Background Effects */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(124,58,237,0.1),transparent_70%)] pointer-events-none"></div>

            {videoUrl ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center animate-fade-in">
                    <video 
                        src={videoUrl} 
                        controls 
                        autoPlay 
                        loop 
                        className="max-w-full max-h-[60vh] rounded-xl shadow-2xl border border-white/10"
                    />
                    <button 
                        onClick={downloadVideo}
                        className="mt-6 px-6 py-3 bg-white text-black rounded-full font-bold text-sm flex items-center hover:bg-slate-200 transition-colors shadow-lg"
                    >
                        <Download className="w-4 h-4 mr-2" />
                        Download MP4
                    </button>
                </div>
            ) : isGenerating ? (
                <div className="text-center animate-pulse">
                    <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4 relative">
                        <div className="absolute inset-0 border-4 border-violet-500 rounded-full border-t-transparent animate-spin"></div>
                        <Film className="w-8 h-8 text-violet-400" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Creating Magic</h3>
                    <p className="text-sm text-slate-400">Veo is dreaming up your video...</p>
                </div>
            ) : (
                <div className="text-center opacity-40">
                    <div className="w-24 h-24 rounded-3xl bg-white/5 border-2 border-dashed border-white/20 flex items-center justify-center mx-auto mb-4 rotate-3">
                        <Play className="w-10 h-10 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-300">Your video preview will appear here</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default VeoModal;