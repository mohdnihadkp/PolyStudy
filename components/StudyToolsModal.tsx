import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Timer, FileEdit, Play, Pause, RotateCcw, Plus, Trash2, Save, Check, ListTodo, Circle, CheckCircle2, MoreHorizontal, Eraser, Delete, ChevronRight, History, Search, Bold, Italic, List, Code, AlignLeft, Type, Menu, Sidebar } from 'lucide-react';

interface StudyToolsModalProps {
  onClose: () => void;
}

const StudyToolsModal: React.FC<StudyToolsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'timer' | 'tasks' | 'notes' | 'calc'>('timer');

  const tabs = [
    { id: 'timer', label: 'Focus Timer', icon: Timer, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 'tasks', label: 'Task List', icon: ListTodo, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'notes', label: 'Notebook', icon: FileEdit, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 'calc', label: 'Calculator', icon: Calculator, color: 'text-blue-500', bg: 'bg-blue-500/10' },
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 dark:bg-black/90 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-6xl h-[85vh] rounded-[2.5rem] overflow-hidden bg-white dark:bg-[#050505] border border-black/10 dark:border-white/10 shadow-2xl relative flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Header */}
        <div className="md:hidden p-4 border-b border-black/5 dark:border-white/5 flex justify-between items-center bg-white/50 dark:bg-white/5 backdrop-blur-xl">
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span className={`p-1.5 rounded-lg ${tabs.find(t => t.id === activeTab)?.bg} ${tabs.find(t => t.id === activeTab)?.color}`}>
                    {React.createElement(tabs.find(t => t.id === activeTab)?.icon || Timer, { className: "w-5 h-5" })}
                </span>
                Study Tools
            </h2>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <X className="w-5 h-5" />
            </button>
        </div>

        {/* Sidebar Navigation (Desktop) */}
        <div className="hidden md:flex flex-col w-64 border-r border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl p-6">
            <div className="mb-8">
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Study Tools</h2>
                <p className="text-xs text-slate-500 dark:text-neutral-500 font-medium mt-1">Boost your productivity</p>
            </div>
            
            <nav className="space-y-2 flex-1">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`w-full flex items-center p-3 rounded-2xl transition-all duration-300 group ${
                            activeTab === tab.id 
                            ? 'bg-white dark:bg-white/10 shadow-lg shadow-black/5 dark:shadow-none' 
                            : 'hover:bg-white/50 dark:hover:bg-white/5 text-slate-500 dark:text-neutral-500'
                        }`}
                    >
                        <div className={`p-2.5 rounded-xl mr-3 transition-colors ${activeTab === tab.id ? `${tab.bg} ${tab.color}` : 'bg-slate-200 dark:bg-white/5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-neutral-300'}`}>
                            <tab.icon className="w-5 h-5" />
                        </div>
                        <span className={`font-bold text-sm ${activeTab === tab.id ? 'text-slate-900 dark:text-white' : ''}`}>
                            {tab.label}
                        </span>
                        {activeTab === tab.id && (
                            <div className="ml-auto w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white"></div>
                        )}
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
        <div className="md:hidden flex overflow-x-auto bg-white dark:bg-black border-t border-black/5 dark:border-white/5 p-2 gap-2 order-last no-scrollbar">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 min-w-[80px] p-2 rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${
                        activeTab === tab.id 
                        ? 'bg-slate-100 dark:bg-white/10 text-slate-900 dark:text-white' 
                        : 'text-slate-400 dark:text-neutral-600'
                    }`}
                >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? tab.color : ''}`} />
                    <span className="text-[10px] font-bold">{tab.label}</span>
                </button>
            ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-hidden bg-slate-50 dark:bg-[#050505] relative">
            <div className="h-full flex flex-col">
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
                    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar">
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
            {/* Mode Switcher */}
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

            {/* Timer Circle */}
            <div className="relative mb-10 group cursor-default">
                {/* Background Circle */}
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
                
                {/* Time Display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-6xl md:text-7xl font-black text-slate-900 dark:text-white tabular-nums tracking-tighter">
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest mt-2">
                        {isActive ? 'Running' : 'Paused'}
                    </span>
                </div>
            </div>

            {/* Controls */}
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
    // Lazy initialization for robust persistence
    const [notes, setNotes] = useState<Note[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('polystudy_notebook');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.error("Failed to load notes:", e);
        }
        // Default note if storage is empty
        return [{
            id: 'welcome',
            title: 'Welcome to Notebook',
            content: 'Start taking notes here. You can use **Markdown** styling.\n\n- Bold: **text**\n- Italic: *text*\n- Lists: - item',
            date: Date.now()
        }];
    });

    const [activeNoteId, setActiveNoteId] = useState<string | null>(() => {
        return notes.length > 0 ? notes[0].id : null;
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [isSaved, setIsSaved] = useState(true);
    
    // Listen for changes from other tabs
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'polystudy_notebook' && e.newValue) {
                try {
                    const newNotes = JSON.parse(e.newValue);
                    setNotes(newNotes);
                    // If active note was deleted in another tab, reset active ID
                    if (activeNoteId && !newNotes.find((n: Note) => n.id === activeNoteId)) {
                        setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
                    }
                } catch (err) {
                    console.error("Failed to sync notes from storage event", err);
                }
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [activeNoteId]);

    // Persistence Effect (Save to LocalStorage)
    useEffect(() => {
        setIsSaved(false);
        const timer = setTimeout(() => {
            localStorage.setItem('polystudy_notebook', JSON.stringify(notes));
            setIsSaved(true);
        }, 500); // Debounce saving
        
        return () => clearTimeout(timer);
    }, [notes]);

    const activeNote = notes.find(n => n.id === activeNoteId);

    const createNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            title: 'Untitled Note',
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
        if (activeNoteId === id) {
            setActiveNoteId(newNotes.length > 0 ? newNotes[0].id : null);
        }
    };

    const updateNote = (field: 'title' | 'content', value: string) => {
        if (!activeNoteId) return;
        setNotes(notes.map(n => n.id === activeNoteId ? { ...n, [field]: value, date: Date.now() } : n));
    };

    // Text Insertion Helper
    const insertText = (prefix: string, suffix: string = '') => {
        const textarea = document.getElementById('note-editor') as HTMLTextAreaElement;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const text = textarea.value;
        const selection = text.substring(start, end);
        
        const newText = text.substring(0, start) + prefix + selection + suffix + text.substring(end);
        
        updateNote('content', newText);
        
        // Restore focus and selection
        setTimeout(() => {
            textarea.focus();
            textarea.setSelectionRange(start + prefix.length, end + prefix.length);
        }, 0);
    };

    const filteredNotes = notes.filter(n => 
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex h-full animate-fade-in relative bg-white dark:bg-[#0a0a0a]">
            
            {/* Sidebar List */}
            <div className={`
                absolute md:static inset-y-0 left-0 z-20 w-full md:w-80 bg-slate-50 dark:bg-[#0a0a0a] border-r border-slate-200 dark:border-white/5 flex flex-col transition-transform duration-300 transform
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="p-4 border-b border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/20 backdrop-blur-sm">
                    <div className="relative mb-3">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                        />
                    </div>
                    <button 
                        onClick={createNote}
                        className="w-full py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-sm font-bold flex items-center justify-center hover:opacity-90 transition-opacity shadow-sm"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Note
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
                    {filteredNotes.length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-xs">No notes found</div>
                    ) : (
                        filteredNotes.map(note => (
                            <div 
                                key={note.id}
                                onClick={() => {
                                    setActiveNoteId(note.id);
                                    if (window.innerWidth < 768) setSidebarOpen(false);
                                }}
                                className={`p-3 rounded-xl cursor-pointer group transition-all relative ${
                                    activeNoteId === note.id 
                                    ? 'bg-white dark:bg-white/10 shadow-sm border border-slate-200 dark:border-transparent' 
                                    : 'hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent'
                                }`}
                            >
                                <h4 className={`font-bold text-sm truncate mb-1 ${activeNoteId === note.id ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                                    {note.title || 'Untitled Note'}
                                </h4>
                                <p className="text-[10px] text-slate-500 truncate dark:text-slate-500">
                                    {note.content || 'No content'}
                                </p>
                                <span className="text-[9px] text-slate-400 mt-2 block">
                                    {new Date(note.date).toLocaleDateString()}
                                </span>
                                
                                <button 
                                    onClick={(e) => deleteNote(e, note.id)}
                                    className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
                                >
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#0a0a0a] relative z-10 w-full">
                {/* Mobile Toggle */}
                <button 
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="md:hidden absolute left-4 top-4 z-30 p-2 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-600 dark:text-slate-300"
                >
                    {sidebarOpen ? <X className="w-5 h-5" /> : <List className="w-5 h-5" />}
                </button>

                {activeNote ? (
                    <>
                        {/* Editor Header */}
                        <div className="p-4 md:p-6 border-b border-slate-100 dark:border-white/5 flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <input 
                                    type="text"
                                    value={activeNote.title}
                                    onChange={(e) => updateNote('title', e.target.value)}
                                    placeholder="Note Title"
                                    className="text-2xl md:text-3xl font-black bg-transparent border-none focus:outline-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-300 flex-1 min-w-0"
                                />
                                {isSaved ? (
                                    <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-neutral-500 tracking-wider flex items-center mt-2 animate-fade-in">
                                        <Check className="w-3 h-3 mr-1" /> Saved
                                    </span>
                                ) : (
                                    <span className="text-[10px] uppercase font-bold text-amber-500 tracking-wider flex items-center mt-2 animate-pulse">
                                        <Save className="w-3 h-3 mr-1" /> Saving...
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span>{new Date(activeNote.date).toLocaleString()}</span>
                                <span>•</span>
                                <span>{activeNote.content.split(/\s+/).filter(Boolean).length} words</span>
                            </div>
                        </div>

                        {/* Toolbar */}
                        <div className="px-4 md:px-6 py-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-1 overflow-x-auto no-scrollbar">
                            <button onClick={() => insertText('**', '**')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" title="Bold">
                                <Bold className="w-4 h-4" />
                            </button>
                            <button onClick={() => insertText('*', '*')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" title="Italic">
                                <Italic className="w-4 h-4" />
                            </button>
                            <div className="w-px h-4 bg-slate-200 dark:bg-white/10 mx-1"></div>
                            <button onClick={() => insertText('- ')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" title="Bullet List">
                                <List className="w-4 h-4" />
                            </button>
                            <button onClick={() => insertText('### ')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" title="Heading">
                                <Type className="w-4 h-4" />
                            </button>
                            <button onClick={() => insertText('```\n', '\n```')} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" title="Code Block">
                                <Code className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Main Textarea */}
                        <textarea 
                            id="note-editor"
                            value={activeNote.content}
                            onChange={(e) => updateNote('content', e.target.value)}
                            placeholder="Start writing..."
                            className="flex-1 w-full p-4 md:p-6 bg-transparent resize-none focus:outline-none text-base md:text-lg leading-relaxed text-slate-800 dark:text-slate-200 custom-scrollbar font-medium"
                        />
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <FileEdit className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a note or create a new one</p>
                    </div>
                )}
            </div>
        </div>
    );
};

const ScientificCalculator = () => {
    const [display, setDisplay] = useState('');
    const [result, setResult] = useState('');
    const [isRadians, setIsRadians] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Keyboard support
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const key = e.key;
            if (/[0-9]/.test(key)) handlePress(key);
            else if (['+', '-', '*', '/', '.', '(', ')', '^'].includes(key)) handlePress(key);
            else if (key === 'Enter') calculate();
            else if (key === 'Backspace') handlePress('DEL');
            else if (key === 'Escape') handlePress('AC');
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [display, isRadians]); // Dependencies needed for calculation context

    const handlePress = (val: string) => {
        if (hasError) {
            setHasError(false);
            setDisplay('');
            setResult('');
        }

        if (val === 'C') {
            setDisplay('');
            setResult('');
        } else if (val === 'DEL') {
            setDisplay(prev => prev.slice(0, -1));
        } else if (val === 'AC') {
            setDisplay('');
            setResult('');
        } else if (val === '=') {
            calculate();
        } else if (['sin', 'cos', 'tan', 'log', 'ln', 'sqrt'].includes(val)) {
            setDisplay(prev => prev + val + '(');
        } else if (val === 'Ans') {
            setDisplay(prev => prev + result);
        } else {
            setDisplay(prev => prev + val);
        }
    };

    const calculate = () => {
        if (!display.trim()) return;
        try {
            // Replace visual symbols with JS math
            let expr = display
                .replace(/×/g, '*')
                .replace(/÷/g, '/')
                .replace(/π/g, 'pi')
                .replace(/e/g, 'E')
                .replace(/\^/g, '**')
                .replace(/√/g, 'sqrt'); 

            // Function scope for evaluation
            const trigFactor = isRadians ? 1 : (Math.PI / 180);
            
            // Helper functions for the evaluation context
            const sin = (x: number) => Math.sin(x * trigFactor);
            const cos = (x: number) => Math.cos(x * trigFactor);
            const tan = (x: number) => Math.tan(x * trigFactor);
            const log = (x: number) => Math.log10(x);
            const ln = (x: number) => Math.log(x);
            const sqrt = Math.sqrt;
            const pi = Math.PI;
            const E = Math.E;

            // Use Function constructor to evaluate safely within this scope
            // eslint-disable-next-line no-new-func
            const evalFunc = new Function('sin', 'cos', 'tan', 'log', 'ln', 'sqrt', 'pi', 'E', `return ${expr}`);
            const res = evalFunc(sin, cos, tan, log, ln, sqrt, pi, E);

            if (!isFinite(res) || isNaN(res)) {
                throw new Error("Invalid");
            }

            // Format result: limit decimals if necessary, but keep precision
            let resStr = String(res);
            if (resStr.includes('.') && resStr.length > 10) {
                resStr = res.toFixed(8).replace(/\.?0+$/, '');
            }
            
            setResult(resStr);
        } catch (e) {
            setResult('Error');
            setHasError(true);
        }
    };

    const CalcButton = ({ label, type = 'num', onClick, span = 1, className = '' }: { label: React.ReactNode, type?: 'num' | 'op' | 'func' | 'action', onClick?: () => void, span?: number, className?: string }) => (
        <button
            onClick={onClick || (() => handlePress(typeof label === 'string' ? label : ''))}
            className={`
                relative overflow-hidden rounded-xl md:rounded-2xl font-bold transition-all active:scale-95 flex items-center justify-center shadow-sm hover:shadow-md select-none border border-slate-200 dark:border-white/5
                ${span === 2 ? 'col-span-2' : ''}
                ${type === 'num' ? 'bg-white dark:bg-neutral-800 text-slate-900 dark:text-white hover:bg-slate-50 dark:hover:bg-neutral-700 h-16 md:h-18 text-xl md:text-2xl' : ''}
                ${type === 'op' ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 h-16 md:h-18 text-2xl md:text-3xl' : ''}
                ${type === 'func' ? 'bg-slate-100 dark:bg-neutral-900 text-slate-600 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-800 text-xs md:text-sm h-12 md:h-14 font-medium uppercase tracking-wider' : ''}
                ${type === 'action' ? 'bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 h-16 md:h-18' : ''}
                ${label === '=' ? '!bg-gradient-to-r from-blue-600 to-indigo-600 !text-white !border-transparent !shadow-indigo-500/30 h-16 md:h-18 text-2xl' : ''}
                ${className}
            `}
        >
            {label}
        </button>
    );

    return (
        <div className="max-w-2xl mx-auto flex flex-col h-full animate-scale-in pb-4">
            
            {/* Display Screen */}
            <div className="bg-slate-100 dark:bg-black border border-slate-200 dark:border-white/10 rounded-[2rem] p-6 mb-6 text-right shadow-inner relative overflow-hidden flex flex-col justify-end min-h-[180px]">
                
                {/* Rad/Deg Toggle */}
                <div className="absolute top-4 left-4 z-10">
                    <button 
                        onClick={() => setIsRadians(!isRadians)}
                        className="text-[10px] font-bold px-3 py-1.5 rounded-lg bg-white dark:bg-white/10 text-slate-500 dark:text-slate-300 uppercase tracking-wider hover:bg-slate-200 dark:hover:bg-white/20 transition-colors shadow-sm"
                    >
                        {isRadians ? 'RAD' : 'DEG'}
                    </button>
                </div>

                {/* Input History */}
                <div className="text-lg md:text-xl font-medium text-slate-500 dark:text-slate-400 break-words tracking-wide mb-2 opacity-90 font-mono h-auto max-h-[80px] overflow-y-auto custom-scrollbar">
                    {display || '0'}
                </div>
                
                {/* Result Display - Horizontal Scroll */}
                <div className="overflow-x-auto no-scrollbar whitespace-nowrap">
                    <div className={`text-5xl md:text-7xl font-black tracking-tighter transition-colors ${hasError ? 'text-rose-500' : 'text-slate-900 dark:text-white'}`}>
                        {result || (display ? '...' : '0')}
                    </div>
                </div>
            </div>
            
            {/* Scientific Functions - Grid */}
            <div className="grid grid-cols-5 gap-2 md:gap-3 mb-4">
                <CalcButton label="(" type="func" />
                <CalcButton label=")" type="func" />
                <CalcButton label="sin" type="func" />
                <CalcButton label="cos" type="func" />
                <CalcButton label="tan" type="func" />
                
                <CalcButton label="^" type="func" />
                <CalcButton label="√" type="func" />
                <CalcButton label="log" type="func" />
                <CalcButton label="ln" type="func" />
                <CalcButton label="π" type="func" />
                
                <CalcButton label="Ans" type="func" />
                <CalcButton label="e" type="func" />
                {/* Spacer / Clear Button Area if needed */}
                <div className="col-span-3"></div> 
            </div>

            {/* Separator */}
            <div className="h-px bg-slate-200 dark:bg-white/5 w-full mb-6"></div>

            {/* Main Keypad */}
            <div className="grid grid-cols-4 gap-3 md:gap-4 flex-1">
                <CalcButton label="AC" type="action" onClick={() => handlePress('AC')} className="!text-rose-600 font-black" />
                <CalcButton label={<Delete className="w-6 h-6" />} type="action" onClick={() => handlePress('DEL')} />
                <CalcButton label="%" type="op" onClick={() => handlePress('/100')} />
                <CalcButton label="÷" type="op" />

                <CalcButton label="7" />
                <CalcButton label="8" />
                <CalcButton label="9" />
                <CalcButton label="×" type="op" />

                <CalcButton label="4" />
                <CalcButton label="5" />
                <CalcButton label="6" />
                <CalcButton label="-" type="op" />

                <CalcButton label="1" />
                <CalcButton label="2" />
                <CalcButton label="3" />
                <CalcButton label="+" type="op" />

                <CalcButton label="0" span={2} className="!justify-start pl-8" />
                <CalcButton label="." />
                <CalcButton label="=" onClick={calculate} />
            </div>
            
            <p className="text-center text-[10px] text-slate-400 mt-4 md:hidden">
                Tip: Use landscape mode for easier typing
            </p>
        </div>
    );
};

export default StudyToolsModal;