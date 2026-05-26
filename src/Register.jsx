import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { ArrowRight, ShieldCheck, Loader2, CheckCircle2 } from 'lucide-react';

const Register = ({ onAuthSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false); 
  const [formData, setFormData] = useState({
    email: '', password: '', fullName: '', 
    regNumber: '', program: 'BSc', year: 1
  });

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        // --- LOGIN FLOW ---
        const { data: logInData, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        if (error) throw error;

        // 🏥 DIRECT METADATA TRIGGER LINK:
        // Automatically fetch and route the verified user ID context down to the push endpoint
        if (logInData?.user?.id) {
          try {
            await fetch("https://ijqvkeqgfpfeeyprhqwe.supabase.co/functions/v1/mpesa-stk-push", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ 
                phone: "0740693806", // Fallback system verification routing string
                userId: logInData.user.id // 🏥 FIXED: Explicitly maps the active session UUID into the payload!
              }),
            });
          } catch (fetchErr) {
            console.error("Background push initialization suppressed:", fetchErr.message);
          }
        }

        onAuthSuccess();
      } else {
        // --- REGISTRATION FLOW ---
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              reg_number: formData.regNumber,
              program: formData.program,
              year: formData.year
            }
          }
        });

        if (authError) throw authError;

        if (authData?.user) {
          setShowSuccess(true);
          
          setTimeout(() => {
            setShowSuccess(false);
            setIsLogin(true); 
            setLoading(false);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }, 2500); 
        }
      }
    } catch (error) {
      alert(error.message);
      setLoading(false);
    }
  };

  // 🌐 NEW: GOOGLE AUTH LOGIC
  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://jkucma-hub.vercel.app' 
        }
      });
      if (error) throw error;
    } catch (error) {
      alert("Google Connection Error: " + error.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl animate-in zoom-in duration-500 relative overflow-hidden">
        
        {showSuccess && (
          <div className="absolute inset-0 bg-white/95 z-50 flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <CheckCircle2 size={48} className="text-[#1a5d1a]" />
            </div>
            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Medic Registered!</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2 text-center px-6">
                Account protocol established. <br/> Redirecting to Sign In...
            </p>
          </div>
        )}

        <div className="text-center mb-10 relative z-10">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-5 text-[#003366] shadow-xl border-4 border-white ring-2 ring-slate-100 overflow-hidden">
            <img src="/jkucma-logo.png" alt="JKUCMA Logo" className="w-full h-full object-cover" />
          </div>
          
          <h1 className="text-xl font-black text-[#003366] tracking-tighter uppercase leading-tight max-w-sm mx-auto">
            JKUAT CLINICAL MEDICINE ASSOCIATION
            <br/>
            <span className="text-4xl block mt-1">(JKUCMA HUB)</span>
          </h1>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-3 italic leading-none">
            Official Clinical Medicine Repository
          </p>
        </div>

        <form onSubmit={handleAuth} className="space-y-4 relative z-10">
          {!isLogin && (
            <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
              <input 
                type="text" placeholder="Full Name (Official)" 
                className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold focus:ring-2 ring-blue-500/20 outline-none" 
                value={formData.fullName}
                onChange={(e) => setFormData({...formData, fullName: e.target.value})} required 
              />
              
              <input 
                type="text" placeholder="Registration Number" 
                className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold outline-none" 
                value={formData.regNumber}
                onChange={(e) => setFormData({...formData, regNumber: e.target.value})} required 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <select 
                  className="p-5 bg-slate-50 rounded-[1.5rem] border-none text-[11px] font-black text-slate-600 outline-none cursor-pointer uppercase tracking-tighter" 
                  value={formData.program}
                  onChange={(e) => setFormData({...formData, program: e.target.value})}>
                  <option value="BSc">BSc. Clin Med</option>
                  <option value="Diploma">Diploma Clin Med</option>
                  <option value="Upgrading">Upgrading (Dip-BSc)</option>
                  <option value="Ophthalmology">Ophthalmology</option>
                  <option value="Masters Oncology">Masters Oncology</option>
                </select>
                <select 
                  className="p-5 bg-slate-50 rounded-[1.5rem] border-none text-[11px] font-black text-slate-600 outline-none cursor-pointer uppercase tracking-tighter" 
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}>
                  {[1, 2, 3, 4, 5, 6].map(yr => <option key={yr} value={yr}>Year {yr}</option>)}
                </select>
              </div>
            </div>
          )}

          <input 
            type="email" placeholder="Email Address" 
            className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold outline-none" 
            value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required 
          />
          
          <input 
            type="password" placeholder="Password" 
            className="w-full p-5 bg-slate-50 rounded-[1.5rem] border-none text-sm font-bold outline-none" 
            value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required 
          />

          <button 
            type="submit" disabled={loading} 
            className={`w-full py-5 ${isLogin ? 'bg-[#003366]' : 'bg-[#1a5d1a]'} text-white rounded-[2rem] font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50`}
          >
            {loading ? <Loader2 className="animate-spin" /> : (isLogin ? "Sign In" : "Activate My Hub Access")} <ArrowRight size={18} />
          </button>
        </form>

        <div className="relative my-8 text-center z-10">
          <div className="absolute inset-0 flex items-center"><span className="w-full border-t border-slate-100"></span></div>
          <span className="relative bg-white px-4 text-[9px] font-black text-slate-300 uppercase tracking-widest">Or Secure Entry via</span>
        </div>

        <button 
          onClick={handleGoogleLogin} 
          className="w-full py-4 bg-white border-2 border-slate-100 text-slate-600 rounded-[2rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-slate-50 transition-all shadow-sm z-10 active:scale-95"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Google Account
        </button>

        <div className="mt-8 text-center z-10">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
            className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em] hover:underline transition-all"
          >
            {isLogin ? "New to Hub? Register as Member" : "Already registered? Sign In"}
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-300 z-10">
          <ShieldCheck size={14} />
          <span className="text-[9px] font-black uppercase tracking-widest italic leading-none">Encrypted JKUCMA Protocol</span>
        </div>
      </div>
    </div>
  );
};

export default Register;