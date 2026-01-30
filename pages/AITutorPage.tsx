
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AITutor from '../components/AITutor';
import Footer from '../components/Footer';
import NoticesModal from '../components/NoticesModal';
import { Bot, ArrowLeft } from 'lucide-react';

interface AITutorPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const AITutorPage: React.FC<AITutorPageProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);

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

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 flex flex-col">
        
        <div className="flex items-center mb-6">
            <button onClick={() => navigate('/')} className="glass-button p-3 rounded-full mr-4">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl text-violet-600 dark:text-violet-400">
                    <Bot className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">AI Personal Tutor</h1>
                    <p className="text-xs text-slate-500 dark:text-neutral-400 font-medium">Your 24/7 academic assistant powered by Gemini</p>
                </div>
            </div>
        </div>

        <div className="flex-grow flex flex-col">
            <AITutor 
                departmentName="Polytechnic General" 
                semesterName="All Semesters" 
            />
        </div>
      </main>

      <Footer onNoticesClick={() => setIsNoticesModalOpen(true)} />
      {isNoticesModalOpen && <NoticesModal onClose={() => setIsNoticesModalOpen(false)} />}
    </div>
  );
};

export default AITutorPage;
