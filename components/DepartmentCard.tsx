import React from 'react';
import { Department } from '../types';
import { ArrowRight } from 'lucide-react';

interface DepartmentCardProps {
  department: Department;
  onClick: (dept: Department) => void;
}

const DepartmentCard: React.FC<DepartmentCardProps> = ({ department, onClick }) => {
  return (
    <button 
      onClick={() => onClick(department)}
      className="group glass-panel p-6 md:p-8 cursor-pointer rounded-[1.5rem] md:rounded-[2rem] relative overflow-hidden h-full flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-sky-500/10 hover:-translate-y-2 border-slate-200 dark:border-white/5 active:scale-95 hover:border-sky-200 dark:hover:border-sky-500/30 bg-white dark:bg-[#0a0a0a] text-left w-full focus-visible:ring-4 focus-visible:ring-sky-500/50 outline-none"
      aria-label={`View subjects for ${department.name}`}
    >
      {/* Decorative Gradient Background on Hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 bg-gradient-to-br ${department.color || 'from-slate-400 to-slate-600'}`}></div>

      {/* Subtle Glow Element */}
      <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/0 via-sky-500/10 to-sky-500/0 rounded-[2rem] opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-500 pointer-events-none"></div>

      <div className="w-full">
        <div className="flex items-start justify-between mb-6 relative z-10">
            <div className={`p-3.5 md:p-4 rounded-xl md:rounded-2xl shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${department.color ? department.color.replace('bg-', 'bg-opacity-10 text-').replace('500', '600 dark:text-') + '400 bg-' + department.color.replace('bg-', '').replace('500', '100 dark:bg-opacity-20') : 'bg-slate-100 text-slate-600'}`}>
                {department.icon}
            </div>
        </div>

        <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 dark:text-white mb-3 tracking-tight group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors relative z-10 leading-tight">
            {department.name}
        </h3>
        <p className="text-sm md:text-base text-slate-600 dark:text-neutral-400 mb-8 leading-relaxed relative z-10 font-medium opacity-90 group-hover:opacity-100 transition-opacity">
            {department.description}
        </p>
      </div>

      <div className="glass-panel !bg-transparent rounded-xl py-3 px-0 flex items-center justify-between text-sm font-bold text-slate-700 dark:text-neutral-300 border-t border-slate-200/50 dark:border-white/10 shadow-none mt-auto group/btn w-full">
        <span className="group-hover:translate-x-1 transition-transform group-hover:text-sky-600 dark:group-hover:text-sky-400">Explore Subjects</span>
        <div className="bg-slate-100 dark:bg-neutral-800 p-2 rounded-full group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300 shadow-sm">
            <ArrowRight className="w-4 h-4" />
        </div>
      </div>
    </button>
  );
};

export default DepartmentCard;