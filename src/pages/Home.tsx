
import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DepartmentCard from '../components/DepartmentCard';
import ContactModal from '../components/ContactModal';
import NoticesModal from '../components/NoticesModal';
import AboutModal from '../components/AboutModal'; 
import FacilitiesModal from '../components/FacilitiesModal';
import { DEPARTMENTS } from '../constants';
import { Department } from '../types';
import { GraduationCap, Sparkles, Heart, Github, Linkedin, Instagram, Twitter, ExternalLink, MessageSquare, Hexagon } from 'lucide-react';
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

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onHomeClick={() => {}} 
        isHome={true} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onSearch={() => {}} // Search could be implemented to redirect
        onBookmarksClick={() => {}} // Bookmarks logic pending refactor
        onScholarshipsClick={() => navigate('/scholarship')}
        onFacilitiesClick={() => setIsFacilitiesModalOpen(true)}
        onNoticesClick={() => setIsNoticesModalOpen(true)}
        onAboutClick={() => setIsAboutModalOpen(true)}
        onContactClick={() => setIsContactModalOpen(true)}
      />

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          <div className="space-y-12 animate-slide-up">
            <header className="text-center max-w-3xl mx-auto mb-10 pt-4" ref={parallaxRef} style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}>
              <div className="inline-flex items-center justify-center p-4 glass-panel rounded-full mb-6">
                 <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2.5 rounded-full text-white">
                    <GraduationCap className="w-8 h-8 fill-current" />
                 </div>
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                Kerala Polytechnic Study Materials - PolyStudy
              </h1>
              <p className="text-lg text-slate-600 dark:text-neutral-400 font-medium max-w-xl mx-auto">
                Premium resources, solved papers, and AI tutoring for academic excellence.
              </p>
            </header>

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

      {/* Footer */}
      <footer className="relative mt-20 bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-white/5 pt-16 pb-8 z-10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
            <div className="flex justify-center mb-16 w-full">
                <div className="w-full max-w-4xl">
                    <AdBanner format="native" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-sky-500 text-white p-2 rounded-lg">
                            <Hexagon className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">PolyStudy</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Democratizing education for Kerala Polytechnic students with open-source resources.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <a href="https://github.com/mohdnihadkp" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="https://www.linkedin.com/in/mohammed-nihad-kp-71b6b6339" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
                    </div>
                </div>
                {/* Simplified Footer Links */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6">Explore</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <li><button onClick={() => navigate('/')} className="hover:text-sky-500 transition-colors text-left w-full">Departments</button></li>
                        <li><button onClick={() => navigate('/scholarship')} className="hover:text-sky-500 transition-colors text-left w-full">Scholarships</button></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400 font-medium">© {new Date().getFullYear()} PolyStudy.</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>Made with</span>
                    <Heart className="w-3 h-3 text-red-500 fill-current" />
                    <span>in Kerala</span>
                </div>
            </div>
        </div>
      </footer>

      {/* Modals */}
      {isContactModalOpen && <ContactModal onClose={() => setIsContactModalOpen(false)} />}
      {isFacilitiesModalOpen && <FacilitiesModal onClose={() => setIsFacilitiesModalOpen(false)} />}
      {isNoticesModalOpen && <NoticesModal onClose={() => setIsNoticesModalOpen(false)} />}
      {isAboutModalOpen && <AboutModal onClose={() => setIsAboutModalOpen(false)} />}
    </div>
  );
};

export default Home;
