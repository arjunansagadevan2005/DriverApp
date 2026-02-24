import React, { useState, useEffect } from 'react';
import { supabase, ICONS } from '../config';

const getIcon = (name, size = 24, classes = '') => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}">${ICONS[name] || ''}</svg>`;
};

export default function EarningsSection({ t, regData }) {
    const [timeframe, setTimeframe] = useState('daily');
    const [selectedDate, setSelectedDate] = useState('');
    const [pastTrips, setPastTrips] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    // --- 1. SET THE CALENDAR DATE AUTOMATICALLY ---
    useEffect(() => {
        const today = new Date();
        if (timeframe === 'daily') {
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            const d = String(today.getDate()).padStart(2, '0');
            setSelectedDate(`${y}-${m}-${d}`); // Sets to e.g., 2026-02-24
        } else if (timeframe === 'weekly') {
            const date = new Date(today.getTime());
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
            const week1 = new Date(date.getFullYear(), 0, 4);
            const weekNumber = 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
            setSelectedDate(`${date.getFullYear()}-W${String(weekNumber).padStart(2, '0')}`);
        } else if (timeframe === 'monthly') {
            const y = today.getFullYear();
            const m = String(today.getMonth() + 1).padStart(2, '0');
            setSelectedDate(`${y}-${m}`);
        } else if (timeframe === 'yearly') {
            setSelectedDate(today.getFullYear().toString());
        }
    }, [timeframe]);

    // --- 2. FETCH ONLY SELECTED DATE FROM SUPABASE ---
    useEffect(() => {
        const fetchTrips = async () => {
            if (!regData?.mobile || !selectedDate) return;
            setIsLoading(true);

            let startDateStr, endDateStr;

            try {
                // Determine exact start and end times for the selected calendar date
                if (timeframe === 'daily') {
                    const start = new Date(`${selectedDate}T00:00:00`);
                    const end = new Date(`${selectedDate}T23:59:59.999`);
                    startDateStr = start.toISOString();
                    endDateStr = end.toISOString();
                } 
                else if (timeframe === 'weekly') {
                    const [yearStr, weekStr] = selectedDate.split('-W');
                    if (yearStr && weekStr) {
                        const simple = new Date(yearStr, 0, 1 + (parseInt(weekStr) - 1) * 7);
                        const dow = simple.getDay();
                        const start = simple;
                        if (dow <= 4) start.setDate(simple.getDate() - simple.getDay() + 1);
                        else start.setDate(simple.getDate() + 8 - simple.getDay());
                        start.setHours(0, 0, 0, 0);
                        
                        const end = new Date(start);
                        end.setDate(start.getDate() + 6);
                        end.setHours(23, 59, 59, 999);

                        startDateStr = start.toISOString();
                        endDateStr = end.toISOString();
                    }
                } 
                else if (timeframe === 'monthly') {
                    const [year, month] = selectedDate.split('-');
                    const start = new Date(year, parseInt(month) - 1, 1, 0, 0, 0);
                    const end = new Date(year, parseInt(month), 0, 23, 59, 59, 999);
                    startDateStr = start.toISOString();
                    endDateStr = end.toISOString();
                } 
                else if (timeframe === 'yearly') {
                    const start = new Date(selectedDate, 0, 1, 0, 0, 0);
                    const end = new Date(selectedDate, 11, 31, 23, 59, 59, 999);
                    startDateStr = start.toISOString();
                    endDateStr = end.toISOString();
                }

                // Query Supabase directly with the exact date bounds
                let query = supabase
                    .from('orders')
                    .select('*')
                    .eq('driver_number', regData.mobile)
                    .ilike('status', 'Completed');

                if (startDateStr && endDateStr) {
                    query = query.gte('created_at', startDateStr).lte('created_at', endDateStr);
                }

                const { data, error } = await query.order('created_at', { ascending: false });

                if (data && !error) {
                    const formattedTrips = data.map(order => ({
                        id: order.id,
                        type: order.product_name || order.type || 'Delivery',
                        amount: order.delivery_fee || order.total_amount || 0,
                        date: new Date(order.created_at).toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
                    }));
                    setPastTrips(formattedTrips); // Displays exactly what the database sends back
                } else {
                    setPastTrips([]);
                }
            } catch (err) {
                console.error('Date parsing error', err);
                setPastTrips([]);
            }

            setIsLoading(false);
        };

        fetchTrips();
    }, [timeframe, selectedDate, regData?.mobile]); // Triggers instantly when you change the date picker

    // Calculate total purely based on the fetched trips
    const total = pastTrips.reduce((acc, curr) => acc + Number(curr.amount), 0);
    const inputClasses = "w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-xl py-3 px-4 text-sm font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:border-brand-500 transition-colors cursor-pointer shadow-sm";

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => currentYear - i);

    return (
        <div className="fade-in pt-4 pb-8 px-2">
            <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white px-2">{t('earnings_history') || 'Earnings History'}</h2>
            
            <div className="flex gap-2 mb-4 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl mx-2">
                {['daily', 'weekly', 'monthly', 'yearly'].map(tf => (
                    <button key={tf} onClick={() => setTimeframe(tf)} 
                        className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize transition-all ${timeframe === tf ? 'bg-white dark:bg-slate-600 text-brand-600 dark:text-brand-400 shadow-sm' : 'text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                        {tf}
                    </button>
                ))}
            </div>
            
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
            
            <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-3xl p-6 text-white shadow-xl shadow-brand-500/20 mb-8 mx-2 relative overflow-hidden transition-all">
                 <div className="relative z-10">
                    <p className="text-brand-100 text-xs font-bold uppercase tracking-wider mb-1">
                        Selected <span className="capitalize">{timeframe}</span> Earnings
                    </p>
                    <h2 className="text-4xl font-black">₹{total.toLocaleString()}</h2>
                    <div className="mt-4 flex gap-4">
                        <div className="bg-white/10 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                            <span className="text-[10px] text-brand-100 uppercase font-bold block">{t('trips') || 'Trips'}</span>
                            <span className="font-black text-lg">{pastTrips.length}</span>
                        </div>
                    </div>
                </div>
                <div className="absolute right-[-20px] bottom-[-20px] text-white/10" dangerouslySetInnerHTML={{ __html: getIcon('barChart', 120) }} />
            </div>

            <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 px-4 capitalize">Completed Trips</h3>
            <div className="space-y-3 px-2">
                {isLoading ? (
                    <div className="text-center py-10 text-brand-600 dark:text-brand-400">
                        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-brand-600 rounded-full"></div>
                        <p className="mt-2 font-bold">Loading trips...</p>
                    </div>
                ) : pastTrips.length > 0 ? pastTrips.map(trip => (
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
                        <p className="font-bold text-slate-500">No trips found for {selectedDate}</p>
                        <p className="text-xs mt-1">Try selecting a different date from the calendar above.</p>
                    </div>
                )}
            </div>
        </div>
    );
}