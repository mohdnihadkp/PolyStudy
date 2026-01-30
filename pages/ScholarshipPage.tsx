
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import AdBanner from '../components/AdBanner';
import Footer from '../components/Footer';
import NoticesModal from '../components/NoticesModal';
import { SCHOLARSHIPS } from '../constants';
import { Award, Search, Calendar, DollarSign, ExternalLink, Filter, ChevronRight, Tag, ArrowLeft } from 'lucide-react';

interface ScholarshipPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const ScholarshipPage: React.FC<ScholarshipPageProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);

  const allTags = Array.from(new Set(SCHOLARSHIPS.flatMap(s => s.tags)));

  const filteredScholarships = SCHOLARSHIPS.filter(scholarship => {
    const matchesSearch = scholarship.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          scholarship.provider.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTag = selectedTag ? scholarship.tags.includes(selectedTag) : true;
    return matchesSearch && matchesTag;
  });

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        onHomeClick={() => navigate('/')} 
        isHome={false} 
        isDarkMode={isDarkMode} 
        toggleTheme={toggleTheme}
        onSearch={() => {}} 
        onBookmarksClick={() => {}}
        onScholarshipsClick={() => {}}
        onFacilitiesClick={() => {}}
        onNoticesClick={() => setIsNoticesModalOpen(true)}
        onAboutClick={() => {}}
        onContactClick={() => {}}
      />

      <main className="relative z-10 flex-grow max-w-[1600px] mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        
        <div className="flex items-center mb-8">
            <button onClick={() => navigate('/')} className="glass-button p-3 rounded-full mr-4">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                    <Award className="w-6 h-6" />
                </div>
                <h1 className="text-3xl font-black text-slate-900 dark:text-white">Scholarship Hub</h1>
            </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="glass-panel p-4 rounded-2xl mb-8 flex flex-col md:flex-row gap-4 sticky top-24 z-20">
            <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search scholarships..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl text-sm font-medium focus:ring-2 focus:ring-amber-500/50 border-transparent bg-white/50 dark:bg-black/50"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar md:pb-0">
                <button 
                    onClick={() => setSelectedTag(null)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${!selectedTag ? 'bg-amber-500 text-white shadow-md' : 'bg-white dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                >
                    All
                </button>
                {allTags.map(tag => (
                    <button 
                        key={tag}
                        onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${selectedTag === tag ? 'bg-amber-500 text-white shadow-md' : 'bg-white dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 hover:bg-amber-50 dark:hover:bg-amber-900/20'}`}
                    >
                        {tag}
                    </button>
                ))}
            </div>
        </div>

        {/* List */}
        <div className="grid grid-cols-1 gap-6 max-w-4xl mx-auto">
            {filteredScholarships.length === 0 ? (
                <div className="text-center py-20 opacity-50">
                    <Filter className="w-12 h-12 mx-auto mb-4" />
                    <p className="font-bold text-slate-500">No scholarships found matching criteria.</p>
                </div>
            ) : (
                filteredScholarships.map(post => (
                    <div 
                        key={post.id} 
                        className={`glass-panel bg-white dark:bg-[#0a0a0a] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden transition-all duration-300 ${expandedId === post.id ? 'shadow-2xl ring-1 ring-amber-500/30' : 'hover:shadow-lg hover:-translate-y-1'}`}
                    >
                        <div 
                            className="p-6 cursor-pointer"
                            onClick={() => setExpandedId(expandedId === post.id ? null : post.id)}
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div className="flex gap-2 mb-2 flex-wrap">
                                    {post.isNew && <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md animate-pulse">New</span>}
                                    <span className="px-2 py-0.5 bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 text-[10px] font-bold uppercase tracking-wider rounded-md">{post.provider}</span>
                                </div>
                            </div>

                            <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-white mb-2 leading-tight">{post.title}</h3>
                            
                            <div className="flex flex-wrap gap-4 text-xs md:text-sm font-medium text-slate-600 dark:text-neutral-300 mb-4">
                                <div className="flex items-center text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-lg">
                                    <DollarSign className="w-4 h-4 mr-1" />
                                    {post.amount}
                                </div>
                                <div className="flex items-center text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-lg">
                                    <Calendar className="w-4 h-4 mr-1" />
                                    Deadline: {post.deadline}
                                </div>
                            </div>

                            <p className={`text-sm text-slate-500 dark:text-neutral-400 leading-relaxed ${expandedId === post.id ? '' : 'line-clamp-2'}`}>{post.description}</p>
                            
                            <div className="mt-4 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {post.tags.slice(0, 3).map(tag => (
                                        <span key={tag} className="flex items-center text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-neutral-800 px-2 py-1 rounded-full"><Tag className="w-3 h-3 mr-1" />{tag}</span>
                                    ))}
                                </div>
                                <button className={`text-xs font-bold flex items-center transition-colors ${expandedId === post.id ? 'text-amber-500' : 'text-slate-400 group-hover:text-amber-500'}`}>
                                    {expandedId === post.id ? 'Show Less' : 'Read More'} 
                                    <ChevronRight className={`w-4 h-4 ml-1 transition-transform ${expandedId === post.id ? '-rotate-90' : 'rotate-90'}`} />
                                </button>
                            </div>
                        </div>

                        {expandedId === post.id && (
                            <div className="px-6 pb-6 pt-0 animate-fade-in border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
                                <div className="mt-4 space-y-4">
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900 dark:text-white mb-2 uppercase tracking-wide">Eligibility Criteria</h4>
                                        <ul className="space-y-2">
                                            {post.eligibility.map((item, idx) => (
                                                <li key={idx} className="flex items-start text-sm text-slate-600 dark:text-neutral-300">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 mr-3 flex-shrink-0"></div>
                                                    {item}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div className="pt-4 flex justify-end">
                                        <button 
                                            onClick={() => window.open(post.applicationLink, '_blank')}
                                            className="glass-action-primary px-6 py-3 rounded-xl font-bold flex items-center shadow-lg hover:shadow-sky-500/25"
                                        >
                                            Apply Now <ExternalLink className="w-4 h-4 ml-2" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
        
        <div className="flex justify-center w-full mt-10">
            <AdBanner format="leaderboard" />
        </div>
      </main>
      
      <Footer onNoticesClick={() => setIsNoticesModalOpen(true)} />
      {isNoticesModalOpen && <NoticesModal onClose={() => setIsNoticesModalOpen(false)} />}
    </div>
  );
};

export default ScholarshipPage;
