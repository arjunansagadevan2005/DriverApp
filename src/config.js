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
    moon: '<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />',
    sun: '<g><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></g>',
    truck: '<g><rect width="16" height="16" x="1" y="3" rx="2" ry="2"/><line x1="1" x2="17" y1="10" y2="10"/><path d="M17 10h2a2 2 0 0 1 2 2v2a2 2 0 0 1-2 2h-2"/><circle cx="5" cy="19" r="2"/><circle cx="13" cy="19" r="2"/></g>',
    globe: '<circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10z"></path>',
    arrowLeft: '<path d="m12 19-7-7 7-7"/><path d="M19 12H5"/>',
    home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    nav: '<polygon points="3 11 22 2 13 21 11 13 3 11"/>',
    barChart: '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
    user: '<g><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></g>'
};