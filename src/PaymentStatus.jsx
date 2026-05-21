import React, { useState } from 'react';
import { CreditCard, AlertCircle, Loader2, Smartphone, CheckCircle2, ShieldCheck, Send, RefreshCw } from 'lucide-react';
import { supabase } from './lib/supabaseClient';

const PaymentStatus = ({ status, profile }) => {
  const [loading, setLoading] = useState(false);
  const [phone, setPhone] = useState("");
  const [txCode, setTxCode] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // --- 🏥 FUNCTION 1: AUTOMATIC STK PUSH ---
  const handlePayment = async (e) => {
    e.preventDefault();
    let cleanPhone = phone.replace(/\D/g, ''); 
    if (cleanPhone.startsWith('0')) cleanPhone = '254' + cleanPhone.slice(1);
    if (cleanPhone.startsWith('7') || cleanPhone.startsWith('1')) cleanPhone = '254' + cleanPhone;

    if (!cleanPhone.match(/^254[71]\d{8}$/)) {
      alert("Please enter a valid M-Pesa number (e.g., 0712345678)");
      return;
    }

    setLoading(true);
    try {
      // 🏥 Hardcoded the direct production URL endpoint to completely bypass any VITE variable caching bugs
      const response = await fetch("https://ijqvkeqgfpfeeyprhqwe.supabase.co/functions/v1/mpesa-stk-push", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          phone: cleanPhone,
          amount: 200,
          accountRef: `JKUCMA-${profile?.full_name?.split(' ')[0]?.toUpperCase() || 'MEMBER'}`
        })
      });

      const data = await response.json();

      if (response.ok && (data.ResponseCode === "0" || data.ResponseCode === 0)) {
        alert("🚀 HUB PROTOCOL: Prompt Sent! Enter your M-Pesa PIN now.");
      } else {
        alert(`Safaricom Error: ${data.CustomerMessage || "Check Daraja Keys."}`);
      }
    } catch (err) {
      alert("Network Error: Could not reach the JKUCMA Payment Gateway.");
    } finally {
      setLoading(false);
    }
  };

  // --- 🏥 FUNCTION 2: MANUAL VERIFICATION (Safety Guarded) ---
  const handleManualVerify = async (e) => {
    e.preventDefault();

    // 🏥 SAFETY GUARD: If profile is missing, try to fetch the user ID directly from the session
    let userId = profile?.id;
    if (!userId) {
      const { data: { user } } = await supabase.auth.getUser();
      userId = user?.id;
    }

    if (!userId) {
      alert("Error: Hub session not found. Please refresh and try again.");
      return;
    }

    if (txCode.length < 8) {
      alert("Please enter a valid M-Pesa Transaction Code");
      return;
    }
    
    setLoading(true);
    const { error } = await supabase
      .from('profiles')
      .update({ 
        payment_reference: txCode.toUpperCase(),
        membership_status: 'Pending Verification' 
      })
      .eq('id', userId);

    if (!error) {
      setSubmitted(true);
    } else {
      alert("Error submitting code: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500 relative">
      
      {/* 🏥 SUCCESS OVERLAY FOR MANUAL SUBMISSION */}
      {submitted && (
        <div className="absolute inset-0 bg-white/98 z-50 flex flex-col items-center justify-center p-8 animate-in fade-in duration-300">
           <CheckCircle2 size={60} className="text-[#1a5d1a] mb-4 animate-bounce" />
           <h3 className="text-xl font-black text-slate-800 uppercase italic leading-none text-center">Protocol Received</h3>
           <p className="text-[10px] font-bold text-slate-400 text-center mt-2 leading-relaxed">
             Treasurer is verifying your payment code. Refresh in a few minutes to access the Hub.
           </p>
           <button onClick={() => window.location.reload()} className="mt-6 flex items-center gap-2 text-[#1a5d1a] font-black uppercase text-[10px] tracking-widest bg-green-50 px-4 py-2 rounded-full">
             <RefreshCw size={14}/> Refresh Access
           </button>
        </div>
      )}

      {/* HUB STATUS HEADER */}
      <div className={`p-5 text-white text-center font-black uppercase tracking-[0.2em] text-[10px] ${status === 'Active' ? 'bg-[#1a5d1a]' : 'bg-[#e63946]'}`}>
        {status === 'Active' ? '✓ Protocol: Active' : '⚠ Protocol: Restricted'}
      </div>
      
      <div className="p-8 text-center">
        <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-4 shadow-inner text-[#1a5d1a]">
          {status === 'Active' ? <CheckCircle2 size={36} /> : <AlertCircle size={36} className="text-amber-500" />}
        </div>
        
        <h1 className="text-xl font-black text-[#003366] uppercase tracking-tighter leading-none mb-4">
          JKUCMA <br/> <span className="text-[#1a5d1a]">HUB ACCESS</span>
        </h1>

        {/* 🏥 OFFICIAL MANUAL PAYMENT DETAILS BOX */}
        <div className="mb-6 p-5 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-left">
          <div className="flex justify-between items-center mb-2">
             <span className="text-[9px] font-black text-slate-400 uppercase">Paybill:</span>
             <span className="text-sm font-black text-slate-800 tracking-tighter text-right">522522</span>
          </div>
          <div className="flex justify-between items-center mb-2">
             <span className="text-[9px] font-black text-slate-400 uppercase">Acc Name:</span>
             <span className="text-[10px] font-black text-red-600 uppercase text-right tracking-tight">JKUCMA</span>
          </div>
          <div className="flex justify-between items-center mb-2">
             <span className="text-[9px] font-black text-slate-400 uppercase">Acc No:</span>
             <span className="text-[11px] font-black text-[#1a5d1a] font-mono text-right">1305909577</span>
          </div>
          <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
             <span className="text-[9px] font-black text-slate-400 uppercase">Amount:</span>
             <span className="text-sm font-black text-slate-900">KSh 200</span>
          </div>
        </div>

        {/* --- CHOICE 1: STK PUSH --- */}
        <div className="space-y-3 mb-6">
          <div className="relative group">
            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#003366] transition-colors" size={18} />
            <input 
              type="tel" placeholder="07xx xxx xxx" value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-[1.2rem] border-none outline-none font-bold text-slate-700 shadow-inner text-center placeholder:text-slate-300 text-sm"
            />
          </div>
          <button 
            onClick={handlePayment} 
            disabled={loading || !phone}
            className="w-full bg-[#003366] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> Secure STK Push</>}
          </button>
        </div>

        <div className="relative my-4 flex items-center justify-center">
           <span className="w-full border-t border-slate-100"></span>
           <span className="absolute bg-white px-3 text-[8px] font-black text-slate-300 uppercase tracking-widest">OR ENTER CODE</span>
        </div>

        {/* --- CHOICE 2: MANUAL CODE ENTRY --- */}
        <form onSubmit={handleManualVerify} className="space-y-3">
          <input 
            type="text" placeholder="M-Pesa Code (e.g. SGR8...)" value={txCode}
            onChange={(e) => setTxCode(e.target.value.toUpperCase())}
            className="w-full p-4 bg-slate-50 rounded-[1.2rem] border-none text-center font-black text-[#1a5d1a] outline-none placeholder:text-slate-200 text-sm"
          />
          <button 
            type="submit" disabled={loading || !txCode}
            className="w-full bg-[#1a5d1a] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <Send size={18} /> Verify Code
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-200">
          <ShieldCheck size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest">Encrypted Daraja Tunnel</span>
        </div>
      </div>
    </div>
  );
};

export default PaymentStatus;