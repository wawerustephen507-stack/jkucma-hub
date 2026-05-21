import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabaseClient';
import Dashboard from './pages/Dashboard';
import Register from './Register';
import PaymentStatus from './PaymentStatus';
import { Loader2 } from 'lucide-react';

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

export default App;