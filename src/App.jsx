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
  const [view, setView] = useState(() => {
      return localStorage.getItem('qc_current_view') || 'welcome';
  });
  
  const [regData, setRegData] = useState(() => {
      const saved = localStorage.getItem('qc_driver_session');
      return saved ? JSON.parse(saved) : { 
          mobile: '', fullName: '', vehicleType: '', vehicleNumber: '', preferredZone: '',
          tshirtSize: '', bloodGroup: '', emergencyContact: '', bankAccount: '', ifscCode: '',
          accountHolder: '', avatarFile: null, aadharFile: null, panFile: null, rcFile: null, licenseFile: null
      };
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

  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    const mockOtp = Math.floor(1000 + Math.random() * 9000).toString();
    console.log(`Target Mobile: ${regData.mobile} | Mock OTP: ${mockOtp}`);
    setRegData(prev => ({ ...prev, generatedOtp: mockOtp }));
    setView('verification');
    setLoading(false);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (regData.otp === regData.generatedOtp) {
      let safeMobile = String(regData.mobile).replace(/\D/g, '');
      if (safeMobile.length > 10) safeMobile = safeMobile.slice(-10);

      const { data, error } = await supabase.from('driver_details').select('*').eq('mobile_number', safeMobile).limit(1);

      if (data && data.length > 0) {
        const sessionData = {
            ...regData,
            mobile: data[0].mobile_number, 
            fullName: data[0].full_name,
            vehicleType: data[0].vehicle_type,
            vehicleNumber: data[0].vehicle_number
        };
        setRegData(sessionData);
        localStorage.setItem('qc_driver_session', JSON.stringify(sessionData));
        localStorage.setItem('qc_current_view', 'dashboard');
        
        setView('dashboard');
      } else {
        setView('registration');
      }
    } else {
      alert("Invalid OTP! Check F12 console for the code.");
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
        const uploadFile = async (file, fileNamePrefix) => {
            if (!file) return null;
            const fileExt = file.name.split('.').pop();
            const fileName = `${fileNamePrefix}-${regData.mobile}-${Date.now()}.${fileExt}`;
            const { error } = await supabase.storage.from('driver_document').upload(fileName, file);
            if (error) throw error;
            const { data: urlData } = supabase.storage.from('driver_document').getPublicUrl(fileName);
            return urlData.publicUrl;
        };

        const [avatarUrl] = await Promise.all([ uploadFile(regData.avatarFile, 'avatar') ]);

        const { error } = await supabase.from('driver_details').insert([{
            mobile_number: regData.mobile, full_name: regData.fullName, vehicle_type: regData.vehicleType,
            vehicle_number: regData.vehicleNumber, bank_account_number: regData.bankAccount, ifsc_code: regData.ifscCode,
            account_holder_name: regData.accountHolder || regData.fullName, avatar_url: avatarUrl,
            preferred_zone: regData.preferredZone, blood_group: regData.bloodGroup, tshirt_size: regData.tshirtSize,
            emergency_contact: regData.emergencyContact, is_approved: false, 
            is_online: 'offline',   // 🔥 SECURE FIX: Now correctly inserts text "offline"
            status: 'offline'       // 🔥 SECURE FIX: Both columns stay synced!
        }]);

        if (error) throw error;
        alert("Registration Successful! Pending Admin Approval.");
        setView('login'); 
    } catch (error) {
        alert("Registration failed: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-white dark:bg-dark-bg overflow-hidden relative transition-colors duration-500">
      {view === 'welcome' && <WelcomeView setView={setView} t={t} />}
      {view === 'login' && <LoginView regData={regData} setRegData={setRegData} handleLogin={handleLogin} loading={loading} t={t} />}
      {view === 'verification' && <VerificationView regData={regData} setRegData={setRegData} handleVerify={handleVerify} loading={loading} t={t} />}
      {view === 'registration' && <RegistrationView regData={regData} setRegData={setRegData} handleRegister={handleRegister} loading={loading} />}
      {view === 'wallet' && <WalletView setView={setView} t={t} regData={regData} />}
      {view === 'dashboard' && <DashboardView t={t} regData={regData} setView={setView} />}      
    </div>
  );
}

export default App;