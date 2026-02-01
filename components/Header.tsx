
import React, { useState, useEffect } from 'react';
import { Search, Sun, Moon, X, Menu, Home, Bookmark, Hexagon, LayoutGrid, Award, MessageSquare, Info, Bot, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { DEPARTMENTS, SEMESTER_URL_MAP, APP_NOTICES } from '../constants';
import { SearchResultItem } from '../types';
import SearchResults from './SearchResults';

interface HeaderProps {
  onHomeClick: () => void;
  isHome: boolean;
  isDarkMode: boolean;
  toggleTheme: () => void;
  onSearch: (query: string) => void;
  onBookmarksClick: () => void;
  onScholarshipsClick: () => void;
  onFacilitiesClick: () => void;
  onNoticesClick: () => void; 
  onAboutClick: () => void;
  onContactClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onHomeClick, 
  isDarkMode, 
  toggleTheme, 
  onSearch, 
  onBookmarksClick,
  onScholarshipsClick,
  onFacilitiesClick,
  onNoticesClick,
  onAboutClick,
  onContactClick
}) => {
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const navigate = useNavigate();

  const hasNewNotices = APP_NOTICES.some(n => n.isNew);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    // onSearch is called but might be empty in parent, we handle logic locally now too
    onSearch(query);
  };

  // Search Logic
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const lowerQuery = searchQuery.toLowerCase();
    const newResults: SearchResultItem[] = [];

    DEPARTMENTS.forEach(dept => {
      // Dept match
      if (dept.name.toLowerCase().includes(lowerQuery) || dept.id.includes(lowerQuery)) {
        newResults.push({ type: 'dept', item: dept, score: 10 });
      }
      
      // Subject match
      dept.subjects.forEach(sub => {
        if (sub.title.toLowerCase().includes(lowerQuery) || sub.id.toLowerCase().includes(lowerQuery)) {
           newResults.push({ type: 'subject', item: sub, dept: dept, sem: sub.semester, score: 5 });
        }
      });

      // Video match
      dept.videos.forEach(vid => {
         if (vid.title.toLowerCase().includes(lowerQuery)) {
            newResults.push({ type: 'video', item: vid, dept: dept, sem: vid.semester, score: 3 });
         }
      });
    });
    
    setSearchResults(newResults);
  }, [searchQuery]);

  const handleSelectResult = (result: SearchResultItem) => {
      setSearchQuery('');
      setSearchResults([]);
      setIsMobileSearchOpen(false);

      if (result.type === 'dept' && 'id' in result.item) {
          navigate(`/${result.item.id}`);
      } else if (result.type === 'subject' && result.dept && result.sem) {
          const semSlug = SEMESTER_URL_MAP[result.sem] || 'sem1';
          navigate(`/${result.dept.id}/${semSlug}/${result.item.id}`);
      } else if (result.type === 'video' && result.dept && result.sem) {
          const semSlug = SEMESTER_URL_MAP[result.sem] || 'sem1';
          navigate(`/${result.dept.id}/${semSlug}`);
      }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    onSearch('');
    setIsMobileSearchOpen(false);
  };

  const MenuItem = ({ icon: Icon, label, subLabel, onClick, disabled = false }: any) => (
    <button 
        onClick={disabled ? undefined : onClick}
        aria-label={label}
        className={`w-full flex items-center p-3 rounded-2xl transition-all text-left group border border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:border-transparent ${disabled ? 'opacity-60 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-white/5 hover:border-slate-200 dark:hover:border-white/10 active:scale-[0.98]'}`}
    >
        <div className={`p-2.5 rounded-xl mr-4 transition-transform duration-300 flex-shrink-0 ${disabled ? 'bg-slate-100 dark:bg-neutral-800 text-slate-400' : 'bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 group-hover:scale-110 group-hover:rotate-3 group-hover:bg-sky-500 group-hover:text-white'}`}>
            <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
                <span className={`text-base font-bold truncate pr-2 transition-colors ${disabled ? 'text-slate-400' : 'text-slate-700 dark:text-slate-200 group-hover:text-sky-600 dark:group-hover:text-sky-400'}`}>
                    {label}
                </span>
            </div>
            {subLabel && <p className="text-xs text-slate-400 dark:text-neutral-500 font-medium mt-0.5 truncate transition-colors group-hover:text-slate-500 dark:group-hover:text-neutral-400">{subLabel}</p>}
        </div>
    </button>
  );

  return (
    <>
        <header className="sticky top-2 md:top-4 z-50 px-2 sm:px-8 lg:px-12 transition-all duration-300">
        <div className="glass-panel rounded-full px-3 sm:px-6 py-2.5 max-w-[1600px] mx-auto flex justify-between items-center shadow-lg shadow-black/5 dark:shadow-black/50 relative bg-white/70 dark:bg-black/70 animate-fade-in-up">
            
            {/* Logo Area */}
            <button 
            className={`flex items-center cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 rounded-xl ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`} 
            onClick={onHomeClick}
            aria-label="Go to Home"
            >
            <div className="mr-2 md:mr-3 flex items-center justify-center transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                <div className="bg-gradient-to-br from-sky-500 to-blue-600 text-white p-2 md:p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
                    <Hexagon className="w-5 h-5 md:w-6 md:h-6 fill-current" />
                </div>
            </div>
            <div className="flex flex-col text-left group-hover:translate-x-1 transition-transform duration-300">
                <h1 className="text-lg md:text-xl font-bold tracking-tight leading-none text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
                Poly<span className="font-light text-slate-500 dark:text-neutral-500 group-hover:text-sky-400 dark:group-hover:text-sky-300 transition-colors">Study</span>
                </h1>
            </div>
            </button>
            
            {/* Desktop Search Bar & Scholarship Button */}
            <div className={`hidden md:flex flex-1 max-w-md mx-6 items-center gap-2 ${isMobileSearchOpen ? 'hidden' : ''}`}>
                <div className="relative w-full group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-sky-500">
                        <Search className="h-4 w-4 text-slate-400 group-focus-within:text-sky-500 transition-transform group-focus-within:scale-110" />
                    </div>
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="w-full bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 rounded-full py-2.5 pl-10 pr-10 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all hover:shadow-md hover:bg-white dark:hover:bg-black"
                        placeholder="Search..."
                        aria-label="Search subjects and videos"
                    />
                    {searchQuery && (
                        <button 
                            onClick={clearSearch}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none focus:text-sky-500"
                            aria-label="Clear search"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>
                
                <button 
                    onClick={onScholarshipsClick}
                    className="flex items-center justify-center p-2.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-amber-500 hover:scale-105 shadow-sm flex-shrink-0"
                    title="Scholarships"
                    aria-label="View Scholarships"
                >
                    <Award className="w-5 h-5" />
                </button>
            </div>

            {/* Mobile Search Input */}
            {isMobileSearchOpen && (
                <div className="flex md:hidden flex-1 items-center animate-scale-in absolute inset-0 bg-white dark:bg-black rounded-full px-4 z-10 m-0 glass-panel border-none shadow-none origin-right">
                    <Search className="h-4 w-4 text-slate-400 mr-2 flex-shrink-0" />
                    <input 
                        type="text" 
                        value={searchQuery}
                        onChange={handleSearchChange}
                        autoFocus
                        className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                        placeholder="Search..."
                        aria-label="Mobile search"
                    />
                    <button 
                        onClick={clearSearch}
                        className="p-2 ml-1 text-slate-400 hover:text-slate-600 dark:hover:text-white flex-shrink-0 focus:outline-none focus:text-sky-500"
                        aria-label="Close search"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            )}
            
            {/* Controls */}
            <div className={`flex items-center space-x-2 md:space-x-3 ${isMobileSearchOpen ? 'hidden md:flex' : 'flex'}`}>
                <button 
                    onClick={() => setIsMobileSearchOpen(true)}
                    className="md:hidden glass-button p-3 rounded-full hover:text-sky-500 dark:hover:text-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:scale-105 active:scale-95 transition-all"
                    title="Search"
                    aria-label="Open search"
                >
                    <Search className="w-5 h-5" />
                </button>

                {/* Mobile Scholarship Button */}
                <button 
                    onClick={onScholarshipsClick}
                    className="md:hidden glass-button p-3 rounded-full hover:text-amber-500 dark:hover:text-amber-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 hover:scale-105 active:scale-95 transition-all"
                    title="Scholarships"
                    aria-label="Scholarships"
                >
                    <Award className="w-5 h-5" />
                </button>

                {/* Notices Button (Desktop) - Updated to navigate */}
                <button 
                    onClick={() => navigate('/notices')}
                    className="glass-button p-3 rounded-full hover:text-sky-500 dark:hover:text-sky-400 relative focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:scale-105 active:scale-95 transition-all hidden md:flex"
                    title="Notices"
                    aria-label="Open notices"
                >
                    <Bell className="w-5 h-5" />
                    {hasNewNotices && <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-sm"></span>}
                </button>

                {/* Persistent Feedback Button (Desktop) */}
                <button 
                    onClick={() => navigate('/feedback')}
                    className="glass-button p-3 rounded-full hover:text-emerald-500 dark:hover:text-emerald-400 hidden lg:flex focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 hover:scale-105 active:scale-95 transition-all"
                    title="Send Feedback"
                    aria-label="Send feedback"
                >
                    <MessageSquare className="w-5 h-5" />
                </button>

                <button 
                onClick={toggleTheme}
                className="glass-button p-3 rounded-full hover:text-sky-500 dark:hover:text-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:scale-105 active:scale-95 transition-all hover:rotate-12"
                title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                aria-label={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
                >
                {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>

                <button 
                onClick={() => setIsMenuOpen(true)}
                className="glass-button p-3 rounded-full hover:text-sky-500 dark:hover:text-sky-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-500 hover:scale-105 active:scale-95 transition-all"
                title="Menu"
                aria-label="Open menu"
                aria-expanded={isMenuOpen}
                aria-haspopup="true"
                >
                <Menu className="w-5 h-5" />
                </button>
            </div>
        </div>

        {/* Slide-out Menu */}
        {isMenuOpen && (
            <>
            <div 
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] animate-in fade-in duration-300" 
                onClick={() => setIsMenuOpen(false)} 
                aria-hidden="true"
            />
            <div 
                className="fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white/95 dark:bg-black/95 backdrop-blur-2xl z-[70] shadow-2xl p-6 border-l border-white/20 flex flex-col animate-in slide-in-from-right duration-300 ease-out"
                role="dialog"
                aria-modal="true"
                aria-label="Main Navigation"
            >
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-2">
                        <div className="bg-sky-500 text-white p-1.5 rounded-lg shadow-lg shadow-sky-500/30">
                            <Menu className="w-5 h-5" />
                        </div>
                        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-neutral-400">Menu</h2>
                    </div>
                    <button 
                    onClick={() => setIsMenuOpen(false)} 
                    className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-neutral-400 focus:outline-none focus:outline-2 focus:outline-sky-500 hover:rotate-90 duration-300"
                    aria-label="Close menu"
                    >
                    <X className="w-6 h-6" />
                    </button>
                </div>
                
                <nav className="flex-grow overflow-y-auto custom-scrollbar pr-2 space-y-1">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2 mt-2" role="presentation">Study</p>
                    <div className="space-y-1 animate-stagger-1">
                    <MenuItem 
                        icon={Home} 
                        label="Home" 
                        subLabel="Main Dashboard"
                        onClick={() => { onHomeClick(); setIsMenuOpen(false); }} 
                    />
                    <MenuItem 
                        icon={Bookmark} 
                        label="Bookmarks" 
                        subLabel="Saved Content"
                        onClick={() => { onBookmarksClick(); setIsMenuOpen(false); }} 
                    />
                    <MenuItem 
                        icon={Bot} 
                        label="AI Tutor" 
                        subLabel="Personal Study Assistant"
                        onClick={() => { navigate('/ai-tutor'); setIsMenuOpen(false); }} 
                    />
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-5 mx-2" role="separator"></div>

                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2" role="presentation">Extras</p>
                    <div className="space-y-1 animate-stagger-2">
                    <MenuItem 
                        icon={Bell} 
                        label="Notices" 
                        subLabel="Latest updates & announcements" 
                        onClick={() => { navigate('/notices'); setIsMenuOpen(false); }} 
                    />
                    <MenuItem 
                        icon={Award} 
                        label="Scholarships" 
                        subLabel="Financial aid & grants" 
                        onClick={() => { onScholarshipsClick(); setIsMenuOpen(false); }} 
                    />
                    <MenuItem 
                        icon={LayoutGrid} 
                        label="Facilities" 
                        subLabel="Campus amenities" 
                        onClick={() => { onFacilitiesClick(); setIsMenuOpen(false); }} 
                    />
                    </div>

                    <div className="h-px bg-slate-100 dark:bg-white/5 my-5 mx-2" role="separator"></div>
                    
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 ml-2" role="presentation">Support</p>
                    <div className="space-y-1 animate-stagger-3">
                    <MenuItem 
                        icon={MessageSquare} 
                        label="Feedback" 
                        subLabel="Report bugs or suggest ideas" 
                        onClick={() => { navigate('/feedback'); setIsMenuOpen(false); }} 
                    />
                    <MenuItem 
                        icon={Info} 
                        label="About Us" 
                        subLabel="Mission & Credits" 
                        onClick={() => { onAboutClick(); setIsMenuOpen(false); }} 
                    />
                    </div>
                </nav>
            </div>
            </>
        )}
        </header>

        {/* Search Results Overlay */}
        {searchResults.length > 0 && searchQuery.length >= 2 && (
            <SearchResults 
                results={searchResults} 
                onSelectResult={handleSelectResult} 
                onClose={clearSearch} 
                query={searchQuery}
            />
        )}
    </>
  );
};

export default Header;
