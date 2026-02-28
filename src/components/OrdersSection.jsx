import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase, ICONS } from '../config';
import ChatModal from './ChatModal';
import useDriverGPS from './useDriverGPS';

const getIcon = (name, size = 24, classes = '') => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}">${ICONS[name] || ''}</svg>`;
};

// ═══════════════════════════════════════════════════════════════════════════
// NAVIGATION CONFIRMATION MODAL
// ═══════════════════════════════════════════════════════════════════════════
function NavigationModal({ order, onClose, onGoToLocation }) {
    const pickupAddress = order?.vendor_shop_name || order?.pickup_address || 'Pickup Location';
    const dropAddress = order?.delivery_address || order?.client_address || order?.customer_address || 'Drop Location';

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center">
            <style>{`
                @keyframes slideUpFade { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            `}</style>

            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"></div>
            
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
                        <div className="w-9 h-9 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5" dangerouslySetInnerHTML={{ __html: getIcon('mapPin', 18, 'text-white') }}></div>
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
                        <div className="w-9 h-9 rounded-full bg-brand-500 flex items-center justify-center flex-shrink-0 mt-0.5" dangerouslySetInnerHTML={{ __html: getIcon('mapPin', 18, 'text-white') }}></div>
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
// MAIN ORDERS SECTION
// ═══════════════════════════════════════════════════════════════════════════
export default function OrdersSection({ t, regData }) {
  const [tab, setTab] = useState('new');
  const [historyFilter, setHistoryFilter] = useState('Completed'); 
  
  const [activeTrip, setActiveTrip] = useState(() => {
      try {
          const savedTrip = localStorage.getItem('activeTrip');
          return savedTrip ? JSON.parse(savedTrip) : null;
      } catch(e) { return null; }
  });
  
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const cancelReasonsList = [
      "Customer is unreachable",
      "Vehicle breakdown / issue",
      "Heavy traffic / area blocked",
      "Incorrect address provided",
      "Package too large for vehicle",
      "Personal emergency"
  ];

  const [navigatingOrder, setNavigatingOrder] = useState(null); 
  const { location: driverLocation, gpsError } = useDriverGPS(regData?.mobile, true);
  const [otpInput, setOtpInput] = useState('');

  const [orders, setOrders] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  const [driverUuid, setDriverUuid] = useState(null);
  const [driverVehicleDetails, setDriverVehicleDetails] = useState(null); 
  
  const mapRef = useRef(null);
  const mapContainerRef = useRef(null);

  // 1. SAFE DATA INITIALIZATION
  useEffect(() => {
      const fetchDriverData = async () => {
          try {
              if (!regData?.mobile) return;
              let safeMobile = String(regData.mobile).replace(/\D/g, '').slice(-10);

              const { data: profile } = await supabase.from('driver_profiles').select('id').eq('mobile_number', safeMobile).maybeSingle();

              if (profile) {
                  setDriverUuid(profile.id);
                  const { data: vehicle } = await supabase.from('driver_vehicles').select('*').eq('driver_id', profile.id).maybeSingle();
                  setDriverVehicleDetails(vehicle || {});
              }
          } catch(e) { console.error("Profile fetch error in orders section", e); }
      };
      fetchDriverData();
  }, [regData?.mobile]);

  // 2. THE EXACT MATCH 6-RULE ENGINE (Handles numbers perfectly)
  const checkOrderMatch = (order, vehicle) => {
      if (!vehicle || !order) return false;

      // Safe extraction turns "1000", "1200 kg", "1.5 tons" into pure numbers
      const extractNum = (str) => {
          if (!str || String(str).toLowerCase() === 'null' || String(str).toLowerCase() === 'any') return 0;
          const match = String(str).match(/\d+(\.\d+)?/);
          return match ? parseFloat(match[0]) : 0;
      };

      const reqType = (order.vehicle_type_requested || order.vehicle_type || "").toLowerCase().trim();
      const myType = (vehicle.vehicle_type || "").toLowerCase().trim();
      if (reqType && reqType !== 'any' && reqType !== 'null' && reqType !== myType) return false;

      const reqWeight = extractNum(order.weight_capacity_requested);
      const myWeight = extractNum(vehicle.weight_capacity);
      if (reqWeight > 0 && myWeight < reqWeight) return false; 

      const reqBody = (order.body_type_requested || "").toLowerCase().trim();
      const myBody = (vehicle.body_type || "").toLowerCase().trim();
      if (reqBody && reqBody !== 'any' && reqBody !== 'null' && reqBody !== myBody) return false;

      const reqDim = extractNum(order.dimensions_requested);
      const myDim = extractNum(vehicle.dimensions);
      if (reqDim > 0 && myDim < reqDim) return false;

      const reqModelId = (order.model_id_requested || "").toLowerCase().trim();
      const myModelId = (vehicle.model_id || "").toLowerCase().trim();
      if (reqModelId && reqModelId !== 'any' && reqModelId !== 'null' && reqModelId !== myModelId) return false;

      const reqModelName = (order.model_name_requested || "").toLowerCase().trim();
      const myModelName = (vehicle.model_name || "").toLowerCase().trim();
      if (reqModelName && reqModelName !== 'any' && reqModelName !== 'null' && reqModelName !== myModelName) return false;

      return true; 
  };

  // 3. FETCH & FILTER ORDERS
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      
      if (tab === 'new') {
        const { data } = await supabase.from('driver_orders')
          .select('*')
          .or('status.ilike.pending,status.is.null') // Core requirement
          .order('created_at', { ascending: false });

        if (data && driverVehicleDetails) {
           const filtered = data.filter(o => checkOrderMatch(o, driverVehicleDetails));
           setOrders(filtered);
        }
      } 
      else {
        if (driverUuid) {
            const { data } = await supabase.from('driver_orders')
                .select('*').eq('driver_id', driverUuid).in('status', ['Completed']).order('created_at', { ascending: false });

            const localVault = JSON.parse(localStorage.getItem(`local_history_${regData?.mobile}`) || "[]");
            let combinedHistory = data ? [...data] : [];
            const existingIds = new Set(combinedHistory.map(item => item.id));
            
            localVault.forEach(item => {
                if (!existingIds.has(item.id)) combinedHistory.push(item);
            });

            combinedHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            setHistory(combinedHistory);
        }
      }
      setIsLoading(false);
    };

    if (driverVehicleDetails) fetchOrders();

    const orderSub = supabase.channel('public:driver_orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'driver_orders' }, () => {
        if (driverVehicleDetails) fetchOrders(); 
      }).subscribe();

    return () => supabase.removeChannel(orderSub);
  }, [tab, driverUuid, driverVehicleDetails, historyFilter, regData?.mobile]);

  // 4. MAP RENDERING & GPS ROUTING
  useEffect(() => {
    if (!activeTrip || !mapContainerRef.current || !driverLocation) return;

    if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, { zoomControl: false }).setView(driverLocation, 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
    mapRef.current = map;

    const createIcon = (iconName, color) => L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color:${color}"><div class="marker-icon text-${color}-600">${getIcon(iconName, 16, 'text-black')}</div></div>`,
        iconSize: [40, 40], iconAnchor: [20, 42]
    });
    const driverIcon = L.divIcon({ className: 'custom-marker', html: `<div class="driver-pulse-marker"></div>`, iconSize: [24, 24], iconAnchor: [12, 12] });

    L.marker(driverLocation, {icon: driverIcon, zIndexOffset: 1000}).addTo(map);
    
    const extractCoords = (order, type) => {
        if (!order) return [13.0827, 80.2707];
        if (type === 'pickup') {
            if (order.pickup_coords) return order.pickup_coords;
            if (order.pickup_latitude && order.pickup_longitude) return [parseFloat(order.pickup_latitude), parseFloat(order.pickup_longitude)];
            return [13.0827, 80.2707];
        } else {
            if (order.drop_coords) return order.drop_coords;
            if (order.delivery_latitude && order.delivery_longitude) return [parseFloat(order.delivery_latitude), parseFloat(order.delivery_longitude)];
            if (order.client_latitude && order.client_longitude) return [parseFloat(order.client_latitude), parseFloat(order.client_longitude)];
            return [13.1000, 80.2600];
        }
    };

    const pickupCoords = extractCoords(activeTrip, 'pickup');
    const dropCoords = extractCoords(activeTrip, 'drop');

    const fetchRoute = async (startCoords, endCoords, color, dashArray) => {
        try {
            let routingProfile = 'driving-car'; 
            const vType = (driverVehicleDetails?.vehicle_type || "").toLowerCase();
            if (vType === 'truck' || vType === 'tempo') routingProfile = 'driving-hgv'; 
            else if (vType === '2wheeler') routingProfile = 'cycling-electric'; 

            const response = await fetch(`https://api.openrouteservice.org/v2/directions/${routingProfile}`, {
                method: "POST",
                headers: {
                    "Authorization": "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6IjcwNjVlNGViMDg5YTRlNWNhODY1ZmU2NDI3MjUyMWZkIiwiaCI6Im11cm11cjY0In0=",
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ coordinates: [[startCoords[1], startCoords[0]], [endCoords[1], endCoords[0]]] })
            });

            const data = await response.json();
            if (data.features && data.features[0]) {
                const coords = data.features[0].geometry.coordinates;
                const latLngs = coords.map(c => [c[1], c[0]]); 
                L.polyline(latLngs, { color: color, weight: 5, opacity: 0.8, dashArray: dashArray }).addTo(map);
            } else {
                throw new Error("No route found");
            }
        } catch (error) {
            console.error('GPS Path Error:', error);
            L.polyline([startCoords, endCoords], {color: color, weight: 4, dashArray: dashArray}).addTo(map);
        }
    };

    if (activeTrip.step === 0) { 
        L.marker(pickupCoords, {icon: createIcon('package', '#f59e0b')}).addTo(map);
        fetchRoute(driverLocation, pickupCoords, '#06b6d4', '10, 10');
        map.fitBounds([driverLocation, pickupCoords], {padding: [50, 50]});
    } else { 
        L.marker(dropCoords, {icon: createIcon('home', '#10b981')}).addTo(map);
        fetchRoute(driverLocation, dropCoords, '#06b6d4', null);
        map.fitBounds([driverLocation, dropCoords], {padding: [50, 50]});
    }

    return () => { if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; } };
  }, [activeTrip, driverLocation, driverVehicleDetails]);

  // 5. ACTION HANDLERS
  const handleAccept = async (order) => {
      if (!driverUuid || !order) return;
      setOrders(prev => prev.filter(o => o.id !== order.id));
      await supabase.from('driver_orders').update({ status: 'Accepted', driver_id: driverUuid }).eq('id', order.id);
      localStorage.setItem('activeTrip', JSON.stringify({ ...order, step: 0 }));
      setNavigatingOrder(order);
  };

  const handleIgnore = (order) => {
      if (!order) return;
      setOrders(prev => prev.filter(o => o.id !== order.id));
      const missedRecord = { ...order, status: 'Missed', created_at: new Date().toISOString() };
      const localVault = JSON.parse(localStorage.getItem(`local_history_${regData?.mobile}`) || "[]");
      localVault.push(missedRecord);
      localStorage.setItem(`local_history_${regData?.mobile}`, JSON.stringify(localVault));
  };

  const handleGoToLocation = () => {
      const order = navigatingOrder;
      setNavigatingOrder(null); 
      setActiveTrip({ ...order, step: 0 }); 
  };

  const handleStartVoiceNavigation = () => {
      const extractCoords = (order, type) => {
          if (type === 'pickup') {
              if (order.pickup_latitude && order.pickup_longitude) return [parseFloat(order.pickup_latitude), parseFloat(order.pickup_longitude)];
              return [13.0827, 80.2707];
          } else {
              if (order.delivery_latitude && order.delivery_longitude) return [parseFloat(order.delivery_latitude), parseFloat(order.delivery_longitude)];
              return [13.1000, 80.2600];
          }
      };
      const targetCoords = activeTrip.step === 0 ? extractCoords(activeTrip, 'pickup') : extractCoords(activeTrip, 'drop');
      const travelMode = (driverVehicleDetails?.vehicle_type || "").toLowerCase() === '2wheeler' ? 'two-wheeler' : 'driving';
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${targetCoords[0]},${targetCoords[1]}&travelmode=${travelMode}`, '_blank');
  };

  const handleAdvanceTrip = async () => {
      if (activeTrip.step === 0) {
          let pLat = parseFloat(activeTrip.pickup_latitude) || 13.0827;
          let pLng = parseFloat(activeTrip.pickup_longitude) || 80.2707;
          
          if (driverLocation) {
              const distanceInMeters = L.latLng(driverLocation).distanceTo(L.latLng([pLat, pLng]));
              if (distanceInMeters > 200) {
                  alert(`You are still ${Math.round(distanceInMeters)} meters away. Please reach the pickup location before marking as arrived.`);
                  return; 
              }
          }
          const updatedTrip = { ...activeTrip, step: 1 };
          setActiveTrip(updatedTrip); 
          localStorage.setItem('activeTrip', JSON.stringify(updatedTrip)); 
      } else if (activeTrip.step === 1) {
          const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString();
          await supabase.from('driver_orders').update({ delivery_otp: generatedOtp }).eq('id', activeTrip.id);
          alert(`[SIMULATED SMS TO CUSTOMER] Your delivery OTP is: ${generatedOtp}`);
          const updatedTrip = { ...activeTrip, step: 2, correctOtp: generatedOtp };
          setActiveTrip(updatedTrip);
          localStorage.setItem('activeTrip', JSON.stringify(updatedTrip)); 
      }
  };

  const handleVerifyOtp = async () => {
      if (otpInput === activeTrip.correctOtp) {
          await supabase.from('driver_orders').update({ status: 'Completed' }).eq('id', activeTrip.id);
          setActiveTrip(null);
          localStorage.removeItem('activeTrip'); 
          setOtpInput(''); 
          alert('Delivery Completed! Earnings added to wallet.');
          setTab('history'); 
          setHistoryFilter('Completed');
      } else {
          alert('Invalid OTP. Please ask the customer and try again.');
          setOtpInput(''); 
      }
  };

  const confirmCancelTrip = async () => {
      if (!cancelReason) {
          alert("Please select a reason before cancelling.");
          return;
      }
      try {
          await supabase.from('driver_orders').update({ status: 'pending', driver_id: null }).eq('id', activeTrip.id);
          const cancelRecord = { ...activeTrip, status: 'Cancelled', cancel_reason: cancelReason, created_at: new Date().toISOString() };
          const localVault = JSON.parse(localStorage.getItem(`local_history_${regData?.mobile}`) || "[]");
          localVault.push(cancelRecord);
          localStorage.setItem(`local_history_${regData?.mobile}`, JSON.stringify(localVault));

          setActiveTrip(null);
          localStorage.removeItem('activeTrip'); 
          setIsCancelModalOpen(false);
          setCancelReason("");
          alert("Order cancelled. It has been returned to the available pool.");
          setTab('history'); 
          setHistoryFilter('Cancelled'); 
      } catch (err) {}
  };

  if (activeTrip) {
      return (
          <div className="absolute inset-0 flex flex-col h-[calc(100vh-64px)] z-40 bg-slate-100 dark:bg-dark-bg fade-in">
              <div ref={mapContainerRef} className="flex-1 w-full z-0"></div>
              
              <div className="absolute top-safe pt-4 left-4 right-4 z-30 flex justify-between">
                  <button onClick={() => alert("⚠️ You cannot exit the map until the delivery is completed or cancelled!")} className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-300 active:scale-95 transition-transform">
                      <span dangerouslySetInnerHTML={{ __html: getIcon('arrowLeft', 20) }} />
                  </button>
                  <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg font-bold text-sm dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Live GPS
                  </div>
              </div>
              
              <div className="bg-white dark:bg-dark-surface rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-6 z-30 slide-up border-t border-slate-100 dark:border-dark-border">
                  <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
                  
                  {activeTrip.step < 2 ? (
                      <>
                          <div className="flex justify-between items-start mb-6">
                              <div>
                                  <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
                                      {activeTrip.step === 0 ? 'Navigating to Pickup' : 'Navigating to Dropoff'}
                                  </p>
                                  <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                                      On Route <span className="text-lg font-medium text-slate-400">({activeTrip.distance || 'calculating...'})</span>
                                  </h2>
                                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                                      {activeTrip.step === 0 ? (activeTrip.vendor_shop_name || activeTrip.pickup_address) : (activeTrip.delivery_address || activeTrip.client_address)}
                                  </p>
                              </div>
                              
                              <div className="flex gap-2">
                                  <button onClick={() => setIsChatOpen(true)} className="w-12 h-12 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center text-brand-600 dark:text-brand-400 active:scale-95 transition-transform shadow-sm">
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
                                  </button>
                                  <button className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 active:scale-95 transition-transform shadow-sm">
                                      <span dangerouslySetInnerHTML={{ __html: getIcon('phone', 20) }} />
                                  </button>
                              </div>
                          </div>
                          
                          <div className="grid grid-cols-1 gap-3 mb-3">
                              <button onClick={handleStartVoiceNavigation} className="w-full py-4 rounded-2xl font-bold text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-95 transition-transform">
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
                                  Start Navigation ↗
                              </button>
                          </div>

                          <button onClick={handleAdvanceTrip} className="w-full py-4 rounded-2xl font-black text-lg border-2 border-brand-600 text-brand-600 dark:border-brand-500 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/10 hover:bg-brand-100 dark:hover:bg-brand-900/30 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                              {activeTrip.step === 0 ? 'Arrived at Pickup' : 'Complete Delivery'} 
                              <span dangerouslySetInnerHTML={{ __html: getIcon('check', 24) }} />
                          </button>

                          <button onClick={() => setIsCancelModalOpen(true)} className="w-full mt-3 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95">
                              Cancel Order
                          </button>
                      </>
                  ) : (
                      <div className="text-center slide-up">
                          <div className="w-16 h-16 bg-brand-100 dark:bg-brand-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600 dark:text-brand-400">
                              <span dangerouslySetInnerHTML={{ __html: getIcon('key', 32) }} />
                          </div>
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Enter OTP to Complete</h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">Ask the customer for the 4-digit code sent to their phone.</p>
                          
                          <input 
                              type="number" 
                              maxLength={4}
                              placeholder="0000"
                              value={otpInput}
                              onChange={(e) => setOtpInput(e.target.value.slice(0, 4))}
                              className="w-full max-w-[200px] mx-auto p-4 text-center text-3xl font-black tracking-[0.5em] rounded-2xl bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 outline-none focus:border-brand-500 dark:text-white mb-6"
                          />
                          
                          <button 
                              onClick={handleVerifyOtp} 
                              disabled={!otpInput || otpInput.length !== 4}
                              className="w-full py-4 rounded-2xl font-black text-lg bg-green-600 hover:bg-green-700 text-white shadow-xl shadow-green-500/30 flex items-center justify-center gap-3 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                          >
                              Verify & Complete
                          </button>

                          <button onClick={() => setIsCancelModalOpen(true)} className="w-full mt-4 py-3 rounded-2xl font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95">
                              Cancel Order
                          </button>
                      </div>
                  )}
              </div>

              <ChatModal 
                  isOpen={isChatOpen} 
                  onClose={() => setIsChatOpen(false)} 
                  orderId={activeTrip.id} 
                  driverName={regData?.fullName}
                  vehicleNumber={regData?.vehicleNumber}
                  onCallCustomer={() => alert("Calling Customer...")} 
              />

              {/* CANCELLATION MODAL */}
              {isCancelModalOpen && (
                  <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={() => setIsCancelModalOpen(false)}></div>
                      
                      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl slide-up">
                          <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2 text-center text-red-600 flex items-center justify-center gap-2">
                             <span dangerouslySetInnerHTML={{ __html: getIcon('alertCircle', 24) }} /> Cancel Order
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">Select a valid reason for cancelling this trip.</p>

                          <div className="space-y-2 mb-6 max-h-[40vh] overflow-y-auto no-scrollbar pr-1">
                              {cancelReasonsList.map((reason, idx) => (
                                  <label key={idx} className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${cancelReason === reason ? 'border-red-500 bg-red-50 dark:bg-red-900/20' : 'border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'}`}>
                                      <input 
                                          type="radio" 
                                          name="cancel_reason" 
                                          value={reason} 
                                          onChange={(e) => setCancelReason(e.target.value)} 
                                          className="hidden" 
                                      />
                                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${cancelReason === reason ? 'border-red-500' : 'border-slate-300 dark:border-slate-600'}`}>
                                          {cancelReason === reason && <div className="w-2.5 h-2.5 bg-red-500 rounded-full"></div>}
                                      </div>
                                      <span className={`font-semibold text-sm ${cancelReason === reason ? 'text-red-700 dark:text-red-400' : 'text-slate-700 dark:text-slate-300'}`}>{reason}</span>
                                  </label>
                              ))}
                          </div>

                          <div className="space-y-3">
                              <button onClick={confirmCancelTrip} disabled={!cancelReason} className="w-full py-4 rounded-xl font-black text-lg transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 bg-red-600 text-white shadow-lg shadow-red-500/30 hover:bg-red-700">
                                {cancelReason ? 'Confirm Cancel' : 'Select a reason first'}
                              </button>
                              <button onClick={() => setIsCancelModalOpen(false)} className="w-full py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 active:scale-95 transition-transform">
                                Go Back
                              </button>
                          </div>
                      </div>
                  </div>
              )}
          </div>
      );
  }

  const renderOrderCard = (order) => (
      <div key={order.id} className="bg-white dark:bg-dark-surface p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden mb-4">
        <div className="flex justify-between items-start mb-4 relative z-10">
          <div>
            <span className="text-[10px] font-black text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded uppercase tracking-widest">
                {order.vehicle_type_requested || order.vehicle_type || 'Order'} #{String(order.id).slice(0,6)}
            </span>
            <h3 className="font-bold dark:text-white text-lg mt-2">{order.product_name || order.type || 'Delivery Request'}</h3>
            <p className="text-xs text-slate-500">
              {order.quantity ? `${order.quantity} • ` : ''}
              {order.weight_capacity_requested ? `${order.weight_capacity_requested}` : 'Standard Load'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-brand-600">₹{order.total_amount || order.delivery_fee || '0'}</p>
            <span className="text-[10px] text-slate-400 font-bold">{order.distance || 'Dist N/A'}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm mb-5 font-medium relative z-10">
          <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: getIcon('mapPin', 16) }} />
          {order.vendor_shop_name || order.pickup_address || 'Pickup Location'}
        </div>

        <div className="grid grid-cols-2 gap-3 relative z-10">
            <button onClick={() => handleIgnore(order)} className="py-3 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors">Ignore</button>
            <button onClick={() => handleAccept(order)} className="py-3 font-bold text-white bg-brand-600 rounded-xl shadow-lg shadow-brand-500/30 active:scale-95 transition-transform">Accept</button>
        </div>
      </div>
  );

  const getStatusStyle = (status) => {
      const s = (status || "").toLowerCase();
      if (s === 'completed') return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
      if (s === 'cancelled') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      if (s === 'missed') return 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300';
      return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
  };

  const filteredHistory = history.filter(order => {
      if (historyFilter === 'Completed') return order.status === 'Completed';
      if (historyFilter === 'Cancelled') return order.status === 'Cancelled';
      if (historyFilter === 'Missed') return order.status === 'Declined' || order.status === 'Missed';
      return true;
  });

  return (
    <div className="p-6 space-y-6 fade-in pt-8">
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        <button onClick={() => setTab('new')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === 'new' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}>Available</button>
        <button onClick={() => setTab('history')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}>History</button>
      </div>

      <div className="space-y-4 pb-10">
        {isLoading ? (
            <div className="text-center py-20 text-slate-400">
                <div className="w-10 h-10 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto mb-3"></div>
                Loading...
            </div>
        ) : tab === 'new' ? (
            orders.length > 0 ? (
                <div>
                    <div className="mb-8">
                        <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span>
                            New Requests
                        </h2>
                        {orders.slice(0, 2).map(renderOrderCard)}
                    </div>

                    {orders.length > 2 && (
                        <div>
                            <h2 className="text-sm font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <span dangerouslySetInnerHTML={{ __html: getIcon('mapPin', 16) }} />
                                Nearby Available
                            </h2>
                            {orders.slice(2).map(renderOrderCard)}
                        </div>
                    )}
                </div>
            ) : (
                <div className="text-center py-20 text-slate-400">
                    <span dangerouslySetInnerHTML={{ __html: getIcon('package', 48, 'mx-auto mb-4 opacity-30') }} />
                    <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No Orders Available</h3>
                    <p className="text-sm mt-1">You're all caught up! Waiting for pings...</p>
                </div>
            )
        ) : (
            <div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar mb-5 pb-1">
                    {['Completed', 'Cancelled', 'Missed'].map(filter => (
                        <button 
                            key={filter}
                            onClick={() => setHistoryFilter(filter)}
                            className={`px-5 py-2.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${
                                historyFilter === filter 
                                ? 'bg-slate-900 text-white shadow-md dark:bg-brand-600' 
                                : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'
                            }`}
                        >
                            {filter} Orders
                        </button>
                    ))}
                </div>

                {filteredHistory.length > 0 ? filteredHistory.map((order, idx) => (
                    <div key={`${order.id}-${idx}`} className="bg-white dark:bg-dark-surface p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm mb-4 transition-all hover:shadow-md">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h3 className="font-bold dark:text-white text-lg line-clamp-1">{order.product_name || order.type || 'Delivery'}</h3>
                                <p className="text-xs text-slate-500">#{String(order.id).slice(0,6)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-2xl font-black text-brand-600">₹{order.total_amount || order.delivery_fee || '0'}</p>
                            </div>
                        </div>
                        
                        {order.cancel_reason && (
                            <p className="text-xs text-red-500 font-medium mb-2 bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
                                Reason: {order.cancel_reason}
                            </p>
                        )}
                        
                        <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <span className="text-xs font-semibold text-slate-400">{new Date(order.created_at).toLocaleDateString()}</span>
                            <span className={`text-[10px] font-black px-2.5 py-1 rounded uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                                {order.status}
                            </span>
                        </div>
                    </div>
                )) : (
                    <div className="text-center py-20 text-slate-400">
                        <span dangerouslySetInnerHTML={{ __html: getIcon('clipboard', 48, 'mx-auto mb-4 opacity-30') }} />
                        <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No {historyFilter} Orders</h3>
                        <p className="text-sm mt-1">You don't have any {historyFilter.toLowerCase()} trips yet.</p>
                    </div>
                )}
            </div>
        )}
      </div>

      {navigatingOrder && (
          <NavigationModal 
              order={navigatingOrder} 
              onClose={() => setNavigatingOrder(null)} 
              onGoToLocation={handleGoToLocation} 
          />
      )}
    </div>
  );
}