// HomePage.jsx
import { useState, useEffect, useCallback } from "react";
import { supabase } from '../config'; // 🔥 ADDED SUPABASE IMPORT

// ─────────────────────────────────────────────
// ICON LIBRARY (Unchanged)
// ─────────────────────────────────────────────
const ICONS = {
  moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
  sun: '<g><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></g>',
  package: '<g><path d="m16.5 9.4-9-5.19"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></g>',
  truck: '<g><rect width="16" height="16" x="1" y="3" rx="2" ry="2"/><line x1="1" x2="17" y1="10" y2="10"/><path d="M17 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><circle cx="5" cy="19" r="2"/><circle cx="13" cy="19" r="2"/></g>',
  power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10"/>',
  bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
  globe: '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"/>',
  gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect width="20" height="5" x="2" y="7"/><line x1="12" x2="12" y1="22" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>',
  check: '<polyline points="20 6 9 17 4 12"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
  barChart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  user: '<g><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></g>',
  clipboard: '<rect width="8" height="4" x="8" y="2" rx="1" ry="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>',
  coffee: '<g><path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/></g>',
};

function Icon({ name, size = 24, className = "" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />
  );
}

// ─────────────────────────────────────────────
// TRANSLATIONS (Unchanged)
// ─────────────────────────────────────────────
const TRANSLATIONS = {
  en: { home: "Home", trips: "Trips", earnings_history: "Earnings", profile: "Profile", online: "Online", offline: "Offline", todays_earnings: "Today's Earnings", weekly_bonus: "Weekly Bonus", orders_this_week: "Orders This Week", keep_going: "Keep Going!", more_orders: "more orders to unlock ₹2000 bonus", language: "Language", nearby_orders: "Nearby Orders", go_online_msg: "Go Online to accept orders" },
  ta: { home: "முகப்பு", trips: "பயணங்கள்", earnings_history: "வருமானம்", profile: "சுயவிவரம்", online: "ஆன்லைன்", offline: "ஆஃப்லைன்", todays_earnings: "இன்றைய வருமானம்", weekly_bonus: "வாராந்திர போனஸ்", orders_this_week: "இந்த வாரம் ஆர்டர்கள்", keep_going: "தொடர்ந்து செல்லுங்கள்!", more_orders: "₹2000 போனஸைத் திறக்க மேலும் ஆர்டர்கள்", language: "மொழி", nearby_orders: "அருகில் ஆர்டர்கள்", go_online_msg: "ஆர்டர்களை ஏற்க ஆன்லைனில் செல்லுங்கள்" },
  hi: { home: "होम", trips: "यात्राएं", earnings_history: "कमाई", profile: "प्रोफ़ाइल", online: "ऑनलाइन", offline: "ऑफलाइन", todays_earnings: "आज की कमाई", weekly_bonus: "साप्ताहिक बोनस", orders_this_week: "इस सप्ताह ऑर्डर", keep_going: "जारी रखें!", more_orders: "₹2000 बोनस को अनलॉक करने के लिए और ऑर्डर", language: "भाषा", nearby_orders: "नज़दीकी ऑर्डर", go_online_msg: "ऑर्डर स्वीकार करने के लिए ऑनलाइन जाएं" },
};

function Toast({ toasts }) {
  return (
    <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center gap-2 pointer-events-none w-[90%]">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto px-6 py-3 rounded-full bg-black/80 text-white text-sm font-semibold shadow-lg" style={{ animation: "toastIn 0.3s cubic-bezier(0.175,0.885,0.32,1.275)" }}>
          {toast.message}
        </div>
      ))}
    </div>
  );
}

