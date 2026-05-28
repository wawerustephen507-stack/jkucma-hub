import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Dashboard from './pages/Dashboard';
import Register from './Register';
import PaymentStatus from './PaymentStatus';
import { Loader2, Lock, Send } from 'lucide-react'; // 🏥 Added icons for the integrated reset form

function App() {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🏥 1. FETCH PROFILE (Refined to prevent the JSON Coerce Error)
  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // 💊 FIX: Prevents crash if profile is still being created
      
      if (error) throw error;

      if (data) {
        setProfile(data);
      } else {
        // 🏥 Fallback: If Auth exists but Profile row hasn't synced yet
        setProfile({ id: userId, membership_status: 'Inactive' });
      }
    } catch (err) {
      console.error("Profile Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // 🏥 2. INITIAL AUTH CHECK
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else setLoading(false);
    });

    // 🏥 3. LISTEN FOR SIGN-IN / SIGN-OUT
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfile(session.user.id);
      else {
        setProfile(null);
        setLoading(false);
        window.localStorage.clear(); // Clean state on logout
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 🏥 PASSWORD RESET INTERCEPTOR GATEWAY
  if (window.location.pathname === '/reset-password') {
    // 🛡️ Safety Check: If the email link has expired or been reused, alert the user and return home
    if (window.location.hash.includes('error=access_denied') || window.location.hash.includes('otp_expired')) {
      alert("⚠ Recovery Link Expired: This reset link has either expired or been used already. Please log in and request a fresh link.");
      window.location.href = window.location.origin;
      return null;
    }
    return <ResetPasswordView />;
  }

  // 🏥 4. LOADING SCREEN
  if (loading) return (
    <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center text-white">
       <Loader2 className="animate-spin mb-4" size={40} />
       <p className="text-[10px] font-black uppercase tracking-[0.3em]">Initializing Hub...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {!session ? (
        // GATE 1: REGISTRATION
        <Register onAuthSuccess={() => window.location.reload()} />
      ) : (
        <>
          {profile?.membership_status === 'Active' ? (
            // ✅ GATE 3: THE ACTUAL HUB (DASHBOARD)
            <Dashboard user={session.user} profile={profile} />
          ) : (
            // 🛡️ GATE 2: THE PAYWALL (MEMBERSHIP GATE)
            <div className="min-h-screen bg-[#003366] flex flex-col items-center justify-center p-8">
              <h1 className="text-2xl font-black text-white mb-8 tracking-tighter uppercase italic">
                JKUCMA <span className="text-green-400">ClinMed Hub</span>
              </h1>
              
              {/* 🏥 Pass profile data safely to the payment card */}
              <PaymentStatus 
                status={profile?.membership_status || "Inactive"} 
                profile={profile} 
              />
              
              <button 
                onClick={() => window.location.reload()}
                className="mt-8 text-[10px] font-black text-blue-300 uppercase tracking-widest hover:text-white transition-colors"
              >
                Already Paid? Click to Refresh Access
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// 🏥 PASSWORD UPDATE CONTAINER (Embedded securely to avoid untracked file issues)
const ResetPasswordView = () => {
  const [newPassword, setNewPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      alert("Password must be at least 6 characters long.");
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (error) throw error;
      
      alert("✓ Password updated successfully! Redirecting to login entry...");
      window.location.href = window.location.origin; 
    } catch (err) {
      alert("Reset Failure: " + err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#003366] flex items-center justify-center p-6 font-sans">
      <div className="bg-white w-full max-w-sm rounded-[3.5rem] p-8 shadow-2xl text-center border border-slate-100 animate-in fade-in zoom-in duration-500">
        <h1 className="text-xl font-black text-[#003366] uppercase tracking-tighter leading-none mb-2">
          RESET <br/> <span className="text-[#1a5d1a]">PASSWORD</span>
        </h1>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-6">
          Establish your secure new login code
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
            disabled={updating}
            className="w-full bg-[#1a5d1a] text-white py-4 rounded-[1.5rem] font-black uppercase tracking-widest text-[11px] shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            {updating ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Update Password</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default App;