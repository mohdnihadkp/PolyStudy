import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, Sparkles, AlertCircle, Brain, BookOpen, CheckCircle2, XCircle, ArrowRight, RotateCcw, Copy, Check, RefreshCcw } from 'lucide-react';
import { startChatSession, sendMessageToGemini, generateQuiz } from '../services/geminiService';
import { ChatMessage, Quiz } from '../types';
import { Chat, GenerateContentResponse } from '@google/genai';
import ReactMarkdown from 'react-markdown';

interface AITutorProps {
  departmentName: string;
  semesterName: string;
  subjectName?: string;
}

const AITutor: React.FC<AITutorProps> = ({ departmentName, semesterName, subjectName }) => {
  // Modes: 'chat' | 'quiz'
  const [mode, setMode] = useState<'chat' | 'quiz'>('chat');
  
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
    
    // Reset quiz when subject changes
    setQuiz(null);
    setMode('chat');
  }, [departmentName, semesterName, subjectName, isThinkingMode]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || !chatSessionRef.current) return;

    const userMsgId = Date.now().toString();
    const newUserMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      text: inputText,
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
        const text = c.text;
        if (text) {
          fullText += text;
          
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
      if (err.message) {
          if (err.message.includes('429')) errorMsg = "Usage quota exceeded. Please try again later.";
          else if (err.message.includes('403')) errorMsg = "API Key error. Please check your configuration.";
          else if (err.message.includes('503')) errorMsg = "Service temporarily unavailable. Please retry.";
      }
      
      setError(errorMsg);
      setMessages(prev => prev.filter(msg => msg.id !== modelMsgId)); // Remove failed placeholder
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
      // If there is a last user message, populate input with it
      const lastUserMsg = [...messages].reverse().find(m => m.role === 'user');
      if (lastUserMsg && lastUserMsg.id !== 'welcome') {
          setInputText(lastUserMsg.text);
          // Optional: Remove the last failed user message to avoid duplication in UI
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
      const generatedQuiz = await generateQuiz(subjectName);
      setQuiz(generatedQuiz);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setQuizFinished(false);
    } catch (err) {
      setError("Failed to generate quiz. Please try again.");
      setMode('chat'); // Go back to chat on error
    } finally {
      setIsQuizLoading(false);
    }
  };

  const handleQuizAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null || !quiz) return; // Prevent changing answer
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

  const retryQuiz = () => {
    startQuiz();
  };

  // --- CUSTOM MARKDOWN COMPONENTS ---
  const MarkdownComponents = {
      h1: ({node, ...props}: any) => <h1 className="text-2xl md:text-3xl font-black mb-4 mt-6 text-slate-900 dark:text-white border-b border-slate-200 dark:border-white/10 pb-2" {...props} />,
      h2: ({node, ...props}: any) => <h2 className="text-xl md:text-2xl font-bold mb-3 mt-5 text-slate-800 dark:text-sky-400" {...props} />,
      h3: ({node, ...props}: any) => <h3 className="text-lg md:text-xl font-bold mb-2 mt-4 text-slate-700 dark:text-indigo-400" {...props} />,
      p: ({node, ...props}: any) => <p className="mb-4 leading-relaxed text-slate-700 dark:text-slate-300 text-sm md:text-base" {...props} />,
      ul: ({node, ...props}: any) => <ul className="list-disc pl-5 mb-4 space-y-2 text-slate-700 dark:text-slate-300 marker:text-sky-500" {...props} />,
      ol: ({node, ...props}: any) => <ol className="list-decimal pl-5 mb-4 space-y-2 text-slate-700 dark:text-slate-300 marker:text-sky-500 font-medium" {...props} />,
      li: ({node, ...props}: any) => <li className="pl-1" {...props} />,
      blockquote: ({node, ...props}: any) => (
          <blockquote className="border-l-4 border-sky-500 bg-sky-50 dark:bg-sky-900/10 pl-4 py-3 my-4 rounded-r-xl italic text-slate-600 dark:text-slate-300 shadow-sm" {...props} />
      ),
      code: ({node, inline, className, children, ...props}: any) => {
        return inline ? (
            <code className="bg-slate-200 dark:bg-white/10 text-rose-600 dark:text-rose-400 px-1.5 py-0.5 rounded font-mono text-xs md:text-sm font-bold border border-slate-300 dark:border-white/5" {...props}>
                {children}
            </code>
        ) : (
            <div className="relative group my-6 rounded-xl overflow-hidden border border-slate-200 dark:border-white/10 shadow-lg bg-[#1e1e1e]">
                <div className="flex items-center justify-between px-4 py-2 bg-[#2d2d2d] border-b border-white/5">
                    <div className="flex gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-yellow-500"></div>
                        <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">Code</span>
                </div>
                <pre className="p-4 overflow-x-auto text-xs md:text-sm font-mono text-gray-300 leading-relaxed custom-scrollbar">
                    <code className={className} {...props}>{children}</code>
                </pre>
            </div>
        );
      },
      table: ({node, ...props}: any) => (
          <div className="overflow-x-auto my-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm bg-white dark:bg-[#151515]">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-white/10 text-sm" {...props} />
          </div>
      ),
      thead: ({node, ...props}: any) => <thead className="bg-slate-50 dark:bg-white/5" {...props} />,
      th: ({node, ...props}: any) => <th className="px-6 py-4 text-left font-bold text-slate-700 dark:text-white uppercase tracking-wider text-xs border-b border-slate-200 dark:border-white/10" {...props} />,
      tbody: ({node, ...props}: any) => <tbody className="divide-y divide-slate-200 dark:divide-white/5" {...props} />,
      tr: ({node, ...props}: any) => <tr className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors group" {...props} />,
      td: ({node, ...props}: any) => <td className="px-6 py-4 whitespace-pre-wrap text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" {...props} />,
      a: ({node, ...props}: any) => <a className="text-sky-500 hover:text-sky-600 underline decoration-2 decoration-sky-200 dark:decoration-sky-800 underline-offset-2 font-medium transition-colors" target="_blank" rel="noopener noreferrer" {...props} />,
      strong: ({node, ...props}: any) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
      hr: ({node, ...props}: any) => <hr className="my-6 border-slate-200 dark:border-white/10" {...props} />,
  };

  return (
    <div className="flex flex-col h-[65dvh] md:h-[600px] min-h-[400px] glass-panel rounded-[2rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden relative border border-slate-200 dark:border-white/10 transition-all duration-300 bg-white dark:bg-black">
      
      {/* Header */}
      <div className="bg-white/80 dark:bg-neutral-900/90 p-3 md:p-5 text-black dark:text-white flex flex-col md:flex-row items-start md:items-center justify-between border-b border-black/5 dark:border-white/10 backdrop-blur-md gap-3 md:gap-0 relative z-20">
        <div className="flex items-center space-x-3 md:space-x-4">
          <div className="glass-button p-2 md:p-2.5 rounded-2xl shadow-inner bg-sky-50 dark:bg-sky-900/20 text-sky-600 dark:text-sky-400 border-none">
            <Bot className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base md:text-lg tracking-wide text-slate-900 dark:text-white">
                {mode === 'quiz' ? 'Knowledge Check' : 'PolyTutor AI'}
            </h3>
            <p className="text-[10px] md:text-xs text-slate-500 dark:text-neutral-400 flex items-center font-medium">
              <Sparkles className="w-3 h-3 mr-1 text-sky-500" />
              Powered by Gemini 2.5
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
            {subjectName && mode === 'chat' && (
                <button
                    onClick={startQuiz}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 text-white text-[10px] md:text-xs font-bold flex items-center gap-2 hover:shadow-lg hover:scale-105 transition-all"
                >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Take Quiz</span>
                </button>
            )}

            {mode === 'quiz' && (
                <button
                    onClick={() => setMode('chat')}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-neutral-300 text-[10px] md:text-xs font-bold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-all"
                >
                    Exit Quiz
                </button>
            )}

            {/* Deep Thinking Toggle (Only in Chat) */}
            {mode === 'chat' && (
                <button
                    onClick={() => setIsThinkingMode(!isThinkingMode)}
                    className={`px-3 py-1.5 rounded-xl transition-all border flex items-center gap-2 text-[10px] md:text-xs font-bold ${
                        isThinkingMode 
                        ? 'bg-violet-600 border-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                        : 'bg-slate-100 dark:bg-white/5 border-transparent text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-white/10'
                    }`}
                    title="Enable Deep Thinking for complex queries"
                >
                    <Brain className={`w-3.5 h-3.5 md:w-4 md:h-4 ${isThinkingMode ? 'animate-pulse' : ''}`} />
                    <span className="hidden sm:inline">{isThinkingMode ? 'Deep Think On' : 'Deep Think'}</span>
                </button>
            )}
        </div>
      </div>

      {/* --- CONTENT AREA --- */}
      
      {mode === 'chat' ? (
          <>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth custom-scrollbar bg-slate-50 dark:bg-[#050505]">
                {messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                    <div 
                    className={`max-w-[95%] md:max-w-[90%] rounded-3xl p-5 md:p-7 shadow-sm backdrop-blur-md border transition-all ${
                        msg.role === 'user' 
                        ? 'bg-gradient-to-br from-slate-900 to-slate-800 dark:from-white dark:to-neutral-200 text-white dark:text-slate-900 rounded-br-none border-transparent' 
                        : 'bg-white dark:bg-[#111] text-slate-800 dark:text-neutral-100 border-slate-200 dark:border-white/10 rounded-bl-none shadow-md'
                    }`}
                    >
                    {msg.isThinking ? (
                        <div className="flex items-center space-x-3 opacity-60 py-2">
                           <div className="w-5 h-5 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-xs font-bold tracking-wider uppercase animate-pulse">Thinking...</span>
                        </div>
                    ) : (
                        <div className={`prose prose-sm max-w-none text-sm leading-loose ${msg.role === 'user' ? 'prose-invert' : 'dark:prose-invert'}`}>
                            <ReactMarkdown components={MarkdownComponents as any}>{msg.text}</ReactMarkdown>
                        </div>
                    )}
                    </div>
                </div>
                ))}
                
                {error && (
                    <div className="flex justify-center w-full px-4 animate-fade-in">
                        <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-2xl shadow-lg flex flex-col md:flex-row items-center gap-3 md:gap-6 max-w-md w-full">
                            <div className="flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <span className="text-xs md:text-sm font-medium">{error}</span>
                            </div>
                            <button 
                                onClick={handleRetry}
                                className="px-4 py-2 bg-red-100 dark:bg-red-500/20 hover:bg-red-200 dark:hover:bg-red-500/30 text-red-700 dark:text-red-300 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap"
                            >
                                <RefreshCcw className="w-3.5 h-3.5" />
                                Retry
                            </button>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 md:p-4 bg-white/90 dark:bg-[#111]/90 backdrop-blur-md border-t border-black/5 dark:border-white/5 relative z-20">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyPress}
                        placeholder={isThinkingMode ? "Ask a complex question..." : "Ask your doubt..."}
                        className={`flex-1 p-3 md:p-4 pr-12 rounded-2xl md:rounded-[1.25rem] border focus:outline-none focus:ring-2 transition-all shadow-inner text-sm md:text-base ${
                            isThinkingMode 
                            ? 'bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-500/20 focus:ring-violet-500/50 text-violet-900 dark:text-violet-100 placeholder-violet-400' 
                            : 'bg-slate-100 dark:bg-[#1a1a1a] border-slate-200 dark:border-white/10 focus:ring-sky-500/50 text-slate-900 dark:text-white placeholder-slate-400'
                        }`}
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={isLoading || !inputText.trim()}
                        className={`absolute right-2 top-2 bottom-2 aspect-square rounded-xl md:rounded-2xl flex items-center justify-center transition-all shadow-md ${
                            isLoading || !inputText.trim()
                            ? 'bg-slate-300 dark:bg-white/10 text-slate-500 cursor-not-allowed'
                            : isThinkingMode 
                                ? 'bg-violet-600 hover:bg-violet-700 text-white hover:scale-105'
                                : 'bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-neutral-200 text-white dark:text-black hover:scale-105'
                        }`}
                    >
                        <Send className="w-4 h-4 md:w-5 md:h-5" />
                    </button>
                </div>
            </div>
          </>
      ) : (
          /* Quiz Mode */
          <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50 dark:bg-[#050505] flex items-center justify-center">
             {isQuizLoading ? (
                 <div className="text-center">
                     <div className="w-16 h-16 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="text-slate-500 dark:text-neutral-400 font-bold">Generating Quiz...</p>
                 </div>
             ) : quiz ? (
                 <div className="w-full max-w-2xl">
                     {!quizFinished ? (
                         <div className="glass-panel p-6 md:p-8 rounded-[2rem] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 shadow-2xl">
                             <div className="flex justify-between items-center mb-6">
                                 <span className="text-xs font-bold text-slate-400 dark:text-neutral-500 uppercase tracking-widest">
                                     Question {currentQuestionIndex + 1} / {quiz.questions.length}
                                 </span>
                                 <span className="px-3 py-1 bg-sky-100 dark:bg-sky-900/30 text-sky-600 dark:text-sky-400 rounded-full text-xs font-bold">
                                     Score: {score}
                                 </span>
                             </div>

                             <h3 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white mb-8 leading-snug">
                                 {quiz.questions[currentQuestionIndex].question}
                             </h3>

                             <div className="space-y-3 mb-8">
                                 {quiz.questions[currentQuestionIndex].options.map((option, idx) => {
                                     const isSelected = selectedAnswer === idx;
                                     const isCorrect = idx === quiz.questions[currentQuestionIndex].correctAnswer;
                                     const showResult = selectedAnswer !== null;

                                     let btnClass = "bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-neutral-300";
                                     
                                     if (showResult) {
                                         if (isCorrect) btnClass = "bg-green-100 dark:bg-green-900/30 border-green-500 text-green-700 dark:text-green-400";
                                         else if (isSelected) btnClass = "bg-red-100 dark:bg-red-900/30 border-red-500 text-red-700 dark:text-red-400";
                                         else btnClass = "opacity-50 border-transparent";
                                     } else if (isSelected) {
                                         btnClass = "bg-sky-100 dark:bg-sky-900/30 border-sky-500 text-sky-700 dark:text-sky-400";
                                     }

                                     return (
                                         <button
                                             key={idx}
                                             onClick={() => handleQuizAnswer(idx)}
                                             disabled={showResult}
                                             className={`w-full p-4 rounded-xl border-2 text-left transition-all font-medium text-sm md:text-base flex justify-between items-center ${btnClass}`}
                                         >
                                             <span>{option}</span>
                                             {showResult && isCorrect && <CheckCircle2 className="w-5 h-5" />}
                                             {showResult && isSelected && !isCorrect && <XCircle className="w-5 h-5" />}
                                         </button>
                                     );
                                 })}
                             </div>

                             {selectedAnswer !== null && (
                                 <div className="animate-fade-in">
                                     <div className="mb-6 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 text-sm text-slate-600 dark:text-neutral-400">
                                         <span className="font-bold block mb-1 text-slate-900 dark:text-white">Explanation:</span>
                                         {quiz.questions[currentQuestionIndex].explanation || "No explanation provided."}
                                     </div>
                                     <button
                                         onClick={nextQuestion}
                                         className="w-full py-4 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-lg hover:scale-[1.02] transition-transform flex items-center justify-center"
                                     >
                                         {currentQuestionIndex < quiz.questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                                         <ArrowRight className="w-5 h-5 ml-2" />
                                     </button>
                                 </div>
                             )}
                         </div>
                     ) : (
                         <div className="text-center glass-panel p-8 rounded-[2.5rem] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 shadow-2xl">
                             <div className="w-24 h-24 bg-gradient-to-br from-sky-400 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-sky-500/30">
                                 <Sparkles className="w-12 h-12 text-white" />
                             </div>
                             <h3 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-white mb-2">Quiz Complete!</h3>
                             <p className="text-slate-500 dark:text-neutral-400 font-medium mb-8">
                                 You scored <span className="text-sky-500 font-bold">{score}</span> out of <span className="text-slate-900 dark:text-white font-bold">{quiz.questions.length}</span>
                             </p>
                             
                             <div className="flex flex-col gap-3 max-w-xs mx-auto">
                                 <button
                                     onClick={retryQuiz}
                                     className="w-full py-3.5 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-black font-bold shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
                                 >
                                     <RotateCcw className="w-4 h-4 mr-2" />
                                     Try Another Quiz
                                 </button>
                                 <button
                                     onClick={() => setMode('chat')}
                                     className="w-full py-3.5 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-white font-bold hover:bg-slate-200 dark:hover:bg-neutral-700 transition-colors"
                                 >
                                     Return to Chat
                                 </button>
                             </div>
                         </div>
                     )}
                 </div>
             ) : (
                 <div className="text-center text-slate-500">
                     <p>Failed to load quiz.</p>
                     <button onClick={() => setMode('chat')} className="mt-4 text-sky-500 hover:underline">Go Back</button>
                 </div>
             )}
          </div>
      )}
    </div>
  );
};

export default AITutor;