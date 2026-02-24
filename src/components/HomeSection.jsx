import React, { useState, useEffect } from "react";
import { supabase, ICONS } from '../config'; 

function getIcon(name, size = 24, classes = "") {
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={classes} dangerouslySetInnerHTML={{ __html: ICONS[name] || "" }} />;
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. EXACT HTML NEW ORDER POPUP
// ═══════════════════════════════════════════════════════════════════════════
function NewOrderPopup({ order, isPrime, onAccept, onDecline }) {
    const [isLoading, setIsLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState(!isPrime ? 10 : 0);

    useEffect(() => {
        try {
            const audio = new window.AudioContext();
            const osc = audio.createOscillator();
            osc.connect(audio.destination);
            osc.start();
            osc.stop(audio.currentTime + 0.1);
        } catch(e) {}

        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800); 
        
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        if (!isLoading && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
    }, [isLoading, timeLeft]);

    const displayData = {
        id: order.id,
        type: order.product_name || order.type || 'New Order',
        distance: order.distance || 'Calculated at pickup',
        payout: order.delivery_fee || order.total_amount || 0,
        pickup: order.vendor_shop_name || order.pickup_address || 'Pickup Location',
        drop: order.delivery_address || order.client_address || order.customer_address || 'Drop Location',
        paymentType: 'CASH'
    };

    return (
        <div className="fixed inset-0 z-[75]">
            <style>{`
                @keyframes slideInFromRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            `}</style>
            
            <div onClick={() => onDecline(order.id)} className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"></div>
            
            <div className="absolute top-0 right-0 bottom-0 w-full max-w-md bg-white dark:bg-slate-900 rounded-l-3xl shadow-2xl pt-safe-top pb-safe overflow-y-auto" style={{ animation: 'slideInFromRight 0.4s cubic-bezier(0.16, 1, 0.3, 1)' }}>
                <div className="p-6">
                    <button onClick={() => onDecline(order.id)} className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-slate-200 transition-colors z-10 text-slate-600 dark:text-slate-300">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>

                    {isLoading ? (
                        <div className="text-center py-20 mt-10">
                            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Loading order details...</p>
                        </div>
                    ) : (
                        <>
                            <div className="text-center mb-6 mt-4">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-400 to-brand-600 flex items-center justify-center shadow-lg animate-bounce">
                                    {getIcon('package', 32, 'text-white')}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">New Order Available!</h2>
                                
                                <div className="flex items-center justify-center gap-2 mb-2">
                                    <p className="text-sm text-slate-600 dark:text-slate-400">Partner Status:</p>
                                    {isPrime ? (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs font-bold rounded-full shadow-lg">
                                            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> PRIME
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-full">NORMAL</span>
                                    )}
                                </div>

                                {!isPrime && timeLeft > 0 && (
                                    <div className="mt-3 p-3 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-xl">
                                        <p className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">⏳ Please Wait</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-500">Normal partners must wait <span className="font-black text-lg">{timeLeft}</span> seconds</p>
                                        <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Complete 50 orders to become PRIME! 🌟</p>
                                    </div>
                                )}
                                {!isPrime && timeLeft === 0 && (
                                    <div className="mt-3 p-3 bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-800 rounded-xl">
                                        <p className="text-sm font-bold text-green-600 dark:text-green-400">✓ You can now respond to this order</p>
                                    </div>
                                )}
                            </div>

                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 mb-6 border border-slate-200 dark:border-slate-700">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-1">{displayData.type}</h3>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{displayData.distance}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-3xl font-black text-green-600 dark:text-green-400">₹{displayData.payout}</span>
                                        <span className="text-xs font-bold text-slate-400 uppercase">{displayData.paymentType}</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {getIcon('mapPin', 14)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Pickup Location</p>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{displayData.pickup}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                            {getIcon('mapPin', 14, 'text-white')}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Drop Location</p>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200 line-clamp-2">{displayData.drop}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className={`grid grid-cols-2 gap-3 ${timeLeft > 0 && !isPrime ? 'opacity-50 pointer-events-none' : ''}`}>
                                <button onClick={() => onDecline(order.id)} className="py-4 rounded-2xl font-bold border-2 border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors active:scale-95">
                                    {getIcon('xCircle', 18)} Decline
                                </button>
                                <button onClick={() => onAccept(order.id)} className="py-4 rounded-2xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-green-500/50 transition-all active:scale-95 flex justify-center items-center gap-2">
                                    {getIcon('check', 18)} Accept
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. NAVIGATION CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════════════════
function NavigationModal({ order, onClose, onGoToLocation }) {
    const pickupAddress = order.vendor_shop_name || order.pickup_address || 'Pickup Location';
    const dropAddress = order.delivery_address || order.client_address || order.customer_address || 'Drop Location';

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
            <style>{`
                @keyframes slideUpFade { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"></div>
            
            <div className="relative w-[90%] max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6" style={{ animation: 'slideUpFade 0.3s ease-out' }}>
                <div className="text-center mb-4">
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center shadow-lg">
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12"/>
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Order Accepted!</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Navigate to complete delivery</p>
                </div>
                
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getIcon('mapPin', 18, 'text-white')}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">From:</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{pickupAddress}</p>
                        </div>
                    </div>
                    <div className="flex items-center pl-4">
                        <div className="flex-1 border-t-2 border-dashed border-slate-300 dark:border-slate-600"></div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-slate-400 mx-2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                    <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                            {getIcon('mapPin', 18, 'text-white')}
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">To:</p>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">{dropAddress}</p>
                        </div>
                    </div>
                </div>
                
                <button onClick={onGoToLocation} className="w-full py-4 rounded-2xl font-bold bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg shadow-brand-500/30 hover:shadow-brand-500/50 transition-all active:scale-95 flex items-center justify-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="3 11 22 2 13 21 11 13 3 11"/>
                    </svg>
                    Go to Location
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN HOME SECTION
// ═══════════════════════════════════════════════════════════════════════════
export default function HomeSection({ t, regData, setActiveTab }) {
  const [isDark, setIsDark] = useState(() => localStorage.getItem("theme") === "true");
  const [isOnline, setIsOnline] = useState(() => localStorage.getItem("isOnline") === "true");
  
  const [ringingOrder, setRingingOrder] = useState(null); 
  const [navigatingOrder, setNavigatingOrder] = useState(null);

  const [currentSlide, setCurrentSlide] = useState(0);
  
  const promoMedia = [
      { type: 'image', url: 'https://th.bing.com/th/id/R.e7d3424217ab8a605c53806b52225001?rik=6BCDskidlZlvKA&riu=http%3a%2f%2fgetwallpapers.com%2fwallpaper%2ffull%2f6%2f4%2f6%2f697414-download-free-surya-hd-wallpaper-2018-1920x1080-meizu.jpg&ehk=niLsJKFrcuiZDD2GiiKSiDLv6cFjz7sUsjNpzqgCSfU%3d&risl=&pid=ImgRaw&r=0' },
      { type: 'image', url: 'https://images.unsplash.com/photo-1611590027211-b954fd027b51?q=80&w=1000&auto=format&fit=crop' },
      { type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4' }
  ];

  useEffect(() => {
      const slideInterval = setInterval(() => {
          setCurrentSlide((prevIndex) => (prevIndex + 1) % promoMedia.length);
      }, 4000); 
      return () => clearInterval(slideInterval);
  }, [promoMedia.length]);


  const [alerts, setAlerts] = useState([
    { id: 'welcome', type: 'offer', title: 'Welcome to QC Logistics! 🎉', message: 'Complete your first 5 trips today to earn a ₹500 joining bonus.', time: 'Just now', read: false },
    { id: 'system', type: 'info', title: 'Profile Approved', message: 'Your driving license and RC book have been successfully verified.', time: '2 hours ago', read: false }
  ]);
  
  const [showNotifications, setShowNotifications] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem("language") || "en");
  
  const [todayStats, setTodayStats] = useState({ orders: 0, earnings: 0, onlineMinutes: 0 });
  const [weeklyOrders, setWeeklyOrders] = useState(0);
  const [driverVehicle, setDriverVehicle] = useState(""); 
  const [driverName, setDriverName] = useState(regData?.fullName || "Partner");

  // 🔥 DAILY INCENTIVE CALCULATIONS
  const currentOrders = todayStats.orders || 0;
  const dailyMilestones = [
      { target: 0, reward: 0 },
      { target: 5, reward: 50 },
      { target: 10, reward: 100 },
      { target: 15, reward: 250 },
      { target: 20, reward: 500 }
  ];
  const maxDailyTarget = dailyMilestones[dailyMilestones.length - 1].target;
  const dailyProgress = Math.min(100, (currentOrders / maxDailyTarget) * 100);
  const nextMilestone = dailyMilestones.find(m => m.target > currentOrders);

  // WEEKLY BONUS CALCULATIONS
  const isPrimePartner = weeklyOrders >= 50; 
  const ordersRemaining = Math.max(0, 20 - weeklyOrders);
  const bonusProgress = Math.min(100, (weeklyOrders / 20) * 100);

  const celestialColor = isDark ? 'text-slate-300' : 'text-yellow-300';
  const celestialIcon = isDark ? getIcon('moon', 40) : getIcon('sun', 40); 

  useEffect(() => {
    const fetchDriverStats = async () => {
      if (!regData?.mobile) return; 

      const { data, error } = await supabase
        .from('driver_details') 
        .select('*') 
        .eq('mobile_number', regData.mobile) 
        .single();

      if (data && !error) {
        setTodayStats({ 
            orders: data.today_orders || 0, 
            earnings: data.today_earnings || 0, 
            onlineMinutes: 0 
        });
        setWeeklyOrders(data.weekly_orders || 0);
        setDriverVehicle(data.vehicle_type || ""); 
        setDriverName(data.full_name || "Partner"); 
      }
    };
    fetchDriverStats();
  }, [regData?.mobile]);


  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [isDark]);

  const changeLanguage = (lang) => {
      setCurrentLang(lang);
      localStorage.setItem("language", lang);
      setShowLangModal(false);
      window.dispatchEvent(new Event("languageChange")); 
  };

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

  useEffect(() => {
    let orderSubscription;

    if (isOnline) {
      orderSubscription = supabase
        .channel('public:orders')
        .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'orders' }, payload => {
          const newOrder = payload.new;
          const status = (newOrder.status || "").toLowerCase().trim();
          
          if (status === '' || status === 'pending') {
              const myVehicle = driverVehicle.toLowerCase().trim();
              const orderVehicle = (newOrder.vehicle_type || "").toLowerCase().trim();

              let isMatch = false;

              if (!orderVehicle || orderVehicle === 'any' || orderVehicle === 'all') {
                  isMatch = true; 
              } else if (myVehicle && orderVehicle === myVehicle) {
                  isMatch = true; 
              }

              if (isMatch) {
                  setRingingOrder(newOrder); 
              }
          }
        })
        .subscribe();
    } else {
      setRingingOrder(null);
    }

    return () => {
      if (orderSubscription) supabase.removeChannel(orderSubscription);
    };
  }, [isOnline, driverVehicle]);

  const toggleOnline = () => {
    if (isOnline) {
        const confirmOffline = window.confirm("Are you sure you want to go offline? You will stop receiving new orders.");
        if (confirmOffline) {
            setIsOnline(false);
            localStorage.setItem("isOnline", "false");
        }
    } else {
        setIsOnline(true);
        localStorage.setItem("isOnline", "true");
    }
  };

  const acceptOrder = async (id) => {
    const acceptedOrder = ringingOrder;
    setRingingOrder(null); 
    
    await supabase
      .from('orders')
      .update({ status: 'Accepted', driver_name: driverName, driver_number: regData.mobile }) 
      .eq('id', id);
      
    setNavigatingOrder(acceptedOrder);
  };

  const declineOrder = (id) => {
    setRingingOrder(null);
  };

  const handleGoToLocation = () => {
      if (navigatingOrder) {
          localStorage.setItem('activeTrip', JSON.stringify({ ...navigatingOrder, step: 0 }));
      }
      
      setNavigatingOrder(null);
      
      if (setActiveTab) {
          setActiveTab('orders'); 
      }
  };

  const openNotifications = () => {
      setShowNotifications(true);
      setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const unreadCount = alerts.filter(a => !a.read).length;

  return (
    <>
      <style>{`
        @keyframes moveRoad { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes moveCity { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes driveBounce { 0%, 100% { transform: translateY(0) rotate(0deg); } 25% { transform: translateY(1px) rotate(0.5deg); } 50% { transform: translateY(-1px) rotate(0deg); } 75% { transform: translateY(0.5px) rotate(-0.5deg); } }
        @keyframes wheelSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes exhaustPuff { 0% { transform: translate(0,0) scale(0.5); opacity: 0.7; } 100% { transform: translate(-30px,-15px) scale(2); opacity: 0; } }
        @keyframes passingCloud { from { transform: translateX(100%); opacity: 0; } 10% { opacity: 0.8; } 90% { opacity: 0.8; } to { transform: translateX(-150%); opacity: 0; } }
        @keyframes bellRing { 0%, 100% { transform: rotate(0deg); } 10%, 30% { transform: rotate(-10deg); } 20%, 40% { transform: rotate(10deg); } }
        @keyframes scaleIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        
        .animate-road-fast { animation: moveRoad 0.6s linear infinite; }
        .animate-city-slow { animation: moveCity 15s linear infinite; }
        .animate-truck-physics { animation: driveBounce 0.8s ease-in-out infinite; }
        .animate-wheel-spin { transform-origin: center; animation: wheelSpin 0.3s linear infinite; }
        .animate-cloud-1 { animation: passingCloud 12s linear infinite; }
        .animate-cloud-2 { animation: passingCloud 18s linear infinite 5s; }
        .bell-ring { animation: bellRing 1s ease-in-out infinite; display: inline-block; }
        .globe-spin { animation: globeSpin 3s ease-in-out infinite; display: inline-block; }
        .animate-scale-in { animation: scaleIn 0.2s ease-out; }
        .exhaust-puff { position: absolute; background: rgba(255,255,255,0.4); border-radius: 50%; pointer-events: none; }
        .puff-1 { width: 6px; height: 6px; animation: exhaustPuff 1s ease-out infinite; left: 5px; top: 45px; }
        .puff-2 { width: 8px; height: 8px; animation: exhaustPuff 1s ease-out infinite 0.3s; left: 5px; top: 45px; }
        .puff-3 { width: 5px; height: 5px; animation: exhaustPuff 1s ease-out infinite 0.6s; left: 5px; top: 45px; }
      `}</style>

      {/* POPUP INJECTED HERE AUTOMATICALLY */}
      {ringingOrder && (
        <NewOrderPopup 
            order={ringingOrder} 
            isPrime={isPrimePartner} 
            onAccept={acceptOrder} 
            onDecline={declineOrder} 
        />
      )}

      {/* NAVIGATION CONFIRMATION MODAL */}
      {navigatingOrder && (
          <NavigationModal 
              order={navigatingOrder} 
              onClose={() => setNavigatingOrder(null)} 
              onGoToLocation={handleGoToLocation} 
          />
      )}

      {/* LANGUAGE MODAL */}
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
                <button onClick={() => setShowLangModal(false)} className="w-full mt-6 py-3 text-slate-500 font-bold hover:text-slate-700 dark:text-slate-400">Close / மூடு</button>
            </div>
        </div>
      )}

      {/* INVISIBLE CLICK-OUTSIDE BACKDROP FOR NOTIFICATIONS */}
      {showNotifications && (
        <div className="fixed inset-0 z-[40]" onClick={() => setShowNotifications(false)}></div>
      )}

      {/* SYSTEM NOTIFICATIONS & ALERTS */}
      <div className={`fixed right-4 max-w-[calc(100vw-32px)] w-[360px] bg-white dark:bg-slate-800 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-[50] transition-all duration-300 overflow-hidden flex flex-col ${showNotifications ? 'top-[70px] opacity-100 pointer-events-auto' : 'top-[-100%] opacity-0 pointer-events-none'}`}>
          <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Alerts & Offers</h3>
              <button onClick={() => setShowNotifications(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-slate-600 dark:text-slate-300">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
              </button>
          </div>
          <div className="overflow-y-auto max-h-[60vh] p-4 space-y-3">
              {alerts.length > 0 ? (
                  alerts.map(alert => (
                      <div key={alert.id} className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden">
                          {alert.type === 'offer' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500"></div>}
                          {alert.type === 'info' && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500"></div>}
                          
                          <div className="flex gap-3 pl-2">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.type === 'offer' ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30' : 'bg-brand-100 text-brand-600 dark:bg-brand-900/30'}`}>
                                  {getIcon(alert.type === 'offer' ? 'gift' : 'info', 20)}
                              </div>
                              <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">{alert.title}</h4>
                                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{alert.message}</p>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase mt-2">{alert.time}</p>
                              </div>
                          </div>
                      </div>
                  ))
              ) : (
                  <div className="text-center py-8">
                      <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                          {getIcon('bell', 32)}
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">No new alerts</p>
                  </div>
              )}
          </div>
      </div>

      {/* HEADER LOGIC */}
      <header className="fixed top-0 w-full z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-800/50 pt-safe-top transition-colors duration-300">
        <div className="px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-brand-600 rounded-lg flex items-center justify-center shadow-lg text-white font-black text-xs transform rotate-3">QC</div>
            <div>
              <h1 className="font-bold text-slate-800 dark:text-white leading-none text-sm">Hi, {driverName.split(" ")[0]}</h1>
              <div className="flex items-center gap-1 mt-1">
                <span className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500 animate-pulse" : "bg-slate-400"}`} />
                <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase">{isOnline ? "ONLINE" : "OFFLINE"}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* ONLINE TOGGLE */}
            <div onClick={toggleOnline} className={`toggle-switch relative h-9 w-16 rounded-full cursor-pointer transition-all duration-300 ${isOnline ? "bg-green-500" : "bg-slate-300 dark:bg-slate-700"} flex items-center px-1 shadow-inner active:scale-95`}>
              <div className="absolute inset-0 flex items-center justify-between px-2 text-[9px] font-black uppercase pointer-events-none">
                  <span className={`${isOnline ? 'text-white opacity-100' : 'text-transparent opacity-0'} transition-all duration-200`}>ON</span>
                  <span className={`${!isOnline ? 'text-white opacity-100' : 'text-transparent opacity-0'} transition-all duration-200`}>OFF</span>
              </div>
              <div className={`toggle-knob relative w-7 h-7 bg-white rounded-full shadow-lg transform ${isOnline ? "translate-x-7" : "translate-x-0"} flex items-center justify-center pointer-events-none transition-transform duration-300`}>
                {getIcon("power", 14, isOnline ? "text-green-500" : "text-slate-400")}
              </div>
            </div>

            {/* LANGUAGE BUTTON */}
            <button onClick={() => setShowLangModal(true)} className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                <span className="globe-spin">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path></svg>
                </span>
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-brand-500 text-white text-[8px] font-bold rounded-full flex items-center justify-center uppercase">
                    {currentLang}
                </span>
            </button>
            
            {/* THEME TOGGLE */}
            <button onClick={toggleTheme} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${isDark ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-purple-500/50' : 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/50'} active:scale-95 hover:scale-105`}>
                {isDark ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
                )}
            </button>

            {/* NOTIFICATION BELL BUTTON */}
            <button onClick={openNotifications} className="relative w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95">
                <span className={unreadCount > 0 ? "bell-ring" : ""}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
                </span>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce shadow-sm">
                        {unreadCount}
                    </span>
                )}
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <div className="space-y-6 fade-in pt-24 px-4 pb-24">
            
            {/* 1. TRUCK HEADER */}
            <div className="w-full h-48 rounded-3xl overflow-hidden bg-gradient-to-r from-sky-400 to-blue-600 dark:from-slate-800 dark:to-slate-900 relative shadow-xl shadow-blue-500/20 cursor-pointer hover:scale-[1.02] active:scale-[0.98] transition-transform">
                
                <div className={`absolute right-4 top-4 ${celestialColor} animate-pulse transition-colors duration-500`}>
                    {celestialIcon}
                </div>
                
                <div className="absolute top-8 left-[-50px] text-white/30 animate-cloud-1">{getIcon('package', 30)}</div> 
                <div className="absolute top-12 left-[-80px] text-white/20 animate-cloud-2">{getIcon('package', 40)}</div>

                <div className="absolute bottom-16 left-0 w-[200%] h-12 animate-city-slow opacity-30 text-white">
                    <svg viewBox="0 0 1000 50" preserveAspectRatio="none" className="w-full h-full">
                        <path d="M0,50 L0,20 L20,20 L20,40 L40,40 L40,15 L60,15 L60,45 L80,45 L80,10 L110,10 L110,50 Z" fill="currentColor"/>
                        <path d="M120,50 L120,25 L140,25 L140,40 L160,40 L160,10 L190,10 L190,50 Z" fill="currentColor" transform="translate(120,0)"/>
                        <path d="M220,50 L220,30 L250,30 L250,50 Z" fill="currentColor" transform="translate(200,0)"/>
                        <path d="M300,50 L300,20 L330,20 L330,50 Z" fill="currentColor" transform="translate(200,0)"/>
                        <path d="M400,50 L400,15 L440,15 L440,50 Z" fill="currentColor" transform="translate(100,0)"/>
                        <path d="M0,50 L0,20 L20,20 L20,40 L40,40 L40,15 L60,15 L60,45 L80,45 L80,10 L110,10 L110,50 Z" fill="currentColor" transform="translate(500,0)"/>
                        <path d="M600,50 L600,25 L640,25 L640,50 Z" fill="currentColor" transform="translate(100,0)"/>
                    </svg>
                </div>

                <div className="absolute bottom-0 w-full h-16 bg-slate-700 flex items-center overflow-hidden">
                    <div className="w-[200%] h-1 bg-transparent border-t-2 border-dashed border-white/50 animate-road-fast absolute top-1/2"></div>
                </div>

                <div className="absolute bottom-6 left-8 animate-truck-physics z-10">
                    <div className="exhaust-puff puff-1"></div>
                    <div className="exhaust-puff puff-2"></div>
                    <div className="exhaust-puff puff-3"></div>

                    <svg width="120" height="60" viewBox="0 0 120 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M10 20 H80 V50 H10 Z" fill="#F8FAFC"/>
                        <path d="M80 30 H110 V50 H80 Z" fill="#CBD5E1"/>
                        <path d="M80 30 H100 L95 20 H80 Z" fill="#CBD5E1"/>
                        <rect x="10" y="30" width="70" height="10" fill="#06B6D4"/>
                        <text x="25" y="38" fontSize="6" fontWeight="bold" fill="white">QC LOGISTICS</text>
                        <g className="animate-wheel-spin" style={{transformBox: 'fill-box', transformOrigin: 'center'}}>
                            <circle cx="25" cy="50" r="8" fill="#334155" stroke="#1E293B" strokeWidth="2"/>
                            <circle cx="25" cy="50" r="3" fill="#94A3B8"/>
                            <line x1="25" y1="42" x2="25" y2="58" stroke="#94A3B8" strokeWidth="1" />
                            <line x1="17" y1="50" x2="33" y2="50" stroke="#94A3B8" strokeWidth="1" />
                        </g>
                        <g className="animate-wheel-spin" style={{transformBox: 'fill-box', transformOrigin: 'center'}}>
                            <circle cx="65" cy="50" r="8" fill="#334155" stroke="#1E293B" strokeWidth="2"/>
                            <circle cx="65" cy="50" r="3" fill="#94A3B8"/>
                            <line x1="65" y1="42" x2="65" y2="58" stroke="#94A3B8" strokeWidth="1" />
                            <line x1="57" y1="50" x2="73" y2="50" stroke="#94A3B8" strokeWidth="1" />
                        </g>
                        <g className="animate-wheel-spin" style={{transformBox: 'fill-box', transformOrigin: 'center'}}>
                            <circle cx="95" cy="50" r="8" fill="#334155" stroke="#1E293B" strokeWidth="2"/>
                            <circle cx="95" cy="50" r="3" fill="#94A3B8"/>
                            <line x1="95" y1="42" x2="95" y2="58" stroke="#94A3B8" strokeWidth="1" />
                            <line x1="87" y1="50" x2="103" y2="50" stroke="#94A3B8" strokeWidth="1" />
                        </g>
                    </svg>
                </div>

                <div className="absolute top-4 left-4 z-20 text-white">
                    <p className="text-xs font-bold uppercase tracking-wider mb-1 opacity-90">Today's Earnings</p>
                    <h2 className="text-4xl font-black drop-shadow-md">₹{todayStats.earnings}</h2>
                </div>

                <div className="absolute top-4 right-16 flex gap-2 z-20">
                    <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 text-xs text-white font-bold">
                        {todayStats.orders} Trips
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm px-3 py-1 rounded-lg border border-white/10 text-xs text-white font-bold">
                        0h 0m
                    </div>
                </div>
            </div>

            {/* 🔥 NEW: 2. DAILY INCENTIVE CARD (Gamified) */}
            <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 shadow-lg border border-slate-100 dark:border-slate-700 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
                
                <div className="flex justify-between items-center mb-5 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-md">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                        </div>
                        <div>
                            <h3 className="font-black text-slate-900 dark:text-white">Daily Target</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">Earn extra cash today!</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{currentOrders}</span>
                        <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-widest">Trips</span>
                    </div>
                </div>

                {/* Milestone Tracker UI */}
                <div className="relative pt-6 pb-2 px-2">
                    {/* Background Track line */}
                    <div className="absolute top-8 left-3 right-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full z-0"></div>
                    
                    {/* Green Active Fill line */}
                    <div className="absolute top-8 left-3 h-1.5 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full z-0 transition-all duration-1000 ease-out" style={{ width: `calc(${dailyProgress}% * 0.9 + 5px)` }}></div>

                    {/* Nodes */}
                    <div className="relative z-10 flex justify-between">
                        {dailyMilestones.map((ms, index) => {
                            const isReached = currentOrders >= ms.target;
                            const isCurrentTarget = nextMilestone && ms.target === nextMilestone.target;
                            
                            return (
                                <div key={index} className="flex flex-col items-center relative">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border-[3px] transition-all duration-500 ${isReached ? 'bg-emerald-500 border-white dark:border-slate-800 scale-[1.3] shadow-md shadow-emerald-500/40' : isCurrentTarget ? 'bg-white dark:bg-slate-800 border-emerald-400 animate-pulse' : 'bg-slate-200 dark:bg-slate-600 border-white dark:border-slate-800'}`}>
                                        {isReached && <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                                    </div>
                                    <span className={`text-[10px] font-bold mt-2 ${isReached ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                                        {ms.target === 0 ? 'Start' : ms.target}
                                    </span>
                                    {ms.reward > 0 && (
                                        <span className={`text-[10px] font-black ${isReached ? 'text-slate-900 dark:text-white' : 'text-slate-400'}`}>
                                            ₹{ms.reward}
                                        </span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 text-center relative z-10">
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                        {currentOrders >= maxDailyTarget 
                            ? "🎉 Incredible! You've unlocked the max daily bonus!" 
                            : `Complete ${nextMilestone?.target - currentOrders} more trips to unlock ₹${nextMilestone?.reward}!`}
                    </p>
                </div>
            </div>
            
            {/* 3. AUTO-PLAYING MEDIA SLIDER (Advertisement) */}
            <div className="relative w-full h-48 rounded-3xl overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-800">
                {promoMedia.map((media, index) => (
                    <div 
                        key={index} 
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    >
                        {media.type === 'video' ? (
                            <video 
                                src={media.url} 
                                autoPlay 
                                muted 
                                loop 
                                playsInline 
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img 
                                src={media.url} 
                                alt={`Promo ${index}`} 
                                className="w-full h-full object-cover" 
                            />
                        )}
                    </div>
                ))}
                
                {/* Dots Indicator at the bottom of the slider */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-10">
                    {promoMedia.map((_, index) => (
                        <div 
                            key={index} 
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-6 bg-white' : 'w-2 bg-white/50'}`}
                        ></div>
                    ))}
                </div>
            </div>

            {/* 🔥 4. WEEKLY BONUS CARD (Relocated below the slider) */}
            <div className="bg-gradient-to-br from-amber-400 via-orange-400 to-red-500 rounded-3xl p-5 text-white shadow-xl shadow-orange-500/20">
                <div className="flex items-center gap-3 mb-3">
                    {getIcon('gift', 24)}
                    <div>
                        <h3 className="font-black text-base">Weekly Bonus</h3>
                        <p className="text-xs opacity-90">Orders This Week: {weeklyOrders}/20</p>
                    </div>
                </div>
                <div className="relative h-2.5 bg-white/20 rounded-full overflow-hidden mb-3">
                    <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-500" style={{width: `${bonusProgress}%`}}></div>
                </div>
                {weeklyOrders >= 20 ? (
                    <div className="flex items-center gap-2">
                        {getIcon('check', 18)}
                        <span className="font-bold text-sm">₹2000 Bonus Unlocked!</span>
                    </div>
                ) : (
                    <p className="text-sm font-semibold">Keep Going! {ordersRemaining} more orders to unlock ₹2000 bonus</p>
                )}
            </div>

        </div>
    </>
  );
}