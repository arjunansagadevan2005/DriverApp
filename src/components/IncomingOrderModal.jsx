import React, { useState, useEffect } from 'react';
import { ICONS } from '../config';

// Helper to render icons
function getIcon(name, size = 24, classes = '') {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={classes} dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />;
}

export default function IncomingOrderModal({ order, onAccept, onDecline }) {
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds to accept

  // Countdown Timer Logic
  useEffect(() => {
    if (timeLeft <= 0) {
      onDecline(order.id); // Auto-decline if time runs out
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, order.id, onDecline]);

  // Calculate progress circle stroke
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / 30) * circumference;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end bg-black/80 backdrop-blur-sm slide-up">
      {/* Ringing Animation Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
        <div className="w-[150vw] h-[150vw] bg-brand-500/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
        <div className="absolute w-[100vw] h-[100vw] bg-brand-500/20 rounded-full animate-ping" style={{ animationDuration: '2.5s', animationDelay: '0.5s' }}></div>
      </div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-dark-surface rounded-t-[2.5rem] p-6 pt-10 pb-safe shadow-2xl">
        
        {/* Timer UI */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white dark:bg-slate-800 rounded-full p-2 shadow-2xl">
          <div className="relative flex items-center justify-center w-24 h-24">
            <svg className="transform -rotate-90 w-24 h-24">
              <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-700" />
              <circle cx="48" cy="48" r="45" stroke="currentColor" strokeWidth="6" fill="transparent" 
                className={`${timeLeft <= 10 ? 'text-red-500' : 'text-brand-500'} transition-all duration-1000 ease-linear`}
                strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
            </svg>
            <div className="absolute flex flex-col items-center justify-center">
              <span className={`text-2xl font-black ${timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-slate-800 dark:text-white'}`}>{timeLeft}</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase">Sec</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6 mb-6">
          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1 uppercase tracking-widest animate-pulse">New Order Ping!</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Delivery Request via {order.vendor_shop_name || 'Partner Store'}</p>
        </div>

        {/* Order Details Card */}
        <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-5 mb-6 border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Estimated Payout</p>
              <p className="text-4xl font-black text-brand-600">₹{order.delivery_fee || order.final_total}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Distance</p>
              <p className="text-xl font-black text-slate-800 dark:text-white">4.2 km</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="mt-1 flex flex-col items-center">
                <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center border-2 border-amber-100 dark:border-amber-900/30"></div>
                <div className="w-0.5 h-8 bg-dashed border-l-2 border-dashed border-slate-300 dark:border-slate-600 my-1"></div>
                <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center border-2 border-green-100 dark:border-green-900/30"></div>
              </div>
              <div className="flex-1 space-y-5">
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Pickup Location</p>
                  <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{order.vendor_shop_name || order.pickup_address}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase">Dropoff Location</p>
                  <p className="font-semibold text-slate-900 dark:text-white line-clamp-1">{order.delivery_address || order.client_address || 'Customer Location'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => onDecline(order.id)} className="py-4 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 active:scale-95 transition-all text-lg bg-white dark:bg-slate-800">
            Decline
          </button>
          <button onClick={() => onAccept(order.id)} className="py-4 rounded-2xl font-black bg-brand-600 text-white shadow-xl shadow-brand-500/40 active:scale-95 transition-all text-lg flex justify-center items-center gap-2 relative overflow-hidden group">
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform"></div>
            Accept Order
          </button>
        </div>

      </div>
    </div>
  );
}