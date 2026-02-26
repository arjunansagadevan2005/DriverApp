import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dmrrycyzgekxuklxmlei.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtcnJ5Y3l6Z2VreHVrbHhtbGVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkxMTg2MzUsImV4cCI6MjA4NDY5NDYzNX0.z_wFfLa0xwJH1WXMucmJD6xd7X7wPw1rY_bMmNTkN6M'; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const TRANSLATIONS = {
    en: {
        app_name: "Quick Construct",
        welcome_subtitle: "Deliver construction materials efficiently and earn on your schedule.",
        login_btn: "Login with Mobile",
        welcome_back: "Welcome Back",
        verify_details: "Verify Details",
        enter_mobile: "Enter your mobile number to receive a verification code.",
        enter_otp: "Enter the 4-digit code sent to",
        mobile_label: "Mobile Number",
        otp_label: "One-Time Password",
        todays_earnings: "Today's Earnings",
        home: "Home",
        trips: "Trips",
        earnings_history: "Earnings History",
        profile: "Profile"
    },
    ta: {
        app_name: "குவிக் கன்ஸ்ட்ரக்ட்",
        welcome_subtitle: "கட்டுமானப் பொருட்களை டெலிவரி செய்து உங்கள் நேரத்தில் சம்பாதிக்கவும்.",
        login_btn: "மொபைல் மூலம் உள்நுழையவும்",
        welcome_back: "மீண்டும் வருக",
        verify_details: "விவரங்களை சரிபார்க்கவும்",
        enter_mobile: "சரிபார்ப்பு குறியீட்டைப் பெற உங்கள் மொபைல் எண்ணை உள்ளிடவும்.",
        enter_otp: "அனுப்பப்பட்ட 4 இலக்க குறியீட்டை உள்ளிடவும்",
        mobile_label: "மொபைல் எண்",
        otp_label: "ஒரு முறை கடவுச்சொல் (OTP)",
        todays_earnings: "இன்றைய வருவாய்",
        home: "முகப்பு",
        trips: "பயணங்கள்",
        earnings_history: "வருவாய் வரலாறு",
        profile: "சுயவிவரம்"
    },
    hi: {
        app_name: "क्विक कंस्ट्रक्ट",
        welcome_subtitle: "निर्माण सामग्री वितरित करें और अपने समय पर कमाएं।",
        login_btn: "मोबाइल से लॉगिन करें",
        welcome_back: "वापसी पर स्वागत है",
        verify_details: "विवरण सत्यापित करें",
        enter_mobile: "सत्यापन कोड प्राप्त करने के लिए अपना मोबाइल नंबर दर्ज करें।",
        enter_otp: "भेजा गया 4-अंकीय कोड दर्ज करें",
        mobile_label: "मोबाइल नंबर",
        otp_label: "वन-टाइम पासवर्ड (OTP)",
        todays_earnings: "आज की कमाई",
        home: "होम",
        trips: "यात्राएं",
        earnings_history: "कमाई का इतिहास",
        profile: "प्रोफ़ाइल"
    }
};

export const ICONS = {
    // Basic & Theme
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
    sun: '<g><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></g>',
    globe: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path>',
    power: '<path d="M18.36 6.64a9 9 0 1 1-12.73 0"/><line x1="12" y1="2" x2="12" y2="12"/>',
    
    // Navigation & General
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    check: '<polyline points="20 6 9 17 4 12"/>',
    xCircle: '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    loader: '<line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="4.93" x2="19.07" y2="7.76"/>',

    // Driver & Vehicle
    user: '<g><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></g>',
    truck: '<g><rect width="16" height="16" x="1" y="3" rx="2" ry="2"/><line x1="1" x2="17" y1="10" y2="10"/><path d="M17 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><circle cx="5" cy="19" r="2"/><circle cx="13" cy="19" r="2"/></g>',
    mapPin: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    package: '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    clipboard: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    key: '<path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>',
    phone: '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',

    // Profile & Settings
    wallet: '<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/><path d="M18 12c-1.1 0-2 .9-2 2s.9 2 2 2h4v-4h-4z"/>',
    barChart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    trendingUp: '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>',
    award: '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>',
    bell: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    file: '<path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/>',
    card: '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>',
    alertCircle: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    volumeUp: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>',
    volumeOff: '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>',

    // Gamification & Extras
    crown: '<path d="m2 4 3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    trophy: '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7c0 6 3 10 6 10s6-4 6-10V2z"/>',
    gift: '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'
};