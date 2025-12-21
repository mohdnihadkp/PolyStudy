import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Analytics } from '@vercel/analytics/react';
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
import { Book, Video, Bot, GraduationCap, ArrowLeft, Layers, Calendar, FolderOpen, ChevronRight, FileText, ArrowRight, Zap, Hexagon, ExternalLink, CheckCircle2, Bookmark, AlertTriangle, MessageSquare, Sparkles, Github, Instagram, Facebook, Twitter, Linkedin, Phone, Bell } from 'lucide-react';

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
  
  // Bookmark State
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);

  // Parallax Refs
  const parallaxRef1 = useRef<HTMLDivElement>(null);
  
  // Mouse Parallax State
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  // Quote State for Landing
  const [currentQuote, setCurrentQuote] = useState(0);
  const quotes = [
      { text: "Engineering is the closest thing to magic that exists in the world.", author: "Elon Musk" },
      { text: "Scientists study the world as it is, engineers create the world that never has been.", author: "Theodore von Karman" },
      { text: "The way to succeed is to double your failure rate.", author: "Thomas J. Watson" },
      { text: "Quality means doing it right when no one is looking.", author: "Henry Ford" }
  ];

  // --- DYNAMIC SEO METADATA UPDATE (OPTIMIZED FOR KERALA) ---
  useEffect(() => {
    let title = "Polystudy | Kerala Polytechnic Study Materials, Question Papers & Syllabus";
    let desc = "Download Kerala Polytechnic previous year question papers, SITTTR syllabus, solved answers, and latest diploma news on Polystudy. The best resource for Kerala diploma students.";

    if (isBookmarksView) {
      title = "My Bookmarks | Polystudy Kerala";
      desc = "Your saved subjects and video lectures on Polystudy.";
    } else if (selectedSubject) {
      title = `${selectedSubject.title} Notes & Papers | ${selectedDept?.name} - Kerala Polytechnic`;
      desc = `Download ${selectedSubject.title} study materials, question papers, and video lectures for ${selectedSemester} ${selectedDept?.name} Diploma (SITTTR/DTE Kerala).`;
    } else if (selectedSemester) {
      title = `${selectedSemester} Syllabus & Notes | ${selectedDept?.name} - Polystudy`;
      desc = `Kerala Polytechnic ${selectedSemester} study resources for ${selectedDept?.name}. SITTTR Syllabus, Lab Manuals, and Workshop guides.`;
    } else if (selectedDept) {
      title = `${selectedDept.name} Diploma Materials | Kerala Polytechnic Resources`;
      desc = `Free study materials for Kerala Polytechnic ${selectedDept.name}. Curriculum, notes, and video classes for S1 to S6 semesters.`;
    }

    document.title = title;
    
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', desc);
    }
  }, [selectedDept, selectedSubject, selectedSemester, isBookmarksView]);

  // --- INJECT NEWSARTICLE SCHEMA ---
  useEffect(() => {
    const scriptId = 'news-schema-script';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.type = 'application/ld+json';
        document.head.appendChild(script);
    }

    const newsData = APP_NOTICES.map(notice => ({
        "@type": "NewsArticle",
        "headline": notice.title,
        "datePublished": new Date(notice.date).toISOString(),
        "description": notice.content,
        "author": {
            "@type": "Organization",
            "name": "DTE Kerala / SITTTR"
        }
    }));

    if (newsData.length > 0) {
        script.text = JSON.stringify({
            "@context": "https://schema.org",
            "@graph": newsData
        });
    }
  }, []);

  useEffect(() => {
      const timer = setInterval(() => {
          setCurrentQuote(prev => (prev + 1) % quotes.length);
      }, 6000);
      return () => clearInterval(timer);
  }, []);

  // --- SEARCH DEBOUNCE ---
  useEffect(() => {
      const timer = setTimeout(() => {
          setDebouncedSearchQuery(searchQuery);
      }, 300); // 300ms debounce
      return () => clearTimeout(timer);
  }, [searchQuery]);

  // --- HISTORY MANAGEMENT ---

  // Helper to push history while MERGING with current state for modals/overlays
  const pushHistory = (newState: any, replace = false) => {
    if (replace) {
      window.history.replaceState(newState, '');
    } else {
      window.history.pushState(newState, '');
    }
  };

  const restoreView = (state: any) => {
      // Close all overlays by default
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
      setSearchQuery('');
      setSearchResults([]);

      if (!state || state.view === 'home') {
        setSelectedDept(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setSelectedCategory(null);
        setIsBookmarksView(false);
      }
      else if (state.view === 'bookmarks') {
        setIsBookmarksView(true);
        setSelectedDept(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setSelectedCategory(null);
      } 
      else if (state.view === 'dept') {
        const dept = DEPARTMENTS.find(d => d.id === state.deptId);
        if (dept) {
          setSelectedDept(dept);
          setSelectedSemester(null);
          setSelectedSubject(null);
          setSelectedCategory(null);
          setIsBookmarksView(false);
        }
      }
      else if (state.view === 'sem') {
        const dept = DEPARTMENTS.find(d => d.id === state.deptId);
        if (dept) {
          setSelectedDept(dept);
          setSelectedSemester(state.semId);
          setSelectedSubject(null);
          setSelectedCategory(null);
          setIsBookmarksView(false);
        }
      }
      else if (state.view === 'sub') {
        const dept = DEPARTMENTS.find(d => d.id === state.deptId);
        const sub = dept?.subjects.find(s => s.id === state.subId);
        if (dept && sub) {
          setSelectedDept(dept);
          setSelectedSemester(state.semId);
          setSelectedSubject(sub);
          setSelectedCategory(null);
          if (state.tab) setSubjectTab(state.tab);
          setIsBookmarksView(false);
        }
      }

      // Restore Overlays if present in state (Supports reload/forward navigation)
      if (state?.modal === 'contact') setIsContactModalOpen(true);
      if (state?.modal === 'scholarship') setIsScholarshipModalOpen(true);
      if (state?.modal === 'sync') setIsSyncModalOpen(true);
      if (state?.modal === 'drive') setIsDriveModalOpen(true);
      if (state?.modal === 'veo') setIsVeoModalOpen(true);
      if (state?.modal === 'tools') setIsToolsModalOpen(true);
      if (state?.modal === 'notices') setIsNoticesModalOpen(true);
      if (state?.modal === 'about') setIsAboutModalOpen(true);
      if (state?.modal === 'deptAI') setIsDeptAIModalOpen(true);
      
      // For Video/PDF, we need the ID to restore
      if (state?.view === 'video' && state.videoId) {
         const dept = DEPARTMENTS.find(d => d.id === state.deptId); 
         const vid = dept?.videos.find(v => v.id === state.videoId);
         if (vid) setPlayingVideo(vid);
      }
      if (state?.view === 'pdf' && state.resourceId) {
         // Complex to restore without full resource object
      }
  };

  useEffect(() => {
    // 1. Initialize history or restore state on mount (Fixes reload issue)
    if (!window.history.state) {
      window.history.replaceState({ view: 'home' }, '');
    } else {
      restoreView(window.history.state);
    }

    // 2. Handle Browser Back/Forward
    const handlePopState = (event: PopStateEvent) => {
      restoreView(event.state);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const savedProgress = localStorage.getItem('pollytechnic_progress');
    if (savedProgress) {
      try {
        setProgressData(JSON.parse(savedProgress));
      } catch (e) {
        console.error("Failed to parse progress data", e);
      }
    }

    const savedBookmarks = localStorage.getItem('pollytechnic_bookmarks');
    if (savedBookmarks) {
      try {
        setBookmarks(JSON.parse(savedBookmarks));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'pollytechnic_progress' && e.newValue) {
        try {
          setProgressData(JSON.parse(e.newValue));
        } catch (err) {
          console.error("Failed to sync progress from other tab", err);
        }
      }
      if (e.key === 'pollytechnic_bookmarks' && e.newValue) {
        try {
          setBookmarks(JSON.parse(e.newValue));
        } catch (err) {
            console.error("Failed to sync bookmarks");
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const updateProgress = (subjectId: string, value: number) => {
    const newData = { ...progressData, [subjectId]: value };
    setProgressData(newData);
    localStorage.setItem('pollytechnic_progress', JSON.stringify(newData));
  };

  const handleImportProgress = (importedData: Record<string, number>) => {
    const merged = { ...progressData };
    Object.keys(importedData).forEach(key => {
        if (!merged[key] || importedData[key] > merged[key]) {
            merged[key] = importedData[key];
        }
    });
    setProgressData(merged);
    localStorage.setItem('pollytechnic_progress', JSON.stringify(merged));
  };

  const toggleBookmark = (item: BookmarkItem) => {
    let newBookmarks;
    if (bookmarks.some(b => b.id === item.id)) {
        newBookmarks = bookmarks.filter(b => b.id !== item.id);
    } else {
        newBookmarks = [...bookmarks, item];
    }
    setBookmarks(newBookmarks);
    localStorage.setItem('pollytechnic_bookmarks', JSON.stringify(newBookmarks));
  };

  const isBookmarked = (id: string) => bookmarks.some(b => b.id === id);

  const handleVideoBookmark = (video: VideoLecture) => {
    const isCurrentlyBookmarked = isBookmarked(video.id);

    if (isCurrentlyBookmarked) {
        toggleBookmark({
            id: video.id,
            type: 'video',
            title: video.title,
            subtitle: video.instructor,
            data: video,
        });
    } else {
        if (!selectedDept) return;
        toggleBookmark({
            id: video.id,
            type: 'video',
            title: video.title,
            subtitle: video.instructor,
            data: video,
            deptId: selectedDept.id
        });
    }
  };

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Combined Parallax Logic (Scroll + Mouse) - OPTIMIZED
  useEffect(() => {
    // Only enable on desktops for performance
    if (window.innerWidth < 1024) return;

    const handleScroll = () => {
      const scrolled = window.scrollY;
      const rate = 0.2; // Subtle rate
      
      requestAnimationFrame(() => {
        if (parallaxRef1.current) {
           parallaxRef1.current.style.transform = `translateY(${scrolled * rate}px)`;
        }
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
        // Subtle mouse parallax
        const x = (e.clientX - window.innerWidth / 2) / 80;
        const y = (e.clientY - window.innerHeight / 2) / 80;
        setMousePosition({ x, y });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const toggleTheme = () => setIsDarkMode(!isDarkMode);

  // Updated Search Logic with Multi-Token Scoring
  useEffect(() => {
    if (!debouncedSearchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = debouncedSearchQuery.toLowerCase();
    const queryTokens = query.split(/\s+/).filter(t => t.length > 0);
    const results: SearchResultItem[] = [];

    // Scoring weights based on match type
    const W = {
        EXACT: 10,
        ALL_TOKENS: 5,
        PARTIAL_TOKEN: 1,
        
        // Item priorities
        DEPT: 100,
        SUBJECT: 80,
        VIDEO: 50,
        DESC: 10,
    };

    const getScore = (text: string | undefined, baseWeight: number) => {
        if (!text) return 0;
        const lowerText = text.toLowerCase();
        
        // 1. Exact Match
        if (lowerText === query) return baseWeight * W.EXACT;
        
        // 2. All tokens present
        const allTokensPresent = queryTokens.every(token => lowerText.includes(token));
        if (allTokensPresent) return baseWeight * W.ALL_TOKENS;

        // 3. Partial Token Match (count how many tokens match)
        let matches = 0;
        queryTokens.forEach(token => {
            if (lowerText.includes(token)) matches++;
        });
        
        if (matches > 0) return (baseWeight * W.PARTIAL_TOKEN) * matches;
        
        return 0;
    };

    DEPARTMENTS.forEach(dept => {
      // Department Score
      const nameScore = getScore(dept.name, W.DEPT);
      const descScore = getScore(dept.description, W.DESC);
      
      if (nameScore > 0 || descScore > 0) {
        results.push({ 
            type: 'dept', 
            item: dept, 
            score: Math.max(nameScore, descScore) 
        });
      }

      // Subject Score
      dept.subjects.forEach(sub => {
        const titleScore = getScore(sub.title, W.SUBJECT);
        // Boost score if the query contains "sem" or "s3" and the subject matches that semester
        let semesterBoost = 0;
        if ((query.includes('s1') || query.includes('sem 1')) && sub.semester === 'Semester 1') semesterBoost = 20;
        if ((query.includes('s2') || query.includes('sem 2')) && sub.semester === 'Semester 2') semesterBoost = 20;
        if ((query.includes('s3') || query.includes('sem 3')) && sub.semester === '3rd Semester') semesterBoost = 20;
        if ((query.includes('s4') || query.includes('sem 4')) && sub.semester === '4th Semester') semesterBoost = 20;
        if ((query.includes('s5') || query.includes('sem 5')) && sub.semester === '5th Semester') semesterBoost = 20;
        if ((query.includes('s6') || query.includes('sem 6')) && sub.semester.includes('6th Semester')) semesterBoost = 20;

        if (titleScore > 0) {
             results.push({ 
                type: 'subject', 
                item: sub, 
                dept, 
                sem: sub.semester,
                score: titleScore + semesterBoost
            });
        }
      });

      // Video Score
      dept.videos.forEach(vid => {
        const titleScore = getScore(vid.title, W.VIDEO);
        const instrScore = getScore(vid.instructor, W.DESC);
        
        if (titleScore > 0 || instrScore > 0) {
          results.push({ 
            type: 'video', 
            item: vid, 
            dept, 
            sem: vid.semester,
            score: Math.max(titleScore, instrScore)
          });
        }
      });
    });

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    setSearchResults(results.slice(0, 20)); // Limit to top 20 matches

  }, [debouncedSearchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    // Logic moved to useEffect with debounce
  };

  const handleSelectSearchResult = (result: SearchResultItem) => {
    setSearchQuery(''); 
    setSearchResults([]);
    setIsBookmarksView(false);

    if (result.type === 'dept') {
      handleDeptSelect(result.item as Department);
    } else if (result.type === 'subject') {
      const subject = result.item as Subject;
      const dept = result.dept!;
      // Push state to jump directly to subject
      pushHistory({ view: 'sub', deptId: dept.id, semId: subject.semester, subId: subject.id });
      
      setSelectedDept(dept);
      setSelectedSemester(subject.semester);
      setSelectedSubject(subject);
      setSelectedCategory(null);
      setSubjectTab('materials'); 
    } else if (result.type === 'video') {
      const video = result.item as VideoLecture;
      const dept = result.dept!;
      const relatedSubject = dept.subjects.find(s => s.id === video.subjectId);
      
      // Setup state for video playback
      const baseState = relatedSubject 
        ? { view: 'sub', deptId: dept.id, semId: video.semester, subId: relatedSubject.id }
        : { view: 'sem', deptId: dept.id, semId: video.semester };
      
      pushHistory(baseState);
      // Then push video state
      setTimeout(() => {
          handlePlayVideo(video);
      }, 0);

      setSelectedDept(dept);
      setSelectedSemester(video.semester);
      if (relatedSubject) {
          setSelectedSubject(relatedSubject);
          setSubjectTab('videos');
      } else {
          setSelectedSubject(null);
      }
      setSelectedCategory(null);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeptSelect = (dept: Department) => {
    pushHistory({ view: 'dept', deptId: dept.id });
    setSelectedDept(dept);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedCategory(null);
    setIsBookmarksView(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSemesterSelect = (sem: Semester) => {
    if (!selectedDept) return;
    pushHistory({ view: 'sem', deptId: selectedDept.id, semId: sem });
    setSelectedSemester(sem);
    setSelectedSubject(null);
    setSelectedCategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubjectSelect = (subject: Subject) => {
    if (!selectedDept || !selectedSemester) return;
    pushHistory({ view: 'sub', deptId: selectedDept.id, semId: selectedSemester, subId: subject.id });
    setSelectedSubject(subject);
    setSelectedCategory(null);
    setSubjectTab('materials');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCategorySelect = (category: ResourceCategory) => {
    if (category.type === 'direct_link' && category.url) {
      window.open(category.url, '_blank');
      return;
    }
    setSelectedCategory(category);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleHomeClick = () => {
    pushHistory({ view: 'home' });
    setSelectedDept(null);
    setSelectedSemester(null);
    setSelectedSubject(null);
    setSelectedCategory(null);
    setPlayingVideo(null);
    setIsBookmarksView(false);
  };
  
  const handleBookmarksClick = () => {
      pushHistory({ view: 'bookmarks' });
      setIsBookmarksView(true);
      setSelectedDept(null);
      setSelectedSemester(null);
      setSelectedSubject(null);
      setSelectedCategory(null);
  }

  // Navigation Back Button Handlers (Use history)
  const goBackToSemesters = () => window.history.back();
  const goBackToSubjects = () => window.history.back();
  
  const handleViewResource = (resource: Resource) => {
    const currentState = window.history.state || { view: 'home' };
    pushHistory({ ...currentState, view: 'pdf', resourceId: resource.id });
    setViewingResource(resource);
  };

  // Close handlers using history back if appropriate, otherwise direct state
  const handleCloseViewer = () => window.history.back();

  const handlePlayVideo = (video: VideoLecture) => {
    const currentState = window.history.state || { view: 'home' };
    pushHistory({ ...currentState, view: 'video', videoId: video.id });
    setPlayingVideo(video);
  };

  const handleCloseVideo = () => window.history.back();

  // Modals with History Support (Merge State to keep background)
  const openModal = (modalName: string, setter: (val: boolean) => void) => {
      const currentState = window.history.state || { view: 'home' };
      pushHistory({ ...currentState, modal: modalName });
      setter(true);
  };
  
  const closeModal = () => window.history.back();

  const filteredSubjects = selectedDept?.subjects.filter(s => s.semester === selectedSemester) || [];
  const filteredVideos = selectedDept?.videos.filter(v => v.semester === selectedSemester) || [];

  const videosBySubject = filteredVideos.reduce((acc, video) => {
    const subjectId = video.subjectId || 'other';
    if (!acc[subjectId]) acc[subjectId] = [];
    acc[subjectId].push(video);
    return acc;
  }, {} as Record<string, VideoLecture[]>);

  const subjectVideos = selectedSubject ? (videosBySubject[selectedSubject.id] || []) : [];

  return (
    <div className="relative min-h-screen flex flex-col font-sans">
      <HexagonBackground />
      
      <Header 
        onHomeClick={handleHomeClick} 
        isHome={!selectedDept && !isBookmarksView} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onSearch={handleSearch}
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
          onSelectResult={handleSelectSearchResult} 
          onClose={() => setSearchQuery('')}
          query={searchQuery}
        />
      )}

      {viewingResource && (
        <PDFViewer 
          url={viewingResource.url} 
          title={viewingResource.title} 
          onClose={handleCloseViewer} 
        />
      )}

      {isDriveModalOpen && selectedSubject && selectedSubject.driveLink && (
        <DriveFolderModal
            url={selectedSubject.driveLink}
            title={`${selectedSubject.title} - Drive Folder`}
            onClose={closeModal}
        />
      )}
      
      {isSyncModalOpen && (
        <SyncModal 
            isOpen={isSyncModalOpen} 
            onClose={closeModal}
            progressData={progressData}
            onImport={handleImportProgress}
        />
      )}

      {isScholarshipModalOpen && (
        <ScholarshipModal 
            onClose={closeModal}
        />
      )}

      {isContactModalOpen && (
        <ContactModal 
            onClose={closeModal}
        />
      )}

      {isVeoModalOpen && (
        <VeoModal 
            onClose={closeModal}
        />
      )}

      {isToolsModalOpen && (
          <StudyToolsModal onClose={closeModal} />
      )}

      {isNoticesModalOpen && (
          <NoticesModal onClose={closeModal} />
      )}

      {isAboutModalOpen && (
          <AboutModal onClose={closeModal} />
      )}

      {isDeptAIModalOpen && selectedDept && selectedSemester && (
          <DepartmentAIModal 
              departmentName={selectedDept.name}
              semesterName={selectedSemester}
              onClose={closeModal}
          />
      )}

      {playingVideo && (
        <VideoPlayer
          youtubeId={playingVideo.youtubeId}
          title={playingVideo.title}
          onClose={handleCloseVideo}
        />
      )}

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 transition-opacity duration-300">
        
        {isBookmarksView ? (
             <section className="animate-slide-up" aria-label="My Bookmarks">
                 <div className="flex items-center mb-8">
                    <button onClick={handleHomeClick} className="glass-button p-3 rounded-full mr-4" aria-label="Back">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex flex-col">
                        <h2 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white">Your Bookmarks</h2>
                        <p className="text-slate-500 dark:text-neutral-400 font-medium">Saved subjects and videos for quick access.</p>
                    </div>
                 </div>

                 {bookmarks.length === 0 ? (
                     <div className="text-center py-20 glass-panel rounded-3xl border-dashed border-2 border-slate-200 dark:border-neutral-800">
                         <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-slate-100 dark:bg-neutral-900 mb-4">
                             <Bookmark className="h-8 w-8 text-slate-400" />
                         </div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white">No bookmarks yet</h3>
                         <p className="mt-2 text-slate-500 dark:text-neutral-400">Save subjects or videos to access them here.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                         {bookmarks.map(item => {
                             const dept = item.deptId ? DEPARTMENTS.find(d => d.id === item.deptId) : null;
                             
                             return (
                             <article 
                                key={item.id}
                                onClick={() => {
                                    if (item.type === 'subject') {
                                        const dept = DEPARTMENTS.find(d => d.id === item.deptId) || DEPARTMENTS[0];
                                        // Push state before navigating
                                        pushHistory({ view: 'sub', deptId: dept.id, semId: (item.data as Subject).semester, subId: item.id });
                                        
                                        setSelectedDept(dept);
                                        const sub = item.data as Subject;
                                        setSelectedSemester(sub.semester);
                                        handleSubjectSelect(sub);
                                    } else {
                                        handlePlayVideo(item.data as VideoLecture);
                                    }
                                    setIsBookmarksView(false);
                                }}
                                className="glass-panel p-5 rounded-3xl cursor-pointer hover:shadow-xl transition-all hover:scale-[1.02] relative group overflow-hidden"
                             >
                                 {/* Decorative side accent */}
                                 {dept && (
                                     <div className={`absolute top-0 bottom-0 left-0 w-1.5 ${dept.color || 'bg-slate-500'}`}></div>
                                 )}

                                 <div className="absolute top-4 right-4 z-20">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); toggleBookmark(item); }}
                                        className="p-2 bg-white dark:bg-black rounded-full shadow-md text-sky-500 hover:scale-110 transition-transform"
                                        aria-label="Remove Bookmark"
                                     >
                                         <Bookmark className="w-4 h-4 fill-current" />
                                     </button>
                                 </div>
                                 <div className="flex items-start mb-4 pl-3">
                                     <div className={`p-3 rounded-xl mr-4 flex-shrink-0 shadow-sm ${item.type === 'subject' ? 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400' : 'bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400'}`}>
                                         {item.type === 'subject' ? <Book className="w-6 h-6" /> : <Video className="w-6 h-6" />}
                                     </div>
                                     <div className="flex-1 pr-6 min-w-0">
                                         <h4 className="font-bold text-lg text-slate-900 dark:text-white line-clamp-2 leading-tight mb-1">{item.title}</h4>
                                         <p className="text-xs text-slate-500 dark:text-neutral-400 font-bold uppercase tracking-wider truncate">
                                             {dept ? dept.name.split(' ')[0] : 'General'} • {item.subtitle}
                                         </p>
                                     </div>
                                 </div>
                             </article>
                         )})}
                     </div>
                 )}
             </section>
        ) : !selectedDept ? (
          <div className="space-y-12 animate-slide-up">
            <header 
                ref={parallaxRef1}
                className="text-center max-w-3xl mx-auto mb-10 pt-4 will-change-transform"
                style={{ 
                    transform: `translate(${mousePosition.x * -1}px, ${mousePosition.y * -1}px)`,
                    transition: 'transform 0.1s ease-out'
                }}
            >
              <div className="inline-flex items-center justify-center p-4 glass-panel rounded-full mb-6 shadow-xl shadow-sky-500/10">
                 <div className="bg-gradient-to-br from-sky-500 to-blue-600 p-2.5 rounded-full shadow-md text-white">
                    <GraduationCap className="w-8 h-8 fill-current" />
                 </div>
              </div>
              
              {/* Primary SEO Heading - Keyword Rich */}
              <h1 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-4 tracking-tight leading-tight">
                Kerala Polytechnic Study Materials & Question Papers - Polystudy
              </h1>
              <p className="text-lg text-slate-600 dark:text-neutral-400 font-medium max-w-xl mx-auto leading-relaxed">
                Premium SITTTR/DTE Kerala diploma resources, solved papers, and AI tutoring for academic excellence.
              </p>
            </header>

            {/* Semantic Section for Departments */}
            <section aria-label="Diploma Departments">
                <div 
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-0 sm:px-4 relative z-10"
                    style={{ 
                        transform: `translate(${mousePosition.x}px, ${mousePosition.y}px)`,
                        transition: 'transform 0.1s ease-out'
                    }}
                >
                  {DEPARTMENTS.map((dept) => (
                    <DepartmentCard 
                      key={dept.id} 
                      department={dept} 
                      onClick={handleDeptSelect} 
                    />
                  ))}
                </div>
            </section>

            {/* News Aside Section - Semantic Update */}
            <aside className="mt-8 max-w-4xl mx-auto" aria-label="Latest Kerala Diploma News">
                <div className="glass-panel p-6 rounded-2xl border border-sky-100 dark:border-white/5 bg-gradient-to-r from-sky-50 to-white dark:from-[#0a0a0a] dark:to-black">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center text-slate-900 dark:text-white">
                            <Bell className="w-5 h-5 mr-2 text-sky-500" />
                            Latest Kerala Diploma News
                        </h2>
                        <button onClick={() => openModal('notices', setIsNoticesModalOpen)} className="text-xs font-bold text-sky-600 hover:underline">
                            View All Notices
                        </button>
                    </div>
                    <div className="space-y-3">
                        {APP_NOTICES.slice(0, 2).map(notice => (
                            <article key={notice.id} className="p-3 rounded-xl bg-white dark:bg-white/5 border border-slate-100 dark:border-white/5 flex items-start gap-3">
                                <time className="text-center min-w-[50px] p-1 bg-slate-100 dark:bg-black rounded-lg" dateTime={notice.date}>
                                    <span className="block text-[10px] font-bold text-slate-400 uppercase">{notice.date.split(' ')[0]}</span>
                                    <span className="block text-lg font-bold text-slate-800 dark:text-slate-200">{notice.date.split(' ')[1].replace(',', '')}</span>
                                </time>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">{notice.title}</h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">{notice.content}</p>
                                </div>
                            </article>
                        ))}
                    </div>
                </div>
            </aside>

            {/* Rest of the Home Page (Features & Quote) */}
            <div className="mt-16 w-full max-w-5xl mx-auto relative z-10 animate-fade-in-up delay-100">
                {/* Section Header */}
                <div className="flex items-center justify-center mb-6 space-x-2 opacity-80">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent to-slate-400 dark:to-slate-500"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Power Tools</span>
                    <div className="h-px w-12 bg-gradient-to-l from-transparent to-slate-400 dark:to-slate-500"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 px-2">
                    {/* Feature 1: Materials */}
                    <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent transition-transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-sky-500/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full glass-panel bg-white/60 dark:bg-black/40 p-5 rounded-xl flex items-center border border-white/40 dark:border-white/10 overflow-hidden">
                             <div className="absolute right-0 top-0 p-16 bg-sky-500/10 blur-3xl rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                             <div className="w-12 h-12 rounded-full bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Layers className="w-6 h-6" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white text-base">Resource Library</h3>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-tight">Access premium notes & archives.</p>
                             </div>
                             <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                 <ArrowRight className="w-4 h-4 text-sky-500" />
                             </div>
                        </div>
                    </div>

                    {/* Feature 2: Videos */}
                    <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent transition-transform hover:-translate-y-1">
                        <div className="absolute inset-0 bg-violet-500/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full glass-panel bg-white/60 dark:bg-black/40 p-5 rounded-xl flex items-center border border-white/40 dark:border-white/10 overflow-hidden">
                             <div className="absolute right-0 top-0 p-16 bg-violet-500/10 blur-3xl rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                             <div className="w-12 h-12 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Video className="w-6 h-6" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white text-base">HD Lectures</h3>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-tight">Master topics with video guides.</p>
                             </div>
                             <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                 <ArrowRight className="w-4 h-4 text-violet-500" />
                             </div>
                        </div>
                    </div>

                    {/* Feature 3: AI Tutor */}
                    <div className="group relative p-1 rounded-2xl bg-gradient-to-b from-white/20 to-transparent dark:from-white/10 dark:to-transparent transition-transform hover:-translate-y-1 sm:col-span-2 md:col-span-1">
                        <div className="absolute inset-0 bg-emerald-500/10 blur-xl rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="relative h-full glass-panel bg-white/60 dark:bg-black/40 p-5 rounded-xl flex items-center border border-white/40 dark:border-white/10 overflow-hidden">
                             <div className="absolute right-0 top-0 p-16 bg-emerald-500/10 blur-3xl rounded-full -mr-8 -mt-8 pointer-events-none"></div>
                             <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mr-4 flex-shrink-0 shadow-sm group-hover:scale-110 transition-transform duration-300">
                                <Bot className="w-6 h-6" />
                             </div>
                             <div>
                                 <h3 className="font-bold text-slate-900 dark:text-white text-base">Gemini AI Tutor</h3>
                                 <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium leading-tight">24/7 Academic assistance.</p>
                             </div>
                             <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300">
                                 <ArrowRight className="w-4 h-4 text-emerald-500" />
                             </div>
                        </div>
                    </div>
                </div>

                {/* Creative Quote Section */}
                <div className="mt-8 flex justify-center">
                    <div className="glass-panel py-2 px-6 rounded-full bg-white/30 dark:bg-white/5 border border-white/20 dark:border-white/10 flex items-center space-x-3 transition-all hover:bg-white/50 dark:hover:bg-white/10 hover:scale-105 cursor-default shadow-lg">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-current animate-pulse" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 italic tracking-wide">
                            "{quotes[currentQuote].text}"
                        </p>
                    </div>
                </div>
            </div>
          </div>
        ) : !selectedSemester ? (
           <div className="animate-slide-up space-y-6 pt-2">
             <div className="flex items-center mb-6 justify-between">
                <div className="flex items-center">
                    <button onClick={handleHomeClick} className="glass-button p-3 rounded-full mr-4 hover:text-sky-500 transition-colors" aria-label="Back">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3 mb-1">
                            <div className={`p-2 rounded-lg ${selectedDept.color ? selectedDept.color.replace('bg-', 'text-').replace('500', '600') + ' bg-opacity-10 bg-' + selectedDept.color.replace('bg-', '') : 'bg-slate-100 text-slate-600'}`}>
                                {selectedDept.icon}
                            </div>
                            <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">{selectedDept.name}</h2>
                        </div>
                        <p className="text-slate-500 dark:text-neutral-400 font-medium ml-1">Select your semester to continue.</p>
                    </div>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SEMESTERS.map((sem, index) => (
                    <button 
                        key={sem}
                        onClick={() => handleSemesterSelect(sem)}
                        className="glass-panel p-6 rounded-2xl cursor-pointer hover:shadow-xl hover:scale-[1.02] transition-all group border border-slate-200 dark:border-white/5 relative overflow-hidden text-left"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <Calendar className="w-16 h-16 transform rotate-12" />
                        </div>
                        <div className="relative z-10">
                            <span className="text-xs font-bold text-sky-500 uppercase tracking-wider mb-2 block">
                                {index < 5 ? `Semester ${index + 1}` : 'Final Semester'}
                            </span>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">{sem}</h3>
                        </div>
                        <div className="mt-4 flex justify-between items-center">
                             {/* AI Assistant Button for this specific semester context could go here, but global fab is cleaner */}
                             <div></div>
                            <div className="p-2 rounded-full bg-slate-100 dark:bg-white/10 text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>
                    </button>
                ))}
             </div>
           </div>
         ) : !selectedSubject ? (
            <div className="animate-slide-up space-y-6 pt-2">
                 <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                        <button onClick={goBackToSemesters} className="glass-button p-3 rounded-full mr-4 hover:text-sky-500 transition-colors" aria-label="Back">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <div className="flex items-center gap-2 mb-1 text-sm font-bold text-slate-400 uppercase tracking-wider">
                                <span>{selectedDept.name}</span>
                                <ChevronRight className="w-4 h-4" />
                                <span>{selectedSemester}</span>
                            </div>
                            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">Subjects & Labs</h2>
                        </div>
                    </div>
                    
                    {/* Department AI Assistant Button */}
                    <button 
                        onClick={() => openModal('deptAI', setIsDeptAIModalOpen)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-xl shadow-lg hover:shadow-indigo-500/25 hover:scale-105 transition-all"
                    >
                        <Bot className="w-5 h-5" />
                        <span className="font-bold text-sm">Ask AI Assistant</span>
                    </button>
                 </div>

                 {/* Mobile Floating Action Button for AI */}
                 <button 
                    onClick={() => openModal('deptAI', setIsDeptAIModalOpen)}
                    className="md:hidden fixed bottom-6 right-6 z-50 p-4 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full shadow-2xl hover:scale-110 transition-transform"
                    aria-label="Open Department AI Assistant"
                 >
                    <Bot className="w-6 h-6" />
                 </button>

                 {filteredSubjects.length === 0 && filteredVideos.length === 0 ? (
                     <div className="text-center py-20 opacity-60">
                         <div className="w-20 h-20 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                             <FolderOpen className="w-10 h-10 text-slate-400" />
                         </div>
                         <h3 className="text-lg font-bold">No content found</h3>
                         <p>We are updating this section.</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {filteredSubjects.map(sub => (
                             <div 
                                key={sub.id}
                                onClick={() => handleSubjectSelect(sub)}
                                className="glass-panel p-5 rounded-2xl cursor-pointer hover:shadow-lg hover:border-sky-300 dark:hover:border-sky-500/50 transition-all group"
                             >
                                 <div className="flex justify-between items-start">
                                     <div className="p-3 bg-sky-50 dark:bg-sky-900/20 rounded-xl text-sky-600 dark:text-sky-400 mb-4 group-hover:scale-110 transition-transform">
                                         <Book className="w-6 h-6" />
                                     </div>
                                     <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            const item: BookmarkItem = {
                                                id: sub.id,
                                                type: 'subject',
                                                title: sub.title,
                                                subtitle: sub.semester,
                                                data: sub,
                                                deptId: selectedDept.id
                                            };
                                            toggleBookmark(item);
                                        }}
                                        className={`p-2 rounded-full transition-colors ${isBookmarked(sub.id) ? 'text-sky-500 bg-sky-50 dark:bg-sky-900/20' : 'text-slate-300 hover:text-sky-500'}`}
                                        aria-label={isBookmarked(sub.id) ? "Remove Bookmark" : "Bookmark Subject"}
                                     >
                                         <Bookmark className={`w-5 h-5 ${isBookmarked(sub.id) ? 'fill-current' : ''}`} />
                                     </button>
                                 </div>
                                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{sub.title}</h3>
                                 <p className="text-sm text-slate-500 dark:text-neutral-400 line-clamp-2 mb-3">{sub.description}</p>
                                 <div className="flex items-center text-xs font-bold text-sky-500 group-hover:translate-x-1 transition-transform">
                                     View Materials <ArrowRight className="w-3 h-3 ml-1" />
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
                 
                 {filteredVideos.length > 0 && (
                     <div className="mt-12">
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6 flex items-center">
                            <Video className="w-5 h-5 mr-2 text-violet-500" />
                            Semester Videos
                         </h3>
                         <VideoGallery 
                            videos={filteredVideos} 
                            onPlay={handlePlayVideo} 
                            onToggleBookmark={handleVideoBookmark}
                            isBookmarked={isBookmarked}
                         />
                     </div>
                 )}
            </div>
         ) : (
            <div className="animate-slide-up h-full flex flex-col">
                <div className="flex items-center mb-6">
                    <button onClick={goBackToSubjects} className="glass-button p-3 rounded-full mr-4 hover:text-sky-500 transition-colors" aria-label="Back">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 text-xs md:text-sm font-bold text-slate-400 uppercase tracking-wider truncate">
                            <span>{selectedDept.name}</span>
                            <ChevronRight className="w-3 h-3" />
                            <span>{selectedSemester}</span>
                        </div>
                        <h2 className="text-xl md:text-3xl font-black text-slate-900 dark:text-white truncate" title={selectedSubject.title}>{selectedSubject.title}</h2>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => {
                                const item: BookmarkItem = {
                                    id: selectedSubject.id,
                                    type: 'subject',
                                    title: selectedSubject.title,
                                    subtitle: selectedSubject.semester,
                                    data: selectedSubject,
                                    deptId: selectedDept.id
                                };
                                toggleBookmark(item);
                            }}
                            className={`p-3 rounded-xl border transition-all ${isBookmarked(selectedSubject.id) ? 'bg-sky-500 text-white border-sky-500 shadow-lg' : 'bg-white dark:bg-neutral-800 border-slate-200 dark:border-white/10 text-slate-400 hover:border-sky-500 hover:text-sky-500'}`}
                            title="Bookmark Subject"
                            aria-label="Bookmark"
                        >
                            <Bookmark className={`w-5 h-5 ${isBookmarked(selectedSubject.id) ? 'fill-current' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6 self-start overflow-x-auto max-w-full no-scrollbar">
                    <button 
                        onClick={() => setSubjectTab('materials')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${subjectTab === 'materials' ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <FolderOpen className="w-4 h-4" /> Materials
                    </button>
                    <button 
                        onClick={() => setSubjectTab('videos')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${subjectTab === 'videos' ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Video className="w-4 h-4" /> Videos
                        {subjectVideos.length > 0 && <span className="bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-400 text-[10px] px-1.5 py-0.5 rounded-md ml-1">{subjectVideos.length}</span>}
                    </button>
                    <button 
                        onClick={() => setSubjectTab('ai')}
                        className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all whitespace-nowrap ${subjectTab === 'ai' ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white shadow-md' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                    >
                        <Bot className="w-4 h-4" /> AI Tutor
                    </button>
                </div>

                <div className="flex-1">
                    {subjectTab === 'materials' && (
                        <div className="animate-fade-in space-y-6">
                            {/* Progress Tracking */}
                            <div className="glass-panel p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-900/10 dark:to-indigo-900/10 border-sky-100 dark:border-sky-500/10">
                                <SubjectProgress 
                                    progress={progressData[selectedSubject.id] || 0}
                                    onChange={(val) => updateProgress(selectedSubject.id, val)}
                                    isDarkMode={isDarkMode}
                                />
                            </div>

                            {/* Main Drive Link Button */}
                             <div 
                                onClick={() => openModal('drive', setIsDriveModalOpen)}
                                className="glass-panel p-6 rounded-2xl cursor-pointer hover:shadow-xl hover:border-sky-400 dark:hover:border-sky-500/50 transition-all group flex items-center justify-between"
                             >
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 bg-sky-100 dark:bg-sky-900/30 rounded-2xl flex items-center justify-center text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                                        <FolderOpen className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Course Materials (Drive)</h3>
                                        <p className="text-sm text-slate-500 dark:text-neutral-400">Access notes, textbooks, and past papers.</p>
                                    </div>
                                </div>
                                <div className="p-2 bg-slate-100 dark:bg-white/10 rounded-full text-slate-400 group-hover:bg-sky-500 group-hover:text-white transition-all">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                             </div>

                             {selectedSubject.categories.length > 0 && (
                                 <div className="space-y-4">
                                     <h3 className="font-bold text-lg">Additional Resources</h3>
                                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {selectedSubject.categories.map(cat => (
                                            <div key={cat.id} onClick={() => handleCategorySelect(cat)} className="glass-panel p-4 cursor-pointer hover:border-sky-300">
                                                <h4 className="font-bold">{cat.title}</h4>
                                                <p className="text-xs text-slate-500">{cat.items?.length || 0} items</p>
                                            </div>
                                        ))}
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}

                    {subjectTab === 'videos' && (
                        <div className="animate-fade-in">
                            <VideoGallery 
                                videos={subjectVideos} 
                                onPlay={handlePlayVideo} 
                                onToggleBookmark={handleVideoBookmark}
                                isBookmarked={isBookmarked}
                            />
                        </div>
                    )}

                    {subjectTab === 'ai' && (
                        <div className="animate-fade-in h-full">
                            <AITutor 
                                departmentName={selectedDept.name}
                                semesterName={selectedSemester}
                                subjectName={selectedSubject.title}
                            />
                        </div>
                    )}
                </div>
            </div>
         )}
      </main>

      {/* Global Ad Banner - Visible on ALL pages just above footer */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 mb-8 mt-12">
           <AdBanner />
      </div>

      {/* Modern Fat Footer */}
      <footer className="relative mt-8">
        {/* Decorative top fade */}
        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-slate-50 dark:to-black -translate-y-full pointer-events-none"></div>
        
        <div className="glass-panel mx-4 sm:mx-8 mb-8 rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden border border-slate-200/60 dark:border-white/5 shadow-2xl bg-white/80 dark:bg-[#080808]/90">
            {/* Background decorative blobs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -ml-16 -mb-16 pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start gap-12">
                
                {/* Brand Section */}
                <div className="max-w-xs">
                    <div className="flex items-center gap-3 mb-6 group cursor-default">
                        <div className="bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-slate-200 p-2.5 rounded-xl text-white dark:text-black shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <Hexagon className="w-6 h-6 fill-current" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                Poly<span className="font-light">Study</span>
                            </h2>
                            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                                Academic Companion
                            </span>
                        </div>
                    </div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 leading-relaxed mb-6">
                        Empowering Kerala Polytechnic students with premium resources, video lectures, and AI-driven support.
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex gap-3 flex-wrap">
                        {/* Instagram */}
                        <a href="https://www.instagram.com/mohdnihadkp?igsh=MWs3M2k1OXNlbTV5YQ==" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-pink-500 hover:text-white transition-all shadow-sm hover:scale-110 hover:shadow-pink-500/30" title="Instagram">
                            <Instagram className="w-4 h-4" />
                        </a>
                        {/* WhatsApp */}
                        <a href="https://wa.me/919846750898" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-green-500 hover:text-white transition-all shadow-sm hover:scale-110 hover:shadow-green-500/30" title="WhatsApp">
                            <Phone className="w-4 h-4" />
                        </a>
                        {/* Facebook */}
                        <a href="https://www.facebook.com/share/1BW6L4yPdY/" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:scale-110 hover:shadow-blue-600/30" title="Facebook">
                            <Facebook className="w-4 h-4" />
                        </a>
                        {/* Twitter */}
                        <a href="https://x.com/mohdnihadkp?t=6AuEYXj5pzlWX6RVQ91Xcw&s=09" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-sky-500 hover:text-white transition-all shadow-sm hover:scale-110 hover:shadow-sky-500/30" title="Twitter / X">
                            <Twitter className="w-4 h-4" />
                        </a>
                        {/* LinkedIn */}
                        <a href="https://www.linkedin.com/in/mohammed-nihad-kp-71b6b6339?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-blue-700 hover:text-white transition-all shadow-sm hover:scale-110 hover:shadow-blue-700/30" title="LinkedIn">
                            <Linkedin className="w-4 h-4" />
                        </a>
                        {/* GitHub */}
                        <a href="https://github.com/mohdnihadkp" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black transition-all shadow-sm hover:scale-110" title="GitHub">
                            <Github className="w-4 h-4" />
                        </a>
                        {/* Pinterest */}
                        <a href="https://pin.it/4SKTJurgS" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:scale-110 hover:shadow-red-600/30" title="Pinterest">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M8 14.5c2.5 3.3 5.5 6 9 7.5"></path><path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-6"></path><path d="M16 2v4"></path><path d="M8 2v4"></path><path d="M12 2v20"></path></svg>
                        </a>
                        {/* Reddit */}
                        <a href="https://www.reddit.com/u/mohdnihadkp/s/PFtW1jmoiR" target="_blank" rel="noreferrer" className="p-2.5 bg-slate-100 dark:bg-white/5 rounded-full text-slate-600 dark:text-slate-400 hover:bg-orange-500 hover:text-white transition-all shadow-sm hover:scale-110 hover:shadow-orange-500/30" title="Reddit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><circle cx="12" cy="12" r="10"></circle><path d="M17 13c0 2-2.5 3-5 3s-5-1-5-3"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>
                        </a>
                    </div>
                </div>

                {/* Feedback Call to Action */}
                <div className="bg-slate-50 dark:bg-white/5 p-6 rounded-3xl border border-slate-100 dark:border-white/5 max-w-sm">
                    <h4 className="font-bold text-slate-900 dark:text-white mb-2">Have a suggestion?</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                        Help us improve PolyStudy by sharing your thoughts or reporting issues.
                    </p>
                    <button 
                        onClick={() => openModal('contact', setIsContactModalOpen)}
                        className="w-full py-3 px-4 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                    >
                        <MessageSquare className="w-4 h-4" />
                        Send Feedback
                    </button>
                </div>
            </div>

            {/* Divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 dark:via-white/10 to-transparent my-8"></div>

            {/* Bottom Bar */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 relative z-10 text-xs font-medium text-slate-400 dark:text-slate-500">
                <p>© {new Date().getFullYear()} PolyStudy. Open Source Education.</p>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => openModal('about', setIsAboutModalOpen)} className="hover:text-sky-500 transition-colors">About Us</button>
                    <span>|</span>
                    <button onClick={() => openModal('contact', setIsContactModalOpen)} className="hover:text-sky-500 transition-colors">Contact</button>
                    <span>|</span>
                    <div className="flex items-center gap-1">
                        <span>Built by</span>
                        <a 
                            href="https://mohdnihadkp.netlify.app/" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-slate-600 dark:text-slate-300 hover:text-sky-500 font-bold transition-colors flex items-center gap-1"
                        >
                            mohdnihadkp <ExternalLink className="w-3 h-3" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
      </footer>
      <Analytics />
    </div>
  );
}