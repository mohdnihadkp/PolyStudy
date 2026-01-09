
import React from 'react';
import { Hexagon, Sparkles } from 'lucide-react';

const SplashScreen = () => {
  return (
    <div className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center overflow-hidden">
      {/* Background Glow */}
      <div className="absolute w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
      
      <div className="relative z-10 flex flex-col items-center">
        {/* Animated Logo Container */}
        <div className="relative w-32 h-32 mb-8">
            {/* Spinning Rings */}
            <div className="absolute inset-0 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-sky-500 rounded-full animate-spin"></div>
            <div className="absolute inset-4 border-4 border-slate-800 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-transparent border-b-violet-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
            
            {/* Center Icon */}
            <div className="absolute inset-0 flex items-center justify-center">
                <Hexagon className="w-12 h-12 text-white fill-white/10 animate-pulse" />
            </div>
        </div>

        {/* Text Animation */}
        <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter animate-fade-in-up">
                Poly<span className="text-sky-500">Study</span>
            </h1>
            <div className="flex items-center justify-center gap-2 text-slate-400 text-sm font-medium animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Academic Companion</span>
            </div>
        </div>

        {/* Loading Bar */}
        <div className="mt-12 w-48 h-1 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-sky-500 to-violet-500 w-full origin-left animate-[scaleIn_2.5s_ease-out_forwards]"></div>
        </div>
        
        {/* Taglines */}
        <div className="mt-4 h-6 overflow-hidden">
             <div className="animate-[slideUp_2.5s_infinite] text-xs text-slate-500 font-mono">
                 <div className="h-6 flex items-center justify-center">Loading AI Modules...</div>
                 <div className="h-6 flex items-center justify-center">Fetching Resources...</div>
                 <div className="h-6 flex items-center justify-center">Preparing Environment...</div>
             </div>
        </div>
      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-8 text-xs text-slate-700 font-mono">
        v2.5.0
      </div>
    </div>
  );
};

export default SplashScreen;
