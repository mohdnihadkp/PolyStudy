import React, { useState, useEffect } from 'react';
import { X, Info, Phone } from 'lucide-react';

export default function SalePopup() {
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!isVisible) return;

    // Timer to decrement the seconds
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsVisible(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-poly-500/20 overflow-hidden animate-scale-in">
        
        {/* Progress bar for the 5-second countdown */}
        <div 
          className="absolute top-0 left-0 h-1 bg-poly-500 transition-all duration-1000 ease-linear" 
          style={{ width: `${(timeLeft / 5) * 100}%` }} 
        />
        
        <button 
          onClick={() => setIsVisible(false)}
          className="absolute top-3 right-3 p-1.5 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Close popup"
        >
          <X size={20} />
        </button>

        <div className="p-6 sm:p-8 text-center flex flex-col items-center">
          <div className="w-14 h-14 rounded-full bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center mb-5 text-amber-600 dark:text-amber-400 ring-4 ring-amber-50 dark:ring-amber-500/10">
            <Info size={28} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            Website for Sale!
          </h2>
          
          <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
            I am selling the <strong>PolyStudy</strong> website. If you are interested in acquiring this platform, please reach out for more details.
          </p>
          
          <a 
            href="tel:+919846750898" 
            className="w-full inline-flex justify-center items-center gap-2 px-6 py-3.5 bg-poly-600 hover:bg-poly-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-poly-500/25 hover:shadow-poly-500/40 mb-4"
          >
            <Phone size={18} />
            +91 98467 50898
          </a>
          
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-slate-400 dark:bg-slate-500 animate-pulse" />
            Closing automatically in {timeLeft}s
          </p>
        </div>
      </div>
    </div>
  );
}
