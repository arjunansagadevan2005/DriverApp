import React, { useState } from 'react';
import HomeSection from './HomeSection';
import OrdersSection from './OrdersSection';
import EarningsSection from './EarningsSection';
import ProfileSection from './ProfileSection';

// 1. 🔥 Add regData and setView here so it catches the data from App.jsx
export default function DashboardView({ t, regData, setView }) {
  const [activeTab, setActiveTab] = useState('home');

  return (
    <div className="h-screen w-full flex flex-col bg-slate-50 dark:bg-dark-bg transition-colors duration-500 overflow-hidden">
      
      {/* CONTENT AREA - Dynamic based on state */}
      <main className="flex-1 overflow-y-auto no-scrollbar pb-20">
        {/* 🔥 FIX: Passed setActiveTab to HomeSection so it can change tabs! */}
        {activeTab === 'home' && <HomeSection t={t} regData={regData} setActiveTab={setActiveTab} />}
        
        {/* 🔥 FIX: Passed regData so Orders knows your vehicle type! */}
        {activeTab === 'orders' && <OrdersSection t={t} regData={regData} />}
        
        {/* 🔥 FIX: Passed regData so Earnings knows your mobile number! */}
        {activeTab === 'earnings' && <EarningsSection t={t} regData={regData} />}
        
        {activeTab === 'profile' && <ProfileSection t={t} regData={regData} setView={setView} />}
      </main>

      {/* NAVIGATION */}
      <nav className="fixed bottom-0 left-0 right-0 pb-safe pt-2 px-6 bg-white/90 dark:bg-dark-surface/90 border-t border-slate-100 dark:border-dark-border glass z-50">
        <div className="flex justify-between items-center h-16 max-w-md mx-auto">
          <NavButton icon="home" label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavButton icon="orders" label="Orders" active={activeTab === 'orders'} onClick={() => setActiveTab('orders')} badge={0} />
          <NavButton icon="earnings" label="Earnings" active={activeTab === 'earnings'} onClick={() => setActiveTab('earnings')} />
          <NavButton icon="profile" label="Profile" active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} />
        </div>
      </nav>
    </div>
  );
}

function NavButton({ icon, label, active, onClick, badge }) {
  // SVG Paths from your HTML
  const iconPaths = {
    home: <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></>,
    orders: <><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></>,
    earnings: <><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></>,
    profile: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>
  };

  return (
    <button onClick={onClick} className={`relative flex flex-col items-center justify-center transition-all duration-300 flex-1 ${active ? '-translate-y-1' : ''}`}>
      {badge > 0 && (
        <div className="absolute top-0 right-1/4 w-5 h-5 bg-red-500 border-2 border-white dark:border-dark-bg text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce z-10">
          {badge}
        </div>
      )}
      
      <div className={`p-2.5 rounded-2xl transition-all duration-300 ${active ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/40 scale-110' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {iconPaths[icon]}
        </svg>
      </div>

      <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${active ? 'text-brand-600 opacity-100' : 'opacity-0 translate-y-2 absolute'}`}>
        {label.toUpperCase()}
      </span>
      
      {active && <div className="absolute -bottom-1 w-1 h-1 bg-brand-600 rounded-full animate-pulse"></div>}
    </button>
  );
}