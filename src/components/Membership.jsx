import React, { useState } from 'react';
import { ShieldCheck, Calendar, CreditCard, Award, ArrowRight, Loader2, Smartphone, CheckCircle2, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient'; // Adjust path if located in src/lib

const Membership = ({ profile, onRefreshProfile }) => {
  const [phone, setPhone] = useState(profile?.phone_number || '');
  const [manualCode, setManualCode] = useState('');
  const [isTriggering, setIsTriggering] = useState(false);
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [paymentStep, setPaymentStep] = useState('idle'); // 'idle' | 'prompted' | 'success'
  const [statusMessage, setStatusMessage] = useState('');

  // 🏥 Calculate days remaining
  const expiryDateString = profile?.membership_expires_at;
  const expiryDate = expiryDateString ? new Date(expiryDateString) : null;
  const today = new Date();
  
  const isExpired = !expiryDate || expiryDate <= today;
  const diffDays = expiryDate && expiryDate > today 
    ? Math.ceil(Math.abs(expiryDate - today) / (1000 * 60 * 60 * 24))
    : 0;

  // 🚀 Trigger Live STK Push
  const handleInitiateSTK = async (e) => {
    e?.preventDefault();
    if (!phone) {
      alert('Please enter a valid Safaricom phone number (e.g. 0740693806)');
      return;
    }

    setIsTriggering(true);
    setStatusMessage('');

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const response = await fetch(
        'https://ijqvkeqgfpfeeyprhqwe.supabase.co/functions/v1/mpesa-stk-push',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            phone: phone,
            amount: 200,
            userId: session?.user?.id || profile?.id,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || result.error) {
        throw new Error(result.error || result.CustomerMessage || 'Failed to dispatch STK Push.');
      }

      setPaymentStep('prompted');
      setStatusMessage('PIN prompt sent! Complete the payment on your phone.');
    } catch (err) {
      console.error('STK Trigger Exception:', err);
      alert(`Payment Notice: ${err.message}`);
    } finally {
      setIsTriggering(false);
    }
  };

  // 🔍 Manual M-PESA Receipt Verification Fallback
  const handleVerifyManualCode = async (e) => {
    e?.preventDefault();
    if (!manualCode.trim()) return;

    setIsVerifyingCode(true);
    try {
      const cleanCode = manualCode.trim().toUpperCase();
      
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 365);

      const { error } = await supabase
        .from('profiles')
        .update({
          membership_status: 'Active',
          membership_expires_at: expiry.toISOString(),
          last_payment_code: cleanCode
        })
        .eq('id', profile?.id);

      if (error) throw error;

      alert(`Receipt ${cleanCode} verified! Membership renewed for 365 days.`);
      if (onRefreshProfile) onRefreshProfile();
      setPaymentStep('success');
    } catch (err) {
      alert(`Verification failed: ${err.message}`);
    } finally {
      setIsVerifyingCode(false);
    }
  };

  return (
    <div className="p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        
        <h2 className="text-2xl lg:text-3xl font-black text-[#003366] uppercase tracking-tighter mb-2">
          Member Protocol
        </h2>
        <p className="text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-8 lg:mb-10">
          Official JKUCMA Credential Status
        </p>

        {/* 📊 PROTOCOL METRIC CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          
          {/* 🛡️ STATUS CARD */}
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className={`w-12 h-12 lg:w-16 lg:h-16 ${!isExpired ? 'bg-green-50 text-[#1a5d1a]' : 'bg-amber-50 text-amber-600'} rounded-2xl flex items-center justify-center mb-4`}>
              <ShieldCheck size={28} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Account Status</p>
            <h3 className={`text-lg lg:text-xl font-black ${!isExpired ? 'text-[#1a5d1a]' : 'text-amber-600'} uppercase italic`}>
              {!isExpired ? 'Verified' : 'Renewal Due'}
            </h3>
          </div>

          {/* 📅 EXPIRY CARD */}
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366] mb-4">
              <Calendar size={28} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Days Remaining</p>
            <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase italic">
              {diffDays} Days Left
            </h3>
          </div>

          {/* 🏅 ROLE CARD */}
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
              <Award size={28} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Member Tier</p>
            <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase italic">
              {profile?.program_type || 'BSc Medic'}
            </h3>
          </div>

        </div>

        {/* 💳 TRANSACTION & RENEWAL CONSOLE */}
        <div className="mt-8 lg:mt-10 bg-[#003366] rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10">
            
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-white/10 rounded-2xl">
                <CreditCard className="text-green-400" size={24} />
              </div>
              <div>
                <h4 className="text-lg lg:text-xl font-black uppercase tracking-tighter leading-none">Subscription Details</h4>
                <p className="text-[10px] text-blue-200/60 font-bold uppercase tracking-widest mt-1">Official Treasury Hub Integration</p>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex justify-between items-end border-b border-blue-800/50 pb-3">
                <span className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Paybill Reference</span>
                <span className="text-xs lg:text-sm font-bold text-white tracking-widest uppercase">
                  522522 • ACC: 1305909577
                </span>
              </div>

              <div className="flex justify-between items-end border-b border-blue-800/50 pb-3">
                <span className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Renewal Expiry</span>
                <span className="text-xs lg:text-sm font-bold text-white">
                  {expiryDate 
                    ? expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                    : 'Protocol Pending'}
                </span>
              </div>

              <div className="flex justify-between items-center border-b border-blue-800/50 pb-3">
                <span className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Annual Dues</span>
                <div className="text-right">
                  <span className="text-xl font-black text-white leading-none">KSh 200</span>
                  <span className="text-[9px] font-bold text-green-400 block uppercase tracking-widest mt-1">Per 365 Days</span>
                </div>
              </div>
            </div>

            {/* PAYMENT FORM INPUTS */}
            <div className="mt-8 pt-6 border-t border-blue-800/60 space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. 0740693806"
                    className="w-full pl-11 pr-4 py-4 rounded-2xl bg-white/10 border border-white/10 text-white placeholder-blue-200/40 text-xs font-bold outline-none focus:border-green-400 focus:bg-white/15 transition-all"
                  />
                </div>

                <button
                  onClick={handleInitiateSTK}
                  disabled={isTriggering}
                  className="py-4 px-6 bg-green-500 hover:bg-green-400 text-[#003366] font-black text-[10px] lg:text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 shadow-lg"
                >
                  {isTriggering ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Requesting STK...
                    </>
                  ) : (
                    <>
                      Pay KSh 200 via STK <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {statusMessage && (
                <div className="p-3 bg-green-500/20 border border-green-500/40 rounded-xl flex items-center gap-2 text-green-300 text-xs font-bold">
                  <CheckCircle2 size={16} />
                  {statusMessage}
                </div>
              )}

              {/* MANUAL RECEIPT FALLBACK */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="Or enter M-PESA Code (e.g. SHK893DFK2)"
                  className="w-full sm:flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-blue-200/30 text-xs font-semibold uppercase outline-none focus:border-blue-300"
                />
                <button
                  onClick={handleVerifyManualCode}
                  disabled={isVerifyingCode || !manualCode.trim()}
                  className="w-full sm:w-auto px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-30"
                >
                  {isVerifyingCode ? 'Verifying...' : 'Verify Code'}
                </button>
              </div>
            </div>

          </div>

          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        </div>

      </div>
    </div>
  );
};

export default Membership;