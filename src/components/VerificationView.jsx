import React from 'react';

export default function VerificationView({ regData, setRegData, handleVerify, loading }) {
  return (
    <div className="h-full flex flex-col justify-center px-6 slide-up text-center bg-white dark:bg-dark-bg">
      <h2 className="text-3xl font-bold dark:text-white mb-2">Verify OTP</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Sent to +91 {regData.mobile}</p>
      <form onSubmit={handleVerify} className="space-y-6">
        <input 
          type="number" 
          maxLength="4"
          value={regData.otp || ''}
          onChange={(e) => setRegData({...regData, otp: e.target.value.slice(0,4)})}
          className="w-full p-4 text-4xl font-black tracking-[1rem] text-center rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-brand-500 transition-colors"
          placeholder="0000"
          required
        />
        <button disabled={loading || regData.otp?.length < 4} className="w-full py-4 rounded-2xl font-bold text-lg bg-brand-600 text-white shadow-lg active:scale-95 transition-all disabled:opacity-50">
          {loading ? 'Verifying Profile...' : 'Login & Verify'}
        </button>
      </form>
    </div>
  );
}