function TruckSVG() {
  return (
    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 20 H80 V50 H10 Z" fill="#F8FAFC" /><path d="M80 30 H110 V50 H80 Z" fill="#CBD5E1" /><path d="M80 30 H100 L95 20 H80 Z" fill="#CBD5E1" /><rect x="10" y="30" width="70" height="10" fill="#06B6D4" /><text x="25" y="38" fontSize="6" fontWeight="bold" fill="white">QC LOGISTICS</text>
      <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "wheelSpin 0.3s linear infinite" }}><circle cx="25" cy="50" r="8" fill="#334155" stroke="#1E293B" strokeWidth="2" /><circle cx="25" cy="50" r="3" fill="#94A3B8" /><line x1="25" y1="42" x2="25" y2="58" stroke="#94A3B8" strokeWidth="1" /><line x1="17" y1="50" x2="33" y2="50" stroke="#94A3B8" strokeWidth="1" /></g>
      <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "wheelSpin 0.3s linear infinite" }}><circle cx="65" cy="50" r="8" fill="#334155" stroke="#1E293B" strokeWidth="2" /><circle cx="65" cy="50" r="3" fill="#94A3B8" /><line x1="65" y1="42" x2="65" y2="58" stroke="#94A3B8" strokeWidth="1" /><line x1="57" y1="50" x2="73" y2="50" stroke="#94A3B8" strokeWidth="1" /></g>
      <g style={{ transformBox: "fill-box", transformOrigin: "center", animation: "wheelSpin 0.3s linear infinite" }}><circle cx="95" cy="50" r="8" fill="#334155" stroke="#1E293B" strokeWidth="2" /><circle cx="95" cy="50" r="3" fill="#94A3B8" /><line x1="95" y1="42" x2="95" y2="58" stroke="#94A3B8" strokeWidth="1" /><line x1="87" y1="50" x2="103" y2="50" stroke="#94A3B8" strokeWidth="1" /></g>
    </svg>
  );
}

function OrderCard({ order, onAccept, onDecline }) {
  const title = order.product_name || order.type || "Construction Material";
  const price = order.total_amount || order.payout || "0";
  const orderType = order.order_type || "Standard";
  return (
    <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-sm border border-slate-100 dark:border-slate-700 mb-4">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-cyan-50 dark:bg-cyan-900/30 flex items-center justify-center text-cyan-600"><Icon name="package" size={20} /></div>
          <div><h3 className="font-bold text-slate-900 dark:text-white">{title}</h3><p className="text-xs text-slate-500">{orderType} Order • {order.quantity || 1} Units</p></div>
        </div>
        <span className="text-xl font-black text-cyan-600">₹{price}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => onDecline(order.id)} className="py-3 rounded-2xl font-bold border-2 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 active:scale-95 transition-all">Decline</button>
        <button onClick={() => onAccept(order.id)} className="py-3 rounded-2xl font-bold bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 active:scale-95 transition-all">Accept</button>
      </div>
    </div>
  );
}

function NavBtn({ id, label, iconName, badge = 0, activeTab, onSetTab }) {
  const isActive = activeTab === id;
  return (
    <button onClick={() => onSetTab(id)} className={`relative w-16 flex flex-col items-center justify-center transition-all duration-300 ${isActive ? "-translate-y-2" : ""}`}>
      {badge > 0 && <div className="absolute -top-1 right-3 z-10 w-5 h-5 bg-red-500 border-2 border-white dark:border-slate-900 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">{badge}</div>}
      <div className={`p-2 rounded-2xl transition-all duration-300 ${isActive ? "bg-cyan-600 text-white shadow-lg shadow-cyan-500/40 scale-110" : "text-slate-400 dark:text-slate-500"}`}><Icon name={iconName} size={24} /></div>
      <span className={`text-[10px] font-bold mt-1 transition-all duration-300 ${isActive ? "text-cyan-600 dark:text-cyan-400 opacity-100" : "text-slate-400 opacity-0 absolute bottom-0"}`}>{label}</span>
      {isActive && <div className="absolute -bottom-2 w-1 h-1 bg-cyan-600 rounded-full" />}
    </button>
  );
}

