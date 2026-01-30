
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import DepartmentCard from '../components/DepartmentCard';
import NoticesModal from '../components/NoticesModal';
import { DEPARTMENTS } from '../constants';
import Footer from '../components/Footer';
import { GraduationCap, ArrowLeft } from 'lucide-react';

interface DepartmentsProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const Departments: React.FC<DepartmentsProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);

  const handleDeptSelect = (deptId: string) => {
    navigate(`/${deptId}`);
  };

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
        
        <div className="flex items-center mb-8">
            <button onClick={() => navigate('/')} className="glass-button p-3 rounded-full mr-4">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl text-indigo-600 dark:text-indigo-400">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">All Departments</h1>
            </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {DEPARTMENTS.map((dept) => (
                <DepartmentCard key={dept.id} department={dept} onClick={() => handleDeptSelect(dept.id)} />
            ))}
        </div>
      </main>

      <Footer onNoticesClick={() => setIsNoticesModalOpen(true)} />
      {isNoticesModalOpen && <NoticesModal onClose={() => setIsNoticesModalOpen(false)} />}
    </div>
  );
};

export default Departments;
