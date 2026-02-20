import React from 'react';
import { ICONS } from '../config';

function getIcon(name, size = 24, classes = '') {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={classes} dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />;
}

export default function PrimePartnerView({ weeklyOrders = 45, onClose }) {
  const targetOrders = 60;
  const isPrime = weeklyOrders >= targetOrders;
  const progressPercent = Math.min(100, (weeklyOrders / targetOrders) * 100);
  const remaining = Math.max(0, targetOrders - weeklyOrders);

  const benefits = [
    { id: 1, title: 'Higher Earnings', desc: 'Earn up to 15% more on every delivery.', icon: 'barChart', unlocked: isPrime },
    { id: 2, title: 'Priority Support', desc: 'Skip the queue with a dedicated helpline.', icon: 'phone', unlocked: isPrime },
    { id: 3, title: 'Health Insurance', desc: 'Free medical cover up to ₹2 Lakhs.', icon: 'alertCircle', unlocked: isPrime },
    { id: 4, title: 'Zero Cancellation Penalty', desc: 'Cancel up to 2 orders/week penalty-free.', icon: 'check', unlocked: isPrime },
  ];

  return (
    <div className="fixed inset-0 z-[110] bg-slate-50 dark:bg-dark-bg flex flex-col slide-up overflow-hidden">
      
      {/* Golden Header Header */}
      <div className="relative pt-safe-top pb-10 bg-gradient-to-b from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-800 rounded-b-[3rem] shadow-xl px-6">
        <div className="absolute top-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 -translate-y-1/4">
          {getIcon('crown', 200, 'text-white')}
        </div>
        
        <div className="flex justify-between items-center py-4 relative z-10">
          <button onClick={onClose} className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center text-white backdrop-blur-md active:scale-95">
            {getIcon('arrowLeft', 24)}
          </button>
          <span className="text-white font-bold uppercase tracking-widest text-xs bg-black/20 px-3 py-1 rounded-full backdrop-blur-md">QC Logistics Elite</span>
          <div className="w-10"></div>
        </div>

        <div className="text-center mt-6 relative z-10 text-white">
          <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md border-2 border-white/50 shadow-inner">
            {getIcon('crown', 40, 'text-yellow-300 drop-shadow-md')}
          </div>
          <h1 className="text-3xl font-black mb-1 drop-shadow-md">Prime Partner</h1>
          <p className="text-amber-100 text-sm">Unlock exclusive benefits and maximum earnings.</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 -mt-8 relative z-20 pb-safe">
        
        {/* Progress Card */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-xl shadow-amber-500/10 border border-amber-100 dark:border-slate-700 mb-6">
          <div className="flex justify-between items-end mb-4">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Current Status</p>
              <h2 className={`text-xl font-black ${isPrime ? 'text-amber-500' : 'text-slate-900 dark:text-white'}`}>
                {isPrime ? 'Active Prime Member' : 'Regular Partner'}
              </h2>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900 dark:text-white">{weeklyOrders}</span>
              <span className="text-sm font-bold text-slate-400">/{targetOrders} trips</span>
            </div>
          </div>

          <div className="relative h-4 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden mb-3">
            <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isPrime ? 'bg-gradient-to-r from-amber-400 to-yellow-500 prime-shimmer' : 'bg-brand-500'}`} style={{ width: `${progressPercent}%` }}></div>
          </div>

          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            {isPrime 
              ? "🎉 You've unlocked Prime for this week!" 
              : `Complete ${remaining} more trips before Sunday to unlock Prime benefits next week.`}
          </p>
        </div>

        {/* Benefits List */}
        <h3 className="font-bold text-slate-900 dark:text-white mb-4">Prime Benefits</h3>
        <div className="space-y-3">
          {benefits.map(benefit => (
            <div key={benefit.id} className={`p-4 rounded-2xl flex items-center gap-4 transition-colors ${benefit.unlocked ? 'bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800/50' : 'bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 opacity-75'}`}>
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${benefit.unlocked ? 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>
                {getIcon(benefit.icon, 24)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className={`font-bold ${benefit.unlocked ? 'text-amber-900 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>{benefit.title}</h4>
                  {benefit.unlocked && <span className="text-[9px] font-black bg-amber-500 text-white px-2 py-0.5 rounded uppercase tracking-wider">Active</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{benefit.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}