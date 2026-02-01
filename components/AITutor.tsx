
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, AlertCircle, Brain, BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, Copy, RefreshCcw, Layers, ArrowLeft, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';
import { startChatSession, sendMessageToGemini, generateQuiz, generateFlashcards } from '../services/geminiService';
import { ChatMessage, Quiz } from '../types';
import { Chat, GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface AITutorProps {
  departmentName: string;
  semesterName: string;
  subjectName?: string;
}

interface Flashcard {
    front: string;
    back: string;
}

const AITutor: React.FC<AITutorProps> = ({ departmentName, semesterName, subjectName }) => {
  // Modes: 'chat' | 'quiz' | 'flashcards'
  const [mode, setMode] = useState<'chat' | 'quiz' | 'flashcards'>('chat');
  
  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isThinkingMode, setIsThinkingMode] = useState(false);
  
  // Quiz State
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false);
  const [quizDifficulty, setQuizDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

  // Flashcards State
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFlashcardsLoading, setIsFlashcardsLoading] = useState(false);

  const chatSessionRef = useRef<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initialize chat session on mount or dept change with specific context
    chatSessionRef.current = startChatSession(departmentName, semesterName, subjectName, isThinkingMode);
    
    // Construct welcome message based on context
    const contextText = subjectName 
      ? `**${subjectName}** in **${departmentName}**`
      : `**${departmentName} (${semesterName})**`;

    const modeText = isThinkingMode ? " I'm in **Deep Thinking** mode for complex queries." : "";
    const welcomeText = `Hello! I'm your AI Tutor for ${contextText}.${modeText} How can I help you study today? Ask me about concepts, formulas, or study plans!`;

    // Reset conversation
    setMessages([{
        id: 'welcome',
        role: 'model',
        text: welcomeText,
    }]);
    
    // Reset other modes
    setQuiz(null);
    setFlashcards([]);
    setMode('chat');
  }, [departmentName, semesterName, subjectName, isThinkingMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (text: string = inputText) => {
    if (!text.trim() || !chatSessionRef.current) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: text,
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputText('');
    setIsLoading(true);
    setError(null);

    const modelMsgId = (Date.now() + 1).toString();
    // Placeholder for stream
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isThinking: true }]);

    try {
      const streamResult = await sendMessageToGemini(chatSessionRef.current, newUserMessage.text);
      
      let fullText = '';
      let isFirstChunk = true;
      
      for await (const chunk of streamResult) {
        const c = chunk as GenerateContentResponse;
        const textChunk = c.text;
        if (textChunk) {
          fullText += textChunk;
          
          if (isFirstChunk) {
             setMessages(prev => 
                prev.map(msg => 
                    msg.id === modelMsgId 
                        ? { ...msg, text: fullText, isThinking: false } 
                        : msg
                )
             );
             isFirstChunk = false;
          } else {
             setMessages(prev => 
                prev.map(msg => 
                    msg.id === modelMsgId 
                        ? { ...msg, text: fullText } 
                        : msg
                )
             );
          }
        }
      }
    } catch (err: any) {
      console.error(err);
      let errorMsg = "Failed to get a response. Please check your connection.";
      setError(errorMsg);
      setMessages(prev => prev.filter(msg => msg.id !== modelMsgId)); // Remove failed placeholder
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg && lastUserMsg.id !== 'welcome') {
          handleSendMessage(lastUserMsg.text);
          setMessages(prev => prev.filter(m => m.id !== lastUserMsg.id));
      }
      setError(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- QUIZ FUNCTIONS ---

  const startQuiz = async () => {
    if (!subjectName) return;
    setMode('quiz');
    setIsQuizLoading(true);
    setError(null);
    
    try {
      const generatedQuiz = await generateQuiz(subjectName, quizDifficulty);
      setQuiz(generatedQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setQuizFinished(false);
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      setMode('chat');
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null || !quiz) return; 
    setSelectedAnswer(optionIndex);
    if (optionIndex === quiz.questions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    if (!quiz) return;
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  // --- FLASHCARD FUNCTIONS ---

  const startFlashcards = async () => {
      if (!subjectName) return;
      setMode('flashcards');
      setIsFlashcardsLoading(true);
      setError(null);

      try {
          const data = await generateFlashcards(subjectName);
          if (data && data.flashcards) {
              setFlashcards(data.flashcards);
              setCurrentCardIndex(0);
              setIsFlipped(false);
          } else {
              throw new Error("Invalid format");
          }
      } catch (err) {
          setError("Failed to generate flashcards.");
          setMode('chat');
      } finally {
          setIsFlashcardsLoading(false);
      }
  };

  const nextCard = () => {
      if (currentCardIndex < flashcards.length - 1) {
          setIsFlipped(false);
          setTimeout(() => setCurrentCardIndex(prev => prev + 1), 150);
      }
  };

  const prevCard = () => {
      if (currentCardIndex > 0) {
          setIsFlipped(false);
          setTimeout(() => setCurrentCardIndex(prev => prev - 1), 150);
      }
  };

  // --- CUSTOM RENDERERS ---
  const MarkdownComponents = {
      h1: ({node, ...props}: any) => <h1 className="text-2xl font-black mb-4 mt-6 border-b border-slate-200 dark:border-white/10 pb-2" {...props} />,
      h2: ({node, ...props}: any) => <h2 className="text-xl font-bold mb-3 mt-5 text-sky-600 dark:text-sky-400" {...props} />,
      h3: ({node, ...props}: any) => <h3 className="text-lg font-bold mb-2 mt-4 text-indigo-600 dark:text-indigo-400" {...props} />,
      p: ({node, ...props}: any) => <p className="mb-4 leading-relaxed" {...props} />,
      ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-2 marker:text-sky-500" {...props} />,
      ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-2 marker:text-sky-500 font-medium" {...props} />,
      blockquote: ({node, ...props}: any) => (
          <blockquote className="border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-900/20 pl-4 py-3 my-4 rounded-r-xl italic text-slate-700 dark:text-slate-300" {...props} />
      ),
      code: ({node, inline, className, children, ...props}: any) => {
        return inline ? (
            <code className="bg-slate-200 dark:bg-white/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-mono text-xs font-bold" {...props}>
                {children}
            </code>
        ) : (
            <div className="relative group my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 bg-[#1e1e1e]">
                <div className="flex items-center px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
                    <div className="flex gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-red-500"/><div className="w-2.5 h-2.5 rounded-full bg-yellow-500"/><div className="w-2.5 h-2.5 rounded-full bg-green-500"/></div>
                </div>
                <pre className="p-4 overflow-x-auto text-xs font-mono text-gray-300 custom-scrollbar">
                    <code className={className} {...props}>{children}</code>
                </pre>
            </div>
        );
      },
      table: ({node, ...props}: any) => (
          <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#151515]">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10 text-sm" {...props} />
          </div>
      ),
      th: ({node, ...props}: any) => <th className="px-6 py-4 text-left font-bold bg-slate-50 dark:bg-white/5 uppercase text-xs" {...props} />,
      td: ({node, ...props}: any) => <td className="px-6 py-4 whitespace-pre-wrap border-t border-slate-100 dark:border-white/5" {...props} />,
  };

  return (
    <div className="flex flex-col h-[65dvh] md:h-[600px] min-h-[400px] glass-panel rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-200 dark:border-white/10 transition-all duration-300 bg-white dark:bg-black">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/90 p-3 md:p-5 flex flex-col md:flex-row items-center justify-between border-b border-black/5 dark:border-white/10 backdrop-blur-md gap-3 md:gap-0 z-20 shrink-0">
        <div className="flex items-center space-x-3 w-full md:w-auto">
          {mode !== 'chat' && (
              <button onClick={() => setMode('chat')} className="p-2 rounded-xl bg-slate-100 dark:bg-white/10 hover:bg-slate-200 mr-2">
                  <ArrowLeft className="w-4 h-4" />
              </button>
          )}
          <div className="glass-button p-2 md:p-2.5 rounded-2xl bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-none">
            <Bot className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg text-slate-900 dark:text-white">
                {mode === 'quiz' ? 'Knowledge Quiz' : mode === 'flashcards' ? 'Flashcards' : 'PolyTutor AI'}
            </h3>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-neutral-400 flex items-center font-medium">
              <Sparkles className="w-3 h-3 mr-1 text-sky-500" /> Powered by Gemini 2.5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto overflow-x-auto no-scrollbar max-w-full">
            {subjectName && mode === 'chat' && (
                <>
                    <button onClick={startFlashcards} className="px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-[10px] md:text-xs font-bold flex items-center gap-1.5 hover:scale-105 transition-all">
                        <Layers className="w-3.5 h-3.5" /> Flashcards
                    </button>
                    <div className="flex items-center bg-slate-100 dark:bg-white/5 rounded-xl p-0.5">
                        <select 
                            value={quizDifficulty}
                            onChange={(e) => setQuizDifficulty(e.target.value as any)}
                            className="bg-transparent text-[10px] md:text-xs font-bold px-2 py-1 outline-none text-slate-600 dark:text-slate-300 cursor-pointer"
                        >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                        </select>
                        <button onClick={startQuiz} className="px-3 py-1.5 rounded-lg bg-sky-500 text-white text-[10px] md:text-xs font-bold flex items-center gap-1.5 hover:bg-sky-600 transition-colors">
                            <BookOpen className="w-3.5 h-3.5" /> Quiz
                        </button>
                    </div>
                </>
            )}
            
            {mode === 'chat' && (
                <button onClick={() => setIsThinkingMode(!isThinkingMode)} className={`px-3 py-1.5 rounded-xl transition-all border flex items-center gap-2 text-[10px] md:text-xs font-bold ${isThinkingMode ? 'bg-violet-600 border-violet-500 text-white shadow-lg' : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-500 dark:text-neutral-400'}`}>
                    <Brain className={`w-3.5 h-3.5 ${isThinkingMode ? 'animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">Deep Think</span>
                </button>
            )}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      
      {mode === 'chat' && (
          <>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar bg-slate-50 dark:bg-[#050505] p-4 md:p-6 space-y-6 scroll-smooth">
                {messages.map((msg) => {
                    // Extract suggestions if present
                    const [content, suggestionsBlock] = msg.text.split('---SUGGESTIONS---');
                    const suggestions = suggestionsBlock ? suggestionsBlock.split('|').map(s => s.trim()).filter(s => s) : [];

                    return (
                        <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`max-w-[95%] md:max-w-[90%] rounded-3xl p-5 shadow-sm border transition-all ${msg.role === 'user' ? 'bg-slate-900 dark:bg-white text-white dark:text-black rounded-br-none' : 'bg-white dark:bg-[#111] text-slate-800 dark:text-neutral-200 border-slate-200 dark:border-white/10 rounded-bl-none'}`}>
                                {msg.isThinking ? (
                                    <div className="flex items-center gap-3 opacity-60 py-1">
                                        <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                                        <span className="text-xs font-bold uppercase tracking-wider">Thinking...</span>
                                    </div>
                                ) : (
                                    <div className={`prose prose-sm max-w-none text-sm leading-7 ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                                        <ReactMarkdown components={MarkdownComponents as any}>{content.trim()}</ReactMarkdown>
                                    </div>
                                )}
                            </div>
                            
                            {/* Follow-up Chips */}
                            {!msg.isThinking && suggestions.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2 animate-fade-in">
                                    {suggestions.map((sug, idx) => (
                                        <button 
                                            key={idx} 
                                            onClick={() => handleSendMessage(sug)}
                                            className="px-4 py-2 rounded-xl bg-white dark:bg-[#1a1a1a] border border-sky-200 dark:border-sky-900/30 text-xs font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 hover:-translate-y-0.5 transition-all shadow-sm flex items-center gap-2"
                                        >
                                            <HelpCircle className="w-3 h-3 opacity-50" /> {sug}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
                {error && (
                    <div className="flex justify-center w-full px-4 animate-fade-in">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium">
                            <AlertCircle className="w-4 h-4" /> {error}
                            <button onClick={handleRetry} className="ml-auto underline font-bold">Retry</button>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <div className="p-3 md:p-4 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-t border-black/5 dark:border-white/5 z-20 shrink-0">
                <div className="relative flex gap-2">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={isThinkingMode ? "Ask a complex question..." : "Ask your doubt..."}
                        className="flex-1 p-3 md:p-4 pr-12 rounded-2xl bg-slate-100 dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-sky-500/50 text-slate-900 dark:text-white placeholder-slate-400 shadow-inner text-sm md:text-base"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSendMessage()} disabled={isLoading || !inputText.trim()} className="absolute right-2 top-2 bottom-2 aspect-square rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black flex items-center justify-center hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100">
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
          </>
      )}

      {mode === 'quiz' && (
          // Fixed scrolling: overflow-y-auto ensures the content scrolls within this container
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar bg-slate-50 dark:bg-[#050505] p-4 flex flex-col items-center">
             {isQuizLoading ? (
                 <div className="text-center my-auto">
                     <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-slate-500 font-bold">Generating {quizDifficulty} quiz...</p>
                 </div>
             ) : quiz ? (
                 <div className="w-full max-w-2xl glass-panel p-6 md:p-8 rounded-[2rem] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 shadow-xl my-4">
                     {!quizFinished ? (
                         <>
                             <div className="flex justify-between items-center mb-6">
                                 <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Q{currentQuestionIndex + 1}/{quiz.questions.length}</span>
                                 <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full text-xs font-bold">Score: {score}</span>
                             </div>
                             <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-6">{quiz.questions[currentQuestionIndex].question}</h3>
                             <div className="space-y-3">
                                 {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                                     const isSelected = selectedAnswer === idx;
                                     const isCorrect = idx === quiz.questions[currentQuestionIndex].correctAnswer;
                                     const showResult = selectedAnswer !== null;
                                     let btnClass = "border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5";
                                     if (showResult) {
                                         if (isCorrect) btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                                         else if (isSelected) btnClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
                                         else btnClass = "opacity-50";
                                     }
                                     return (
                                         <button key={idx} onClick={() => handleQuizAnswer(idx)} disabled={showResult} className={`w-full p-4 rounded-xl border-2 text-left transition-all text-sm md:text-base font-medium flex justify-between items-center ${btnClass}`}>
                                             {option}
                                             {showResult && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                                             {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                                         </button>
                                     );
                                 })}
                             </div>
                             {selectedAnswer !== null && (
                                 <div className="mt-6 animate-fade-in pb-2">
                                     <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-neutral-400 mb-4">
                                         <span className="font-bold text-slate-900 dark:text-white block mb-1">Explanation:</span>
                                         {quiz.questions[currentQuestionIndex].explanation}
                                     </div>
                                     <button onClick={nextQuestion} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-lg">
                                         {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                     </button>
                                 </div>
                             )}
                         </>
                     ) : (
                         <div className="text-center py-10">
                             <Sparkles className="w-16 h-16 text-amber-400 mx-auto mb-6" />
                             <h3 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Quiz Complete!</h3>
                             <p className="text-slate-500 mb-8">Score: {score}/{quiz.questions.length}</p>
                             <button onClick={() => setMode('chat')} className="w-full py-3 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold">Return to Chat</button>
                         </div>
                     )}
                 </div>
             ) : null}
          </div>
      )}

      {mode === 'flashcards' && (
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain custom-scrollbar bg-slate-50 dark:bg-[#050505] p-4 relative flex flex-col items-center justify-center">
              {/* Background decorative elements */}
              <div className="absolute top-10 left-10 text-9xl text-slate-200 dark:text-white/5 font-black select-none pointer-events-none">A</div>
              <div className="absolute bottom-10 right-10 text-9xl text-slate-200 dark:text-white/5 font-black select-none pointer-events-none">Z</div>

              {isFlashcardsLoading ? (
                  <div className="text-center">
                      <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                      <p className="text-slate-500 font-bold">Generating cards...</p>
                  </div>
              ) : flashcards.length > 0 ? (
                  <div className="w-full max-w-lg perspective-1000 my-auto">
                      <div 
                        className={`relative w-full aspect-[4/3] cursor-pointer transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-y-180' : ''}`}
                        onClick={() => setIsFlipped(!isFlipped)}
                      >
                          {/* Front */}
                          <div className="absolute inset-0 backface-hidden glass-panel bg-white dark:bg-[#111] border-2 border-violet-100 dark:border-violet-900/30 rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center hover:border-violet-300 transition-colors">
                              <span className="text-xs font-bold text-violet-500 uppercase tracking-widest mb-4">Term</span>
                              <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white">{flashcards[currentCardIndex].front}</h3>
                              <p className="absolute bottom-6 text-xs text-slate-400 font-medium animate-pulse">Click to flip</p>
                          </div>

                          {/* Back */}
                          <div className="absolute inset-0 backface-hidden rotate-y-180 glass-panel bg-gradient-to-br from-violet-500 to-indigo-600 text-white rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center border-none">
                              <span className="text-xs font-bold text-white/60 uppercase tracking-widest mb-4">Definition</span>
                              <p className="text-lg md:text-xl font-medium leading-relaxed">{flashcards[currentCardIndex].back}</p>
                          </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center justify-between mt-8 px-4">
                          <button onClick={prevCard} disabled={currentCardIndex === 0} className="p-3 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 disabled:opacity-50 transition-all shadow-md">
                              <ChevronLeft className="w-6 h-6 text-slate-700 dark:text-white" />
                          </button>
                          <span className="font-bold text-slate-500 dark:text-neutral-400 font-mono">
                              {currentCardIndex + 1} / {flashcards.length}
                          </span>
                          <button onClick={nextCard} disabled={currentCardIndex === flashcards.length - 1} className="p-3 rounded-full bg-white dark:bg-white/10 hover:bg-slate-100 disabled:opacity-50 transition-all shadow-md">
                              <ChevronRight className="w-6 h-6 text-slate-700 dark:text-white" />
                          </button>
                      </div>
                  </div>
              ) : null}
          </div>
      )}
    </div>
  );
};

export default AITutor;
