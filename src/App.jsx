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
  const [view, setView] = useState('welcome');
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState(localStorage.getItem('language') || 'en');
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'true');
  
  const [regData, setRegData] = useState({ 
  mobile: '', 
  fullName: '', 
  vehicleType: '',
  vehicleNumber: '',
  preferredZone: '',
  tshirtSize: '',
  bloodGroup: '',
  emergencyContact: '',
  bankAccount: '',
  ifscCode: '',
  accountHolder: '',
  // Files
  avatarFile: null,
  aadharFile: null,
  panFile: null,
  rcFile: null,
  licenseFile: null
});

  const t = (key) => TRANSLATIONS[language]?.[key] || TRANSLATIONS['en'][key] || key;

  // --- 1. LOGIN: GENERATE MOCK OTP ---
  const handleLogin = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate 6-digit code
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    
    console.log("%c--- PROJECT AUTH DEBUG ---", "color: #0891b2; font-weight: bold; font-size: 12px;");
    console.log(`Target Mobile: ${regData.mobile}`);
    console.log(`Your Mock OTP: ${mockOtp}`);
    console.log("---------------------------");

    setRegData(prev => ({ ...prev, generatedOtp: mockOtp }));
    setView('verification');
    setLoading(false);
  };

  // --- 2. VERIFY: CHECK AGAINST YOUR TABLE ---
  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (regData.otp === regData.generatedOtp) {
      // Clean the number for the query
      const cleanPhone = regData.mobile.replace(/\D/g, '');

      // Query using your specific table "driver_details" and column "mobile_number"
      const { data, error } = await supabase
        .from('driver_details')
        .select('*')
        .eq('mobile_number', cleanPhone)
        .single();

      if (data) {
        console.log("Welcome back,", data.full_name);
        setView('dashboard');
      } else {
        console.log("New Driver detected. Redirecting to registration.");
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
        // Helper function to upload files to Supabase Storage
        const uploadFile = async (file, fileNamePrefix) => {
            if (!file) return null;
            const fileExt = file.name.split('.').pop();
            const fileName = `${fileNamePrefix}-${regData.mobile}-${Date.now()}.${fileExt}`;
            
            // 🔥 FIXED: Pointing to your 'driver_document' bucket
            const { data, error } = await supabase.storage
                .from('driver_document')
                .upload(fileName, file);

            if (error) throw error;

            // 🔥 FIXED: Fetching the URL from 'driver_document'
            const { data: urlData } = supabase.storage.from('driver_document').getPublicUrl(fileName);
            return urlData.publicUrl;
        };

        // 1. Upload all documents concurrently for speed
        const [avatarUrl, aadharUrl, licenseUrl, rcUrl] = await Promise.all([
            uploadFile(regData.avatarFile, 'avatar'),
            uploadFile(regData.aadharFile, 'aadhar'),
            uploadFile(regData.licenseFile, 'license'),
            uploadFile(regData.rcFile, 'rc')
        ]);

        // 2. Save everything (including the new URLs) to your database
        const { error } = await supabase.from('driver_details').insert([{
            mobile_number: regData.mobile,
            full_name: regData.fullName,
            vehicle_type: regData.vehicleType,
            vehicle_number: regData.vehicleNumber,
            bank_account: regData.bankAccount,
            ifsc_code: regData.ifscCode,
            avatar_url: avatarUrl,
            aadhar_url: aadharUrl,
            license_url: licenseUrl,
            rc_url: rcUrl,
            status: 'Pending Verification'
        }]);

        if (error) throw error;
        alert("Registration Successful! Pending Admin Approval.");
        setView('login'); // Send them to login screen

    } catch (error) {
        console.error("Upload error:", error);
        alert("Registration failed: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
  <div className={isDark ? "dark" : ""}>
    <div className="h-screen w-full bg-white dark:bg-dark-bg overflow-hidden relative">
      {view === 'welcome' && <WelcomeView setView={setView} t={t} />}
      {view === 'login' && <LoginView regData={regData} setRegData={setRegData} handleLogin={handleLogin} loading={loading} t={t} />}
      {view === 'verification' && <VerificationView regData={regData} setRegData={setRegData} handleVerify={handleVerify} loading={loading} t={t} />}
      {view === 'registration' && <RegistrationView regData={regData} setRegData={setRegData} handleRegister={handleRegister} loading={loading} />}
      {view === 'wallet' && <WalletView setView={setView} t={t} />}
      {view === 'dashboard' && <DashboardView t={t} regData={regData} setView={setView} />}      
      </div>
  </div>
);
}

export default App;