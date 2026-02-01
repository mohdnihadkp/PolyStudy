
import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import VideoGallery from '../components/VideoGallery';
import VideoPlayer from '../components/VideoPlayer';
import AdBanner from '../components/AdBanner';
import { DEPARTMENTS, SEMESTERS } from '../constants';
import { VideoLecture } from '../types';
import { ArrowLeft, Film, Search, Filter } from 'lucide-react';

interface VideoLibraryProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const VideoLibrary: React.FC<VideoLibraryProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [playingVideo, setPlayingVideo] = useState<VideoLecture | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedSem, setSelectedSem] = useState<string>('all');

  // Collect all videos
  const allVideos = useMemo(() => {
      const videos: (VideoLecture & { deptName: string, deptId: string })[] = [];
      DEPARTMENTS.forEach(dept => {
          dept.videos.forEach(vid => {
              videos.push({ ...vid, deptName: dept.name, deptId: dept.id });
          });
      });
      return videos;
  }, []);

  // Filter Logic
  const filteredVideos = useMemo(() => {
      return allVideos.filter(vid => {
          const matchesSearch = vid.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                                vid.instructor.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesDept = selectedDept === 'all' || vid.deptId === selectedDept;
          const matchesSem = selectedSem === 'all' || vid.semester === selectedSem;
          
          return matchesSearch && matchesDept && matchesSem;
      });
  }, [allVideos, searchQuery, selectedDept, selectedSem]);

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
        onFacilitiesClick={() => {}}
        onNoticesClick={() => navigate('/notices')}
        onAboutClick={() => {}}
        onContactClick={() => navigate('/feedback')}
      />

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
            <div className="flex items-center">
                <button onClick={() => navigate('/')} className="glass-button p-3 rounded-full mr-4 group">
                    <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                </button>
                <div className="flex items-center space-x-4">
                    <div className="p-3 bg-violet-100 dark:bg-violet-900/30 rounded-2xl text-violet-600 dark:text-violet-400 shadow-sm">
                        <Film className="w-6 h-6 md:w-8 md:h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">Video Library</h1>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">Curated lectures and playlists for all branches.</p>
                    </div>
                </div>
            </div>
        </div>

        {/* Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col lg:flex-row gap-4 sticky top-24 z-20">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search lectures, instructors..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm font-medium focus:ring-2 focus:ring-violet-500/50 border-transparent bg-white/50 dark:bg-black/50"
                />
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:pb-0">
                <div className="relative min-w-[150px]">
                    <select 
                        value={selectedDept}
                        onChange={(e) => setSelectedDept(e.target.value)}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 glass-input rounded-xl text-sm font-bold cursor-pointer focus:ring-2 focus:ring-violet-500/50 bg-white/50 dark:bg-black/50"
                    >
                        <option value="all">All Departments</option>
                        {DEPARTMENTS.map(dept => (
                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>

                <div className="relative min-w-[150px]">
                    <select 
                        value={selectedSem}
                        onChange={(e) => setSelectedSem(e.target.value)}
                        className="w-full appearance-none pl-4 pr-10 py-2.5 glass-input rounded-xl text-sm font-bold cursor-pointer focus:ring-2 focus:ring-violet-500/50 bg-white/50 dark:bg-black/50"
                    >
                        <option value="all">All Semesters</option>
                        {SEMESTERS.map(sem => (
                            <option key={sem} value={sem}>{sem}</option>
                        ))}
                    </select>
                    <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                </div>
            </div>
        </div>

        {/* Content */}
        {filteredVideos.length === 0 ? (
            <div className="text-center py-20 opacity-50">
                <Film className="w-12 h-12 mx-auto mb-4" />
                <p className="font-bold text-slate-500">No videos found matching criteria.</p>
            </div>
        ) : (
            <VideoGallery 
                videos={filteredVideos} 
                onPlay={setPlayingVideo} 
                onToggleBookmark={() => {}} 
                isBookmarked={() => false} 
            />
        )}

        <div className="flex justify-center w-full mt-10">
            <AdBanner format="leaderboard" />
        </div>

      </main>

      <Footer onNoticesClick={() => navigate('/notices')} />
      
      {playingVideo && (
          <VideoPlayer 
            youtubeId={playingVideo.youtubeId} 
            title={playingVideo.title} 
            onClose={() => setPlayingVideo(null)} 
          />
      )}
    </div>
  );
};

export default VideoLibrary;
