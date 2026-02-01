
import React, { useState, useEffect, useRef } from 'react';
import { X, Calculator, Timer, FileEdit, Play, Pause, RotateCcw, Plus, Trash2, Save, Check, ListTodo, Eraser, Search, Bold, Italic, List, Code, Quote, Heading1, Heading2, Menu, Copy, ChevronLeft, ChevronRight } from 'lucide-react';

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
            <div className="h-full flex flex-col relative z-10">
                {activeTab === 'timer' && (
                    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar overscroll-contain">
                        <PomodoroTimer />
                    </div>
                )}
                {activeTab === 'tasks' && (
                    <div className="h-full overflow-y-auto p-4 md:p-8 custom-scrollbar overscroll-contain">
                        <TaskManager />
                    </div>
                )}
                {activeTab === 'notes' && (
                    <div className="h-full overflow-hidden p-4 md:p-8">
                        <Notebook />
                    </div>
                )}
                {activeTab === 'calc' && (
                    <div className="h-full bg-[#1a1c20] flex flex-col items-center justify-center relative p-4 overscroll-contain overflow-y-auto">
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
            new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(e => console.log(e));
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

    return (
        <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto py-10">
            <div className="flex p-1.5 bg-white dark:bg-white/5 rounded-2xl shadow-sm border border-slate-200 dark:border-white/5 mb-12">
                {['work', 'short', 'long'].map((m) => (
                    <button
                        key={m}
                        onClick={() => setTimerMode(m as any)}
                        className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase transition-all ${mode === m ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        {m === 'work' ? 'Focus' : m === 'short' ? 'Short Break' : 'Long Break'}
                    </button>
                ))}
            </div>
            
            <div className="relative mb-12 group cursor-pointer" onClick={() => setIsActive(!isActive)}>
                {/* Progress Ring */}
                <svg className="w-80 h-80 transform -rotate-90">
                    <circle
                        cx="160"
                        cy="160"
                        r="150"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-200 dark:text-white/5"
                    />
                    <circle
                        cx="160"
                        cy="160"
                        r="150"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={2 * Math.PI * 150}
                        strokeDashoffset={2 * Math.PI * 150 * (1 - progress / 100)}
                        className={`text-rose-500 transition-all duration-1000 ease-linear ${isActive ? 'animate-pulse' : ''}`}
                        strokeLinecap="round"
                    />
                </svg>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900 dark:text-white">
                    <span className="text-7xl font-black tracking-tighter tabular-nums">
                        {formatTime(timeLeft)}
                    </span>
                    <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">
                        {isActive ? 'Running' : 'Paused'}
                    </span>
                </div>
            </div>

            <div className="flex gap-4">
                <button 
                    onClick={() => setIsActive(!isActive)}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-900 dark:bg-white text-white dark:text-black shadow-xl hover:scale-110 transition-all"
                >
                    {isActive ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current ml-1" />}
                </button>
                <button 
                    onClick={() => { setIsActive(false); setTimeLeft(totalTime); }}
                    className="w-16 h-16 rounded-full flex items-center justify-center bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20 transition-all"
                >
                    <RotateCcw className="w-6 h-6" />
                </button>
            </div>
        </div>
    );
};

const TaskManager = () => {
    const [tasks, setTasks] = useState<{id: number, text: string, completed: boolean}[]>([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        const saved = localStorage.getItem('study_tasks');
        if (saved) {
            try { setTasks(JSON.parse(saved)); } catch (e) {}
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('study_tasks', JSON.stringify(tasks));
    }, [tasks]);

    const addTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;
        setTasks([{ id: Date.now(), text: input, completed: false }, ...tasks]);
        setInput('');
    };

    const toggleTask = (id: number) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: number) => {
        setTasks(tasks.filter(t => t.id !== id));
    };

    return (
        <div className="max-w-2xl mx-auto h-full flex flex-col">
            <div className="mb-8 text-center">
                <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Today's Goals</h3>
                <p className="text-slate-500">Stay organized and productive.</p>
            </div>

            <form onSubmit={addTask} className="relative mb-8">
                <input 
                    type="text" 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Add a new task..."
                    className="w-full pl-6 pr-14 py-4 rounded-2xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-slate-900 dark:text-white placeholder-slate-400"
                />
                <button 
                    type="submit"
                    className="absolute right-2 top-2 p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors shadow-md"
                >
                    <Plus className="w-5 h-5" />
                </button>
            </form>

            <div className="space-y-3 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {tasks.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <ListTodo className="w-12 h-12 mx-auto mb-3 text-slate-400" />
                        <p className="text-slate-500">No tasks yet. Add one to get started!</p>
                    </div>
                )}
                {tasks.map(task => (
                    <div 
                        key={task.id} 
                        className={`group flex items-center p-4 rounded-2xl border transition-all duration-300 ${task.completed ? 'bg-slate-50/50 dark:bg-white/5 border-transparent opacity-60' : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-sm hover:shadow-md'}`}
                    >
                        <button 
                            onClick={() => toggleTask(task.id)}
                            className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-4 transition-colors ${task.completed ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300 dark:border-white/30 hover:border-emerald-500'}`}
                        >
                            {task.completed && <Check className="w-3.5 h-3.5" />}
                        </button>
                        <span className={`flex-1 font-medium text-lg ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                            {task.text}
                        </span>
                        <button 
                            onClick={() => deleteTask(task.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

const Notebook = () => {
    const [note, setNote] = useState('');
    const [savedTime, setSavedTime] = useState<string | null>(null);

    useEffect(() => {
        const saved = localStorage.getItem('study_notes');
        if (saved) setNote(saved);
    }, []);

    const handleSave = () => {
        localStorage.setItem('study_notes', note);
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setSavedTime(`Saved at ${now}`);
        setTimeout(() => setSavedTime(null), 2000);
    };

    // Auto-save debounced
    useEffect(() => {
        const timeout = setTimeout(() => {
            localStorage.setItem('study_notes', note);
        }, 1000);
        return () => clearTimeout(timeout);
    }, [note]);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(note);
        setSavedTime('Copied to clipboard!');
        setTimeout(() => setSavedTime(null), 2000);
    };

    return (
        <div className="h-full flex flex-col bg-white dark:bg-[#111] rounded-[2rem] shadow-xl border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-white/5 flex justify-between items-center bg-slate-50/50 dark:bg-white/5">
                <div className="flex items-center space-x-2 text-amber-600 dark:text-amber-500">
                    <FileEdit className="w-5 h-5" />
                    <span className="font-bold">Scratchpad</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium mr-2 transition-opacity duration-300 opacity-100">
                        {savedTime || "Auto-saving..."}
                    </span>
                    <button onClick={copyToClipboard} className="p-2 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg text-slate-500 transition-colors" title="Copy">
                        <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={() => setNote('')} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-500 hover:text-red-500 rounded-lg transition-colors" title="Clear">
                        <Eraser className="w-4 h-4" />
                    </button>
                </div>
            </div>
            <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Type your notes here..."
                className="flex-1 w-full p-6 bg-transparent resize-none focus:outline-none text-slate-700 dark:text-slate-200 text-base leading-relaxed custom-scrollbar font-mono"
            />
        </div>
    );
};

const ScientificCalculator = () => {
    const [display, setDisplay] = useState('');
    const [result, setResult] = useState('');
    const [history, setHistory] = useState<string[]>([]);

    const handleBtn = (val: string) => {
        if (val === 'AC') {
            setDisplay('');
            setResult('');
        } else if (val === 'DEL') {
            setDisplay(display.slice(0, -1));
        } else if (val === '=') {
            try {
                // Safe eval alternative or careful usage
                // Replace math functions for JS eval
                let evalString = display
                    .replace(/sin/g, 'Math.sin')
                    .replace(/cos/g, 'Math.cos')
                    .replace(/tan/g, 'Math.tan')
                    .replace(/log/g, 'Math.log10')
                    .replace(/ln/g, 'Math.log')
                    .replace(/π/g, 'Math.PI')
                    .replace(/√/g, 'Math.sqrt')
                    .replace(/\^/g, '**');
                
                // eslint-disable-next-line no-eval
                const res = eval(evalString);
                setResult(res.toString());
                setHistory(prev => [display + ' = ' + res, ...prev].slice(0, 5));
            } catch (e) {
                setResult('Error');
            }
        } else {
            setDisplay(prev => prev + val);
        }
    };

    const buttons = [
        ['7', '8', '9', 'DEL', 'AC'],
        ['4', '5', '6', '*', '/'],
        ['1', '2', '3', '+', '-'],
        ['0', '.', 'π', 'Ans', '='],
        ['sin', 'cos', 'tan', '(', ')'],
        ['log', 'ln', '√', '^', 'e']
    ];

    return (
        <div className="w-full max-w-sm bg-[#222] rounded-3xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)] border border-[#333]">
            {/* Screen */}
            <div className="bg-[#9ea792] p-6 h-32 flex flex-col justify-between shadow-inner relative overflow-hidden">
                <div className="text-right font-mono text-lg text-slate-800 tracking-widest break-all h-12 overflow-hidden">{display}</div>
                <div className="text-right font-mono text-3xl font-bold text-black tracking-wider">{result}</div>
                {/* Solar Panel Aesthetic */}
                <div className="absolute top-2 left-2 flex gap-0.5">
                    {[1,2,3,4].map(i => <div key={i} className="w-3 h-6 bg-[#463f3a] opacity-80 border-r border-[#5c544e]"></div>)}
                </div>
            </div>

            {/* Keypad */}
            <div className="p-4 grid grid-rows-6 gap-2 bg-[#222]">
                <div className="col-span-5 flex justify-between px-2 mb-2">
                    <span className="text-[10px] text-white/40 font-bold uppercase">PolyCalc FX-991</span>
                    <span className="text-[10px] text-sky-500 font-bold">DEG</span>
                </div>
                
                {buttons.map((row, rIdx) => (
                    <div key={rIdx} className="grid grid-cols-5 gap-2">
                        {row.map((btn) => {
                            let bg = "bg-[#333] text-white";
                            if (['DEL', 'AC'].includes(btn)) bg = "bg-rose-900 text-rose-100";
                            if (['='].includes(btn)) bg = "bg-sky-700 text-white";
                            if (['+', '-', '*', '/', '(', ')', '^'].includes(btn)) bg = "bg-[#444] text-sky-300";
                            
                            return (
                                <button
                                    key={btn}
                                    onClick={() => handleBtn(btn === 'Ans' ? result : btn)}
                                    className={`${bg} rounded-md py-3 text-sm font-bold shadow-[0_3px_0_rgba(0,0,0,0.3)] active:shadow-none active:translate-y-[2px] transition-all hover:brightness-110`}
                                >
                                    {btn}
                                </button>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default StudyToolsModal;
