import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SubjectProgressProps {
  progress: number;
  onChange: (value: number) => void;
  isDarkMode: boolean;
  className?: string;
}

const SubjectProgress: React.FC<SubjectProgressProps> = ({ 
  progress, 
  onChange, 
  isDarkMode, 
  className = ''
}) => {
  const getProgressStyle = (val: number) => {
      let activeColor = '#0ea5e9'; // Sky 500 (Default)
      if (val >= 100) activeColor = '#10b981'; // Emerald 500
      else if (val >= 75) activeColor = '#3b82f6'; // Blue 500
      else if (val >= 40) activeColor = '#f59e0b'; // Amber 500
      
      const trackColor = isDarkMode ? '#333333' : '#e2e8f0'; 
      
      return {
          background: `linear-gradient(to right, ${activeColor} 0%, ${activeColor} ${val}%, ${trackColor} ${val}%, ${trackColor} 100%)`
      };
  };

  const isComplete = progress === 100;

  return (
    <div 
      className={`w-full ${className}`} 
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-2" id="progress-label">
          <span className="text-[10px] font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-wider flex items-center gap-1.5">
              {isComplete ? (
                  <span className="text-emerald-500 flex items-center animate-pulse">
                      <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                      Completed
                  </span>
              ) : (
                  <span>Study Progress</span>
              )}
          </span>
          <span className={`text-xs font-black ${isComplete ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'}`}>
              {progress}%
          </span>
      </div>
      
      <div className="relative h-2 w-full rounded-full group/slider">
        <input 
            type="range" 
            min="0" 
            max="100" 
            step="5"
            value={progress}
            onChange={(e) => onChange(parseInt(e.target.value))}
            style={getProgressStyle(progress)}
            aria-label="Subject completion progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            aria-valuetext={`${progress}% complete`}
            className="absolute inset-0 w-full h-full rounded-full appearance-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-black transition-all [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-slate-400 [&::-webkit-slider-thumb]:transition-transform [&::-webkit-slider-thumb]:hover:scale-125"
        />
      </div>
    </div>
  );
};

export default SubjectProgress;