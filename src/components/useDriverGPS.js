import { useState, useEffect } from 'react';
import { supabase } from '../config'; // Make sure this path points to your Supabase config

export default function useDriverGPS(driverMobile, isOnline) {
    // Default fallback location
    const [location, setLocation] = useState([13.0827, 80.2707]);
    const [gpsError, setGpsError] = useState(null);

    useEffect(() => {
        // Only track if the driver is marked as ONLINE
        if (!isOnline || !driverMobile) return;

        if (!navigator.geolocation) {
            setGpsError("GPS is not supported by this browser/device.");
            return;
        }

        const handleSuccess = async (position) => {
            const { latitude, longitude, heading, speed } = position.coords;
            const newLocation = [latitude, longitude];
            
            // 1. Update the local React state so the map moves immediately
            setLocation(newLocation);

            // 2. Silently update Supabase so the customer can see the driver moving
            // Note: Make sure you add 'current_lat' and 'current_lng' columns to 'driver_details'
            try {
                await supabase.from('driver_details').update({
                    current_lat: latitude,
                    current_lng: longitude,
                    heading: heading || 0, // Which direction the car is facing
                    last_active: new Date().toISOString()
                }).eq('mobile_number', driverMobile);
            } catch (error) {
                console.error("Failed to update GPS in DB:", error);
            }
        };

        const handleError = (error) => {
            console.error("GPS Watch Error:", error);
            setGpsError(error.message);
        };

        // Start continuously watching the GPS hardware
        const watchId = navigator.geolocation.watchPosition(
            handleSuccess, 
            handleError, 
            {
                enableHighAccuracy: true, // Forces the device to use hardware GPS (not just WiFi/Cell towers)
                maximumAge: 5000,         // Don't use cached locations older than 5 seconds
                timeout: 10000            // Timeout if no signal after 10 seconds
            }
        );

        // Cleanup function: Stop tracking if they go offline or close the app
        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, [isOnline, driverMobile]);

    return { location, gpsError };
}