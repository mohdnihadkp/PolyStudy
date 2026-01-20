
import React from 'react';
import { X, GraduationCap } from 'lucide-react';
import AITutor from './AITutor';
import AdBanner from './AdBanner';

interface DepartmentAIModalProps {
  departmentName: string;
  semesterName: string;
  onClose: () => void;
}

const DepartmentAIModal: React.FC<DepartmentAIModalProps> = ({ departmentName, semesterName, onClose }) => {
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-4xl rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#050505] border border-black/10 dark:border-white/10 shadow-2xl relative flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 md:p-6 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 backdrop-blur-xl">
            <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-xl text-white shadow-lg">
                    <GraduationCap className="w-6 h-6" />
                </div>
                <div>
                    <h2 className="text-lg md:text-xl font-black text-slate-900 dark:text-white leading-tight">
                        Department AI Assistant
                    </h2>
                    <p className="text-xs font-bold text-slate-500 dark:text-neutral-400">
                        {departmentName} • {semesterName}
                    </p>
                </div>
            </div>
            <button 
                onClick={onClose}
                className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
            >
                <X className="w-6 h-6" />
            </button>
        </div>

        <div className="flex justify-center w-full bg-slate-50 dark:bg-[#050505] pt-2">
            <AdBanner format="leaderboard" />
        </div>

        <div className="flex-1 overflow-hidden p-0">
            <AITutor 
                departmentName={departmentName}
                semesterName={semesterName}
                // No subjectName passed implies general department context
            />
        </div>
      </div>
    </div>
  );
};

export default DepartmentAIModal;
