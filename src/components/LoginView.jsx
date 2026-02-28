import React from 'react';

export default function LoginView({ regData, setRegData, handleLogin, loading, t }) {
  return (
    <div className="h-full flex flex-col justify-center px-6 slide-up bg-white dark:bg-dark-bg">
      <h2 className="text-3xl font-bold dark:text-white mb-2">{t('welcome_back') || 'Welcome Back'}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{t('enter_mobile') || 'Enter your mobile number to continue.'}</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <input 
          type="tel" 
          value={regData.mobile || ''}
          onChange={(e) => setRegData({...regData, mobile: e.target.value})}
          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-brand-500 transition-colors font-bold text-lg tracking-wider"
          placeholder="Mobile Number"
          maxLength={10}
          required
        />
        <button disabled={loading || regData.mobile?.length < 10} className="w-full py-4 rounded-2xl font-bold text-lg bg-brand-600 text-white shadow-lg disabled:opacity-50 active:scale-95 transition-all">
          {loading ? 'Sending OTP...' : (t('verify_details') || 'Get OTP')}
        </button>
      </form>
    </div>
  );
}