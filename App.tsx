
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HexagonBackground from './components/HexagonBackground';
import Home from './pages/Home';
import Departments from './pages/Departments';
import CourseView from './pages/CourseView';
import ScholarshipPage from './pages/ScholarshipPage';
import AITutorPage from './pages/AITutorPage';
import FeedbackPage from './pages/FeedbackPage';
import NoticesPage from './pages/NoticesPage';
import AdBanner from './components/AdBanner';

// Scroll to top on route change
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

export default function App() {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Toggle Theme Function with HTML Class Logic
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Ensure theme is applied on mount
  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
  }, []);

  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="relative min-h-screen flex flex-col font-sans text-slate-900 dark:text-neutral-200 antialiased selection:bg-sky-500/30 selection:text-sky-200">
        <HexagonBackground isDarkMode={isDarkMode} />
        
        {/* Top Responsive Ad Banner */}
        <div className="w-full z-40 bg-white/5 backdrop-blur-sm border-b border-white/5 py-1">
            <AdBanner format="leaderboard" />
        </div>

        <Routes>
          {/* Homepage */}
          <Route path="/" element={<Home isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          
          {/* Main Pages */}
          <Route path="/departments" element={<Departments isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/scholarship" element={<ScholarshipPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/ai-tutor" element={<AITutorPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/feedback" element={<FeedbackPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/notices" element={<NoticesPage isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          
          {/* Dynamic Routes: Department -> Semester -> Subject */}
          <Route path="/:deptId" element={<CourseView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/:deptId/:semId" element={<CourseView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />
          <Route path="/:deptId/:semId/:subId" element={<CourseView isDarkMode={isDarkMode} toggleTheme={toggleTheme} />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

      </div>
    </BrowserRouter>
  );
}
