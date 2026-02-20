export default function VerificationView({ regData, setRegData, handleVerify, loading }) {
  return (
    <div className="h-full flex flex-col justify-center px-6 slide-up text-center">
      <h2 className="text-3xl font-bold dark:text-white mb-2">Verify OTP</h2>
      <p className="text-slate-500 dark:text-slate-400 mb-8">Sent to {regData.mobile}</p>
      <form onSubmit={handleVerify} className="space-y-6">
        <input 
          type="text" 
          maxLength="6"
          value={regData.otp}
          onChange={(e) => setRegData({...regData, otp: e.target.value})}
          className="w-full p-4 text-3xl tracking-[1rem] text-center rounded-2xl bg-slate-50 dark:bg-slate-800 dark:text-white outline-none border-2 border-transparent focus:border-brand-500"
          placeholder="000000"
          required
        />
        <button disabled={loading} className="w-full py-4 rounded-2xl font-bold bg-brand-600 text-white shadow-lg">
          {loading ? 'Verifying...' : 'Login Now'}
        </button>
      </form>
    </div>
  );
}