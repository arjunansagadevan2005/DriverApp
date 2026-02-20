export default function LoginView({ regData, setRegData, handleLogin, loading, t }) {
  return (
    <div className="h-full flex flex-col justify-center px-6 slide-up">
      <h2 className="text-3xl font-bold dark:text-white mb-2">{t('welcome_back')}</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">{t('enter_mobile')}</p>
      <form onSubmit={handleLogin} className="space-y-4">
        <input 
          type="tel" 
          value={regData.mobile}
          onChange={(e) => setRegData({...regData, mobile: e.target.value})}
          className="w-full p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-brand-500"
          placeholder="Enter Mobile Number"
          required
        />
        <button disabled={loading} className="w-full py-4 rounded-2xl font-bold bg-brand-600 text-white shadow-lg disabled:opacity-50">
          {loading ? 'Sending OTP...' : t('verify_details')}
        </button>
      </form>
    </div>
  );
}