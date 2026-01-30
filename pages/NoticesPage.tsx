
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ContactModal from '../components/ContactModal';
import NoticesModal from '../components/NoticesModal';
import FacilitiesModal from '../components/FacilitiesModal';
import AboutModal from '../components/AboutModal';
import AdBanner from '../components/AdBanner';
import { APP_NOTICES } from '../constants';
import { Calendar, ExternalLink, BellRing, ArrowLeft, Bell } from 'lucide-react';

interface NoticesPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const NoticesPage: React.FC<NoticesPageProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  
  // Modals state (to maintain Header functionality)
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); 
  const [isFacilitiesModalOpen, setIsFacilitiesModalOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onHomeClick={() => navigate('/')} 
        isHome={false} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onSearch={() => {}} 
        onBookmarksClick={() => {}} 
        onScholarshipsClick={() => navigate('/scholarship')}
        onFacilitiesClick={() => setIsFacilitiesModalOpen(true)}
        onNoticesClick={() => setIsNoticesModalOpen(true)}
        onAboutClick={() => setIsAboutModalOpen(true)}
        onContactClick={() => setIsContactModalOpen(true)}
      />

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center">
                <button onClick={() => navigate('/')} className="glass-button p-3 rounded-full mr-4 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-2xl text-red-600 dark:text-red-400 shadow-sm rotate-3">
                        <BellRing className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Notice Board</h1>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">Official updates, exam schedules, and news.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Notices Timeline Layout */}
        <div className="max-w-4xl mx-auto">
            <div className="relative border-l-2 border-slate-200 dark:border-white/10 ml-4 md:ml-6 space-y-12 pb-12">
                {APP_NOTICES.map((notice, idx) => (
                    <div key={notice.id} className="relative pl-8 md:pl-12 group animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                        {/* Timeline Dot */}
                        <div className={`absolute -left-[9px] md:-left-[11px] top-0 w-5 h-5 md:w-6 md:h-6 rounded-full border-4 border-white dark:border-black ${notice.isNew ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.6)] animate-pulse' : 'bg-slate-300 dark:bg-neutral-600'}`}></div>
                        
                        <div className="glass-panel p-6 md:p-8 rounded-3xl bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 hover:border-sky-300 dark:hover:border-sky-500/30 transition-all hover:shadow-xl hover:-translate-y-1">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4">
                                <span className="flex items-center text-xs md:text-sm font-bold text-slate-400 uppercase tracking-widest">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {notice.date}
                                </span>
                                {notice.isNew && (
                                    <span className="self-start md:self-auto px-3 py-1 bg-red-500 text-white text-[10px] md:text-xs font-black uppercase tracking-wider rounded-full shadow-lg shadow-red-500/30 flex items-center gap-1">
                                        <Bell className="w-3 h-3 fill-current" /> New Update
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white mb-4 leading-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                                {notice.title}
                            </h3>
                            
                            <div className="prose prose-sm md:prose-base dark:prose-invert text-slate-600 dark:text-neutral-300 leading-relaxed mb-6">
                                {notice.content}
                            </div>

                            {notice.links && notice.links.length > 0 && (
                                <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex flex-wrap gap-3">
                                    {notice.links.map((link, lIdx) => (
                                        <a 
                                            key={lIdx}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 text-xs md:text-sm font-bold hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-all hover:scale-105"
                                        >
                                            <ExternalLink className="w-4 h-4 mr-2" />
                                            {link.label}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="flex justify-center w-full mt-8">
            <AdBanner format="leaderboard" />
        </div>

      </main>

      <Footer onNoticesClick={() => setIsNoticesModalOpen(true)} />

      {/* Modals */}
      {isContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
      {isFacilitiesModalOpen && <FacilitiesModal onClose={() => setIsFacilitiesModalOpen(false)} />}
      {isNoticesModalOpen && <NoticesModal onClose={() => setIsNoticesModalOpen(false)} />}
      {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
    </div>
  );
};

export default NoticesPage;