function LangModal({ onClose, onSelect }) {
  return (
    <div className="fixed inset-0 z-[60]">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-sm bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-2xl">
        <h2 className="text-xl font-bold mb-4 dark:text-white text-center">Select Language / மொழி</h2>
        <div className="space-y-3">
          {[["en", "English", "🇺🇸"], ["ta", "தமிழ்", "🇮🇳"], ["hi", "हिंदी", "🇮🇳"]].map(([code, label, flag]) => (
            <button key={code} onClick={() => onSelect(code)} className="w-full p-4 rounded-xl border-2 border-slate-100 dark:border-slate-700 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              <span className="font-bold text-lg dark:text-white">{label}</span><span className="text-2xl">{flag}</span>
            </button>
          ))}
        </div>
        <button onClick={onClose} className="w-full mt-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:text-slate-400">Close / மூடு / बंद करें</button>
      </div>
    </div>
  );
}

function HomeTab({ state, onAccept, onDecline, onToggleOnline, onShowEarnings, onShowToast }) {
  const { isDark, isOnline, weeklyOrders, todayStats, orders } = state;
  const t = (key) => TRANSLATIONS[state.language]?.[key] || TRANSLATIONS.en[key] || key;

  const ordersRemaining = Math.max(0, 20 - weeklyOrders);
  const bonusProgress = Math.min(100, (weeklyOrders / 20) * 100);
  const formatOnlineTime = () => `${Math.floor((todayStats.onlineMinutes || 0) / 60)}h ${(todayStats.onlineMinutes || 0) % 60}m`;

  return (
    <div className="space-y-6 fade-in">
      {/* TODAY'S EARNINGS CARD */}
      <div onClick={onShowEarnings} className="w-full h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-sky-400 to-blue-600 dark:from-slate-800 dark:to-slate-900 relative shadow-xl shadow-blue-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform">
        <div className={`absolute right-4 top-4 animate-pulse transition-colors duration-500 ${isDark ? "text-slate-300" : "text-yellow-300"}`}><Icon name={isDark ? "moon" : "sun"} size={40} /></div>
        <div className="absolute top-8 text-white/30 animate-cloud-1" style={{ left: "-50px" }}><Icon name="package" size={30} /></div>
        <div className="absolute top-12 text-white/20 animate-cloud-2" style={{ left: "-80px" }}><Icon name="package" size={40} /></div>
        <div className="absolute bottom-16 left-0 w-[200%] h-12 animate-city-slow opacity-30 text-white">
          <svg viewBox="0 0 1000 50" preserveAspectRatio="none" className="w-full h-full">
            <path d="M0,50 L0,20 L20,20 L20,40 L40,40 L40,15 L60,15 L60,45 L80,45 L80,10 L110,10 L110,50 Z" fill="currentColor" /><path d="M120,50 L120,25 L140,25 L140,40 L160,40 L160,10 L190,10 L190,50 Z" fill="currentColor" transform="translate(120,0)" /><path d="M220,50 L220,30 L250,30 L250,50 Z" fill="currentColor" transform="translate(200,0)" /><path d="M300,50 L300,20 L330,20 L330,50 Z" fill="currentColor" transform="translate(200,0)" /><path d="M400,50 L400,15 L440,15 L440,50 Z" fill="currentColor" transform="translate(100,0)" /><path d="M0,50 L0,20 L20,20 L20,40 L40,40 L40,15 L60,15 L60,45 L80,45 L80,10 L110,10 L110,50 Z" fill="currentColor" transform="translate(500,0)" /><path d="M600,50 L600,25 L640,25 L640,50 Z" fill="currentColor" transform="translate(100,0)" />
          </svg>
        </div>
        <div className="absolute bottom-0 w-full h-16 bg-slate-700 flex items-center overflow-hidden"><div className="w-[200%] h-1 border-t-2 border-dashed border-white/50 animate-road-fast absolute top-1/2" /></div>
        <div className="absolute bottom-6 left-8 animate-truck-physics z-10"><div className="exhaust-puff puff-1" /><div className="exhaust-puff puff-2" /><div className="exhaust-puff puff-3" /><TruckSVG /></div>
        <div className="absolute top-4 left-4 z-20 text-white"><p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-90">{t("todays_earnings")}</p><h2 className="text-4xl font-black drop-shadow-md">₹{todayStats.earnings}</h2></div>
        <div className="absolute top-4 right-16 flex gap-2 z-20">
          <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 text-xs text-white font-bold">{todayStats.orders} {t("trips")}</div>
          <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 text-xs text-white font-bold">{formatOnlineTime()}</div>
        </div>
      </div>

      {/* WEEKLY BONUS CARD */}
      <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20">
        <div className="flex items-center gap-3 mb-3"><Icon name="gift" size={24} /><div><h3 className="font-black text-base">{t("weekly_bonus")}</h3><p className="text-xs opacity-90">{t("orders_this_week")}: {weeklyOrders}/20</p></div></div>
        <div className="relative h-2.5 bg-white/20 rounded-full overflow-hidden mb-3"><div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500" style={{ width: `${bonusProgress}%` }} /></div>
        {weeklyOrders >= 20 ? <div className="flex items-center gap-2"><Icon name="check" size={18} /><span className="font-bold text-sm">₹2000 Bonus Unlocked!</span></div> : <p className="text-sm font-semibold">{t("keep_going")} {ordersRemaining} {t("more_orders")}</p>}
      </div>

      {/* NEARBY ORDERS */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold text-slate-800 dark:text-white text-base">{t("nearby_orders")}</h2>
          <div className={`px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${isOnline ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />{isOnline ? "LIVE" : "OFFLINE"}
          </div>
        </div>

        {!isOnline ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400"><Icon name="power" size={32} /></div>
            <h3 className="font-bold text-lg text-slate-700 dark:text-slate-300">You are Offline</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{t("go_online_msg")}</p>
            <button onClick={onToggleOnline} className="px-8 py-3 bg-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-cyan-500/30 active:scale-95 transition-all">Go Online</button>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            <Icon name="coffee" size={48} className="mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-bold text-slate-600 dark:text-slate-400">No Orders Nearby</h3>
            <p className="text-sm opacity-75">Waiting for new incoming requests...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => <OrderCard key={order.id} order={order} onAccept={onAccept} onDecline={onDecline} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN HOMEPAGE COMPONENT
// ─────────────────────────────────────────────
export default function HomePage({ regData }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "true");
  const [language, setLanguage] = useState(() => localStorage.getItem("language") || "en");
  const [isOnline, setIsOnline] = useState(false);
  const [tab, setTab] = useState("home");
  const [showLangModal, setShowLangModal] = useState(false);
  const [toasts, setToasts] = useState([]);
  
  const [weeklyOrders, setWeeklyOrders] = useState(7);
  const [orders, setOrders] = useState([]);
  const [trips, setTrips] = useState([]);
  const [todayStats, setTodayStats] = useState({ orders: 0, earnings: 0, onlineMinutes: 0 });


  // Theme & Language
  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", isDark);
  }, [isDark]);
  useEffect(() => { localStorage.setItem("language", language); }, [language]);

  const showToast = useCallback((message) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3000);
  }, []);

  const t = useCallback((key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS.en[key] || key, [language]);

  // 🔥 SUPABASE REALTIME MAGIC 🔥
  useEffect(() => {
    let orderSubscription;

    const fetchPendingOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('status', 'pending');
        
      if (data && !error) {
        setOrders(data);
      }
    };

    if (isOnline) {
      // Fetch current unaccepted orders
      fetchPendingOrders();

      // Listen for brand new orders coming in Live!
      orderSubscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
          if (payload.new.status === 'pending') {
            setOrders(prev => [...prev, payload.new]);
            showToast("📦 New order arrived!");
          }
        })
        .subscribe();
    } else {
      setOrders([]); // Clear screen when offline
    }

    // Cleanup subscription when you go offline or close the app
    return () => {
      if (orderSubscription) supabase.removeChannel(orderSubscription);
    };
  }, [isOnline, showToast]);

  const toggleOnline = () => {
    if (!isOnline) {
      setIsOnline(true);
      showToast("🟢 You are now Online! Listening for orders...");
    } else {
      setIsOnline(false);
      showToast("🔴 You are Offline");
    }
  };

  // 🔥 ACCEPT ORDER IN DATABASE 🔥
  const acceptOrder = async (id) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;

    // 1. Tell Supabase we claim this order
    const { error } = await supabase
      .from('orders')
      .update({ status: 'accepted', driver_id: regData.driver_id })
      .eq('id', id);

    if (error) {
      showToast("❌ Failed to accept order. Someone else might have taken it!");
      return;
    }

    // 2. Update UI
    setOrders((prev) => prev.filter((o) => o.id !== id));
    setTrips((prev) => [...prev, { ...order, step: 0 }]); // Sends to map
    setWeeklyOrders((w) => w + 1);
    setTodayStats((s) => ({ ...s, orders: s.orders + 1, earnings: s.earnings + parseFloat(order.total_amount || 0) }));
    showToast(`✅ Order Accepted! Click TRIPS to see Map.`);
  };

  const declineOrder = (id) => {
    setOrders((prev) => prev.filter((o) => o.id !== id));
    showToast("Order declined");
  };

  const state = { isDark, language, isOnline, weeklyOrders, orders, trips, todayStats, regData };

  return (
    <>
      <style>{`
        @keyframes toastIn { from { transform: translateY(-20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes moveRoad { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes moveCity { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes driveBounce { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(1px) rotate(0.5deg); } 50% { transform: translateY(-1px) rotate(0deg); } 75% { transform: translateY(0.5px) rotate(-0.5deg); } }
        @keyframes wheelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes exhaustPuff { 0% { transform: translate(0,0) scale(0.5); opacity: 0.7; } 100% { transform: translate(-30px,-15px) scale(2); opacity: 0; } }
        @keyframes passingCloud { from { transform: translateX(100%); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } to { transform: translateX(-150%); opacity: 0; } }
        @keyframes globeSpin { 0%, 100% { transform: rotate(0deg); } 50% { transform: rotate(180deg); } }
        @keyframes bellRing { 0%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(-10deg); } 20%, 40% { transform: rotate(10deg); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
        
        .animate-road-fast { animation: moveRoad 0.6s linear infinite; }
        .animate-city-slow { animation: moveCity 15s linear infinite; }
        .animate-truck-physics { animation: driveBounce 0.8s ease-in-out infinite; }
        .animate-cloud-1 { animation: passingCloud 12s linear infinite; }
        .animate-cloud-2 { animation: passingCloud 18s linear infinite 5s; }
        .globe-spin { animation: globeSpin 3s ease-in-out infinite; display: inline-block; }
        .bell-ring { animation: bellRing 1s ease-in-out infinite; display: inline-block; }
        .fade-in { animation: fadeInUp 0.3s ease-out; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .glass { background: rgba(255,255,255,0.95); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
        .dark .glass { background: rgba(15,23,42,0.95); }
        .pt-safe-top { padding-top: env(safe-area-inset-top, 20px); }
        .pb-safe { padding-bottom: env(safe-area-inset-bottom, 20px); }
        .exhaust-puff { position: absolute; background: rgba(255,255,255,0.4); border-radius: 50%; pointer-events: none; }
        .puff-1 { width: 6px; height: 6px; animation: exhaustPuff 1s ease-out infinite; left: 5px; top: 45px; }
        .puff-2 { width: 8px; height: 8px; animation: exhaustPuff 1s ease-out infinite 0.3s; left: 5px; top: 45px; }
        .puff-3 { width: 5px; height: 5px; animation: exhaustPuff 1s ease-out infinite 0.6s; left: 5px; top: 45px; }
      `}</style>

      <Toast toasts={toasts} />

      {showLangModal && <LangModal onClose={() => setShowLangModal(false)} onSelect={(lang) => { setLanguage(lang); setShowLangModal(false); }} />}

      <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors font-sans antialiased overflow-hidden">
        <header className="fixed top-0 w-full z-30 glass border-b border-slate-200/50 dark:border-slate-800/50 pt-safe-top">
          <div className="px-4 h-16 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg text-white font-black text-xs" style={{ transform: "rotate(3deg)" }}>QC</div>
              <div>
                <h1 className="font-bold text-slate-800 dark:text-white leading-none text-sm">
                  Hi, {(regData?.fullName || "Partner").split(" ")[0]}
                </h1>                <div className="flex items-center gap-1 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                  <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">{isOnline ? t("online") : t("offline")}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div onClick={toggleOnline} className={`relative h-9 w-16 rounded-full cursor-pointer transition-all duration-300 ${isOnline ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"} flex items-center px-1 shadow-inner active:scale-95`}>
                <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-black uppercase pointer-events-none">
                  <span className={`${isOnline ? "text-white opacity-100" : "text-transparent opacity-0"} transition-all duration-200`}>ON</span>
                  <span className={`${!isOnline ? "text-white opacity-100" : "text-transparent opacity-0"} transition-all duration-200`}>OFF</span>
                </div>
                <div className={`relative w-7 h-7 bg-white rounded-full shadow-lg transform ${isOnline ? "translate-x-7" : "translate-x-0"} flex items-center justify-center pointer-events-none transition-transform duration-300`}>
                  <Icon name="power" size={14} className={isOnline ? "text-green-500" : "text-slate-400"} />
                </div>
              </div>
              <button onClick={() => setShowLangModal(true)} className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                <span className="globe-spin"><Icon name="globe" size={20} /></span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-cyan-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center">{language.toUpperCase()}</span>
              </button>
              <button onClick={() => setIsDark(!isDark)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/50" : "bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/50"} active:scale-95 hover:scale-105`}>
                <Icon name={isDark ? "moon" : "sun"} size={20} className="text-white" />
              </button>
              <button onClick={() => showToast("No new notifications")} className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                <span className={trips.length > 0 ? "bell-ring" : ""}><Icon name="bell" size={20} /></span>
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pt-20 pb-24 px-4 no-scrollbar">
          {tab === "home" && <HomeTab state={state} onAccept={acceptOrder} onDecline={declineOrder} onToggleOnline={toggleOnline} onShowEarnings={() => { setTab("earnings"); showToast("Today's Earnings: ₹" + todayStats.earnings); }} onShowToast={showToast} />}
          {tab === "trips" && (
            <div className="text-center py-20 text-slate-400 fade-in">
              <Icon name="truck" size={48} className="mx-auto mb-4 opacity-50" />
              <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">Active Trips: {trips.length}</h3>
              <p className="text-sm">{trips.length === 0 ? "No active trips" : trips.map((t) => `Order #${t.id}`).join(", ")}</p>
              {trips.length > 0 && <p className="text-brand-600 font-bold mt-4 animate-pulse">Switching to GPS Map View...</p>}
            </div>
          )}
          {tab === "earnings" && (
            <div className="text-center py-20 fade-in">
              <Icon name="barChart" size={48} className="mx-auto mb-4 opacity-50 text-slate-400" />
              <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">Total Earned Today</h3>
              <p className="text-4xl font-black text-slate-800 dark:text-white mt-2">₹{todayStats.earnings}</p>
            </div>
          )}
          {tab === "profile" && (
            <div className="text-center py-20 fade-in">
              <Icon name="user" size={48} className="mx-auto mb-4 opacity-50 text-slate-400" />
              <h3 className="font-bold text-lg text-slate-800 dark:text-white">{regData.fullName}</h3>
              <p className="text-sm text-slate-500">Driver ID: #{regData.driver_id}</p>
            </div>
          )}
        </main>

        <nav className="fixed bottom-0 w-full glass border-t border-slate-200/50 dark:border-slate-800/50 pb-safe z-30">
          <div className="flex justify-around items-center h-16">
            <NavBtn id="home"     label={t("home")}             iconName="home"     activeTab={tab} onSetTab={setTab} />
            <NavBtn id="trips"    label={t("trips")}            iconName="nav"      badge={trips.length} activeTab={tab} onSetTab={setTab} />
            <NavBtn id="earnings" label={t("earnings_history")} iconName="barChart" activeTab={tab} onSetTab={setTab} />
            <NavBtn id="profile"  label={t("profile")}          iconName="user"     activeTab={tab} onSetTab={setTab} />
          </div>
        </nav>
      </div>
      
      {orders.length > 0 && isOnline && (
        <IncomingOrderModal 
          order={orders[0]} 
          onAccept={acceptOrder} 
          onDecline={declineOrder} 
        />
      )}
    </>
  );
}