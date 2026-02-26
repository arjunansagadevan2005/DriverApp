import React, { useState, useEffect } from 'react';
import { supabase, ICONS } from '../config';

const getIcon = (name, size = 24, classes = '') => {
    const iconPath = ICONS[name] || ICONS['star'] || '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}">${iconPath}</svg>`;
};

export default function ProfileSection({ t, setView, regData = {} }) {
    const [activeModal, setActiveModal] = useState(null);
    const [isVoiceOn, setIsVoiceOn] = useState(true);
    const [fetchError, setFetchError] = useState(""); 
    
    // Performance Tab State
    const [perfPeriod, setPerfPeriod] = useState('daily');
    const [leaderboard, setLeaderboard] = useState([]);

    // Notification Toggles State
    const [notifSettings, setNotifSettings] = useState({
        newOrders: true, earnings: true, promotions: true, updates: true
    });

    const [dbData, setDbData] = useState({ 
        todayOrders: 0, todayEarnings: 0, weeklyOrders: 0, walletBalance: 0,
        referrals: 0, referralCode: "PENDING", fullName: "Partner", driverId: "PENDING",
        bankAccount: "", ifscCode: "", vehicleType: "Not Set", vehicleNumber: "N/A",
        avatarUrl: null // 🔥 FIXED: Added avatarUrl to properly fetch image!
    });

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!regData?.mobile) {
                setFetchError("Please log in again. Mobile number is missing.");
                return;
            }

            let safeMobile = String(regData.mobile).replace(/\D/g, '');
            if (safeMobile.length > 10) safeMobile = safeMobile.slice(-10); 

            try {
                const { data, error } = await supabase.from('driver_details').select('*').eq('mobile_number', safeMobile).limit(1);

                if (error) setFetchError(error.message);
                else if (data && data.length > 0) {
                    const row = data[0]; 
                    setFetchError(""); 
                    setDbData({
                        todayOrders: Number(row.total_orders_completed) || 0, 
                        todayEarnings: Number(row.total_earnings) || 0,
                        weeklyOrders: Number(row.weekly_orders_completed) || 0, 
                        walletBalance: Number(row.wallet_balance) || 0,
                        referrals: Number(row.referrals) || 0,
                        referralCode: row.referral_code || "NONE",
                        fullName: row.full_name || "Partner",
                        driverId: row.driver_id || "PENDING",
                        bankAccount: row.bank_account_number || "", 
                        ifscCode: row.ifsc_code || "",
                        vehicleType: row.vehicle_type || "Not Set",
                        vehicleNumber: row.vehicle_number || "N/A",
                        avatarUrl: row.avatar_url || null // 🔥 Database Avatar URL!
                    });
                }

                // Fetch Leaderboard
                const { data: topDriversData } = await supabase
                    .from('driver_details')
                    .select('full_name, mobile_number, weekly_earnings, weekly_orders_completed') 
                    .order('weekly_earnings', { ascending: false, nullsFirst: false }) 
                    .limit(10); 

                if (topDriversData) {
                    setLeaderboard(topDriversData.map((d, index) => ({
                        name: d.mobile_number === safeMobile ? (t && t('you') ? t('you') : 'You') : (d.full_name || 'Partner'),
                        earnings: Number(d.weekly_earnings) || 0, 
                        trips: Number(d.weekly_orders_completed) || 0, 
                        rank: index + 1,
                        isMe: d.mobile_number === safeMobile
                    })));
                }
            } catch (err) {
                setFetchError("Network error. Please check VPN.");
            }
        };

        fetchProfileData();

        // REAL-TIME DB SYNC (Updates Profile automatically when order finishes)
        let driverSub;
        if (regData?.mobile) {
            let safeMobile = String(regData.mobile).replace(/\D/g, '');
            if (safeMobile.length > 10) safeMobile = safeMobile.slice(-10);

            driverSub = supabase.channel('profile_updates')
                .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'driver_details', filter: `mobile_number=eq.${safeMobile}` }, (payload) => {
                    const row = payload.new;
                    setDbData(prev => ({
                        ...prev,
                        todayOrders: Number(row.total_orders_completed) || prev.todayOrders,
                        todayEarnings: Number(row.total_earnings) || prev.todayEarnings,
                        weeklyOrders: Number(row.weekly_orders_completed) || prev.weeklyOrders,
                        walletBalance: Number(row.wallet_balance) || prev.walletBalance
                    }));
                }).subscribe();
        }
        return () => { if (driverSub) supabase.removeChannel(driverSub); };

    }, [regData?.mobile, t]);

    const ranks = [
        { id: 1, name: 'Trainee', threshold: 0, icon: 'user', colorBg: 'bg-slate-100 dark:bg-slate-800', colorText: 'text-slate-600 dark:text-slate-400' },
        { id: 2, name: 'Second Officer', threshold: 16, icon: 'award', colorBg: 'bg-cyan-100 dark:bg-cyan-900/30', colorText: 'text-cyan-700 dark:text-cyan-500' },
        { id: 3, name: 'Junior First Officer', threshold: 18, icon: 'award', colorBg: 'bg-blue-100 dark:bg-blue-900/30', colorText: 'text-blue-700 dark:text-blue-500' },
        { id: 4, name: 'First Officer', threshold: 20, icon: 'star', colorBg: 'bg-indigo-100 dark:bg-indigo-900/30', colorText: 'text-indigo-700 dark:text-indigo-500' },
        { id: 5, name: 'Captain', threshold: 22, icon: 'trophy', colorBg: 'bg-purple-100 dark:bg-purple-900/30', colorText: 'text-purple-700 dark:text-purple-500' },
        { id: 6, name: 'Flight Captain', threshold: 24, icon: 'crown', colorBg: 'bg-amber-100 dark:bg-amber-900/30', colorText: 'text-amber-700 dark:text-amber-500' },
        { id: 7, name: 'Senior Flight Captain', threshold: 26, icon: 'crown', colorBg: 'bg-orange-100 dark:bg-orange-900/30', colorText: 'text-orange-700 dark:text-orange-500' },
        { id: 8, name: 'Commercial Captain', threshold: 30, icon: 'crown', colorBg: 'bg-red-100 dark:bg-red-900/30', colorText: 'text-red-700 dark:text-red-500' }
    ];

    const currentWeeklyOrders = Number(dbData.weeklyOrders) || 0;
    let currentRankIndex = ranks.findIndex(r => currentWeeklyOrders < r.threshold) - 1;
    if (currentRankIndex < 0) currentRankIndex = ranks.length - 1; 
    if (currentWeeklyOrders === 0) currentRankIndex = 0; 
    const currentRank = ranks[currentRankIndex];

    const isPilot = currentWeeklyOrders >= 50; 
    const progressPercent = Math.min(100, (currentWeeklyOrders / 50) * 100);
    const ordersNeededForPilot = Math.max(0, 50 - currentWeeklyOrders);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('qc_driver_session');
        localStorage.removeItem('qc_current_view');
        if (setView) setView('welcome');
    };

    const showToast = (msg) => alert(msg);

    const renderModal = () => {
        if (!activeModal) return null;

        let content = null;

        if (activeModal === 'achievements') {
            const nextRank = ranks[currentRankIndex + 1];
            let rankProgress = 100;
            let ordersNeeded = 0;
            if (nextRank) {
                const range = nextRank.threshold - currentRank.threshold;
                const progress = currentWeeklyOrders - currentRank.threshold;
                rankProgress = Math.min(100, Math.max(0, (progress / range) * 100));
                ordersNeeded = nextRank.threshold - currentWeeklyOrders;
            }

            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('trophy', 24, 'text-brand-600') }} /> Weekly Aviation Ranks
                    </h2>

                    <div className={`p-5 rounded-2xl mb-6 border-2 shadow-sm ${currentRank.colorBg} border-transparent`}>
                        <div className="flex justify-between items-center mb-3">
                            <div>
                                <p className={`text-sm font-bold ${currentRank.colorText} opacity-80 uppercase`}>Current Rank</p>
                                <h3 className={`text-2xl font-black ${currentRank.colorText}`}>{currentRank.name}</h3>
                            </div>
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center bg-white/30 dark:bg-black/20 backdrop-blur-sm ${currentRank.colorText}`} dangerouslySetInnerHTML={{ __html: getIcon(currentRank.icon, 32, 'fill-current opacity-50') }} />
                        </div>
                        
                        {nextRank ? (
                            <>
                             <div className="flex justify-between text-sm font-bold mb-1">
                                 <span className={currentRank.colorText}>{currentWeeklyOrders} Orders</span>
                                 <span className="opacity-60">{nextRank.threshold} Goal</span>
                             </div>
                             <div className="relative h-3 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden">
                                 <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out bg-current ${currentRank.colorText}`} style={{ width: `${rankProgress}%` }}></div>
                             </div>
                             <p className={`text-xs mt-2 font-medium ${currentRank.colorText} opacity-80`}>
                                 {ordersNeeded} more orders to reach <span className="font-bold">{nextRank.name}</span>
                             </p>
                            </>
                        ) : (
                            <p className={`text-sm font-bold ${currentRank.colorText}`}>You are at the top rank! Incredible work!</p>
                        )}
                    </div>

                    <h3 className="font-bold text-slate-900 dark:text-white mb-4">Progression Path</h3>
                    <div className="relative space-y-0 pl-2 ml-4 border-l-2 border-slate-200 dark:border-slate-700">
                        {ranks.map((rank, index) => {
                            const isCompleted = currentWeeklyOrders >= rank.threshold;
                            const isCurrent = index === currentRankIndex;

                            return (
                                <div key={rank.id} className={`relative pl-8 pb-8 ${index === ranks.length - 1 ? 'pb-0' : ''}`}>
                                    <div className={`absolute -left-[17px] top-0 w-9 h-9 rounded-full border-4 transition-all
                                        ${isCompleted || isCurrent ? `${rank.colorBg} border-white dark:border-dark-surface shadow-sm` : 'bg-slate-100 dark:bg-slate-800 border-white dark:border-dark-surface'} 
                                        flex items-center justify-center z-10`}>
                                        <div className={`${isCompleted || isCurrent ? rank.colorText : 'text-slate-300 dark:text-slate-600'}`} 
                                             dangerouslySetInnerHTML={{ __html: getIcon(rank.icon, 16, isCompleted || isCurrent ? 'fill-current' : '') }} />
                                    </div>

                                    <div className={`p-4 rounded-xl border transition-all
                                        ${isCurrent ? `${rank.colorBg} border-transparent shadow-md scale-[1.02]` : 
                                          isCompleted ? 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 opacity-80' : 
                                          'bg-white dark:bg-dark-surface border-slate-100 dark:border-slate-800 opacity-50 grayscale'}`}>
                                        <div className="flex justify-between items-center">
                                            <h4 className={`font-bold text-lg ${isCurrent ? rank.colorText : 'text-slate-900 dark:text-white'}`}>{rank.name}</h4>
                                            {isCurrent && <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/30 dark:bg-black/20 uppercase tracking-wider">Current</span>}
                                        </div>
                                        <p className={`text-sm font-medium mt-1 ${isCurrent ? rank.colorText : 'text-slate-500 dark:text-slate-400'}`}>
                                            {rank.threshold === 0 ? 'Starting Rank' : `${rank.threshold}+ Orders / Week`}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
        else if (activeModal === 'performance') {
            const mockGraphData = {
                daily: [ { label: 'Mon', value: 400 }, { label: 'Tue', value: 650 }, { label: 'Wed', value: 450 }, { label: 'Thu', value: 800 }, { label: 'Fri', value: 550 }, { label: 'Sat', value: 1200 }, { label: 'Sun', value: 950 } ],
                monthly: [ { label: 'Wk 1', value: 2500 }, { label: 'Wk 2', value: 3800 }, { label: 'Wk 3', value: 2100 }, { label: 'Wk 4', value: 4200 } ],
                yearly: [ { label: 'Jan', value: 14000 }, { label: 'Feb', value: 16500 }, { label: 'Mar', value: 12000 }, { label: 'Apr', value: 18000 }, { label: 'May', value: 15500 }, { label: 'Jun', value: 21000 } ]
            };
            const currentGraph = mockGraphData[perfPeriod];
            const maxVal = Math.max(...currentGraph.map(d => d.value));

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

                    <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 mb-5 flex flex-col justify-end">
                         <div className="flex justify-between items-end h-40 gap-2 w-full border-b border-slate-200 dark:border-slate-700 pb-2 pt-8">
                            {currentGraph.map((item, i) => (
                                <div key={i} className="flex flex-col items-center flex-1 group relative h-full justify-end">
                                    <div className="absolute -top-8 bg-slate-800 dark:bg-slate-700 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none shadow-lg">
                                        ₹{item.value}
                                    </div>
                                    <div className="w-full max-w-[24px] flex justify-center items-end h-full">
                                        <div 
                                            className="w-full bg-gradient-to-t from-brand-600 to-cyan-400 rounded-t-md transition-all duration-700 ease-out shadow-sm"
                                            style={{ height: `${(item.value / maxVal) * 100}%` }}
                                        ></div>
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 mt-2">{item.label}</span>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            );
        }
        else if (activeModal === 'leaderboard') {
             content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('award', 24, 'text-yellow-600') }} /> Weekly Leaderboard
                    </h2>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
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
        else if (activeModal === 'docs') {
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
                    <h2 className="text-xl font-bold mb-4 dark:text-white">Documents</h2>
                    <div className="space-y-3" dangerouslySetInnerHTML={{ __html: 
                        renderDoc('Driving License', regData.licenseFile) +
                        renderDoc('RC Book', regData.rcFile) +
                        renderDoc('Insurance', regData.insuranceFile) +
                        renderDoc('Aadhaar Card', regData.aadhaarFile)
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
                        <span dangerouslySetInnerHTML={{ __html: getIcon('card', 24, 'text-brand-600 dark:text-brand-400') }} /> Bank Account
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
        else if (activeModal === 'vehicle') {
             content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('truck', 24, 'text-brand-600') }} /> Vehicle Info
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
        else if (activeModal === 'referral') {
             content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('gift', 24, 'text-amber-600') }} /> Refer & Earn
                    </h2>
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl p-6 border-2 border-amber-200 dark:border-amber-800 mb-4">
                        <p className="text-sm text-amber-700 dark:text-amber-400 mb-2 font-semibold">Your Code</p>
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex-1 bg-white dark:bg-slate-800 rounded-lg p-3 font-mono text-2xl font-black text-amber-600 dark:text-amber-400 text-center">
                                {dbData.referralCode}
                            </div>
                            <button onClick={() => { navigator.clipboard.writeText(dbData.referralCode); showToast('Copied!'); }} className="p-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 active:scale-95 transition-transform" dangerouslySetInnerHTML={{ __html: getIcon('copy', 20) }} />
                        </div>
                        <p className="text-xs text-amber-600 dark:text-amber-400">Share with your friends to earn!</p>
                    </div>
                </div>
            );
        }
        else if (activeModal === 'notifications') {
            const toggleKey = (k) => setNotifSettings(prev => ({...prev, [k]: !prev[k]}));
            content = (
                <div>
                    <h2 className="text-xl font-bold mb-4 dark:text-white flex items-center gap-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('bell', 24, 'text-brand-600') }} /> Notifications
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
                        <span dangerouslySetInnerHTML={{ __html: getIcon('helpCircle', 24, 'text-green-600') }} /> Support
                    </h2>
                    <div className="space-y-3">
                        <button className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="font-semibold text-slate-900 dark:text-white">FAQs</span>
                            <span dangerouslySetInnerHTML={{ __html: getIcon('arrowRight', 18, 'text-slate-400') }} />
                        </button>
                        <button className="w-full p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700">
                            <span className="font-semibold text-slate-900 dark:text-white">Contact Support</span>
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
                        <span dangerouslySetInnerHTML={{ __html: getIcon('alertCircle', 24, 'text-red-600') }} /> Emergency SOS
                    </h2>
                    <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl p-6 border-2 border-red-200 dark:border-red-800 mb-4 text-center">
                        <p className="text-sm text-red-700 dark:text-red-400 mb-4">Pressing this will alert your emergency contacts instantly.</p>
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
            
            {fetchError && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 mb-4 rounded-2xl text-xs font-bold shadow-sm">
                    ⚠️ DATABASE ERROR:<br/>{fetchError}
                </div>
            )}

            <div className="flex items-center gap-4 mb-6 mt-2">
                <div className="relative group">
                    <div className="w-20 h-20 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-600 shadow-md">
                        {/* 🔥 FIXED: Now fetches the DB avatarUrl instead of a ghost file */}
                        {dbData.avatarUrl 
                            ? <img src={dbData.avatarUrl} className="w-full h-full object-cover" alt="Profile" /> 
                            : <span dangerouslySetInnerHTML={{ __html: getIcon('user', 40, 'text-slate-400') }} />
                        }
                    </div>
                </div>
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{dbData.fullName}</h2>
                        {isPilot && (
                            <div className="crown-shine inline-block text-amber-500" dangerouslySetInnerHTML={{ __html: getIcon('crown', 20) }} />
                        )}
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500 font-bold text-sm">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('star', 14, 'fill-current') }} /> 4.9 Rating
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Driver ID: #{dbData.driverId}</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-4 border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('barChart', 16, 'text-blue-600 dark:text-blue-400') }} />
                        <span className="text-xs font-bold text-blue-600 dark:text-blue-400">Total Stats</span>
                    </div>
                    <p className="text-2xl font-black text-blue-700 dark:text-blue-300">{dbData.todayOrders}</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">Trips</p>
                </div>
                <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-4 border border-green-200 dark:border-green-800">
                    <div className="flex items-center gap-2 mb-2">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('wallet', 16, 'text-green-600 dark:text-green-400') }} />
                        <span className="text-xs font-bold text-green-600 dark:text-green-400">Total Earnings</span>
                    </div>
                    <p className="text-2xl font-black text-green-700 dark:text-green-300">₹{dbData.todayEarnings}</p>
                    <p className="text-xs text-green-600 dark:text-green-400">Total</p>
                </div>
            </div>

            {/* PILOT CARD */}
            <div className={`mb-6 rounded-3xl p-5 border-2 shadow-lg ${isPilot ? 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100 dark:from-amber-900/30 dark:via-yellow-900/20 dark:to-amber-800/30 border-amber-300 dark:border-amber-600 prime-glow' : 'bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800/50 dark:to-slate-700/50 border-slate-300 dark:border-slate-600'}`}>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPilot ? 'bg-gradient-to-br from-amber-400 to-yellow-500 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`} dangerouslySetInnerHTML={{ __html: getIcon('crown', 24) }} />
                        <div>
                            <h3 className={`font-black text-base ${isPilot ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}`}>{isPilot ? 'Pilot Partner' : 'Standard Partner'}</h3>
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{currentWeeklyOrders} orders this week</p>
                        </div>
                    </div>
                    {isPilot ? (
                        <div className="relative overflow-hidden px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-bold text-xs">
                            <span className="relative z-10">PILOT</span>
                        </div>
                    ) : (
                        <div className="text-right">
                            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Progress</p>
                            <p className="text-lg font-black text-slate-700 dark:text-slate-300">{Math.round(progressPercent)}%</p>
                        </div>
                    )}
                </div>
                
                <div className="relative h-3 bg-white/50 dark:bg-slate-900/30 rounded-full overflow-hidden mb-2 border border-slate-200 dark:border-slate-700">
                    <div className={`absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ${isPilot ? 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-500' : 'bg-gradient-to-r from-brand-400 to-brand-500'}`} style={{ width: `${progressPercent}%` }}></div>
                </div>
                
                {isPilot ? (
                    <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('check', 16) }} />
                        <p className="text-sm font-bold">Congratulations! You are a Pilot!</p>
                    </div>
                ) : (
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                        {ordersNeededForPilot} more {ordersNeededForPilot === 1 ? 'order' : 'orders'} to become a Pilot!
                    </p>
                )}
            </div>

            {/* AVIATION RANK */}
            <button onClick={() => setActiveModal('achievements')} className="w-full mb-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-4 border-2 border-purple-200 dark:border-purple-800 active:scale-95 transition-transform">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('trophy', 20, 'text-purple-600 dark:text-purple-400') }} />
                        <div className="text-left">
                            <p className="font-bold text-slate-900 dark:text-white">Aviation Rank</p>
                            <p className="text-xs font-bold text-purple-700 dark:text-purple-400">{currentRank.name} • View progression</p>
                        </div>
                    </div>
                    <span dangerouslySetInnerHTML={{ __html: getIcon('arrowRight', 18, 'text-purple-600 dark:text-purple-400') }} />
                </div>
            </button>

            {/* VOICE NARRATION TOGGLE */}
            <button onClick={() => setIsVoiceOn(!isVoiceOn)} className={`w-full mb-3 py-3.5 rounded-2xl font-bold border-2 ${isVoiceOn ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'} hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-between px-6 active:scale-95 transition-all`}>
                <span className="flex items-center gap-3">
                    <span dangerouslySetInnerHTML={{ __html: getIcon(isVoiceOn ? 'volumeUp' : 'volumeOff', 18) }} /> Voice Narration
                </span>
                <div className={`w-10 h-5 bg-slate-300 dark:bg-slate-700 rounded-full relative transition-colors ${isVoiceOn ? '!bg-brand-500' : ''}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${isVoiceOn ? 'translate-x-5' : ''}`}></div>
                </div>
            </button>

            <button onClick={() => setView && setView('wallet')} className="w-full mb-6 bg-slate-900 dark:bg-slate-800 rounded-2xl p-4 text-white flex justify-between items-center shadow-lg active:scale-95 transition-transform mt-3">
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center" dangerouslySetInnerHTML={{ __html: getIcon('wallet', 20) }} />
                    <div className="text-left">
                        <p className="text-xs text-slate-400 font-bold uppercase">Wallet Balance</p>
                        <p className="font-black text-xl">₹{dbData.walletBalance}</p>
                    </div>
                </div>
                <div className="bg-brand-600 px-3 py-1.5 rounded-lg text-xs font-bold">View</div>
            </button>

            {/* Main Action List */}
            <div className="space-y-3">
                <button onClick={() => setActiveModal('performance')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('trendingUp', 18) }} /> Performance Graph
                </button>
                <button onClick={() => setActiveModal('leaderboard')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('award', 18) }} /> Leaderboard
                </button>
                <button onClick={() => setActiveModal('notifications')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('bell', 18) }} /> Notifications
                </button>
                <button onClick={() => setActiveModal('vehicle')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('truck', 18) }} /> Vehicle Info
                </button>
                <button onClick={() => setActiveModal('docs')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('file', 18) }} /> Documents
                </button>
                <button onClick={() => setActiveModal('referral')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('gift', 18) }} /> Refer & Earn
                </button>
                <button onClick={() => setActiveModal('bank')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('card', 18) }} /> Bank Details
                </button>
                <button onClick={() => setActiveModal('support')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('helpCircle', 18) }} /> Help / Support
                </button>
                <button onClick={() => setActiveModal('emergency')} className="w-full py-3.5 rounded-2xl font-bold border-2 border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('alertCircle', 18) }} /> Emergency SOS
                </button>
                <button onClick={handleLogout} className="w-full py-3.5 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 mt-8 flex items-center gap-3 px-6 active:scale-95 transition-transform">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('logout', 18) }} /> Sign Out
                </button>
            </div>

            {renderModal()}
        </div>
    );
}