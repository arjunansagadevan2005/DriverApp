import React, { useState, useEffect } from 'react';

export default function WelcomeView({ setView, t }) {
  // Setup local states for Theme and Language modal
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "true");
  const [showLangModal, setShowLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem("language") || "en");

  // Keep dark mode synced with the DOM
  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  // Smooth View-Transition Theme Toggle
  const toggleTheme = (event) => {
    const nextState = !isDark;
    const updateDOM = () => {
      setIsDark(nextState);
      localStorage.setItem("theme", nextState);
      if (nextState) document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    };

    if (!document.startViewTransition) {
      updateDOM();
      return;
    }

    const x = event.clientX;
    const y = event.clientY;
    const endRadius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    const transition = document.startViewTransition(() => { updateDOM(); });

    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
        { duration: 500, easing: 'ease-out', pseudoElement: '::view-transition-new(root)' }
      );
    });
  };

  // Instant Language Switcher
  const changeLanguage = (lang) => {
      setCurrentLang(lang);
      localStorage.setItem("language", lang);
      setShowLangModal(false);
      window.dispatchEvent(new Event("languageChange")); 
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-6 fade-in relative bg-white dark:bg-dark-bg transition-colors duration-300">
      
      {/* 🔥 EXACT TOP RIGHT CONTROLS 🔥 */}
      <div className="absolute top-6 right-6 flex gap-3 z-50">
        {/* Language Button */}
        <button onClick={() => setShowLangModal(true)} className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95 shadow-sm">
            <span className="globe-spin">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path></svg>
            </span>
            <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center uppercase">
                {currentLang}
            </span>
        </button>
        
        {/* Theme Button */}
        <button onClick={toggleTheme} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/50' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/50'} active:scale-95 hover:scale-105`}>
            {isDark ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            )}
        </button>
      </div>

      <div className="w-24 h-24 bg-brand-600 rounded-3xl flex items-center justify-center shadow-2xl text-white font-black text-5xl transform rotate-3 mb-10">
        QC
      </div>
      
      <h1 className="text-3xl font-bold dark:text-white mb-3 text-center">
        {t('app_name') || 'QC Logistics'}
      </h1>
      
      <p className="text-slate-500 dark:text-slate-400 text-center mb-12 max-w-xs">
        {t('welcome_subtitle') || 'Partner with us and start earning today.'}
      </p>
      
      <button 
        onClick={() => setView('login')} 
        className="w-full py-4 rounded-2xl font-bold bg-brand-600 text-white shadow-lg shadow-brand-500/30 active:scale-95 transition-transform mb-6"
      >
        {t('login_btn') || 'Login to Account'}
      </button>

      {/* Classic Link Concept */}
      <p className="text-sm text-slate-500 dark:text-slate-400 text-center">
        {t('new_driver') || 'New Driver?'}{' '}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault();
            setView('registration');
          }} 
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          {t('create_account') || 'Create an account'}
        </a>
      </p>

      {/* LANGUAGE SELECTION MODAL */}
      {showLangModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowLangModal(false)}></div>
            <div className="relative w-[85%] max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl animate-scale-in">
                <h2 className="text-xl font-bold mb-4 dark:text-white text-center">Select Language / மொழி</h2>
                <div className="space-y-3">
                    <button onClick={() => changeLanguage('en')} className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="font-bold text-lg dark:text-white">English</span><span className="text-2xl">🇺🇸</span>
                    </button>
                    <button onClick={() => changeLanguage('ta')} className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="font-bold text-lg dark:text-white font-sans">தமிழ்</span><span className="text-2xl">🇮🇳</span>
                    </button>
                    <button onClick={() => changeLanguage('hi')} className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                        <span className="font-bold text-lg dark:text-white font-sans">हिंदी</span><span className="text-2xl">🇮🇳</span>
                    </button>
                </div>
                <button onClick={() => setShowLangModal(false)} className="w-full mt-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:text-slate-400 transition-colors">{t('close') || 'Close'} / மூடு</button>
            </div>
        </div>
      )}
    </div>
  );
}