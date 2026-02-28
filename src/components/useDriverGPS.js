import { useState, useEffect } from 'react';
import { supabase } from '../config'; 

export default function useDriverGPS(driverMobile, isOnline) {
    const [location, setLocation] = useState([13.0827, 80.2707]);
    const [gpsError, setGpsError] = useState(null);

    useEffect(() => {
        if (!isOnline || !driverMobile) return;

        if (!navigator.geolocation) {
            setGpsError("GPS is not supported by this browser/device.");
            return;
        }

        const handleSuccess = async (position) => {
            const { latitude, longitude, heading } = position.coords;
            const newLocation = [latitude, longitude];
            
            setLocation(newLocation);

            // 🔥 FIX: Now updates 'driver_profiles' instead of 'driver_details'
            let safeMobile = String(driverMobile).replace(/\D/g, '').slice(-10);
            
            try {
                await supabase.from('driver_profiles').update({
                    current_lat: latitude,
                    current_lng: longitude,
                    heading: heading || 0, 
                    last_active: new Date().toISOString()
                }).eq('mobile_number', safeMobile);
            } catch (error) {
                console.error("Failed to update GPS in DB:", error);
            }
        };

        const handleError = (error) => {
            console.error("GPS Watch Error:", error);
            setGpsError(error.message);
        };

        const watchId = navigator.geolocation.watchPosition(
            handleSuccess, 
            handleError, 
            { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, driverMobile]);

    return { location, gpsError };
}