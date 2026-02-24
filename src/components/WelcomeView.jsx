import React from 'react';

export default function WelcomeView({ setView, t }) {
  return (
    <div className="h-full flex flex-col justify-center items-center px-6 fade-in">
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
        New Driver?{' '}
        <a 
          href="#" 
          onClick={(e) => {
            e.preventDefault(); // Prevents the page from refreshing
            setView('registration');
          }} 
          className="font-bold text-brand-600 dark:text-brand-400 hover:underline"
        >
          Create an account
        </a>
      </p>
    </div>
  );
}