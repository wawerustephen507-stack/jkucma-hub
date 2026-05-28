import React, { useState } from 'react';
import { supabase } from './lib/supabaseClient';
import { Loader2, Lock, Send } from 'lucide-react';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    // Supabase automatically consumes the token from the URL behind the scenes
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (!error) {
      setSuccess(true);
      alert("✓ Password updated successfully! You can now log in.");
      window.location.href = window.location.origin; // Redirects back to login home
    } else {
      alert("Error resetting password: " + error.message);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 shadow-2xl text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
        <h1 className="text-xl font-black text-[#003366] uppercase tracking-tighter leading-none mb-2">
          RESET <br/> <span className="text-[#1a5d1a]">PASSWORD</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
          Enter your secure new access code
        </p>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="password" 
              placeholder="New Password (min 6 chars)" 
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-[1.2rem] border-none outline-none font-bold text-slate-700 shadow-inner text-center text-sm"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || success}
            className="w-full bg-[#1a5d1a] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;