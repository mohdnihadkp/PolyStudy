import React, { useState, useRef } from 'react';
import { X, Send, Mail, User, MessageSquare, AlertCircle, Loader2, CheckCircle2 } from 'lucide-react';
import emailjs from '@emailjs/browser';

interface ContactModalProps {
  onClose: () => void;
}

const ContactModal: React.FC<ContactModalProps> = ({ onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useRef<HTMLFormElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --- EMAILJS CONFIGURATION ---
    // NOTE: Replace these with your actual EmailJS credentials to enable direct sending.
    // Get them for free at https://emailjs.com/
    const SERVICE_ID = 'YOUR_SERVICE_ID'; // e.g. 'service_xxxxx'
    const TEMPLATE_ID = 'YOUR_TEMPLATE_ID'; // e.g. 'template_xxxxx'
    const PUBLIC_KEY = 'YOUR_PUBLIC_KEY'; // e.g. 'user_xxxxx'
    // -----------------------------

    const fallbackToMailto = () => {
        const subject = encodeURIComponent(`Feedback from PolyStudy User: ${name}`);
        const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nFeedback/Message:\n${message}`);
        window.location.href = `mailto:mohdnihadkp@gmail.com?subject=${subject}&body=${body}`;
        setIsSubmitting(false);
        onClose();
    };

    if (SERVICE_ID === 'YOUR_SERVICE_ID' || !form.current) {
        // Simulated delay for better UX if not configured, then fallback
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
          setTimeout(() => {
              onClose();
              setIsSuccess(false);
          }, 2500);
        },
        (error) => {
          console.error('EmailJS Failed:', error.text);
          fallbackToMailto();
        },
    );
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 dark:bg-white/10 backdrop-blur-md p-4 animate-fade-in" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-lg rounded-[2rem] relative shadow-2xl border border-black dark:border-white overflow-hidden bg-white dark:bg-black max-h-[90vh] flex flex-col" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Fixed Close Button Container */}
        <div className="absolute top-0 right-0 p-4 md:p-6 z-50 pointer-events-none w-full flex justify-end">
            <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 text-gray-500 dark:text-gray-400 transition-colors cursor-pointer pointer-events-auto bg-white/20 dark:bg-black/20 backdrop-blur-md shadow-sm border border-black/5 dark:border-white/10"
            >
            <X className="w-6 h-6" />
            </button>
        </div>

        {isSuccess ? (
            <div className="flex flex-col items-center justify-center h-full p-10 text-center animate-fade-in">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-6 text-green-600 dark:text-green-400 shadow-lg">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Feedback Sent!</h2>
                <p className="text-slate-500 dark:text-gray-400 font-medium">
                    Thank you for helping us improve PolyStudy.
                </p>
            </div>
        ) : (
            <div className="overflow-y-auto p-6 md:p-8 custom-scrollbar">
                <div className="mb-6 md:mb-8 relative z-10 pt-2">
                    <h2 className="text-2xl md:text-3xl font-black text-black dark:text-white mb-2 tracking-tight">Feedback</h2>
                    <p className="text-sm md:text-base text-gray-500 dark:text-gray-400 font-medium pr-8">
                    Send feedback directly without leaving the app. Found a bug or have an idea? Let us know!
                    </p>
                </div>

                <form ref={form} onSubmit={handleSubmit} className="space-y-4 md:space-y-6 relative z-10">
                    <div className="space-y-2">
                        <label className="text-sm font-bold text-black dark:text-white ml-1">Your Name</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <User className="w-5 h-5" />
                            </div>
                            <input 
                                type="text" 
                                name="user_name" // Required for EmailJS template matching
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 md:py-4 glass-input rounded-2xl text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-medium border border-black/10 dark:border-white/20 text-sm md:text-base"
                                placeholder="Your Name"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-black dark:text-white ml-1">Email Address</label>
                        <div className="relative">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input 
                                type="email" 
                                name="user_email" // Required for EmailJS template matching
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 md:py-4 glass-input rounded-2xl text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white font-medium border border-black/10 dark:border-white/20 text-sm md:text-base"
                                placeholder="your@email.com"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-black dark:text-white ml-1">Message</label>
                        <div className="relative">
                            <div className="absolute left-4 top-5 text-gray-400">
                                <MessageSquare className="w-5 h-5" />
                            </div>
                            <textarea 
                                name="message" // Required for EmailJS template matching
                                required
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                className="w-full pl-12 pr-4 py-3.5 md:py-4 glass-input rounded-2xl text-black dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white min-h-[120px] resize-none font-medium border border-black/10 dark:border-white/20 text-sm md:text-base"
                                placeholder="Tell me what you think..."
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 md:py-4 rounded-2xl font-bold text-base md:text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed group"
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
                    
                    <p className="text-center text-xs text-gray-400 dark:text-gray-500 font-medium mt-4">
                    Direct email: mohdnihadkp@gmail.com
                    </p>
                </form>
            </div>
        )}
      </div>
    </div>
  );
};

export default ContactModal;