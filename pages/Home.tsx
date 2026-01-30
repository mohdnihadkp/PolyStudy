
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DepartmentCard from '../components/DepartmentCard';
import ContactModal from '../components/ContactModal';
import NoticesModal from '../components/NoticesModal';
import AboutModal from '../components/AboutModal'; 
import FacilitiesModal from '../components/FacilitiesModal';
import Footer from '../components/Footer';
import { DEPARTMENTS, APP_NOTICES } from '../constants';
import { Department } from '../types';
import { GraduationCap, Sparkles, TrendingUp, Search, Bell, ChevronRight } from 'lucide-react';
import AdBanner from '../components/AdBanner';

interface HomeProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Home: React.FC<HomeProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentQuote, setCurrentQuote] = useState(0);
  
  // Modals state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); 
  const [isFacilitiesModalOpen, setIsFacilitiesModalOpen] = useState(false);

  const parallaxRef = useRef<HTMLDivElement>(null);

  const quotes = useMemo(() => [
      { text: "Engineering is the closest thing to magic that exists in the world.", author: "Elon Musk" },
      { text: "Scientists study the world as it is, engineers create the world that never has been.", author: "Theodore von Karman" },
      { text: "The way to succeed is to double your failure rate.", author: "Thomas J. Watson" },
      { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" }
  ], []);

  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentQuote(prev => (prev + 1) % quotes.length);
      }, 6000);
      return () => clearInterval(timer);
  }, [quotes]);

  // Parallax Effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX - window.innerWidth / 2) / 80;
        const y = (e.clientY - window.innerHeight / 2) / 80;
        setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleDeptSelect = (dept: Department) => {
    navigate(`/${dept.id}`);
  };

  // Keyword-rich predictions for SEO internal linking
  const trendingSearches = [
      { label: "SITTTR Question Papers", path: "/ce/sem5" },
      { label: "Semester 1 Maths Notes", path: "/ce/sem1" },
      { label: "Computer Engineering Solved Papers", path: "/ce" },
      { label: "AI Tutor for Diploma", path: "/ai-tutor" },
      { label: "Pragati Scholarship", path: "/scholarship" },
      { label: "Exam Timetable 2025", path: "/notices" },
  ];

  const hasNewNotices = APP_NOTICES.some(n => n.isNew);
  const latestNotice = APP_NOTICES.find(n => n.isNew) || APP_NOTICES[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onHomeClick={() => {}} 
        isHome={true} 
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
          <div className="space-y-12 animate-slide-up">
            <header className="text-center max-w-3xl mx-auto mb-10 pt-4" ref={parallaxRef} style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}>
              
              {/* Notable Place: Dynamic Notice Pill */}
              <button 
                onClick={() => setIsNoticesModalOpen(true)}
                className={`inline-flex items-center gap-2 pl-1 pr-4 py-1 rounded-full mb-6 transition-all group border ${hasNewNotices ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400' : 'bg-slate-100 dark:bg-white/5 border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300'}`}
              >
                <div className={`p-1.5 rounded-full ${hasNewNotices ? 'bg-red-500 text-white' : 'bg-slate-300 dark:bg-white/20 text-slate-600 dark:text-white'}`}>
                    <Bell className="w-3 h-3" />
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold">
                    <span className="uppercase tracking-wider">{hasNewNotices ? 'New Update:' : 'Notice:'}</span>
                    <span className="font-medium truncate max-w-[200px] sm:max-w-[300px]">{latestNotice.title}</span>
                    <ChevronRight className="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </button>

              <div className="flex justify-center mb-6">
                 <div className="inline-flex items-center justify-center p-4 glass-panel rounded-full">
                    <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2.5 rounded-full text-white">
                        <GraduationCap className="w-8 h-8 fill-current" />
                    </div>
                 </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                Kerala Polytechnic Study Materials - PolyStudy
              </h1>
              <p className="text-lg text-slate-600 dark:text-neutral-400 font-medium max-w-xl mx-auto">
                Access SITTTR solved question papers, revision notes, video lectures, and AI tutoring for academic excellence.
              </p>
            </header>

            {/* SEO Strategy: Trending Searches (Internal Links) */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
                <div className="flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
                    <TrendingUp className="w-4 h-4 mr-1" /> Trending:
                </div>
                {trendingSearches.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => item.path === '/notices' ? setIsNoticesModalOpen(true) : navigate(item.path)}
                        className="px-3 py-1 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:text-sky-600 dark:hover:text-sky-400 transition-colors flex items-center"
                    >
                        <Search className="w-3 h-3 mr-1 opacity-50" />
                        {item.label}
                    </button>
                ))}
            </div>

            <section>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6" style={{ transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)` }}>
                  {DEPARTMENTS.map((dept) => (
                    <DepartmentCard key={dept.id} department={dept} onClick={handleDeptSelect} />
                  ))}
                </div>
            </section>
            
            <div className="mt-8 flex justify-center">
                <div className="glass-panel py-2 px-6 rounded-full flex items-center space-x-3">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic">
                        "{quotes[currentQuote].text}"
                    </p>
                </div>
            </div>
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

export default Home;
