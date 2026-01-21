
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Header from './components/Header';
import DepartmentCard from './components/DepartmentCard';
import ResourceList from './components/ResourceList';
import VideoGallery from './components/VideoGallery';
import AITutor from './components/AITutor';
import PDFViewer from './components/PDFViewer';
import VideoPlayer from './components/VideoPlayer';
import SearchResults from './components/SearchResults';
import AdBanner from './components/AdBanner'; 
import DriveFolderModal from './components/DriveFolderModal'; 
import SyncModal from './components/SyncModal'; 
import ScholarshipModal from './components/ScholarshipModal';
import ContactModal from './components/ContactModal';
import VeoModal from './components/VeoModal';
import StudyToolsModal from './components/StudyToolsModal';
import DepartmentAIModal from './components/DepartmentAIModal';
import SubjectProgress from './components/SubjectProgress';
import HexagonBackground from './components/HexagonBackground'; 
import NoticesModal from './components/NoticesModal';
import AboutModal from './components/AboutModal'; 
import { DEPARTMENTS, SEMESTERS, APP_NOTICES } from './constants';
import { Department, Semester, Subject, ResourceCategory, Resource, VideoLecture, BookmarkItem } from './types';
import { Book, Video, Bot, GraduationCap, ArrowLeft, Layers, Calendar, FolderOpen, ChevronRight, FileText, ArrowRight, Zap, Hexagon, ExternalLink, CheckCircle2, Bookmark, AlertTriangle, MessageSquare, Sparkles, Github, Instagram, Facebook, Twitter, Linkedin, Phone, Bell, Heart, Globe } from 'lucide-react';

interface SearchResultItem {
  type: 'dept' | 'subject' | 'video';
  item: Department | Subject | VideoLecture;
  dept?: Department;
  sem?: string;
  score: number;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // App State
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<Semester | null>(null);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | null>(null);
  const [isBookmarksView, setIsBookmarksView] = useState(false);
  
