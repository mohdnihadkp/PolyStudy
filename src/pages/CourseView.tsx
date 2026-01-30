
import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import SubjectProgress from '../components/SubjectProgress';
import VideoGallery from '../components/VideoGallery';
import AITutor from '../components/AITutor';
import PDFViewer from '../components/PDFViewer';
import VideoPlayer from '../components/VideoPlayer';
import DriveFolderModal from '../components/DriveFolderModal';
import DepartmentAIModal from '../components/DepartmentAIModal';
import { DEPARTMENTS, SEMESTERS } from '../constants';
import { Semester, Resource, VideoLecture } from '../types';
import { ArrowLeft, ArrowRight, FolderOpen, ExternalLink, Bot } from 'lucide-react';

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
  const [progressData, setProgressData] = useState<Record<string, number>>({});

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
  const decodedSemId = semId ? decodeURIComponent(semId) as Semester : null;
  const subject = subId && department && decodedSemId 
    ? department.subjects.find(s => s.id === subId) 
    : null;

  // Filter lists
  const filteredSubjects = useMemo(() => 
    department?.subjects.filter(s => s.semester === decodedSemId) || [], 
  [department, decodedSemId]);

  const filteredVideos = useMemo(() => 
    department?.videos.filter(v => v.semester === decodedSemId) || [], 
  [department, decodedSemId]);

  // Handlers
  const handleSemesterSelect = (sem: Semester) => {
    navigate(`/${deptId}/${encodeURIComponent(sem)}`);
  };

  const handleSubjectSelect = (subId: string) => {
    navigate(`/${deptId}/${encodeURIComponent(decodedSemId || '')}/${subId}`);
    setSubjectTab('materials');
  };

  const handleBack = () => {
    if (subId) {
      navigate(`/${deptId}/${encodeURIComponent(decodedSemId || '')}`);
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
        onNoticesClick={() => {}}
        onAboutClick={() => {}}
        onContactClick={() => {}}
      />

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Breadcrumb / Back Button */}
        <div className="flex items-center mb-6">
            <button onClick={handleBack} className="glass-button p-3 rounded-full mr-4">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{department.name}</span>
                <h2 className="text-2xl md:text-4xl font-black text-slate-900 dark:text-white">
                    {subject ? subject.title : decodedSemId ? decodedSemId : "Select Semester"}
                </h2>
            </div>
        </div>

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
                    <h3 className="text-lg font-bold text-slate-500">Subjects</h3>
                    <button onClick={() => setIsDeptAIModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors">
                        <Bot className="w-5 h-5" /> AI Assistant
                    </button>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {filteredSubjects.map(sub => (
                         <div key={sub.id} onClick={() => handleSubjectSelect(sub.id)} className="glass-panel p-5 rounded-2xl cursor-pointer hover:shadow-lg hover:border-sky-500/50 transition-all">
                             <h3 className="text-lg font-bold text-slate-900 dark:text-white">{sub.title}</h3>
                             <p className="text-sm text-slate-500 line-clamp-2">{sub.description}</p>
                         </div>
                     ))}
                 </div>
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
                             <div onClick={() => setIsDriveModalOpen(true)} className="glass-panel p-6 rounded-2xl cursor-pointer hover:border-sky-400 transition-colors flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <FolderOpen className="w-7 h-7 text-sky-600" />
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Course Materials (Drive)</h3>
                                        <p className="text-sm text-slate-500">Access notes, previous question papers, and texts</p>
                                    </div>
                                </div>
                                <ExternalLink className="w-5 h-5 text-slate-500" />
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

      {/* Modals specific to this view */}
      {viewingResource && <PDFViewer url={viewingResource.url} title={viewingResource.title} onClose={() => setViewingResource(null)} />}
      {playingVideo && <VideoPlayer youtubeId={playingVideo.youtubeId} title={playingVideo.title} onClose={() => setPlayingVideo(null)} />}
      {isDriveModalOpen && subject?.driveLink && <DriveFolderModal url={subject.driveLink} title={subject.title} onClose={() => setIsDriveModalOpen(false)} />}
      {isDeptAIModalOpen && decodedSemId && <DepartmentAIModal departmentName={department.name} semesterName={decodedSemId} onClose={() => setIsDeptAIModalOpen(false)} />}
    
    </div>
  );
};

export default CourseView;
