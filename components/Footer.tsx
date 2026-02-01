
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Hexagon, Github, Linkedin, Heart, Globe, Instagram } from 'lucide-react';
import AdBanner from './AdBanner';
import { APP_NOTICES } from '../constants';

interface FooterProps {
  onNoticesClick: () => void;
}

const Footer: React.FC<FooterProps> = ({ onNoticesClick }) => {
  const navigate = useNavigate();
  const hasNewNotices = APP_NOTICES.some(n => n.isNew);

  // Custom Icons for brands not in Lucide
  const WhatsAppIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
    </svg>
  );

  const PinterestIcon = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <line x1="12" y1="5" x2="12" y2="19"></line>
      <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
  );

  return (
    <footer className="relative mt-20 bg-slate-50 dark:bg-[#050505] border-t border-slate-200 dark:border-white/5 pt-16 pb-8 z-10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
            <div className="flex justify-center mb-16 w-full">
                <div className="w-full max-w-4xl">
                    <AdBanner format="native" />
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <div className="bg-sky-500 text-white p-2 rounded-lg">
                            <Hexagon className="w-5 h-5 fill-current" />
                        </div>
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">PolyStudy</span>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                        Democratizing education for Kerala Polytechnic students with open-source resources.
                    </p>
                    
                    {/* Social Links */}
                    <div className="flex items-center gap-4 pt-4">
                        <a href="https://wa.me/qr/HQWL273HTEK4L1" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-green-500 transition-colors" title="WhatsApp">
                            <WhatsAppIcon />
                        </a>
                        <a href="https://www.instagram.com/mohdnihadkp?igsh=MWs3M2k1OXNlbTV5YQ==" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-500 transition-colors" title="Instagram">
                            <Instagram className="w-5 h-5" />
                        </a>
                        <a href="https://www.linkedin.com/in/mohammed-nihad-kp-71b6b6339?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors" title="LinkedIn">
                            <Linkedin className="w-5 h-5" />
                        </a>
                        <a href="https://mohdnihadkp.netlify.app" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-sky-500 transition-colors" title="Portfolio">
                            <Globe className="w-5 h-5" />
                        </a>
                        <a href="https://github.com/mohdnihadkp" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-white transition-colors" title="GitHub">
                            <Github className="w-5 h-5" />
                        </a>
                        <a href="https://pin.it/4SKTJurgS" target="_blank" rel="noreferrer" className="text-slate-400 hover:text-red-600 transition-colors" title="Pinterest">
                            <PinterestIcon /> {/* Using generic as placeholder or custom SVG */}
                        </a>
                    </div>
                </div>
                
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6">Explore</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <li><button onClick={() => navigate('/departments')} className="hover:text-sky-500 transition-colors text-left w-full">Departments</button></li>
                        <li><button onClick={() => navigate('/scholarship')} className="hover:text-sky-500 transition-colors text-left w-full">Scholarships</button></li>
                        <li><button onClick={() => navigate('/ai-tutor')} className="hover:text-sky-500 transition-colors text-left w-full">AI Tutor</button></li>
                        <li>
                            <button onClick={() => navigate('/notices')} className="hover:text-sky-500 transition-colors text-left w-full flex items-center">
                                Notice Board
                                {hasNewNotices && <span className="ml-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
                            </button>
                        </li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-bold text-slate-900 dark:text-white mb-6">Support</h4>
                    <ul className="space-y-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                        <li><button onClick={() => navigate('/feedback')} className="hover:text-sky-500 transition-colors text-left w-full">Feedback</button></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-slate-200 dark:border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-xs text-slate-400 font-medium">Copyright ©{new Date().getFullYear()} PolyStudy.All rights reserved</p>
                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <span>Made with</span>
                    <Heart className="w-3 h-3 text-red-500 fill-current" />
                    <span>in Kerala</span>
                </div>
            </div>
        </div>
      </footer>
  );
};

export default Footer;
