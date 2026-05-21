import React from 'react';
import { ShieldCheck, Calendar, CreditCard, Award, ArrowRight } from 'lucide-react';

const Membership = ({ profile }) => {
  // 🏥 Calculate days remaining (Fixed to handle null/undefined dates)
  const expiryDateString = profile?.membership_expires_at;
  const expiryDate = expiryDateString ? new Date(expiryDateString) : null;
  const today = new Date();
  
  const diffDays = expiryDate && expiryDate > today 
    ? Math.ceil(Math.abs(expiryDate - today) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="p-4 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="max-w-4xl mx-auto">
        
        <h2 className="text-2xl lg:text-3xl font-black text-[#003366] uppercase tracking-tighter mb-2">
          Member Protocol
        </h2>
        <p className="text-slate-400 font-bold text-[10px] lg:text-xs uppercase tracking-widest mb-8 lg:mb-10">
          Official JKUCMA Credential Status
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
          
          {/* 🛡️ STATUS CARD */}
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-green-50 rounded-2xl flex items-center justify-center text-[#1a5d1a] mb-4">
              <ShieldCheck size={28} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Account Status</p>
            <h3 className="text-lg lg:text-xl font-black text-[#1a5d1a] uppercase italic">Verified</h3>
          </div>

          {/* 📅 EXPIRY CARD */}
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-[#003366] mb-4">
              <Calendar size={28} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Days Remaining</p>
            <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase italic">{diffDays} Days Left</h3>
          </div>

          {/* 🏅 ROLE CARD */}
          <div className="bg-white p-6 lg:p-8 rounded-[2rem] lg:rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center text-center">
            <div className="w-12 h-12 lg:w-16 lg:h-16 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-500 mb-4">
              <Award size={28} />
            </div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Member Tier</p>
            <h3 className="text-lg lg:text-xl font-black text-slate-800 uppercase italic">{profile?.program_type || 'BSc Medic'}</h3>
          </div>

        </div>

        {/* 💳 TRANSACTION HISTORY & RENEWAL (Fixed Distortion) */}
        <div className="mt-8 lg:mt-10 bg-[#003366] rounded-[2.5rem] lg:rounded-[3rem] p-8 lg:p-10 text-white relative overflow-hidden shadow-2xl">
           <div className="relative z-10">
             <div className="flex items-center gap-4 mb-8">
               <div className="p-3 bg-white/10 rounded-2xl">
                 <CreditCard className="text-green-400" size={24} />
               </div>
               <h4 className="text-lg lg:text-xl font-black uppercase tracking-tighter leading-none">Subscription Details</h4>
             </div>
             
             <div className="space-y-6">
               <div className="flex justify-between items-end border-b border-blue-800/50 pb-3">
                 <span className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Last Code</span>
                 <span className="text-xs lg:text-sm font-bold text-white tracking-widest uppercase">
                    {profile?.last_payment_code || 'Pending Sync'}
                 </span>
               </div>

               <div className="flex justify-between items-end border-b border-blue-800/50 pb-3">
                 <span className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Renewal Date</span>
                 <span className="text-xs lg:text-sm font-bold text-white">
                    {expiryDate 
                      ? expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
                      : 'Protocol Pending'}
                 </span>
               </div>

               <div className="flex justify-between items-center border-b border-blue-800/50 pb-3">
                 <span className="text-[9px] font-black text-blue-200/50 uppercase tracking-widest">Membership Fee</span>
                 <div className="text-right">
                    <span className="text-xl font-black text-white leading-none">KSh 200</span>
                    <span className="text-[9px] font-bold text-green-400 block uppercase tracking-widest mt-1">Per Year</span>
                 </div>
               </div>
             </div>

             <button className="mt-8 w-full py-5 bg-white text-[#003366] rounded-2xl font-black text-[10px] lg:text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-green-400 hover:text-white transition-all group active:scale-95 shadow-lg">
               Extend Membership Protocol <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
             </button>
           </div>

           <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl"></div>
        </div>

      </div>
    </div>
  );
};

export default Membership;