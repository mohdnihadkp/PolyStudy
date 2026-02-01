
import React, { useState } from 'react';
import { X, Hexagon, Globe, Code, Heart, Layers, Github, Linkedin, Instagram, Twitter, Mail } from 'lucide-react';

interface AboutModalProps {
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'about' | 'developer' | 'tech'>('about');

  // Specific Social Links for the Developer
  const socialLinks = [
    { icon: <Globe className="w-5 h-5" />, url: "https://mohdnihadkp.netlify.app", label: "Portfolio" },
    { icon: <Github className="w-5 h-5" />, url: "https://github.com/mohdnihadkp", label: "GitHub" },
    { icon: <Linkedin className="w-5 h-5" />, url: "https://www.linkedin.com/in/mohammed-nihad-kp-71b6b6339?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", label: "LinkedIn" },
    { icon: <Instagram className="w-5 h-5" />, url: "https://www.instagram.com/mohdnihadkp?igsh=MWs3M2k1OXNlbTV5YQ==", label: "Instagram" },
    { icon: <Mail className="w-5 h-5" />, url: "mailto:mohdnihadkp@gmail.com", label: "Email" }
  ];

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 backdrop-blur-md bg-black/80" onClick={onClose}>
      <div 
        className="glass-panel w-full max-w-2xl rounded-[2.5rem] bg-white dark:bg-[#0a0a0a] border border-white/20 shadow-2xl overflow-hidden relative animate-scale-in flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/5 dark:bg-white/10 text-slate-500 dark:text-white hover:rotate-90 transition-all z-20"
        >
            <X className="w-5 h-5" />
        </button>

        {/* Profile Header */}
        <div className="relative pt-10 pb-6 px-6 bg-gradient-to-b from-sky-500/10 to-transparent flex flex-col items-center text-center shrink-0">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 p-1 shadow-xl mb-3">
                <div className="w-full h-full bg-white dark:bg-black rounded-full flex items-center justify-center">
                    <Hexagon className="w-10 h-10 text-sky-600 dark:text-sky-400 fill-current" />
                </div>
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">PolyStudy</h2>
            <p className="text-xs font-bold text-slate-500 dark:text-neutral-400 bg-slate-100 dark:bg-white/10 px-3 py-1 rounded-full mt-2">
                Academic Companion v2.5
            </p>
        </div>

        {/* Tabs */}
        <div className="flex px-6 space-x-4 border-b border-slate-100 dark:border-white/5 shrink-0">
            {['about', 'developer', 'tech'].map((tab) => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`pb-3 text-sm font-bold capitalize transition-colors relative ${activeTab === tab ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                    {tab}
                    {activeTab === tab && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-500 rounded-t-full"></div>
                    )}
                </button>
            ))}
        </div>

        {/* Content Section */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6 custom-scrollbar overscroll-contain">
            {activeTab === 'about' && (
                <div className="space-y-6 animate-fade-in">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Our Mission</h3>
                        <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                            PolyStudy is an open-source initiative designed to democratize education for Kerala Polytechnic students. We provide curated study materials, solved question papers, and an advanced AI tutor to ensure every student has access to high-quality academic support, completely free of charge.
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-sky-50 dark:bg-sky-900/10 border border-sky-100 dark:border-sky-500/20">
                            <h4 className="font-bold text-sky-700 dark:text-sky-300 mb-1">Open Source</h4>
                            <p className="text-xs text-sky-600/80 dark:text-sky-400/70">Built by students, for students.</p>
                        </div>
                        <div className="p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-500/20">
                            <h4 className="font-bold text-violet-700 dark:text-violet-300 mb-1">AI Powered</h4>
                            <p className="text-xs text-violet-600/80 dark:text-violet-400/70">24/7 personalized tutoring.</p>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'developer' && (
                <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-black dark:bg-white flex items-center justify-center text-white dark:text-black shadow-lg">
                            <Code className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Mohammed Nihad KP</h3>
                            <p className="text-sm text-slate-500 dark:text-neutral-400 font-medium">Full Stack Developer & Creator</p>
                        </div>
                    </div>

                    <p className="text-sm text-slate-600 dark:text-neutral-400 leading-relaxed">
                        Passionate about building tools that solve real-world problems. PolyStudy was created to bridge the gap in digital resources for diploma students.
                    </p>

                    <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Connect With Me</h4>
                        <div className="flex flex-wrap gap-3">
                            {socialLinks.map((link, idx) => (
                                <a 
                                    key={idx}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 dark:bg-white/5 hover:bg-sky-50 dark:hover:bg-sky-900/20 text-slate-600 dark:text-neutral-300 hover:text-sky-600 dark:hover:text-sky-400 transition-all border border-slate-100 dark:border-white/5"
                                >
                                    {link.icon}
                                    <span className="text-xs font-bold">{link.label}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'tech' && (
                <div className="space-y-4 animate-fade-in">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Technology Stack</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { name: 'React 19', desc: 'Frontend Framework' },
                            { name: 'Vite', desc: 'Build Tool' },
                            { name: 'Tailwind CSS', desc: 'Styling' },
                            { name: 'Three.js', desc: '3D Graphics' },
                            { name: 'Gemini API', desc: 'AI Intelligence' },
                            { name: 'Google Drive', desc: 'Content Hosting' }
                        ].map((tech, i) => (
                            <div key={i} className="flex items-center p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <Layers className="w-5 h-5 text-slate-400 mr-3" />
                                <div>
                                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{tech.name}</h4>
                                    <p className="text-xs text-slate-500 dark:text-neutral-500">{tech.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Foooter */}
        <div className="p-4 border-t border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex justify-center gap-2 text-xs font-bold text-slate-400 shrink-0">
            <span className="flex items-center"><Heart className="w-3 h-3 mr-1 text-red-500 fill-current" /> Made in Kerala</span>
            <span>•</span>
            <span>&copy; {new Date().getFullYear()} PolyStudy</span>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
