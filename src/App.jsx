import React, { useState, useEffect } from 'react';
import './App.css';
import { supabase, TRANSLATIONS, ICONS } from './config';
import WelcomeView from './components/WelcomeView';
import LoginView from './components/LoginView';
import VerificationView from './components/VerificationView';
import RegistrationView from './components/RegistrationView';
import WalletView from './components/WalletView';
import DashboardView from './components/DashboardView'; 

function App() {
  const [view, setView] = useState(() => localStorage.getItem('qc_current_view') || 'welcome');
  
  const [regData, setRegData] = useState(() => {
      const saved = localStorage.getItem('qc_driver_session');
      return saved ? JSON.parse(saved) : { mobile: '', fullName: '', dob: '' };
  });

  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'true');

  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;

  useEffect(() => {
      if (isDark) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
  }, [isDark]);

  useEffect(() => {
      const handleLanguageUpdate = () => { setLanguage(localStorage.getItem("language") || 'en'); };
      window.addEventListener("languageChange", handleLanguageUpdate);
      return () => window.removeEventListener("languageChange", handleLanguageUpdate);
  }, []);

  // --- LOGIN LOGIC (Send OTP) ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate OTP generation (Check F12 console for the code)
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`📲 Target Mobile: ${regData.mobile} | 🔑 Mock OTP: ${mockOtp}`);
    
    setRegData(prev => ({ ...prev, generatedOtp: mockOtp }));
    setView('verification');
    setLoading(false);
  };

  // --- VERIFICATION LOGIC (Check if user exists in driver_profiles) ---
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (regData.otp === regData.generatedOtp) {
      // Clean mobile number format
      let safeMobile = String(regData.mobile).replace(/\D/g, '').slice(-10);

      // 1. Check if user is already registered (using maybeSingle)
      const { data: profileData, error } = await supabase
          .from('driver_profiles')
          .select('id, mobile_number, driver_id, full_name, avatar_url')
          .eq('mobile_number', safeMobile)
          .maybeSingle(); 

      if (profileData && !error) {
        // ✅ USER EXISTS: Fetch their vehicle data and skip registration
        const { data: vehicleData } = await supabase
            .from('driver_vehicles')
            .select('vehicle_type, registration_number')
            .eq('driver_id', profileData.id)
            .maybeSingle();

        const safeVehicle = vehicleData || {};
        
        // Save full session so the Dashboard loads instantly with real data
        const sessionData = {
            ...regData,
            mobile: profileData.mobile_number, 
            fullName: profileData.full_name,
            driverId: profileData.driver_id, // Gets your DRV2005ARJ id
            uuid: profileData.id,
            avatarUrl: profileData.avatar_url,
            vehicleType: safeVehicle.vehicle_type || 'Not Set',
            vehicleNumber: safeVehicle.registration_number || ''
        };
        
        setRegData(sessionData);
        localStorage.setItem('qc_driver_session', JSON.stringify(sessionData));
        localStorage.setItem('qc_current_view', 'dashboard');
        
        // Route straight to dashboard!
        setView('dashboard');
      } else {
        // ❌ NEW USER: Profile not found, route to Registration Page
        setView('registration');
      }
    } else {
      alert("Invalid OTP! Check your F12 browser console for the mock code.");
    }
    setLoading(false);
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-dark-bg overflow-hidden relative transition-colors duration-500">
      {view === 'welcome' && <WelcomeView setView={setView} t={t} />}
      {view === 'login' && <LoginView regData={regData} setRegData={setRegData} handleLogin={handleLogin} loading={loading} t={t} />}
      {view === 'verification' && <VerificationView regData={regData} setRegData={setRegData} handleVerify={handleVerify} loading={loading} t={t} />}
      {view === 'registration' && <RegistrationView regData={regData} setRegData={setRegData} setView={setView} />}      
      {view === 'wallet' && <WalletView setView={setView} t={t} regData={regData} />}
      {view === 'dashboard' && <DashboardView t={t} regData={regData} setView={setView} />}      
    </div>
  );
}

export default App;