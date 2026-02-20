import React, { useState, useEffect, useMemo } from 'react';
import { ICONS } from '../config';

// Helper to pull icons safely from config
const getIcon = (name, size = 24, classes = '') => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}">${ICONS[name] || ''}</svg>`;
};

export default function EarningsSection({ t }) {
    const [timeframe, setTimeframe] = useState('daily');
    const [selectedDate, setSelectedDate] = useState('');

    // --- HELPER FUNCTIONS FOR DATES ---
    const getISOWeek = (dateObj) => {
        const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return d.getUTCFullYear() + "-W" + String(weekNo).padStart(2, '0');
    };

    const getLocalYYYYMMDD = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    const getLocalYYYYMM = (d) => d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');

    // --- AUTO-SET DATE WHEN TIMEFRAME CHANGES ---
    useEffect(() => {
        const now = new Date();
        if (timeframe === 'daily') setSelectedDate(getLocalYYYYMMDD(now));
        else if (timeframe === 'weekly') setSelectedDate(getISOWeek(now));
        else if (timeframe === 'monthly') setSelectedDate(getLocalYYYYMM(now));
        else if (timeframe === 'yearly') setSelectedDate(now.getFullYear().toString());
    }, [timeframe]);

    // --- MOCK PAST TRIPS (Will be replaced by Supabase data later) ---
    const pastTrips = useMemo(() => {
        const now = new Date();
        return [
            { id: 1, type: "Cement Bags (50kg)", amount: 450, date: `Today, 2:30 PM`, rawDate: now.toISOString() },
            { id: 2, type: "Steel TMT Bars", amount: 750, date: `Today, 11:15 AM`, rawDate: now.toISOString() },
            { id: 3, type: "Bricks & Sand", amount: 1200, date: `Today, 9:00 AM`, rawDate: now.toISOString() }
        ];
    }, []);

    // --- FILTER TRIPS BASED ON SELECTED DATE ---
    const filteredTrips = useMemo(() => {
        if (!selectedDate) return [];
        return pastTrips.filter(trip => {
            const tripDate = new Date(trip.rawDate);
            if (timeframe === 'daily') return getLocalYYYYMMDD(tripDate) === selectedDate;
            if (timeframe === 'weekly') return getISOWeek(tripDate) === selectedDate;
            if (timeframe === 'monthly') return getLocalYYYYMM(tripDate) === selectedDate;
            if (timeframe === 'yearly') return tripDate.getFullYear().toString() === selectedDate;
            return true;
        });
    }, [pastTrips, timeframe, selectedDate]);

    const total = filteredTrips.reduce((acc, curr) => acc + curr.amount, 0);
    const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer shadow-sm";

    // Build the Year Options (Current year to 5 years ago)
    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    return (
        <div className="fade-in pt-4 pb-8 px-2">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white px-2">{t('earnings_history') || 'Earnings History'}</h2>
            
            {/* Timeframe Tabs */}
            <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mx-2">
                {['daily', 'weekly', 'monthly', 'yearly'].map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)} 
                        className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${timeframe === tf ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {tf}
                    </button>
                ))}
            </div>
            
            {/* Date Pickers */}
            <div className="mb-6 mx-2">
                {timeframe === 'daily' && <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClasses} />}
                {timeframe === 'weekly' && <input type="week" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClasses} />}
                {timeframe === 'monthly' && <input type="month" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClasses} />}
                {timeframe === 'yearly' && (
                    <select value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className={inputClasses}>
                        {yearOptions.map(year => (
                            <option key={year} value={year}>{year}</option>
                        ))}
                    </select>
                )}
            </div>
            
            {/* Summary Card */}
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 mb-8 mx-2 relative overflow-hidden transition-all">
                 <div className="relative z-10">
                    <p className="text-brand-100 text-xs font-bold uppercase tracking-wider mb-1">
                        Selected <span className="capitalize">{timeframe}</span> Earnings
                    </p>
                    <h2 className="text-4xl font-black">₹{total.toLocaleString()}</h2>
                    <div className="mt-4 flex gap-4">
                        <div className="bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                            <span className="text-[10px] text-brand-100 uppercase font-bold block">{t('trips') || 'Trips'}</span>
                            <span className="font-black text-lg">{filteredTrips.length}</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] text-white/10" dangerouslySetInnerHTML={{ __html: getIcon('barChart', 120) }} />
            </div>

            {/* List of Trips */}
            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 px-4 capitalize">Completed Trips</h3>
            <div className="space-y-3 px-2">
                {filteredTrips.length > 0 ? filteredTrips.map(trip => (
                    <div key={trip.id} className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400" dangerouslySetInnerHTML={{ __html: getIcon('check', 20) }} />
                            <div>
                                <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{trip.type}</h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{trip.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="block font-black text-slate-900 dark:text-white">₹{trip.amount}</span>
                            <span className="text-[10px] font-bold text-green-500 bg-green-50 dark:bg-green-900/20 px-1.5 py-0.5 rounded">{t('paid') || 'PAID'}</span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-10 text-slate-400 bg-white dark:bg-dark-surface rounded-3xl border border-slate-100 dark:border-slate-800">
                        <div dangerouslySetInnerHTML={{ __html: getIcon('clipboard', 40, 'mx-auto mb-3 opacity-50') }} />
                        <p className="font-bold text-slate-500">No trips found</p>
                        <p className="text-xs mt-1">Change the date above to view past earnings.</p>
                    </div>
                )}
            </div>
        </div>
    );
}