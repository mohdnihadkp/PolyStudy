import React from 'react';
import { Bell, Calendar, ExternalLink, Megaphone, AlertTriangle, FileText } from 'lucide-react';
import { DepartmentAnnouncement } from '../types';

interface DepartmentAnnouncementProps {
  data: DepartmentAnnouncement;
}

const DepartmentAnnouncement: React.FC<DepartmentAnnouncementProps> = ({ data }) => {
  // Determine styles based on variant
  const getVariantStyles = () => {
    switch (data.variant) {
      case 'warning':
        return {
          container: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-700/30',
          iconBg: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
          title: 'text-amber-900 dark:text-amber-100',
          text: 'text-amber-800 dark:text-amber-200/80',
          button: 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
        };
      case 'gradient':
        return {
          container: 'bg-white dark:bg-[#0a0a0a] border-transparent',
          iconBg: 'bg-white/20 text-white',
          title: 'text-white',
          text: 'text-white/90',
          button: 'bg-white text-violet-600 hover:bg-blue-50 shadow-black/20'
        };
      default: // info
        return {
          container: 'bg-sky-50 dark:bg-sky-900/10 border-sky-200 dark:border-sky-700/30',
          iconBg: 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400',
          title: 'text-sky-900 dark:text-sky-100',
          text: 'text-sky-800 dark:text-sky-200/80',
          button: 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
        };
    }
  };

  const styles = getVariantStyles();
  const isGradient = data.variant === 'gradient';

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border shadow-lg animate-fade-in mb-8 group ${styles.container}`}>
      
      {/* Background Effect for Gradient Variant */}
      {isGradient && (
        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-indigo-600 bg-[length:200%_200%] animate-shimmer"></div>
      )}

      {/* Decorative noise/texture overlay for gradient */}
      {isGradient && (
         <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      )}

      <div className="relative z-10 p-5 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 items-start">
        {/* Icon Box */}
        <div className={`p-3.5 rounded-xl shadow-sm flex-shrink-0 ${styles.iconBg} ${isGradient ? 'backdrop-blur-md border border-white/20' : ''}`}>
           {data.variant === 'warning' ? <AlertTriangle className="w-6 h-6 animate-pulse" /> : 
            isGradient ? <Megaphone className="w-6 h-6 animate-float" /> : 
            <Bell className="w-6 h-6" />}
        </div>

        <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                <h3 className={`text-lg md:text-xl font-bold ${styles.title}`}>
                    {data.title}
                </h3>
                {data.date && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-lg bg-black/5 dark:bg-white/10 backdrop-blur-sm ${isGradient ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                        {data.date}
                    </span>
                )}
            </div>
            
            <p className={`text-sm md:text-base font-medium leading-relaxed mb-4 ${styles.text}`}>
                {data.message}
            </p>

            {/* Links Section */}
            {data.links && data.links.length > 0 && (
                <div className="flex flex-wrap gap-3">
                    {data.links.map((link, idx) => (
                        <a 
                            key={idx}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center transition-all transform hover:-translate-y-0.5 shadow-md hover:shadow-lg ${styles.button}`}
                        >
                            {link.text.toLowerCase().includes('timetable') ? <Calendar className="w-4 h-4 mr-2" /> : <ExternalLink className="w-4 h-4 mr-2" />}
                            {link.text}
                        </a>
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default DepartmentAnnouncement;