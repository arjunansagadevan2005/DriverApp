import React, { useState } from 'react';
import { ICONS } from '../config';

// Helper to pull icons safely from config
function getIcon(name, size = 24, classes = '') {
    return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={classes} dangerouslySetInnerHTML={{ __html: ICONS[name] || '' }} />;
}

export default function WalletView({ t, setView }) {
    // Local State matching your HTML app state
    const [walletBalance, setWalletBalance] = useState(250.00);
    const [outstandingDues, setOutstandingDues] = useState(450.00); // Set > 300 to show the suspension warning
    const [transactions, setTransactions] = useState([
        { id: 1, type: 'credit', amount: 250, date: 'Welcome Bonus', desc: 'Joining Bonus' }
    ]);
    
    const [isLoading, setIsLoading] = useState(false);
    const [payAmount, setPayAmount] = useState(Math.ceil(outstandingDues));
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

    const isLimitReached = outstandingDues > 300;

    const showToast = (msg) => {
        // Replace with your actual toast notification system if needed
        alert(msg);
    };

    // --- ACTIONS ---

    const handleAddMoney = () => {
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            const amount = 500;
            setWalletBalance(prev => prev + amount);
            setTransactions(prev => [{
                id: Date.now(),
                type: 'credit',
                amount: amount,
                date: 'Just now',
                desc: 'Wallet Top-up'
            }, ...prev]);
            showToast('₹500 Added. Balance Updated!');
        }, 1500);
    };

    const handlePayDues = () => {
        const amountToPay = parseFloat(payAmount);

        if (!amountToPay || amountToPay <= 0) {
            showToast('Please enter a valid amount.');
            return;
        }
        if (outstandingDues <= 0) {
            showToast('No outstanding dues to pay.');
            return;
        }
        if (amountToPay > walletBalance) {
            showToast('Insufficient Wallet Balance. Please Add Money.');
            return;
        }
        if (amountToPay > outstandingDues) {
            showToast('Amount exceeds outstanding dues.');
            return;
        }

        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setWalletBalance(prev => prev - amountToPay);
            const newDues = outstandingDues - amountToPay;
            setOutstandingDues(newDues);
            
            setTransactions(prev => [{
                id: Date.now(),
                type: 'debit',
                amount: amountToPay,
                date: 'Just now',
                desc: 'Commission Dues Payment'
            }, ...prev]);

            if (newDues <= 300) {
                showToast("Account Active Again!");
            }
            showToast(`Paid ₹${amountToPay}. Dues cleared successfully!`);
            setPayAmount(Math.ceil(newDues));
        }, 1000);
    };

    const handleWithdraw = () => {
        const amount = parseFloat(withdrawAmount || 0);
        
        if (!amount || amount < 500) {
            showToast(t('min_withdraw'));
            return;
        }
        if (amount > walletBalance) {
            showToast('Insufficient balance!');
            return;
        }
        
        setIsLoading(true);
        setTimeout(() => {
            setIsLoading(false);
            setWalletBalance(prev => prev - amount);
            
            setTransactions(prev => [{
                id: Date.now(),
                type: 'debit',
                amount: amount,
                date: 'Just now',
                desc: 'Bank Withdrawal'
            }, ...prev]);
            
            setIsWithdrawModalOpen(false);
            setWithdrawAmount('');
            showToast(t('withdraw_success'));
        }, 1500);
    };

    // --- WITHDRAWAL MODAL RENDERER ---
    const renderWithdrawModal = () => {
        if (!isWithdrawModalOpen) return null;

        return (
            <div className="fixed inset-0 z-50 flex flex-col justify-end">
                <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsWithdrawModalOpen(false)}></div>
                <div className="relative bg-white dark:bg-dark-surface rounded-t-3xl p-6 slide-up max-h-[80vh] overflow-y-auto pb-safe">
                    <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mx-auto mb-6"></div>
                    
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600 dark:text-red-400">
                            {getIcon('wallet', 32)}
                        </div>
                        <h2 className="text-2xl font-bold mb-2 dark:text-white">{t('withdraw_money')}</h2>
                        <p className="text-slate-500 dark:text-slate-400 mb-2 text-sm">{t('wallet_bal')}: <span className="font-black text-brand-600">₹{walletBalance.toFixed(0)}</span></p>
                        <p className="text-slate-500 dark:text-slate-400 mb-6 text-sm">{t('min_withdraw')}</p>
                        
                        <div className="mb-6">
                            <input type="number" min="500" step="100"
                                value={withdrawAmount}
                                onChange={(e) => setWithdrawAmount(e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-center text-2xl font-black focus:ring-2 focus:ring-brand-500 focus:outline-none dark:text-white transition-all" 
                                placeholder="₹ 500" 
                            />
                        </div>

                        <div className="grid grid-cols-4 gap-2 mb-6">
                            <button onClick={() => setWithdrawAmount('500')} className="py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/20">₹500</button>
                            <button onClick={() => setWithdrawAmount('1000')} className="py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/20">₹1000</button>
                            <button onClick={() => setWithdrawAmount('2000')} className="py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/20">₹2000</button>
                            <button onClick={() => setWithdrawAmount('5000')} className="py-2 px-3 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-brand-100 dark:hover:bg-brand-900/20">₹5000</button>
                        </div>

                        <button disabled={isLoading} onClick={handleWithdraw} className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-500/30 active:scale-95 transition-transform disabled:opacity-70">
                            {isLoading ? <span className="animate-spin inline-block">{getIcon('loader', 20)}</span> : t('confirm_withdraw')}
                        </button>
                        <button disabled={isLoading} onClick={() => setIsWithdrawModalOpen(false)} className="w-full mt-3 py-3 text-slate-500 font-bold hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 disabled:opacity-50">
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-dark-bg slide-up overflow-hidden">
            {/* Header */}
            <div className="px-6 pt-safe-top pb-4 bg-white dark:bg-dark-surface border-b border-slate-100 dark:border-slate-800 z-10 flex items-center gap-4">
                <button onClick={() => setView('dashboard')} className="p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300">
                    {getIcon('arrowLeft', 24)}
                </button>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{t('wallet_title')}</h1>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6 no-scrollbar">
                {/* Balance Card */}
                <div className="bg-slate-900 dark:bg-slate-800 rounded-3xl p-6 text-white shadow-xl mb-4 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-2">
                            <p className="text-slate-400 text-sm font-bold uppercase tracking-wider">{t('wallet_bal')}</p>
                            <div className="flex gap-2">
                                <button onClick={() => setIsWithdrawModalOpen(true)} className="bg-red-500/20 hover:bg-red-500/30 rounded-lg px-3 py-1 text-xs font-bold transition-colors text-red-300">
                                    {t('withdraw')}
                                </button>
                                <button disabled={isLoading} onClick={handleAddMoney} className="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-1 text-xs font-bold transition-colors disabled:opacity-50">
                                    + {t('add_money')}
                                </button>
                            </div>
                        </div>
                        <h2 className="text-5xl font-black mb-1">₹{walletBalance.toFixed(0)}</h2>
                        <p className="text-slate-500 text-xs">{t('used_for_comm')}</p>
                    </div>
                    <div className="absolute -right-6 -bottom-6 text-white/5 opacity-10">
                        {getIcon('wallet', 120)}
                    </div>
                </div>

                {/* Outstanding Dues Section */}
                <div className={`bg-white dark:bg-dark-surface rounded-3xl p-6 border-2 ${isLimitReached ? 'border-red-500' : 'border-slate-100 dark:border-slate-700'} shadow-sm mb-6`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('pending_comm')}</p>
                            <h3 className="text-3xl font-black text-slate-900 dark:text-white">₹{outstandingDues.toFixed(0)}</h3>
                            <p className={`text-[10px] text-red-500 font-bold mt-1 ${isLimitReached ? 'animate-pulse' : ''}`}>
                                {isLimitReached ? t('limit_exceeded') : t('limit_normal')}
                            </p>
                        </div>
                    </div>
                    
                    {/* Payment Input Section */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-700">
                        <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">{t('enter_pay_amount')}</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                                <input 
                                    type="number" 
                                    className="w-full pl-6 pr-3 py-2.5 rounded-lg font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500"
                                    value={payAmount} 
                                    onChange={(e) => setPayAmount(e.target.value)}
                                    placeholder="0"
                                    min="1" 
                                    max={Math.ceil(outstandingDues)}
                                />
                            </div>
                            <button 
                                disabled={outstandingDues <= 0 || isLoading}
                                onClick={handlePayDues} 
                                className="bg-brand-600 hover:bg-brand-700 text-white rounded-lg px-4 py-2.5 font-bold shadow-lg shadow-brand-500/30 active:scale-95 transition-transform disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? <span className="animate-spin inline-block">{getIcon('loader', 16)}</span> : t('pay')}
                            </button>
                        </div>
                    </div>

                    {isLimitReached ? (
                        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold p-3 rounded-xl border border-red-100 dark:border-red-900/50 flex items-center gap-2 mt-4">
                            {getIcon('lock', 16)} {t('acct_suspended')}
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 dark:text-slate-500 mt-3">
                            {t('pay_dues_hint')}
                        </div>
                    )}
                </div>

                {/* Transactions */}
                <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4 px-2">{t('recent_trans')}</h3>
                <div className="space-y-3 pb-8">
                    {transactions.map(t => {
                        const isCredit = t.type === 'credit';
                        return (
                            <div key={t.id} className="bg-white dark:bg-dark-surface p-4 rounded-2xl border border-slate-100 dark:border-slate-700 flex justify-between items-center shadow-sm">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full ${isCredit ? 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'} flex items-center justify-center`}>
                                        {getIcon(isCredit ? 'plus' : 'wallet', 20)}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 dark:text-white text-sm line-clamp-1">{t.desc}</h4>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">{t.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`block font-black ${isCredit ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                        {isCredit ? '+' : '-'} ₹{t.amount}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                    {transactions.length === 0 && <div className="text-center text-slate-400 py-4">No transactions yet.</div>}
                </div>
            </div>

            {/* Withdraw Modal Portal */}
            {renderWithdrawModal()}
        </div>
    );
}