
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import SubjectProgress from '../components/SubjectProgress';
import VideoGallery from '../components/VideoGallery';
import AITutor from '../components/AITutor';
import PDFViewer from '../components/PDFViewer';
import VideoPlayer from '../components/VideoPlayer';
import DriveFolderModal from '../components/DriveFolderModal';
import DepartmentAIModal from '../components/DepartmentAIModal';
import NoticesModal from '../components/NoticesModal';
import { DEPARTMENTS, SEMESTERS, SEMESTER_URL_MAP, URL_SEMESTER_MAP } from '../constants';
import { Semester, Resource, VideoLecture } from '../types';
import { ArrowLeft, ArrowRight, FolderOpen, ExternalLink, Bot, Search, Filter } from 'lucide-react';

interface CourseViewProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const CourseView: React.FC<CourseViewProps> = ({ isDarkMode, toggleTheme }) => {
  const { deptId, semId, subId } = useParams();
  const navigate = useNavigate();

  // State for modals/content
  const [subjectTab, setSubjectTab] = useState<'materials' | 'videos' | 'ai'>('materials');
  const [viewingResource, setViewingResource] = useState<Resource | null>(null);
  const [playingVideo, setPlayingVideo] = useState<VideoLecture | null>(null);
  const [isDriveModalOpen, setIsDriveModalOpen] = useState(false);
  const [isDeptAIModalOpen, setIsDeptAIModalOpen] = useState(false);
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);
  const [progressData, setProgressData] = useState<Record<string, number>>({});
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Load Progress
  useEffect(() => {
    const savedProgress = localStorage.getItem('pollytechnic_progress');
    if (savedProgress) setProgressData(JSON.parse(savedProgress));
  }, []);

  const updateProgress = (subjectId: string, value: number) => {
    setProgressData(prev => {
        const newData = { ...prev, [subjectId]: value };
        localStorage.setItem('pollytechnic_progress', JSON.stringify(newData));
        return newData;
    });
  };

  // Derived Data
  const department = DEPARTMENTS.find(d => d.id === deptId);
  
  // Resolve Semester from slug if present
  const semesterSlug = semId;
  const decodedSemId = semesterSlug ? URL_SEMESTER_MAP[semesterSlug] : null;

  const subject = subId && department && decodedSemId 
    ? department.subjects.find(s => s.id === subId) 
    : null;

  // Filter lists
  const filteredSubjects = useMemo(() => {
    if (!department) return [];
    let list = department.subjects.filter(s => s.semester === decodedSemId);
    if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        list = list.filter(s => s.title.toLowerCase().includes(lowerQuery) || s.id.toLowerCase().includes(lowerQuery));
    }
    return list;
  }, [department, decodedSemId, searchQuery]);

  const filteredVideos = useMemo(() => 
    department?.videos.filter(v => v.semester === decodedSemId) || [], 
  [department, decodedSemId]);

  // Handlers
  const handleSemesterSelect = (sem: Semester) => {
    const slug = SEMESTER_URL_MAP[sem];
    navigate(`/${deptId}/${slug}`);
    setSearchQuery('');
  };

  const handleSemesterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const slug = e.target.value;
      if (slug) navigate(`/${deptId}/${slug}`);
      else navigate(`/${deptId}`);
      setSearchQuery('');
  };

  const handleSubjectSelect = (subId: string) => {
    navigate(`/${deptId}/${semesterSlug}/${subId}`);
    setSubjectTab('materials');
  };

  const handleBack = () => {
    if (subId) {
      navigate(`/${deptId}/${semesterSlug}`);
    } else if (decodedSemId) {
      navigate(`/${deptId}`);
    } else {
      navigate('/');
    }
  };

  // Render Logic
  if (!department) {
    return <div className="p-10 text-center text-white">Department not found. <button onClick={() => navigate('/')} className="underline">Go Home</button></div>;
  }

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
        onNoticesClick={() => setIsNoticesModalOpen(true)}
        onAboutClick={() => {}}
        onContactClick={() => navigate('/feedback')}
      />

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex items-center">
                <button onClick={handleBack} className="glass-button p-3 rounded-full mr-4">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{department.name}</span>
                    <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">
                        {subject ? subject.title : decodedSemId ? decodedSemId : "Select Semester"}
                    </h2>
                </div>
            </div>

            {/* Controls specific to view */}
            {decodedSemId && !subject && (
                <div className="flex gap-2">
                    <div className="relative">
                        <select 
                            value={semesterSlug || ''} 
                            onChange={handleSemesterChange}
                            className="appearance-none pl-10 pr-8 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-bold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/50 cursor-pointer"
                        >
                            {Object.entries(SEMESTER_URL_MAP).map(([semName, slug]) => (
                                <option key={slug} value={slug}>{semName}</option>
                            ))}
                        </select>
                        <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                    
                    <div className="relative hidden sm:block">
                        <input 
                            type="text" 
                            placeholder="Search subjects..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 pr-4 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-900 dark:text-white placeholder-slate-400 w-[200px]"
                        />
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    </div>
                </div>
            )}
        </div>

        {/* Search Bar for Mobile (Visible only when in subject list) */}
        {decodedSemId && !subject && (
            <div className="mb-6 sm:hidden relative">
                <input 
                    type="text" 
                    placeholder="Search subjects..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-900 dark:text-white placeholder-slate-400"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>
        )}

        {/* View 1: Semester Selection (When only Department is selected) */}
        {!decodedSemId && (
           <div className="animate-slide-up grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {SEMESTERS.map((sem) => (
                    <button key={sem} onClick={() => handleSemesterSelect(sem)} className="glass-panel p-6 rounded-2xl text-left hover:scale-[1.02] transition-transform group">
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">{sem}</h3>
                        <ArrowRight className="w-4 h-4 mt-4 text-slate-500 dark:text-slate-400" />
                    </button>
                ))}
           </div>
        )}

        {/* View 2: Subject List (When Semester is selected but no Subject) */}
        {decodedSemId && !subject && (
            <div className="animate-slide-up pt-2">
                 <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-500">Subjects ({filteredSubjects.length})</h3>
                    <button onClick={() => setIsDeptAIModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors text-sm font-bold shadow-lg shadow-indigo-500/20">
                        <Bot className="w-4 h-4" /> AI Assistant
                    </button>
                 </div>
                 
                 {filteredSubjects.length === 0 ? (
                     <div className="text-center py-12 glass-panel rounded-2xl border-dashed border-2 border-slate-200 dark:border-white/10">
                         <p className="text-slate-500 font-medium">No subjects found matching "{searchQuery}"</p>
                     </div>
                 ) : (
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         {filteredSubjects.map(sub => (
                             <div key={sub.id} onClick={() => handleSubjectSelect(sub.id)} className="glass-panel p-5 rounded-2xl cursor-pointer hover:shadow-lg hover:border-sky-500/50 transition-all group">
                                 <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-sky-500 transition-colors">{sub.title}</h3>
                                 <p className="text-sm text-slate-500 line-clamp-2 mt-1">{sub.description}</p>
                                 <div className="mt-4 flex items-center justify-between">
                                     <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md">{sub.id}</span>
                                     <SubjectProgress progress={progressData[sub.id] || 0} onChange={()=>{}} isDarkMode={isDarkMode} className="w-24 opacity-60" readOnly />
                                 </div>
                             </div>
                         ))}
                     </div>
                 )}
            </div>
        )}

        {/* View 3: Subject Detail (Study Materials) */}
        {subject && (
            <div className="animate-slide-up flex flex-col">
                <div className="flex p-1.5 bg-slate-100 dark:bg-white/5 rounded-2xl mb-6 self-start">
                    {['materials', 'videos', 'ai'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setSubjectTab(t as any)}
                            className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition-all ${subjectTab === t ? 'bg-white dark:bg-neutral-800 shadow-md text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                        >
                            {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1">
                    {subjectTab === 'materials' && (
                        <div className="animate-fade-in space-y-6">
                            <SubjectProgress progress={progressData[subject.id] || 0} onChange={(val) => updateProgress(subject.id, val)} isDarkMode={isDarkMode} />
                             <div onClick={() => setIsDriveModalOpen(true)} className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-sky-400 transition-colors flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-sky-100 dark:bg-sky-900/30 rounded-xl text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform">
                                        <FolderOpen className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Course Materials (Drive)</h3>
                                        <p className="text-sm text-slate-500">Access notes, previous question papers, and texts</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-5 h-5 text-slate-500 group-hover:text-sky-500 transition-colors" />
                             </div>
                        </div>
                    )}
                    {subjectTab === 'videos' && (
                        <VideoGallery videos={filteredVideos} onPlay={setPlayingVideo} onToggleBookmark={() => {}} isBookmarked={() => false} />
                    )}
                    {subjectTab === 'ai' && (
                        <AITutor departmentName={department.name} semesterName={decodedSemId} subjectName={subject.title} />
                    )}
                </div>
            </div>
        )}
      </main>

      <Footer onNoticesClick={() => setIsNoticesModalOpen(true)} />

      {/* Modals specific to this view */}
      {viewingResource && <PDFViewer url={viewingResource.url} title={viewingResource.title} onClose={() => setViewingResource(null)} />}
      {playingVideo && <VideoPlayer youtubeId={playingVideo.youtubeId} title={playingVideo.title} onClose={() => setPlayingVideo(null)} />}
      {isDriveModalOpen && subject?.driveLink && <DriveFolderModal url={subject.driveLink} title={subject.title} onClose={() => setIsDriveModalOpen(false)} />}
      {isDeptAIModalOpen && decodedSemId && <DepartmentAIModal departmentName={department.name} semesterName={decodedSemId} onClose={() => setIsDeptAIModalOpen(false)} />}
      {isNoticesModalOpen && <NoticesModal onClose={() => setIsNoticesModalOpen(false)} />}
    </div>
  );
};

export default CourseView;