  // Subject-level tab state
  const [subjectTab, setSubjectTab] = useState<'materials' | 'videos' | 'ai'>('materials');
  
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoLecture | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [isScholarshipModalOpen, setIsScholarshipModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isVeoModalOpen, setIsVeoModalOpen] = useState(false);
  const [isToolsModalOpen, setIsToolsModalOpen] = useState(false);
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false); 
  const [isDeptAIModalOpen, setIsDeptAIModalOpen] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);

  // Progress State
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  const parallaxRef1 = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [currentQuote, setCurrentQuote] = useState(0);

  const quotes = useMemo(() => [
      { text: "Engineering is the closest thing to magic that exists in the world.", author: "Elon Musk" },
      { text: "Scientists study the world as it is, engineers create the world that never has been.", author: "Theodore von Karman" },
      { text: "The way to succeed is to double your failure rate.", author: "Thomas J. Watson" },
      { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" }
  ], []);

  // --- SOCIAL AD SCRIPT INJECTION ---
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://remotelydependedchance.com/f7/04/cd/f704cd9f226dfbb6e0274063024d326d.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  // --- QUOTE ROTATION ---
  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentQuote(prev => (prev + 1) % quotes.length);
      }, 6000);
      return () => clearInterval(timer);
  }, [quotes]);

  // --- SEARCH DEBOUNCE ---
  useEffect(() => {
      const timer = setTimeout(() => {
          setDebouncedSearchQuery(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- HISTORY & NAVIGATION ---
  const pushHistory = useCallback((newState: any, replace = false) => {
    if (replace) {
      window.history.replaceState(newState, '');
    } else {
      window.history.pushState(newState, '');
    }
  }, []);

  const restoreView = useCallback((state: any) => {
      setPlayingVideo(null);
      setViewingResource(null);
      setIsDriveModalOpen(false);
      setIsSyncModalOpen(false);
      setIsScholarshipModalOpen(false);
      setIsContactModalOpen(false);
      setIsVeoModalOpen(false);
      setIsToolsModalOpen(false);
      setIsNoticesModalOpen(false);
      setIsAboutModalOpen(false);
      setIsDeptAIModalOpen(false);

      if (!state || state.view === 'home') {
        setSelectedDept(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setIsBookmarksView(false);
      } else if (state.view === 'bookmarks') {
        setIsBookmarksView(true);
        setSelectedDept(null);
      } else if (state.view === 'dept') {
        const dept = DEPARTMENTS.find(d => d.id === state.deptId);
        if (dept) { setSelectedDept(dept); setSelectedSemester(null); setIsBookmarksView(false); }
      } else if (state.view === 'sem') {
        const dept = DEPARTMENTS.find(d => d.id === state.deptId);
        if (dept) { setSelectedDept(dept); setSelectedSemester(state.semId); setSelectedSubject(null); }
      } else if (state.view === 'sub') {
        const dept = DEPARTMENTS.find(d => d.id === state.deptId);
        const sub = dept?.subjects.find(s => s.id === state.subId);
        if (dept && sub) {
          setSelectedDept(dept); setSelectedSemester(state.semId); setSelectedSubject(sub);
          if (state.tab) setSubjectTab(state.tab);
        }
      }

      if (state?.modal === 'contact') setIsContactModalOpen(true);
      if (state?.modal === 'scholarship') setIsScholarshipModalOpen(true);
      if (state?.modal === 'veo') setIsVeoModalOpen(true);
      if (state?.modal === 'tools') setIsToolsModalOpen(true);
      if (state?.modal === 'notices') setIsNoticesModalOpen(true);
      if (state?.modal === 'about') setIsAboutModalOpen(true);
      if (state?.modal === 'deptAI') setIsDeptAIModalOpen(true);
  }, []);

  useEffect(() => {
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '');
    } else {
      restoreView(window.history.state);
    }
    const handlePopState = (event: PopStateEvent) => restoreView(event.state);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [restoreView]);

  // --- DATA PERSISTENCE ---
  useEffect(() => {
    const savedProgress = localStorage.getItem('pollytechnic_progress');
    if (savedProgress) setProgressData(JSON.parse(savedProgress));
    const savedBookmarks = localStorage.getItem('pollytechnic_bookmarks');
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  const updateProgress = useCallback((subjectId: string, value: number) => {
    setProgressData(prev => {
        const newData = { ...prev, [subjectId]: value };
        localStorage.setItem('pollytechnic_progress', JSON.stringify(newData));
        return newData;
    });
  }, []);

  const toggleBookmark = useCallback((item: BookmarkItem) => {
    setBookmarks(prev => {
        const exists = prev.some(b => b.id === item.id);
        const newBookmarks = exists ? prev.filter(b => b.id !== item.id) : [...prev, item];
        localStorage.setItem('pollytechnic_bookmarks', JSON.stringify(newBookmarks));
        return newBookmarks;
    });
  }, []);

  const isBookmarked = useCallback((id: string) => bookmarks.some(b => b.id === id), [bookmarks]);

  // --- NAVIGATION HANDLERS ---
  const handleDeptSelect = useCallback((dept: Department) => {
    pushHistory({ view: 'dept', deptId: dept.id });
    setSelectedDept(dept);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setIsBookmarksView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pushHistory]);

  const handleSemesterSelect = useCallback((sem: Semester) => {
    if (!selectedDept) return;
    pushHistory({ view: 'sem', deptId: selectedDept.id, semId: sem });
    setSelectedSemester(sem);
    setSelectedSubject(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDept, pushHistory]);

  const handleSubjectSelect = useCallback((subject: Subject) => {
    if (!selectedDept || !selectedSemester) return;
    pushHistory({ view: 'sub', deptId: selectedDept.id, semId: selectedSemester, subId: subject.id });
    setSelectedSubject(subject);
    setSubjectTab('materials');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [selectedDept, selectedSemester, pushHistory]);

  const handleHomeClick = useCallback(() => {
    pushHistory({ view: 'home' });
    setSelectedDept(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setIsBookmarksView(false);
  }, [pushHistory]);
  
  const handleBookmarksClick = useCallback(() => {
      pushHistory({ view: 'bookmarks' });
      setIsBookmarksView(true);
      setSelectedDept(null);
  }, [pushHistory]);

  const openModal = useCallback((modalName: string, setter: (val: boolean) => void) => {
      const currentState = window.history.state || { view: 'home' };
      pushHistory({ ...currentState, modal: modalName });
      setter(true);
  }, [pushHistory]);

  const closeModal = useCallback(() => window.history.back(), []);

  // --- PARALLAX ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX - window.innerWidth / 2) / 80;
        const y = (e.clientY - window.innerHeight / 2) / 80;
        setMousePosition({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const filteredSubjects = useMemo(() => selectedDept?.subjects.filter(s => s.semester === selectedSemester) || [], [selectedDept, selectedSemester]);
  const filteredVideos = useMemo(() => selectedDept?.videos.filter(v => v.semester === selectedSemester) || [], [selectedDept, selectedSemester]);

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      <HexagonBackground />
      
      {/* Top Ad Banner - Responsive Leaderboard */}
      <div className="flex justify-center w-full z-40 relative my-2 sm:my-4">
          <AdBanner format="leaderboard" />
      </div>

      <Header 
        onHomeClick={handleHomeClick} 
        isHome={!selectedDept && !isBookmarksView} 
        isDarkMode={isDarkMode} 
        toggleTheme={() => setIsDarkMode(!isDarkMode)}
        onSearch={setSearchQuery}
        onSyncClick={() => openModal('sync', setIsSyncModalOpen)}
        onBookmarksClick={handleBookmarksClick}
        onScholarshipsClick={() => openModal('scholarship', setIsScholarshipModalOpen)}
        onVeoClick={() => openModal('veo', setIsVeoModalOpen)}
        onToolsClick={() => openModal('tools', setIsToolsModalOpen)}
        onNoticesClick={() => openModal('notices', setIsNoticesModalOpen)}
        onAboutClick={() => openModal('about', setIsAboutModalOpen)}
        onContactClick={() => openModal('contact', setIsContactModalOpen)}
      />

      {searchQuery && (
        <SearchResults 
          results={searchResults} 
          onSelectResult={(res) => { /* Handle search logic from original file */ }} 
          onClose={() => setSearchQuery('')}
          query={searchQuery}
        />
      )}

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 transition-opacity duration-300">
        {isBookmarksView ? (
             <section className="animate-slide-up">
                 <div className="flex items-center mb-8">
                    <button onClick={handleHomeClick} className="glass-button p-3 rounded-full mr-4">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Your Bookmarks</h2>
                    </div>
                 </div>
                 {/* Bookmarks Grid */}
                 {bookmarks.length === 0 ? (
                     <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-2">
                         <Bookmark className="h-8 w-8 mx-auto text-slate-400 mb-4" />
                         <h3 className="text-xl font-bold">No bookmarks yet</h3>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {bookmarks.map(item => (
                             <article 
                                key={item.id}
                                onClick={() => {
                                    if (item.type === 'subject') {
                                        const dept = DEPARTMENTS.find(d => d.id === item.deptId) || DEPARTMENTS[0];
                                        setSelectedDept(dept);
                                        setSelectedSemester((item.data as Subject).semester);
                                        setSelectedSubject(item.data as Subject);
                                    }
                                    setIsBookmarksView(false);
                                }}
                                className="glass-panel p-5 rounded-3xl cursor-pointer hover:scale-[1.02] transition-transform"
                             >
                                 <h4 className="font-bold text-lg">{item.title}</h4>
                                 <p className="text-xs text-slate-500">{item.subtitle}</p>
                             </article>
                         ))}
                     </div>
                 )}
             </section>
        ) : !selectedDept ? (
          <div className="space-y-12 animate-slide-up">
            <header className="text-center max-w-3xl mx-auto mb-10 pt-4" ref={parallaxRef1} style={{ transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)` }}>
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

            {/* Native Banner on Front Page */}
            <div className="max-w-4xl mx-auto my-8">
                <AdBanner format="native" />
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
        ) : !selectedSemester ? (
           <div className="animate-slide-up pt-2">
             <div className="flex items-center mb-6">
                <button onClick={handleHomeClick} className="glass-button p-3 rounded-full mr-4">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl md:text-4xl font-black">{selectedDept.name}</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SEMESTERS.map((sem) => (
                    <button key={sem} onClick={() => handleSemesterSelect(sem)} className="glass-panel p-6 rounded-2xl text-left hover:scale-[1.02] transition-transform">
                        <h3 className="text-xl font-bold">{sem}</h3>
                        <ArrowRight className="w-4 h-4 mt-4" />
                    </button>
                ))}
             </div>
           </div>
         ) : !selectedSubject ? (
            <div className="animate-slide-up pt-2">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button onClick={closeModal} className="glass-button p-3 rounded-full mr-4">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <h2 className="text-2xl md:text-3xl font-black">Subjects</h2>
                    </div>
                    <button onClick={() => openModal('deptAI', setIsDeptAIModalOpen)} className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl">
                        <Bot className="w-5 h-5" /> AI Assistant
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {filteredSubjects.map(sub => (
                         <div key={sub.id} onClick={() => handleSubjectSelect(sub)} className="glass-panel p-5 rounded-2xl cursor-pointer hover:shadow-lg transition-all">
                             <h3 className="text-lg font-bold">{sub.title}</h3>
                             <p className="text-sm text-slate-500 line-clamp-2">{sub.description}</p>
                         </div>
                     ))}
                 </div>
            </div>
         ) : (
            <div className="animate-slide-up flex flex-col">
                <div className="flex items-center mb-6">
                    <button onClick={closeModal} className="glass-button p-3 rounded-full mr-4">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl md:text-3xl font-black truncate">{selectedSubject.title}</h2>
                </div>
                
                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6 self-start">
                    {['materials', 'videos', 'ai'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setSubjectTab(t as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize ${subjectTab === t ? 'bg-white dark:bg-neutral-800 shadow-md' : 'text-slate-500'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1">
                    {subjectTab === 'materials' && (
                        <div className="animate-fade-in space-y-6">
                            <SubjectProgress progress={progressData[selectedSubject.id] || 0} onChange={(val) => updateProgress(selectedSubject.id, val)} isDarkMode={isDarkMode} />
                             <div onClick={() => openModal('drive', setIsDriveModalOpen)} className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-sky-400 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FolderOpen className="w-7 h-7 text-sky-600" />
                                    <h3 className="text-lg font-bold">Course Materials (Drive)</h3>
                                </div>
                                <ExternalLink className="w-5 h-5" />
                             </div>
                        </div>
                    )}
                    {subjectTab === 'videos' && (
                        <VideoGallery videos={filteredVideos} onPlay={setPlayingVideo} onToggleBookmark={() => {}} isBookmarked={isBookmarked} />
                    )}
                    {subjectTab === 'ai' && (
                        <AITutor departmentName={selectedDept.name} semesterName={selectedSemester} subjectName={selectedSubject.title} />
                    )}
                </div>
            </div>
         )}
      </main>

      {/* Conditional Modals */}
      {viewingResource && <PDFViewer url={viewingResource.url} title={viewingResource.title} onClose={() => setViewingResource(null)} />}
      {playingVideo && <VideoPlayer youtubeId={playingVideo.youtubeId} title={playingVideo.title} onClose={() => setPlayingVideo(null)} />}
      {isDriveModalOpen && selectedSubject?.driveLink && <DriveFolderModal url={selectedSubject.driveLink} title={selectedSubject.title} onClose={closeModal} />}
      {isSyncModalOpen && <SyncModal isOpen={isSyncModalOpen} onClose={closeModal} progressData={progressData} onImport={(d) => setProgressData(d)} />}
      {isScholarshipModalOpen && <ScholarshipModal onClose={closeModal} />}
      {isContactModalOpen && <ContactModal onClose={closeModal} />}
      {isVeoModalOpen && <VeoModal onClose={closeModal} />}
      {isToolsModalOpen && <StudyToolsModal onClose={closeModal} />}
      {isNoticesModalOpen && <NoticesModal onClose={closeModal} />}
      {isAboutModalOpen && <AboutModal onClose={closeModal} />}
      {isDeptAIModalOpen && selectedDept && selectedSemester && <DepartmentAIModal departmentName={selectedDept.name} semesterName={selectedSemester} onClose={closeModal} />}

      {/* RICH FOOTER */}
      <footer className="relative mt-20 bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-white/5 pt-16 pb-8 z-10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
            
            {/* Ad Banner before footer content */}
            <div className="flex justify-center mb-16">
                <AdBanner format="leaderboard" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                {/* Brand Column */}
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-sky-500 text-white p-2 rounded-lg">
                            <Hexagon className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">PolyStudy</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Democratizing education for Kerala Polytechnic students with open-source resources, AI tutoring, and premium study materials.
                    </p>
                    <div className="flex items-center gap-4 pt-2">
                        <a href="https://github.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors"><Github className="w-5 h-5" /></a>
                        <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors"><Linkedin className="w-5 h-5" /></a>
                        <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors"><Instagram className="w-5 h-5" /></a>
                        <a href="https://twitter.com" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors"><Twitter className="w-5 h-5" /></a>
                    </div>
                </div>

                {/* Explore Column */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6">Explore</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <li><button onClick={handleHomeClick} className="hover:text-sky-500 transition-colors text-left w-full">Departments</button></li>
                        <li><button onClick={() => openModal('veo', setIsVeoModalOpen)} className="hover:text-sky-500 transition-colors text-left w-full">Veo Animator</button></li>
                        <li><button onClick={() => openModal('scholarship', setIsScholarshipModalOpen)} className="hover:text-sky-500 transition-colors text-left w-full">Scholarships</button></li>
                        <li><button onClick={() => openModal('tools', setIsToolsModalOpen)} className="hover:text-sky-500 transition-colors text-left w-full">Study Tools</button></li>
                    </ul>
                </div>

                {/* Support Column */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <li><button onClick={() => openModal('contact', setIsContactModalOpen)} className="hover:text-sky-500 transition-colors text-left w-full">Feedback</button></li>
                        <li><button onClick={() => openModal('about', setIsAboutModalOpen)} className="hover:text-sky-500 transition-colors text-left w-full">About Us</button></li>
                        <li><button onClick={() => openModal('notices', setIsNoticesModalOpen)} className="hover:text-sky-500 transition-colors text-left w-full">Notices</button></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Report Issue</a></li>
                    </ul>
                </div>

                {/* Legal Column */}
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6">Legal</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Terms of Service</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Cookie Policy</a></li>
                        <li><a href="#" className="hover:text-sky-500 transition-colors">Disclaimer</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400 font-medium">
                    © {new Date().getFullYear()} PolyStudy. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>Made with</span>
                    <Heart className="w-3 h-3 text-red-500 fill-current" />
                    <span>in Kerala</span>
                </div>
            </div>
        </div>
      </footer>
    </div>
  );
}
