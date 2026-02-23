import React, { useState, useEffect } from 'react';
import { supabase, ICONS } from '../config';

// Helper to pull icons safely from config
const getIcon = (name, size = 24, classes = '') => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}">${ICONS[name] || ''}</svg>`;
};

export default function ProfileSection({ t, setView, regData = {} }) {
    const [activeModal, setActiveModal] = useState(null);
    const [isVoiceOn, setIsVoiceOn] = useState(true);
    const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
    
    // Performance Tab State
    const [perfPeriod, setPerfPeriod] = useState('daily');

    const [leaderboard, setLeaderboard] = useState([]);

    // Notification Toggles State
    const [notifSettings, setNotifSettings] = useState({
        newOrders: true, earnings: true, promotions: true, updates: true
    });

    // 🔥 1. STATE FOR LIVE SUPABASE DATA
    const [dbData, setDbData] = useState({ 
        todayOrders: 0, 
        todayEarnings: 0, 
        weeklyOrders: 0, 
        walletBalance: 0,
        referrals: 0,
        referralCode: "PENDING",
        fullName: "Partner",
        driverId: "PENDING",
        bankAccount: "",
        ifscCode: "",
        vehicleType: "",
        vehicleNumber: ""
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!regData?.mobile) return;

            // Fetch My Profile
            const { data, error } = await supabase
                .from('driver_details') 
                .select('*')
                .eq('mobile', regData.mobile)
                .single();

            // 🔥 NEW: Fetch Leaderboard (Top 5 Drivers by Today's Earnings)
            const { data: topDriversData } = await supabase
                .from('driver_details')
                .select('full_name, mobile, today_earnings, today_orders')
                .order('today_earnings', { ascending: false })
                .limit(5);

            if (data && !error) {
                setDbData(prev => ({
                    todayOrders: data.today_orders ?? data.todayOrders ?? 0,
                    todayEarnings: data.today_earnings ?? data.todayEarnings ?? 0,
                    weeklyOrders: data.weekly_orders ?? data.weeklyOrders ?? 0,
                    walletBalance: data.wallet_balance ?? data.walletBalance ?? 0,
                    referrals: data.referrals ?? 0,
                    referralCode: data.referral_code ?? data.referralCode ?? "NONE",
                    fullName: data.full_name ?? data.fullName ?? prev.fullName,
                    driverId: data.driver_id ?? data.driverId ?? prev.driverId,
                    bankAccount: data.bank_account ?? data.bankAccount ?? prev.bankAccount,
                    ifscCode: data.ifsc_code ?? data.ifscCode ?? prev.ifscCode,
                    vehicleType: data.vehicle_type ?? data.vehicleType ?? prev.vehicleType,
                    vehicleNumber: data.vehicle_number ?? data.vehicleNumber ?? prev.vehicleNumber,
                    vehicleWeight: data.vehicle_weight ?? data.vehicleWeight ?? prev.vehicleWeight
                }));
            }

            // 🔥 NEW: Format Leaderboard Data
            if (topDriversData) {
                const formattedLeaderboard = topDriversData.map((d, index) => ({
                    name: d.mobile === regData.mobile ? 'You' : (d.full_name || 'Partner'),
                    earnings: d.today_earnings || 0,
                    trips: d.today_orders || 0,
                    rank: index + 1,
                    isMe: d.mobile === regData.mobile
                }));
                setLeaderboard(formattedLeaderboard);
            }
        };

        fetchProfileData();
    }, [regData]);

    // 🔥 2. FETCH ORIGINAL DETAILS FROM SUPABASE
    // 🔥 2. FETCH ORIGINAL DETAILS FROM SUPABASE
    useEffect(() => {
        const fetchProfileData = async () => {
            if (!regData?.mobile) return;

            // We use '*' to grab everything safely without crashing if a stats column is missing
            const { data, error } = await supabase
                .from('driver_details') 
                .select('*')
                .eq('mobile_number', regData.mobile) // 🔥 FIX 1: Matches your DB 'mobile_number'
                .single();

            if (data && !error) {
                setDbData({
                    // 🔥 FIX 2: Map exact DB column names to the React state
                    fullName: data.full_name || "Partner",
                    driverId: data.driver_id || "PENDING",
                    bankAccount: data.bank_account_number || "", // Exact match to your DB
                    ifscCode: data.ifsc_code || "",
                    vehicleType: data.vehicle_type || "Not Set",
                    vehicleNumber: data.vehicle_number || "N/A",
                    
                    // Stats (Defaults to 0 if you haven't added these columns to your table yet)
                    todayOrders: data.today_orders || 0,
                    todayEarnings: data.today_earnings || 0,
                    weeklyOrders: data.weekly_orders || 0,
                    walletBalance: data.wallet_balance || 0,
                    referrals: data.referrals || 0,
                    referralCode: data.referral_code || "NONE"
                });
            } else if (error) {
                console.error("Error fetching driver details:", error.message);
            }
        };

        fetchProfileData();
    }, [regData?.mobile]);

    const achievements = [
        { id: 1, name: 'First Delivery', desc: 'Complete your first order', unlocked: true, icon: 'package' },
        { id: 2, name: 'Speed Demon', desc: 'Complete 5 orders in a day', unlocked: true, icon: 'truck' },
        { id: 3, name: 'Week Warrior', desc: 'Complete 20 orders in a week', unlocked: true, icon: 'trophy' },
        { id: 4, name: '5-Star Rating', desc: 'Maintain 5.0 rating for a week', unlocked: false, icon: 'star' },
        { id: 5, name: 'Early Bird', desc: 'Complete 10 morning deliveries', unlocked: false, icon: 'sun' },
        { id: 6, name: 'Night Owl', desc: 'Complete 10 night deliveries', unlocked: false, icon: 'moon' }
    ];

    // Derived Prime Logic State
    const isPrime = dbData.weeklyOrders >= 60;
    const progressPercent = Math.min(100, (dbData.weeklyOrders / 60) * 100);
    const ordersNeeded = Math.max(0, 60 - dbData.weeklyOrders);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        if (setView) setView('welcome');
    };

    const showToast = (msg) => alert(msg);

    // --- EXACT MODALS FROM YOUR HTML ---
    const renderModal = () => {
        if (!activeModal) return null;

        let content = null;

        if (activeModal === 'docs') {
            const renderDoc = (name, file) => `
                <div class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                    <div class="flex items-center gap-3">
                        <div class="${file ? 'text-green-500' : 'text-slate-300'}">${getIcon('check', 18)}</div>
                        <div>
                            <p class="font-bold text-sm dark:text-white">${name}</p>
                            <p class="text-xs text-slate-400">${file ? 'Uploaded' : 'Pending Upload'}</p>
                        </div>
                    </div>
                    <span class="px-2 py-1 ${file ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500'} text-[10px] font-bold rounded uppercase">${file ? 'Active' : 'Missing'}</span>
                </div>
            `;
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white">{t('documents')}</h2>
                    <div className="space-y-3" dangerouslySetInnerHTML={{ __html: 
                        renderDoc(t('driving_license'), regData.licenseFile) +
                        renderDoc(t('rc_book'), regData.rcFile) +
                        renderDoc(t('insurance'), regData.insuranceFile) +
                        renderDoc(t('aadhaar'), regData.aadhaarFile)
                    }}></div>
                </div>
            );
        } 
        else if (activeModal === 'bank') {
            const hasAccountDetails = dbData.bankAccount && dbData.ifscCode;
            const safeBankAccount = dbData.bankAccount ? String(dbData.bankAccount) : '000000000000';
            const safeIfsc = dbData.ifscCode ? String(dbData.ifscCode) : 'PENDING';

            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('card', 24, 'text-brand-600 dark:text-brand-400') }} /> {t('bank_acct')}
                    </h2>
                    
                    {hasAccountDetails ? (
                        <>
                            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg mb-4 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white opacity-5 rounded-full -ml-12 -mb-12"></div>
                                <div className="relative z-10">
                                    <div className="flex justify-between items-start mb-8">
                                        <span className="text-xs font-mono opacity-50 tracking-wider">BANK ACCOUNT</span>
                                        <span dangerouslySetInnerHTML={{ __html: getIcon('card', 28, 'opacity-75') }} />
                                    </div>
                                    <div className="font-mono text-2xl tracking-widest mb-6 font-bold">
                                        {safeBankAccount.replace(/(\d{4})/g, '$1 ').trim()}
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <div className="text-xs opacity-50 mb-1">ACCOUNT HOLDER</div>
                                            <div className="font-semibold text-sm">{dbData.fullName.toUpperCase()}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs opacity-50 mb-1">IFSC CODE</div>
                                            <div className="font-semibold text-sm">{safeIfsc.toUpperCase()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 mb-4 space-y-4">
                                <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Account Details</h3>
                                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center text-brand-600 dark:text-brand-400" dangerouslySetInnerHTML={{ __html: getIcon('hash', 16) }} />
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">Account Number</div>
                                            <div className="font-mono font-semibold text-slate-900 dark:text-white">{safeBankAccount}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-700">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400" dangerouslySetInnerHTML={{ __html: getIcon('code', 16) }} />
                                        <div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">IFSC Code</div>
                                            <div className="font-mono font-semibold text-slate-900 dark:text-white">{safeIfsc.toUpperCase()}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-800">
                                <div className="w-10 h-10 rounded-full bg-green-600 dark:bg-green-500 flex items-center justify-center text-white flex-shrink-0" dangerouslySetInnerHTML={{ __html: getIcon('check', 20) }} />
                                <div className="flex-1">
                                    <div className="font-bold text-sm">Verified for Payouts</div>
                                    <div className="text-xs opacity-75">Your account is ready to receive payments</div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400" dangerouslySetInnerHTML={{ __html: getIcon('card', 40) }} />
                            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300 mb-2">No Bank Account Linked</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Please contact support to add your bank details</p>
                        </div>
                    )}
                </div>
            );
        }
        else if (activeModal === 'achievements') {
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('trophy', 24, 'text-purple-600') }} /> {t('achievements')}
                    </h2>
                    <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                        {achievements.map(ach => (
                            <div key={ach.id} className={`p-4 rounded-2xl border-2 ${ach.unlocked ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800' : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700'} flex items-center gap-4`}>
                                <div className={`w-12 h-12 rounded-full ${ach.unlocked ? 'bg-purple-600' : 'bg-slate-300 dark:bg-slate-700'} flex items-center justify-center text-white`} dangerouslySetInnerHTML={{ __html: getIcon(ach.icon, 24) }} />
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{ach.name}</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{ach.desc}</p>
                                </div>
                                <div className={`text-xs font-bold px-2 py-1 rounded ${ach.unlocked ? 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30' : 'text-slate-400 bg-slate-100 dark:bg-slate-700'}`}>
                                    {ach.unlocked ? t('unlocked') : t('locked')}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        else if (activeModal === 'referral') {
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('gift', 24, 'text-amber-600') }} /> {t('referral_program')}
                    </h2>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800 mb-4">
                        <p className="text-sm text-amber-700 dark:text-amber-400 mb-2 font-semibold">{t('your_code')}</p>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-2xl font-black text-amber-600 dark:text-amber-400 text-center">
                                {dbData.referralCode}
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText(dbData.referralCode); showToast('Copied!'); }} className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:scale-95 transition-transform" dangerouslySetInnerHTML={{ __html: getIcon('copy', 20) }} />
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400">{t('share_code')}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('total_referrals')}</p>
                            <p className="text-2xl font-black text-slate-900 dark:text-white">{dbData.referrals}</p>
                        </div>
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{t('referral_earnings')}</p>
                            <p className="text-2xl font-black text-green-600 dark:text-green-400">₹{dbData.referrals * 500}</p>
                        </div>
                    </div>
                    <button onClick={() => showToast('Sharing...')} className="w-full py-4 bg-amber-600 text-white rounded-xl font-bold flex items-center justify-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('share2', 18) }} /> {t('share')}
                    </button>
                </div>
            );
        }
        else if (activeModal === 'performance') {
            content = (
                <div>
                    <h2 className="text-2xl font-bold mb-5 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('trendingUp', 28, 'text-brand-600') }} /> Performance
                    </h2>
                    <div className="flex gap-3 mb-5">
                        {['daily', 'monthly', 'yearly'].map(p => (
                            <button key={p} onClick={() => setPerfPeriod(p)} className={`flex-1 py-3 rounded-xl font-semibold transition-all border-2 ${perfPeriod === p ? 'bg-gradient-to-br from-cyan-500 to-cyan-600 text-white border-transparent shadow-lg shadow-cyan-500/40' : 'bg-transparent text-slate-500 border-slate-300 dark:border-slate-600'}`}>
                                <span className="capitalize">{p}</span>
                            </button>
                        ))}
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 mb-5">
                        <div className="rounded-2xl p-4 border border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
                            <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">Acceptance</p>
                            <p className="text-xl font-black text-blue-900 dark:text-blue-300">92%</p>
                        </div>
                        <div className="rounded-2xl p-4 border border-green-200 bg-green-50 dark:bg-green-900/20 dark:border-green-800">
                            <p className="text-xs font-semibold text-green-700 dark:text-green-400 mb-1">Earnings</p>
                            <p className="text-xl font-black text-green-900 dark:text-green-300">₹{dbData.todayEarnings}</p>
                        </div>
                        <div className="rounded-2xl p-4 border border-purple-200 bg-purple-50 dark:bg-purple-900/20 dark:border-purple-800">
                            <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-1">Trips</p>
                            <p className="text-xl font-black text-purple-900 dark:text-purple-300">{dbData.todayOrders}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 mb-5 h-64 flex flex-col justify-center items-center text-center">
                         <span dangerouslySetInnerHTML={{ __html: getIcon('barChart', 48, 'text-slate-300 dark:text-slate-600 mb-2') }} />
                         <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Dynamic <span className="capitalize text-brand-600">{perfPeriod}</span> Chart Area</p>
                         <p className="text-xs text-slate-400 mt-1">Ready for Chart.js rendering</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 border border-amber-200 dark:border-amber-800">
                            <p className="text-[10px] text-amber-700 dark:text-amber-400 mb-1 font-bold uppercase">Avg/Trip</p>
                            <p className="text-lg font-black text-amber-800 dark:text-amber-300">
                                {/* 🔥 Dynamically calculates real average based on earnings & trips */}
                                ₹{dbData.todayOrders > 0 ? (dbData.todayEarnings / dbData.todayOrders).toFixed(0) : 0}
                            </p>
                        </div>
                        <div className="bg-rose-50 dark:bg-rose-900/20 rounded-xl p-3 border border-rose-200 dark:border-rose-800">
                            <p className="text-[10px] text-rose-700 dark:text-rose-400 mb-1 font-bold uppercase">Distance</p>
                            <p className="text-lg font-black text-rose-800 dark:text-rose-300">
                                {/* Dynamic placeholder based on trips */}
                                {dbData.todayOrders * 4}km
                            </p>
                        </div>
                        <div className="bg-sky-50 dark:bg-sky-900/20 rounded-xl p-3 border border-sky-200 dark:border-sky-800">
                            <p className="text-[10px] text-sky-700 dark:text-sky-400 mb-1 font-bold uppercase">Hours</p>
                            <p className="text-lg font-black text-sky-800 dark:text-sky-300">
                                {/* Dynamic placeholder based on trips */}
                                {(dbData.todayOrders * 0.5).toFixed(1)}hrs
                            </p>
                        </div>
                    </div>
                </div>
            );
        }
        else if (activeModal === 'leaderboard') {
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('award', 24, 'text-yellow-600') }} /> {t('leaderboard')}
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                        {/* 🔥 USING REAL DB LEADERBOARD NOW */}
                        {leaderboard.length > 0 ? leaderboard.map(driver => (
                            <div key={driver.rank} className={`p-4 rounded-xl ${driver.isMe ? 'bg-brand-50 dark:bg-brand-900/20 border-2 border-brand-500' : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'} flex items-center gap-3`}>
                                <div className={`w-10 h-10 rounded-full ${driver.rank <= 3 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'} flex items-center justify-center font-black`}>
                                    {driver.rank <= 3 ? <span dangerouslySetInnerHTML={{ __html: getIcon('trophy', 20) }} /> : driver.rank}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white">{driver.name}</h3>
                                    <p className="text-xs text-slate-600 dark:text-slate-400">{driver.trips} trips • ₹{driver.earnings}</p>
                                </div>
                                <div className="text-sm font-bold text-slate-500 dark:text-slate-400">#{driver.rank}</div>
                            </div>
                        )) : (
                            <p className="text-center text-slate-500 py-10">Loading Leaderboard...</p>
                        )}
                    </div>
                </div>
            );
        }

        else if (activeModal === 'notifications') {
            const toggleKey = (k) => setNotifSettings(prev => ({...prev, [k]: !prev[k]}));
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('bell', 24, 'text-brand-600') }} /> {t('notification_settings')}
                    </h2>
                    <div className="space-y-3">
                        {Object.keys(notifSettings).map(key => (
                            <div key={key} className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                                <span className="font-semibold text-slate-900 dark:text-white capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                <div onClick={() => toggleKey(key)} className={`w-12 h-6 ${notifSettings[key] ? 'bg-brand-500' : 'bg-slate-300 dark:bg-slate-700'} rounded-full relative transition-colors cursor-pointer`}>
                                    <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${notifSettings[key] ? 'translate-x-6' : ''}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        }
        else if (activeModal === 'support') {
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('helpCircle', 24, 'text-green-600') }} /> {t('support')}
                    </h2>
                    <div className="space-y-3">
                        <button className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="font-semibold text-slate-900 dark:text-white">{t('faq')}</span>
                            <span dangerouslySetInnerHTML={{ __html: getIcon('arrowRight', 18, 'text-slate-400') }} />
                        </button>
                        <button className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="font-semibold text-slate-900 dark:text-white">{t('contact_support')}</span>
                            <span dangerouslySetInnerHTML={{ __html: getIcon('arrowRight', 18, 'text-slate-400') }} />
                        </button>
                        <button className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="font-semibold text-slate-900 dark:text-white">{t('help_center')}</span>
                            <span dangerouslySetInnerHTML={{ __html: getIcon('arrowRight', 18, 'text-slate-400') }} />
                        </button>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-200 dark:border-green-800">
                            <p className="text-sm text-green-700 dark:text-green-400 mb-2 font-semibold">24/7 Support Available</p>
                            <a href="tel:+911800123456" className="text-2xl font-black text-green-600 dark:text-green-400">1800-123-456</a>
                        </div>
                    </div>
                </div>
            );
        }
        else if (activeModal === 'emergency') {
            content = (
                <div className="text-center">
                    <h2 className="text-xl font-bold mb-4 text-red-600 flex items-center justify-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('alertCircle', 24, 'text-red-600') }} /> {t('emergency')} SOS
                    </h2>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800 mb-4 text-center">
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">{t('emergency_help')}</p>
                        <button onClick={() => { showToast('Alerting emergency contacts!'); setActiveModal(null); }} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-lg flex items-center justify-center gap-2 active:scale-95 transition-transform">
                            <span dangerouslySetInnerHTML={{ __html: getIcon('phone', 24) }} /> TRIGGER SOS
                        </button>
                    </div>
                    <div className="space-y-2">
                        <a href="tel:112" className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">📞 Police (112)</a>
                        <a href="tel:102" className="block p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white">🚑 Ambulance (102)</a>
                    </div>
                </div>
            );
        }
        else if (activeModal === 'vehicle') {
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('truck', 24, 'text-brand-600') }} /> {t('vehicle_info')}
                    </h2>
                    <div className="space-y-4">
                        <div className="bg-gradient-to-br from-brand-50 to-blue-50 dark:from-brand-900/20 dark:to-blue-900/20 rounded-2xl p-5 border-2 border-brand-200 dark:border-brand-800">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-brand-600 flex items-center justify-center text-white" dangerouslySetInnerHTML={{ __html: getIcon('truck', 24) }} />
                                <div>
                                    <p className="text-xs text-brand-700 dark:text-brand-400 font-semibold uppercase">Vehicle Type</p>
                                    <p className="text-lg font-black text-brand-900 dark:text-brand-300 capitalize">{dbData.vehicleType}</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-3">
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Vehicle Number</p>
                                <p className="text-base font-black text-slate-900 dark:text-white uppercase">{dbData.vehicleNumber}</p>
                            </div>
                            <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1 font-semibold">Weight Limit</p>
                                <p className="text-base font-black text-slate-900 dark:text-white">Standard</p>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-semibold">Vehicle Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                <p className="text-sm font-bold text-green-600 dark:text-green-400">Active & Ready</p>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="fixed inset-0 z-[100] flex flex-col justify-end">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setActiveModal(null)}></div>
                <div className="relative bg-white dark:bg-dark-surface rounded-t-3xl p-6 slide-up max-h-[85vh] overflow-y-auto pb-safe shadow-2xl">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
                    {content}
                    <button onClick={() => setActiveModal(null)} className="w-full mt-6 py-4 bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg active:scale-95 transition-all">Close</button>
                </div>
            </div>
        );
    };

    return (
        <div className="fade-in pt-4 pb-20 px-6">
            {/* 1. Profile Header */}
            <div className="flex items-center gap-4 mb-8">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600 shadow-md">
                        {regData.facePhoto 
                            ? <img src={regData.facePhoto} className="w-full h-full object-cover" alt="Profile" /> 
                            : <span dangerouslySetInnerHTML={{ __html: getIcon('user', 40, 'text-slate-400') }} />
                        }
                    </div>
                    <label className="absolute bottom-0 right-0 bg-slate-800 text-white p-1.5 rounded-full shadow-lg cursor-pointer hover:scale-110 transition-transform">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('camera', 12) }} />
                        <input type="file" accept="image/*" className="hidden" />
                    </label>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{dbData.fullName}</h2>
                        {isPrime && (
                            <div className="crown-shine inline-block text-amber-500" dangerouslySetInnerHTML={{ __html: getIcon('crown', 20) }} />
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('star', 14, 'fill-current') }} /> 4.9 Rating
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Driver ID: #{dbData.driverId}</p>
                </div>
            </div>

            {/* 2. Today's Stats Cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('barChart', 16, 'text-blue-600 dark:text-blue-400') }} />
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">{t('today_stats')}</span>
                    </div>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{dbData.todayOrders}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">{t('trips')}</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('wallet', 16, 'text-green-600 dark:text-green-400') }} />
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">{t('todays_earnings')}</span>
                    </div>
                    <p className="text-2xl font-black text-green-700 dark:text-green-300">₹{dbData.todayEarnings}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Earnings</p>
                </div>
            </div>

            {/* 3. Prime Partner Progress */}
            <div className={`mb-6 rounded-3xl p-5 border-2 shadow-lg ${isPrime ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-amber-800/30 border-amber-300 dark:border-amber-600 prime-glow' : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-300 dark:border-slate-600'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPrime ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`} dangerouslySetInnerHTML={{ __html: getIcon('crown', 24) }} />
                        <div>
                            <h3 className={`font-black text-base ${isPrime ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>{isPrime ? 'Prime Partner' : 'Normal Partner'}</h3>
                            <p className={`text-xs font-semibold ${isPrime ? 'text-amber-600 dark:text-amber-500' : 'text-slate-500 dark:text-slate-400'}`}>{dbData.weeklyOrders} orders this week</p>
                        </div>
                    </div>
                    {isPrime ? (
                        <div className="relative overflow-hidden px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold text-xs">
                            <div className="prime-shimmer absolute inset-0"></div>
                            <span className="relative z-10">PRIME</span>
                        </div>
                    ) : (
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Progress</p>
                            <p className={`text-lg font-black ${progressPercent >= 50 ? 'text-amber-600' : 'text-slate-600'} dark:text-slate-300`}>{Math.round(progressPercent)}%</p>
                        </div>
                    )}
                </div>
                
                <div className="relative h-3 bg-white/50 dark:bg-slate-900/30 rounded-full overflow-hidden mb-2 border border-amber-200/50 dark:border-amber-700/50">
                    <div className={`absolute top-0 left-0 h-full rounded-full progress-bar-animated ${isPrime ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500' : 'bg-gradient-to-r from-slate-400 to-slate-500'}`} style={{ width: `${progressPercent}%` }}>
                        {isPrime && <div className="prime-shimmer absolute inset-0"></div>}
                    </div>
                </div>
                
                {isPrime ? (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('check', 16) }} />
                        <p className="text-sm font-bold">Congratulations! You're a Prime Partner! Enjoy exclusive benefits.</p>
                    </div>
                ) : (
                    <p className={`text-sm font-semibold ${progressPercent >= 50 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>
                        {ordersNeeded} more {ordersNeeded === 1 ? 'order' : 'orders'} to become a Prime Partner! 
                    </p>
                )}
            </div>

            {/* Achievements & Referral Preview Buttons */}
            <button onClick={() => setActiveModal('achievements')} className="w-full mb-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-800 active:scale-95 transition-transform">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('trophy', 20, 'text-purple-600 dark:text-purple-400') }} />
                        <div className="text-left">
                            <p className="font-bold text-slate-900 dark:text-white">{t('achievements')}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{achievements.filter(a => a.unlocked).length}/{achievements.length} {t('unlocked')}</p>
                        </div>
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: getIcon('arrowRight', 18, 'text-purple-600 dark:text-purple-400') }} />
                </div>
            </button>

            <button onClick={() => setActiveModal('referral')} className="w-full mb-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-4 border-2 border-amber-200 dark:border-amber-800 active:scale-95 transition-transform">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('gift', 20, 'text-amber-600 dark:text-amber-400') }} />
                        <div className="text-left">
                            <p className="font-bold text-slate-900 dark:text-white">Refer & Earn</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">{dbData.referrals} referrals • ₹{dbData.referrals * 500} earned</p>
                        </div>
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: getIcon('arrowRight', 18, 'text-amber-600 dark:text-amber-400') }} />
                </div>
            </button>

            {/* Toggles */}
            <button onClick={() => setIsVoiceOn(!isVoiceOn)} className={`w-full mb-3 py-3.5 rounded-2xl font-bold border-2 ${isVoiceOn ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'} hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between px-6 active:scale-95 transition-all`}>
                <span className="flex items-center gap-3">
                    <span dangerouslySetInnerHTML={{ __html: getIcon(isVoiceOn ? 'volumeUp' : 'volumeOff', 18) }} /> Voice Narration
                </span>
                <div className={`w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full relative transition-colors ${isVoiceOn ? '!bg-brand-500' : ''}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isVoiceOn ? 'translate-x-5' : ''}`}></div>
                </div>
            </button>

            {/* Wallet Summary Button */}
            <button onClick={() => setView && setView('wallet')} className="w-full mb-6 bg-slate-900 dark:bg-slate-800 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg active:scale-95 transition-transform mt-3">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: getIcon('wallet', 20) }} />
                    <div className="text-left">
                        <p className="text-xs text-slate-400 font-bold uppercase">{t('wallet_bal')}</p>
                        <p className="font-black text-xl">₹{dbData.walletBalance}</p>
                    </div>
                </div>
                <div className="bg-brand-600 px-3 py-1.5 rounded-lg text-xs font-bold">View</div>
            </button>

            {/* Main Action List */}
            <div className="space-y-3">
                <button onClick={() => setActiveModal('performance')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('trendingUp', 18) }} /> Performance
                </button>
                <button onClick={() => setActiveModal('leaderboard')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('award', 18) }} /> Leaderboard
                </button>
                <button onClick={() => setActiveModal('notifications')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('bell', 18) }} /> Notifications
                </button>
                <button onClick={() => setActiveModal('vehicle')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('truck', 18) }} /> {t('vehicle_info')}
                </button>
                <button onClick={() => setActiveModal('docs')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('file', 18) }} /> Documents
                </button>
                <button onClick={() => setActiveModal('bank')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('card', 18) }} /> {t('bank_acct')}
                </button>
                <button onClick={() => setActiveModal('support')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('helpCircle', 18) }} /> {t('support')}
                </button>
                <button onClick={() => setActiveModal('emergency')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('alertCircle', 18) }} /> Emergency SOS
                </button>
                <button onClick={handleLogout} className="w-full py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-8 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('logout', 18) }} /> Sign Out
                </button>
            </div>

            {/* Render the active Modal on top */}
            {renderModal()}
        </div>
    );
}