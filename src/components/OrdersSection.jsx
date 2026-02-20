import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ICONS } from '../config';

// Helper to pull icons safely from config
const getIcon = (name, size = 24, classes = '') => {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${classes}">${ICONS[name] || ''}</svg>`;
};

export default function OrdersSection({ t }) {
  const [tab, setTab] = useState('new');
  const [activeTrip, setActiveTrip] = useState(null);
  const [driverLocation, setDriverLocation] = useState([13.0827, 80.2707]); // Default: Chennai
  const mapRef = useRef(null);

  // Mock Orders List
  const [orders, setOrders] = useState([
    { 
        id: 'ORD-7721', customer: 'Ramesh Kumar', price: '₹450', location: 'OMR, Chennai', status: 'Pending',
        distance: '4.2 km', items: '20x Cement Bags', pickup: [13.0900, 80.2800], drop: [13.1000, 80.2600],
        pickupAddress: 'Ram Cements, Anna Nagar'
    },
    { 
        id: 'ORD-7722', customer: 'Suresh Raina', price: '₹850', location: 'Adyar, Chennai', status: 'Pending',
        distance: '8.5 km', items: 'Steel TMT Bars', pickup: [13.0700, 80.2500], drop: [13.0500, 80.2200],
        pickupAddress: 'Steel Traders, T. Nagar'
    }
  ]);

  // --- LEAFLET MAP INITIALIZATION ---
  useEffect(() => {
    if (!activeTrip) return;

    const mapId = 'trip-map';
    const mapElement = document.getElementById(mapId);
    if (!mapElement) return;

    // Cleanup existing map instance if React re-renders
    if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
    }

    // 1. Initialize Map
    const map = L.map(mapId, { zoomControl: false }).setView(driverLocation, 13);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19
    }).addTo(map);
    mapRef.current = map;

    // 2. Define Custom Icons matching your HTML
    const createIcon = (iconName, color) => L.divIcon({
        className: 'custom-marker',
        html: `<div class="marker-pin" style="background-color:${color}">
                  <div class="marker-icon text-${color}-600">${getIcon(iconName, 16, 'text-black')}</div>
               </div>`,
        iconSize: [40, 40], iconAnchor: [20, 42]
    });

    const driverIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div class="driver-pulse-marker"></div>`,
        iconSize: [24, 24], iconAnchor: [12, 12]
    });

    // 3. Draw Markers & Lines based on Trip Step
    L.marker(driverLocation, {icon: driverIcon, zIndexOffset: 1000}).addTo(map);
    
    if (activeTrip.step === 0) { // Going to Pickup
        L.marker(activeTrip.pickup, {icon: createIcon('package', '#f59e0b')}).addTo(map);
        L.polyline([driverLocation, activeTrip.pickup], {color: '#06b6d4', weight: 4, dashArray: '10, 10'}).addTo(map);
        map.fitBounds([driverLocation, activeTrip.pickup], {padding: [50, 50]});
    } else { // Going to Dropoff
        L.marker(activeTrip.drop, {icon: createIcon('home', '#10b981')}).addTo(map);
        L.polyline([driverLocation, activeTrip.drop], {color: '#06b6d4', weight: 4}).addTo(map);
        map.fitBounds([driverLocation, activeTrip.drop], {padding: [50, 50]});
    }

    // Cleanup on unmount
    return () => {
        if (mapRef.current) {
            mapRef.current.remove();
            mapRef.current = null;
        }
    };
  }, [activeTrip, driverLocation]);

  // --- ACTIONS ---
  const handleAccept = (order) => {
      setOrders(orders.filter(o => o.id !== order.id));
      setActiveTrip({ ...order, step: 0 }); // Step 0 = Navigating to Pickup
  };

  const handleAdvanceTrip = () => {
      if (activeTrip.step === 0) {
          setActiveTrip({ ...activeTrip, step: 1 }); // Step 1 = Navigating to Dropoff
      } else {
          setActiveTrip(null); // Finished
          alert('Delivery Completed! Earnings added to wallet.');
      }
  };

  // --- RENDER LIVE MAP VIEW ---
  if (activeTrip) {
      return (
          <div className="absolute inset-0 flex flex-col h-[calc(100vh-64px)] z-40 bg-slate-100 dark:bg-dark-bg fade-in">
              {/* Map Container */}
              <div id="trip-map" className="flex-1 w-full z-0"></div>

              {/* Top Controls Overlay */}
              <div className="absolute top-safe pt-4 left-4 right-4 z-30 flex justify-between">
                  <button onClick={() => setActiveTrip(null)} className="w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center text-slate-700 dark:text-slate-300">
                      <span dangerouslySetInnerHTML={{ __html: getIcon('arrowLeft', 20) }} />
                  </button>
                  <div className="bg-white dark:bg-slate-800 px-4 py-2 rounded-full shadow-lg font-bold text-sm dark:text-white flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      Live GPS
                  </div>
              </div>

              {/* Bottom Sheet */}
              <div className="bg-white dark:bg-dark-surface rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.12)] p-6 z-30 slide-up border-t border-slate-100 dark:border-dark-border">
                  <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-5"></div>
                  
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <p className="text-xs font-bold text-brand-600 uppercase tracking-widest mb-1">
                              {activeTrip.step === 0 ? 'Navigating to Pickup' : 'Navigating to Dropoff'}
                          </p>
                          <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-1">
                              24 min <span className="text-lg font-medium text-slate-400">({activeTrip.distance})</span>
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                              {activeTrip.step === 0 ? activeTrip.pickupAddress : activeTrip.location}
                          </p>
                      </div>
                      <div className="flex gap-2">
                          <a href="tel:123" className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 dark:text-green-400 active:scale-95">
                              <span dangerouslySetInnerHTML={{ __html: getIcon('phone', 20) }} />
                          </a>
                          <button className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 active:scale-95">
                              <span dangerouslySetInnerHTML={{ __html: getIcon('messageCircle', 20) }} />
                          </button>
                      </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 mb-6 border border-slate-100 dark:border-slate-700 flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500" dangerouslySetInnerHTML={{ __html: getIcon('user', 24) }} />
                      <div>
                          <h3 className="font-bold text-slate-900 dark:text-white">{activeTrip.customer}</h3>
                          <p className="text-xs text-slate-500">{activeTrip.items} • {activeTrip.price}</p>
                      </div>
                  </div>

                  <button onClick={handleAdvanceTrip} className="w-full py-4 rounded-2xl font-black text-lg bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/30 flex items-center justify-center gap-3 active:scale-95 transition-transform">
                      {activeTrip.step === 0 ? 'Arrived at Pickup' : 'Complete Delivery'} 
                      <span dangerouslySetInnerHTML={{ __html: getIcon('check', 24) }} />
                  </button>
              </div>
          </div>
      );
  }

  // --- RENDER NORMAL ORDERS LIST ---
  return (
    <div className="p-6 space-y-6 fade-in pt-8">
      {/* Tabs */}
      <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl">
        <button onClick={() => setTab('new')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === 'new' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}>New Orders</button>
        <button onClick={() => setTab('history')} className={`flex-1 py-3 rounded-xl font-bold transition-all ${tab === 'history' ? 'bg-white dark:bg-slate-700 shadow-sm text-brand-600' : 'text-slate-500'}`}>History</button>
      </div>

      {tab === 'new' ? (
        <div className="space-y-4">
          {orders.length > 0 ? orders.map(order => (
            <div key={order.id} className="bg-white dark:bg-dark-surface p-5 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden">
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div>
                  <span className="text-[10px] font-black text-brand-600 bg-brand-50 dark:bg-brand-900/20 px-2 py-1 rounded uppercase tracking-widest">{order.id}</span>
                  <h3 className="font-bold dark:text-white text-lg mt-2">{order.customer}</h3>
                  <p className="text-xs text-slate-500">{order.items}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-black text-brand-600">{order.price}</p>
                  <span className="text-[10px] text-slate-400 font-bold">{order.distance}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300 text-sm mb-5 font-medium relative z-10">
                <span className="text-slate-400" dangerouslySetInnerHTML={{ __html: getIcon('mapPin', 16) }} />
                {order.location}
              </div>
              <div className="grid grid-cols-2 gap-3 relative z-10">
                  <button className="py-3 font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-slate-100 transition-colors">Decline</button>
                  <button onClick={() => handleAccept(order)} className="py-3 font-bold text-white bg-brand-600 rounded-xl shadow-lg shadow-brand-500/30 active:scale-95 transition-transform">Accept & Start</button>
              </div>
            </div>
          )) : (
            <div className="text-center py-20 text-slate-400">
                <span dangerouslySetInnerHTML={{ __html: getIcon('package', 48, 'mx-auto mb-4 opacity-30') }} />
                <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No New Orders</h3>
                <p className="text-sm">You're all caught up! Waiting for pings...</p>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 text-slate-400">
            <span dangerouslySetInnerHTML={{ __html: getIcon('clipboard', 48, 'mx-auto mb-4 opacity-30') }} />
            <h3 className="font-bold text-lg text-slate-600 dark:text-slate-300">No History Yet</h3>
        </div>
      )}
    </div>
  );
}