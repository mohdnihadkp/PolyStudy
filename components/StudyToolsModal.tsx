
import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Timer, FileEdit, Play, Pause, RotateCcw, Plus, Trash2, Save, Check, ListTodo, Circle, CheckCircle2, MoreHorizontal, Eraser, Delete, ChevronRight, History, Search, Bold, Italic, List, Code, AlignLeft, Type, Menu, Sidebar, Quote, Heading1, Heading2, Heading3, ArrowLeft } from 'lucide-react';

interface StudyToolsModalProps {
  onClose: () => void;
}

const StudyToolsModal: React.FC<StudyToolsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'notes' | 'calc'>('calc');

  const tabs = [
    { id: 'calc', label: 'ClassWiz Calc', icon: Calculator, color: 'text-white', bg: 'bg-gradient-to-br from-slate-800 to-black' },
    { id: 'notes', label: 'Notebook', icon: FileEdit, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/20' },
    { id: 'timer', label: 'Focus Timer', icon: Timer, color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/20' },
    { id: 'tasks', label: 'Task List', icon: ListTodo, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/20' },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-md p-2 md:p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-6xl h-[95vh] md:h-[90vh] rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden bg-[#f8f9fa] dark:bg-[#050505] border border-black/10 dark:border-white/10 shadow-2xl relative flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header */}
        <div className="md:hidden p-3 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/80 dark:bg-white/5 backdrop-blur-xl z-20 shrink-0">
            <h2 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${tabs.find(t => t.id === activeTab)?.bg} ${tabs.find(t => t.id === activeTab)?.color}`}>
                    {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Timer, { className: "w-4 h-4" })}
                </span>
                <span className="truncate">{tabs.find(t => t.id === activeTab)?.label}</span>
            </h2>
            <button onClick={onClose} className="p-1.5 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Sidebar Navigation (Desktop) */}
        <div className="hidden md:flex flex-col w-64 border-r border-black/5 dark:border-white/5 bg-white dark:bg-[#0a0a0a] backdrop-blur-xl p-6 z-20">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Study Tools</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-500 font-medium mt-1">Boost your productivity</p>
            </div>
            
            <nav className="space-y-3 flex-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group relative overflow-hidden ${
                            activeTab === tab.id 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-lg transform scale-105' 
                            : 'hover:bg-slate-100 dark:hover:bg-white/10 text-slate-500 dark:text-neutral-400'
                        }`}
                    >
                        <div className={`p-2 rounded-xl mr-3 transition-colors ${activeTab === tab.id ? 'bg-white/20 dark:bg-black/10 text-white dark:text-black' : 'bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-neutral-200'}`}>
                            <tab.icon className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-sm">
                            {tab.label}
                        </span>
                    </button>
                ))}
            </nav>

            <div className="mt-auto pt-6 border-t border-black/5 dark:border-white/5">
                <button 
                    onClick={onClose}
                    className="w-full py-3 rounded-xl flex items-center justify-center text-xs font-bold text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
                >
                    <X className="w-4 h-4 mr-2" />
                    Close Tools
                </button>
            </div>
        </div>

        {/* Mobile Navigation (Bottom Bar) */}
        <div className="md:hidden flex overflow-x-auto bg-white dark:bg-black border-t border-black/5 dark:border-white/5 p-2 gap-2 order-last no-scrollbar z-20 shrink-0">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[80px] p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        activeTab === tab.id 
                        ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white font-bold' 
                        : 'text-slate-400 dark:text-neutral-600'
                    }`}
                >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-sky-500' : ''}`} />
                    <span className="text-[10px]">{tab.label.split(' ')[0]}</span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-[#f0f2f5] dark:bg-[#000000] relative h-full">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            
            <div className="h-full flex flex-col relative z-10">
                {activeTab === 'timer' && (
                    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <PomodoroTimer />
                    </div>
                )}
                {activeTab === 'tasks' && (
                    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
                        <TaskManager />
                    </div>
                )}
                {activeTab === 'notes' && (
                    <Notebook />
                )}
                {activeTab === 'calc' && (
                    <div className="h-full bg-[#1a1c20] flex items-center justify-center">
                        <ScientificCalculator />
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

// --- SUB COMPONENTS ---

const PomodoroTimer = () => {
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState<'work' | 'short' | 'long'>('work');
    const [totalTime, setTotalTime] = useState(25 * 60);

    useEffect(() => {
        let interval: any;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
        } else if (timeLeft === 0) {
            setIsActive(false);
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
            audio.play().catch(() => {});
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const setTimerMode = (m: 'work' | 'short' | 'long') => {
        setMode(m);
        setIsActive(false);
        let time = 25 * 60;
        if (m === 'short') time = 5 * 60;
        if (m === 'long') time = 15 * 60;
        setTimeLeft(time);
        setTotalTime(time);
    };

    const progress = ((totalTime - timeLeft) / totalTime) * 100;
    const strokeDasharray = 2 * Math.PI * 120; 
    const strokeDashoffset = strokeDasharray * ((100 - progress) / 100);

    return (
        <div className="flex flex-col items-center justify-center h-full animate-scale-in max-w-3xl mx-auto">
            <div className="flex p-1.5 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-100 dark:border-white/5 mb-10">
                {[
                    { id: 'work', label: 'Focus' },
                    { id: 'short', label: 'Short Break' },
                    { id: 'long', label: 'Long Break' },
                ].map((m) => (
                    <button
                        key={m.id}
                        onClick={() => setTimerMode(m.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            mode === m.id 
                            ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-md' 
                            : 'text-slate-500 dark:text-neutral-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                    >
                        {m.label}
                    </button>
                ))}
            </div>

            <div className="relative mb-10 group cursor-default scale-75 md:scale-100">
                <svg className="transform -rotate-90 w-64 h-64 md:w-80 md:h-80">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="120"
                        className="stroke-slate-200 dark:stroke-white/5 fill-none"
                        strokeWidth="12"
                    />
                    <circle
                        cx="50%"
                        cy="50%"
                        r="120"
                        className={`fill-none transition-all duration-1000 ease-linear ${
                            mode === 'work' ? 'stroke-rose-500' : 
                            mode === 'short' ? 'stroke-emerald-500' : 'stroke-blue-500'
                        }`}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={strokeDasharray}
                        strokeDashoffset={strokeDashoffset}
                    />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mt-2">
                        {isActive ? 'Running' : 'Paused'}
                    </span>
                </div>
            </div>

            <div className="flex gap-6 items-center">
                <button 
                    onClick={() => setTimerMode(mode)}
                    className="p-4 rounded-full bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white transition-all"
                    title="Reset Timer"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>

                <button 
                    onClick={() => setIsActive(!isActive)}
                    className={`w-20 h-20 rounded-[2rem] flex items-center justify-center text-white shadow-2xl transition-all hover:scale-105 active:scale-95 ${
                        mode === 'work' ? 'bg-gradient-to-br from-rose-500 to-orange-600 shadow-rose-500/30' : 
                        mode === 'short' ? 'bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/30' : 
                        'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-blue-500/30'
                    }`}
                >
                    {isActive ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
            </div>
        </div>
    );
};

const TaskManager = () => {
    const [tasks, setTasks] = useState<{id: string, text: string, completed: boolean}[]>([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('polystudy_tasks');
        if (saved) setTasks(JSON.parse(saved));
    }, []);

    const updateTasks = (newTasks: typeof tasks) => {
        setTasks(newTasks);
        localStorage.setItem('polystudy_tasks', JSON.stringify(newTasks));
    };

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTask.trim()) return;
        const task = { id: Date.now().toString(), text: newTask, completed: false };
        updateTasks([...tasks, task]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        updateTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        updateTasks(tasks.filter(t => t.id !== id));
    };

    const clearCompleted = () => {
        updateTasks(tasks.filter(t => !t.completed));
    };

    return (
        <div className="flex flex-col h-full animate-fade-in max-w-3xl mx-auto w-full">
            <div className="flex justify-between items-end mb-6">
                <div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">My Tasks</h3>
                    <p className="text-sm text-slate-500 dark:text-neutral-400">Keep track of your study goals</p>
                </div>
                {tasks.some(t => t.completed) && (
                    <button onClick={clearCompleted} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors flex items-center">
                        <Eraser className="w-3 h-3 mr-1" /> Clear Completed
                    </button>
                )}
            </div>

            <form onSubmit={addTask} className="relative mb-6">
                <input 
                    type="text" 
                    value={newTask}
                    onChange={(e) => setNewTask(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full pl-5 pr-14 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all shadow-sm"
                />
                <button 
                    type="submit"
                    disabled={!newTask.trim()}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                {tasks.length === 0 ? (
                    <div className="text-center py-12 opacity-50">
                        <ListTodo className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-neutral-700" />
                        <p className="text-slate-500 dark:text-neutral-500 font-medium">No tasks yet. Start by adding one!</p>
                    </div>
                ) : (
                    tasks.map(task => (
                        <div 
                            key={task.id}
                            className={`group flex items-center p-4 rounded-xl border transition-all duration-300 ${
                                task.completed 
                                ? 'bg-slate-50 dark:bg-white/5 border-transparent opacity-60' 
                                : 'bg-white dark:bg-[#0a0a0a] border-slate-100 dark:border-white/10 shadow-sm hover:border-emerald-500/30'
                            }`}
                        >
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mr-4 ${
                                    task.completed 
                                    ? 'bg-emerald-500 border-emerald-500 text-white' 
                                    : 'border-slate-300 dark:border-neutral-600 hover:border-emerald-500 text-transparent'
                                }`}
                            >
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </button>
                            
                            <span className={`flex-1 font-medium text-sm md:text-base break-words ${
                                task.completed ? 'text-slate-400 line-through' : 'text-slate-700 dark:text-slate-200'
                            }`}>
                                {task.text}
                            </span>

                            <button 
                                onClick={() => deleteTask(task.id)}
                                className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

interface Note {
    id: string;
    title: string;
    content: string;
    date: number;
}

const Notebook = () => {
    const [notes, setNotes] = useState<Note[]>(() => {
        try {
            const saved = localStorage.getItem('polystudy_notebook');
            if (saved) return JSON.parse(saved);
        } catch (e) { console.error(e); }
        return [{
            id: 'welcome',
            title: 'Quick Notes',
            content: '# Welcome to your Notebook\n\nYou can format text using markdown:\n\n- **Bold**\n- *Italic*\n- [ ] Checklist',
            date: Date.now()
        }];
    });

    const [activeNoteId, setActiveNoteId] = useState<string | null>(notes[0]?.id || null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isSaved, setIsSaved] = useState(true);
    
    useEffect(() => {
        setIsSaved(false);
        const timer = setTimeout(() => {
            localStorage.setItem('polystudy_notebook', JSON.stringify(notes));
            setIsSaved(true);
        }, 800);
        return () => clearTimeout(timer);
    }, [notes]);

    const activeNote = notes.find(n => n.id === activeNoteId);

    const createNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: '',
            content: '',
            date: Date.now()
        };
        setNotes([newNote, ...notes]);
        setActiveNoteId(newNote.id);
        if (window.innerWidth < 768) setSidebarOpen(false);
    };

    const deleteNote = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        const newNotes = notes.filter(n => n.id !== id);
        setNotes(newNotes);
        if (activeNoteId === id) setActiveNoteId(newNotes[0]?.id || null);
    };

    const updateNote = (field: 'title' | 'content', value: string) => {
        if (!activeNoteId) return;
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, [field]: value, date: Date.now() } : n));
    };

    const insertText = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('note-editor') as HTMLTextAreaElement;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const newText = text.substring(0, start) + prefix + text.substring(start, end) + suffix + text.substring(end);
        updateNote('content', newText);
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const filteredNotes = notes.filter(n => 
        (n.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
        (n.content || '').toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full animate-fade-in relative bg-[#fafafa] dark:bg-[#0a0a0a]">
            {/* Sidebar */}
            <div className={`
                absolute md:static inset-y-0 left-0 z-20 w-full md:w-80 bg-white dark:bg-[#0f0f0f] border-r border-slate-200 dark:border-white/5 flex flex-col transition-transform duration-300 transform
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-100 dark:border-white/5">
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-white/5 border-none rounded-xl text-sm focus:ring-2 focus:ring-amber-500/20"
                        />
                    </div>
                    <button 
                        onClick={createNote}
                        className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" /> New Note
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredNotes.map(note => (
                        <div 
                            key={note.id}
                            onClick={() => {
                                setActiveNoteId(note.id);
                                if (window.innerWidth < 768) setSidebarOpen(false);
                            }}
                            className={`p-3 rounded-xl cursor-pointer group transition-all border ${
                                activeNoteId === note.id 
                                ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-500/20 shadow-sm' 
                                : 'hover:bg-slate-50 dark:hover:bg-white/5 border-transparent'
                            }`}
                        >
                            <h4 className={`font-bold text-sm truncate mb-1 ${activeNoteId === note.id ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {note.title || 'Untitled Note'}
                            </h4>
                            <p className="text-[10px] text-slate-400 truncate">
                                {note.content || 'Start writing...'}
                            </p>
                            <div className="flex justify-between items-center mt-2">
                                <span className="text-[9px] text-slate-300">
                                    {new Date(note.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                </span>
                                <button 
                                    onClick={(e) => deleteNote(e, note.id)}
                                    className="p-1.5 rounded-md text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="flex-1 flex flex-col h-full relative z-10 bg-white dark:bg-[#0a0a0a]">
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden absolute left-4 top-4 z-30 p-2 bg-slate-100 dark:bg-white/10 rounded-lg"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>

                {activeNote ? (
                    <>
                        <div className="px-4 md:px-8 py-6 border-b border-slate-50 dark:border-white/5 flex flex-col gap-2">
                            <input 
                                type="text"
                                value={activeNote.title}
                                onChange={(e) => updateNote('title', e.target.value)}
                                placeholder="Note Title"
                                className="text-3xl font-black bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-white placeholder-slate-200"
                            />
                            <div className="flex items-center gap-3 text-xs text-slate-400 font-medium">
                                <span>{new Date(activeNote.date).toLocaleString()}</span>
                                {isSaved ? (
                                    <span className="text-emerald-500 flex items-center"><Check className="w-3 h-3 mr-1" /> Saved</span>
                                ) : (
                                    <span className="text-amber-500 flex items-center"><Save className="w-3 h-3 mr-1" /> Saving...</span>
                                )}
                            </div>
                        </div>

                        {/* Formatting Toolbar */}
                        <div className="px-4 md:px-8 py-2 border-b border-slate-50 dark:border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar bg-slate-50/50 dark:bg-white/[0.02]">
                            {[
                                { icon: Bold, action: () => insertText('**', '**'), label: 'Bold' },
                                { icon: Italic, action: () => insertText('*', '*'), label: 'Italic' },
                                { icon: Quote, action: () => insertText('> '), label: 'Quote' },
                                { icon: Code, action: () => insertText('`', '`'), label: 'Code' },
                                { icon: List, action: () => insertText('- '), label: 'List' },
                                { icon: Heading1, action: () => insertText('# '), label: 'H1' },
                                { icon: Heading2, action: () => insertText('## '), label: 'H2' },
                            ].map((btn, idx) => (
                                <button 
                                    key={idx}
                                    onClick={btn.action}
                                    className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 transition-colors"
                                    title={btn.label}
                                >
                                    <btn.icon className="w-4 h-4" />
                                </button>
                            ))}
                        </div>

                        <textarea 
                            id="note-editor"
                            value={activeNote.content}
                            onChange={(e) => updateNote('content', e.target.value)}
                            placeholder="Start typing..."
                            className="flex-1 w-full p-4 md:p-8 bg-transparent resize-none focus:outline-none text-lg leading-relaxed text-slate-700 dark:text-slate-300 font-serif"
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-300 dark:text-neutral-700">
                        <FileEdit className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select or create a note</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ScientificCalculator = () => {
    const [display, setDisplay] = useState('');
    const [result, setResult] = useState('');
    const [isShift, setIsShift] = useState(false);
    const [isAlpha, setIsAlpha] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [angleMode, setAngleMode] = useState<'D' | 'R' | 'G'>('D');

    const handlePress = (val: string) => {
        if (val === 'AC') {
            setDisplay('');
            setResult('');
            setIsShift(false);
            setIsAlpha(false);
        } else if (val === 'DEL') {
            setDisplay(prev => prev.slice(0, -1));
        } else if (val === '=') {
            calculate();
        } else if (val === 'SHIFT') {
            setIsShift(!isShift);
            setIsAlpha(false);
        } else if (val === 'ALPHA') {
            setIsAlpha(!isAlpha);
            setIsShift(false);
        } else if (val === 'Ans') {
            setDisplay(prev => prev + result);
        } else {
            setDisplay(prev => prev + val);
        }
    };

    const calculate = () => {
        if (!display.trim()) return;
        try {
            let expr = display
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'Math.PI')
                .replace(/e/g, 'Math.E')
                .replace(/\^/g, '**')
                .replace(/√\(/g, 'Math.sqrt(')
                .replace(/sin\(/g, `Math.sin(${angleMode === 'D' ? 'Math.PI/180*' : ''}`)
                .replace(/cos\(/g, `Math.cos(${angleMode === 'D' ? 'Math.PI/180*' : ''}`)
                .replace(/tan\(/g, `Math.tan(${angleMode === 'D' ? 'Math.PI/180*' : ''}`)
                .replace(/log\(/g, 'Math.log10(')
                .replace(/ln\(/g, 'Math.log(')
                .replace(/asin\(/g, `(180/Math.PI)*Math.asin(`)
                .replace(/acos\(/g, `(180/Math.PI)*Math.acos(`)
                .replace(/atan\(/g, `(180/Math.PI)*Math.atan(`);

            // eslint-disable-next-line no-new-func
            const res = new Function(`return ${expr}`)();
            
            let resStr = String(res);
            if (resStr.length > 12) resStr = res.toPrecision(10);
            
            setResult(resStr);
            setHistory(prev => [display + ' = ' + resStr, ...prev.slice(0, 4)]);
            setIsShift(false);
            setIsAlpha(false);
        } catch (e) {
            setResult('Syntax ERROR');
        }
    };

    // Responsive Calc Button
    const CalcButton = ({ 
        label, 
        subLabel = '', 
        alphaLabel = '', 
        type = 'std', 
        onClick, 
        className = '' 
    }: any) => (
        <div className="relative group select-none flex flex-col items-center justify-center w-full h-full">
            <div className="flex justify-between w-full px-0.5 mb-0.5 absolute -top-3 left-0 right-0">
                <span className={`text-[6px] md:text-[8px] font-bold text-yellow-500 transition-opacity whitespace-nowrap ${isShift ? 'opacity-100' : 'opacity-60'}`}>{subLabel}</span>
                <span className={`text-[6px] md:text-[8px] font-bold text-red-500 transition-opacity whitespace-nowrap ${isAlpha ? 'opacity-100' : 'opacity-60'}`}>{alphaLabel}</span>
            </div>
            
            <button
                onClick={onClick}
                className={`
                    w-full aspect-square rounded-full md:rounded-[12px] lg:rounded-full text-xs md:text-sm lg:text-base font-bold shadow-[0_2px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[1px] transition-all flex items-center justify-center border border-white/5
                    ${type === 'std' ? 'bg-white text-black' : ''}
                    ${type === 'black' ? 'bg-[#2a2a2a] text-white hover:bg-[#333]' : ''}
                    ${type === 'nav' ? 'bg-[#d1d5db] text-black text-xs hover:bg-[#e5e7eb]' : ''}
                    ${type === 'gold' ? 'bg-yellow-600 text-white hover:bg-yellow-500' : ''}
                    ${type === 'blue' ? 'bg-blue-600 text-white hover:bg-blue-500' : ''}
                    ${className}
                `}
            >
                {label}
            </button>
        </div>
    );

    return (
        <div className="w-full h-full flex flex-col p-2 md:p-4 bg-[#1a1c20] font-mono">
            {/* Casio Frame - Flexible Width/Height */}
            <div className="w-full max-w-sm mx-auto h-full flex flex-col bg-[#121212] rounded-[20px] p-3 md:p-5 shadow-[0_0_60px_rgba(0,0,0,0.6)] border border-[#333] relative">
                
                {/* Branding */}
                <div className="flex justify-between items-end mb-2 px-1 relative z-10 shrink-0">
                    <span className="text-white font-bold tracking-widest text-[10px] md:text-xs">CASIO</span>
                    <div className="text-[8px] md:text-[10px] text-gray-400 font-bold italic">fx-991CW</div>
                    <span className="text-[7px] md:text-[8px] text-cyan-400 font-bold border border-cyan-400 px-1 rounded">CLASSWIZ</span>
                </div>

                {/* Screen - Flexible Height */}
                <div className="bg-[#eff5f0] border-4 border-[#333] rounded-lg h-24 md:h-32 mb-4 shadow-inner relative overflow-hidden flex flex-col p-2 shrink-0">
                    {/* Status Bar */}
                    <div className="flex justify-between text-[8px] md:text-[9px] font-bold text-black border-b border-black/10 pb-1 mb-1">
                        <span className="bg-black text-white px-1.5 rounded-sm">{angleMode}</span>
                        <span className="flex gap-2">
                            {isShift && <span className="bg-yellow-500 text-white px-1.5">S</span>}
                            {isAlpha && <span className="bg-red-500 text-white px-1.5">A</span>}
                        </span>
                    </div>
                    {/* Calculation Area */}
                    <div className="flex-1 text-black font-medium text-lg md:text-xl overflow-x-auto whitespace-nowrap px-1 custom-scrollbar flex items-center">
                        {display}<span className="animate-pulse w-0.5 h-4 md:h-5 bg-black ml-0.5"></span>
                    </div>
                    {/* Result Area */}
                    <div className="text-right text-2xl md:text-3xl font-bold text-black px-1 tracking-tight mt-auto">
                        {result}
                    </div>
                </div>

                {/* Keypad - Responsive Grid */}
                <div className="relative z-10 grid grid-cols-4 gap-2 md:gap-3 flex-1 overflow-y-auto content-start py-1 px-1 custom-scrollbar">
                    
                    {/* Top Control Cluster */}
                    <CalcButton label="SHIFT" type="gold" onClick={() => handlePress('SHIFT')} />
                    <CalcButton label="ALPHA" type="nav" className="!text-red-600" onClick={() => handlePress('ALPHA')} />
                    <CalcButton label="MENU" type="nav" />
                    <CalcButton label="ON" type="nav" onClick={() => { setDisplay(''); setResult(''); }} />

                    {/* Scientific Functions */}
                    <CalcButton label="OPTN" type="black" />
                    <CalcButton label="CALC" type="black" />
                    <CalcButton label="∫dx" subLabel="d/dx" type="black" />
                    <CalcButton label="x⁻¹" subLabel="x!" type="black" onClick={() => handlePress('^(-1)')} />

                    <CalcButton label="√" subLabel="∛" type="black" onClick={() => handlePress('√(')} />
                    <CalcButton label="x²" subLabel="x³" type="black" onClick={() => handlePress('^2')} />
                    <CalcButton label="xⁿ" subLabel="ⁿ√" type="black" onClick={() => handlePress('^')} />
                    <CalcButton label="log" subLabel="10ⁿ" type="black" onClick={() => isShift ? handlePress('10^') : handlePress('log(')} />

                    <CalcButton label="ln" subLabel="eⁿ" type="black" onClick={() => isShift ? handlePress('e^') : handlePress('ln(')} />
                    <CalcButton label="(-)" subLabel="A" type="black" onClick={() => handlePress('-')} />
                    <CalcButton label="°'″" subLabel="B" type="black" />
                    <CalcButton label="hyp" subLabel="C" type="black" />

                    <CalcButton label="sin" subLabel="sin⁻¹" type="black" onClick={() => handlePress(isShift ? 'asin(' : 'sin(')} />
                    <CalcButton label="cos" subLabel="cos⁻¹" type="black" onClick={() => handlePress(isShift ? 'acos(' : 'cos(')} />
                    <CalcButton label="tan" subLabel="tan⁻¹" type="black" onClick={() => handlePress(isShift ? 'atan(' : 'tan(')} />
                    <CalcButton label="STO" subLabel="RCL" type="black" />

                    {/* Number Pad */}
                    <CalcButton label="7" type="std" onClick={() => handlePress('7')} />
                    <CalcButton label="8" type="std" onClick={() => handlePress('8')} />
                    <CalcButton label="9" type="std" onClick={() => handlePress('9')} />
                    <CalcButton label="DEL" type="blue" className="!bg-blue-600 !text-white" onClick={() => handlePress('DEL')} />

                    <CalcButton label="4" type="std" onClick={() => handlePress('4')} />
                    <CalcButton label="5" type="std" onClick={() => handlePress('5')} />
                    <CalcButton label="6" type="std" onClick={() => handlePress('6')} />
                    <CalcButton label="×" type="std" onClick={() => handlePress('×')} />

                    <CalcButton label="1" type="std" onClick={() => handlePress('1')} />
                    <CalcButton label="2" type="std" onClick={() => handlePress('2')} />
                    <CalcButton label="3" type="std" onClick={() => handlePress('3')} />
                    <CalcButton label="+" type="std" onClick={() => handlePress('+')} />

                    <CalcButton label="0" type="std" onClick={() => handlePress('0')} />
                    <CalcButton label="." subLabel="Ran#" type="std" onClick={() => handlePress('.')} />
                    <CalcButton label="×10ˣ" subLabel="π" type="std" onClick={() => isShift ? handlePress('π') : handlePress('E')} />
                    <CalcButton label="-" type="std" onClick={() => handlePress('-')} />

                    <CalcButton label="Ans" type="std" onClick={() => handlePress('Ans')} />
                    <div className="col-span-2">
                        <CalcButton label="EXE" type="std" className="!w-full !aspect-auto !h-full !bg-black !text-white !border-white/20 !rounded-[12px]" onClick={() => handlePress('=')} />
                    </div>
                    <CalcButton label="÷" type="std" onClick={() => handlePress('÷')} />
                </div>
            </div>
            
            {/* History Tape - Desktop Only */}
            <div className="hidden xl:block absolute right-8 top-1/2 -translate-y-1/2 w-48 bg-[#121212] border border-[#333] rounded-xl p-4 text-xs font-mono text-gray-400 shadow-xl">
                <div className="flex items-center gap-2 mb-2 text-gray-500 border-b border-gray-800 pb-2">
                    <History className="w-3 h-3" /> Tape
                </div>
                <div className="space-y-2 opacity-80">
                    {history.length === 0 && <div>No history</div>}
                    {history.map((h, i) => (
                        <div key={i} className="border-b border-gray-800 pb-1">{h}</div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default StudyToolsModal;
