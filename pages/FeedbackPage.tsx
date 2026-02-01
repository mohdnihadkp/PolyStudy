
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import NoticesModal from '../components/NoticesModal';
import { MessageSquare, ArrowLeft, Send, Mail, User, Loader2, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface FeedbackPageProps {
  isDarkMode: boolean;
  toggleTheme: () => void;
}

const FeedbackPage: React.FC<FeedbackPageProps> = ({ isDarkMode, toggleTheme }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isNoticesModalOpen, setIsNoticesModalOpen] = useState(false);
  const form = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const SERVICE_ID = 'service_8ucr436';
    const TEMPLATE_ID = 'template_8j5ufg8';
    const PUBLIC_KEY = 'e1MqgWnXieh6QUVGv';

    const fallbackToMailto = () => {
        const subject = encodeURIComponent(`Feedback from PolyStudy User: ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nFeedback/Message:\n${message}`);
        window.location.href = `mailto:mohdnihadkp@gmail.com?subject=${subject}&body=${body}`;
        setIsSubmitting(false);
        setIsSuccess(true);
    };

    if (SERVICE_ID === 'YOUR_SERVICE_ID' || !form.current) {
        setTimeout(fallbackToMailto, 800);
        return;
    }

    emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, form.current, {
        publicKey: PUBLIC_KEY,
    })
    .then(
        () => {
          setIsSubmitting(false);
          setIsSuccess(true);
        },
        (error) => {
          console.error('EmailJS Failed:', error.text);
          fallbackToMailto();
        },
    );
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
        onContactClick={() => {}}
      />

      <main className="relative z-10 flex-grow max-w-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 flex flex-col justify-center">
        
        {isSuccess ? (
            <div className="glass-panel p-12 rounded-[2.5rem] text-center animate-scale-in border border-slate-200 dark:border-white/10">
                <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400 shadow-lg mx-auto">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-4">Feedback Sent!</h2>
                <p className="text-slate-500 dark:text-gray-400 font-medium text-lg mb-8">
                    Thank you for helping us improve PolyStudy.
                </p>
                <button 
                    onClick={() => navigate('/')}
                    className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold shadow-lg hover:scale-105 transition-transform"
                >
                    Return Home
                </button>
            </div>
        ) : (
            <div className="glass-panel p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/10 shadow-2xl">
                <div className="flex items-center mb-8">
                    <button onClick={() => navigate('/')} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/10 mr-4 transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-500 dark:text-white" />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Send Feedback</h1>
                        <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">We'd love to hear your thoughts, suggestions or bug reports.</p>
                    </div>
                </div>

                <form ref={form} onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Your Name</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                name="user_name"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white font-medium border border-slate-200 dark:border-white/10"
                                placeholder="John Doe"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input 
                                type="email" 
                                name="user_email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white font-medium border border-slate-200 dark:border-white/10"
                                placeholder="john@example.com"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Message</label>
                        <div className="relative">
                            <div className="absolute left-4 top-5 text-gray-400">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <textarea 
                                name="message"
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 glass-input rounded-2xl text-slate-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-white min-h-[150px] resize-none font-medium border border-slate-200 dark:border-white/10"
                                placeholder="Describe your experience or issue..."
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            <>
                                <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 transition-transform" />
                                Send Feedback
                            </>
                        )}
                    </button>
                </form>
            </div>
        )}
      </main>

      <Footer onNoticesClick={() => setIsNoticesModalOpen(true)} />
      {isNoticesModalOpen && <NoticesModal onClose={() => setIsNoticesModalOpen(false)} />}
    </div>
  );
};

export default FeedbackPage;
