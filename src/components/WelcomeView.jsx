export default function WelcomeView({ setView, t }) {
  return (
    <div className="h-full flex flex-col justify-center items-center px-6 fade-in">
      <div className="w-24 h-24 bg-brand-600 rounded-3xl flex items-center justify-center shadow-2xl text-white font-black text-5xl transform rotate-3 mb-10">QC</div>
      <h1 className="text-3xl font-bold dark:text-white mb-3 text-center">{t('app_name')}</h1>
      <button onClick={() => setView('login')} className="w-full py-4 rounded-2xl font-bold bg-brand-600 text-white shadow-lg active:scale-95 transition-transform">
        {t('login_btn')}
      </button>
    </div>
  );
}