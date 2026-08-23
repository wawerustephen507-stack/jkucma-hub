import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import EventsFeed from '../components/EventsFeed';
import LibrarySection from '../components/LibrarySection';
import PastPapers from '../components/PastPapers';
import AdminUploadModal from '../components/AdminUploadModal';
import Membership from '../components/Membership'; 
import AdvertCarousel from '../components/AdvertCarousel';
import LibraryPouch from '../components/LibraryPouch';
import AdvertManagerModal from '../components/AdvertManagerModal';
import { 
  BookOpen, Bell, Users, Home, ChevronRight, Camera, X, LogOut, BadgeCheck,
  FileText, ShieldCheck, Instagram, Facebook, Twitter, Youtube, Globe, Sparkles
} from 'lucide-react';

const Dashboard = ({ user, profile }) => {
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAdvertModalOpen, setIsAdvertModalOpen] = useState(false);
  const [officialLinks, setOfficialLinks] = useState([]); 

  const [isLibraryPouchOpen, setIsLibraryPouchOpen] = useState(false);
  const [adverts, setAdverts] = useState([]);
  const [libraryResources, setLibraryResources] = useState([]);

  const [latestAnnouncement, setLatestAnnouncement] = useState({
    title: "JKUCMA Digital Hub",
    content: "Your central repository for clinical resources, exam papers, and association updates. Welcome back!"
  });
  const [nextEvent, setNextEvent] = useState(null);

  const isSuperAdmin = profile?.email === 'wawerustephen507@gmail.com';

  const fetchHubData = async () => {
    try {
      const { data: annData } = await supabase
        .from('announcements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (annData && annData.length > 0) setLatestAnnouncement(annData[0]);

      const { data: evtData } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: true })
        .limit(1);
      
      if (evtData && evtData.length > 0) setNextEvent(evtData[0]);

      const { data: linksData } = await supabase
        .from('official_links')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (linksData) setOfficialLinks(linksData);

      const { data: adData } = await supabase
        .from('adverts')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (adData && adData.length > 0) setAdverts(adData);

      const { data: libData } = await supabase
        .from('clinical_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (libData && libData.length > 0) setLibraryResources(libData);

    } catch (err) {
      console.error("Cloud Connection Error:", err.message);
    }
  };

  useEffect(() => {
    fetchHubData();
  }, []);

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${profile?.id || 'avatar'}-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      if (updateError) throw updateError;
      
      setProfileImage(publicUrl);
      alert("Hub Identity Photo Updated!");
    } catch (error) { 
      alert("Error: " + error.message); 
    }
  };

  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'home': return 'Medic Dashboard';
      case 'papers': return 'Revision Materials';
      case 'library': return 'Clinical Library';
      case 'updates': return 'Hub Updates';
      case 'membership': return 'Member Portal';
      default: return 'JKUCMA Hub';
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload(); 
  };

  const [expiryStats, setExpiryStats] = useState({ days: 0, date: 'N/A', percent: 0 });

  useEffect(() => {
    if (profile?.membership_expires_at) {
      const calculate = () => {
        const expiry = new Date(profile.membership_expires_at);
        const today = new Date();
        const diff = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
        const totalDays = 365;
        const remaining = diff > 0 ? diff : 0;
        const percentage = (remaining / totalDays) * 100;
        setExpiryStats({
          days: remaining,
          date: expiry.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          percent: percentage
        });
      };
      calculate();
    }
  }, [profile]);

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden lg:flex w-64 flex-col bg-[#003366] text-white p-6 shadow-xl fixed h-full z-40">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-white rounded-full overflow-hidden flex items-center justify-center border-2 border-white/20 shadow-lg p-1">
            <img src="/jkucma-logo.png" alt="JKUCMA Logo" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-xl font-black tracking-tight leading-none text-white select-none">
            JKUCMA <br/><span className="text-[10px] opacity-60 uppercase font-bold tracking-[0.2em]">Hub</span>
          </h2>
        </div>
        
        <nav className="space-y-2 flex-1">
          <NavItem icon={<Home size={20} />} label="Home" active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
          <NavItem icon={<BookOpen size={20} />} label="Library Pouch" active={isLibraryPouchOpen} onClick={() => setIsLibraryPouchOpen(true)} />
          <NavItem icon={<Bell size={20} />} label="Updates" active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} />
          <NavItem icon={<Users size={20} />} label="Membership" active={activeTab === 'membership'} onClick={() => setActiveTab('membership')} />
          
          {profile?.role === 'Admin' && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <NavItem icon={<ShieldCheck size={20} className="text-green-400" />} label="Admin Vault" onClick={() => setIsAdminModalOpen(true)} />
            </div>
          )}

          {/* SUPER ADMIN ONLY ADVERT MANAGER */}
          {isSuperAdmin && (
            <div className="mt-2 pt-2 border-t border-white/10">
              <NavItem 
                icon={<Sparkles size={20} className="text-yellow-400 animate-pulse" />} 
                label="Advert Manager" 
                onClick={() => setIsAdvertModalOpen(true)} 
              />
            </div>
          )}
        </nav>

        <div className="pt-2 border-t border-white/10">
          <NavItem icon={<LogOut size={20} />} label="Sign Out" onClick={handleSignOut} />
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <div className="lg:hidden fixed top-0 w-full bg-[#003366] text-white px-4 py-3 flex justify-between items-center z-50 shadow-md">
        <div className="flex items-center gap-2">
          <img src="/jkucma-logo.png" className="w-8 h-8 rounded-full bg-white p-0.5" alt="Logo" />
          <span className="font-black text-xs tracking-tighter uppercase">JKUCMA HUB</span>
        </div>
        <div className="flex items-center gap-3">
          {isSuperAdmin && (
            <button 
              onClick={() => setIsAdvertModalOpen(true)} 
              className="p-1.5 bg-yellow-400/20 text-yellow-300 rounded-xl text-[10px] font-black uppercase flex items-center gap-1"
            >
              <Sparkles size={13} /> Ads
            </button>
          )}
          <LogOut size={18} onClick={handleSignOut} className="text-red-300 opacity-70 cursor-pointer" />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-screen pt-14 lg:pt-0 pb-32 lg:pb-0">
        <header className="bg-white lg:bg-transparent p-4 lg:p-8 flex justify-between items-center relative z-40">
          <div className="max-w-[65%]">
            <h1 className="text-lg lg:text-3xl font-black text-slate-800 uppercase tracking-tighter truncate leading-tight">{getHeaderTitle()}</h1>
            <p className="text-slate-500 text-[10px] lg:text-sm font-medium italic truncate">Hi, {profile?.full_name?.split(' ')[0] || 'Steve'}</p>
          </div>

          <div className="flex items-center gap-3 relative flex-shrink-0">
            <div className="text-right hidden sm:block">
              <p className="text-xs font-bold text-slate-800 uppercase tracking-tighter">{profile?.full_name}</p>
              <p className={`text-[10px] font-bold uppercase tracking-wider flex items-center justify-end gap-1 ${profile?.membership_status === 'Active' ? 'text-[#1a5d1a]' : 'text-orange-500'}`}>
                {profile?.membership_status === 'Active' ? <><BadgeCheck size={12}/> Verified</> : 'Pending'}
              </p>
            </div>
            
            <div onClick={() => setShowProfile(!showProfile)} className="w-9 h-9 lg:w-12 lg:h-12 rounded-2xl bg-[#1a5d1a] flex items-center justify-center text-white font-black shadow-lg cursor-pointer border-2 border-white overflow-hidden active:scale-95 transition-transform">
              {(profile?.avatar_url || profileImage) ? <img src={profile?.avatar_url || profileImage} className="w-full h-full object-cover" alt="Avatar" /> : (profile?.full_name?.charAt(0) || 'M')}
            </div>

            {showProfile && (
              <>
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60] lg:hidden" onClick={() => setShowProfile(false)}></div>
                <div className="fixed inset-x-6 top-1/2 -translate-y-1/2 lg:absolute lg:top-14 lg:right-0 lg:inset-x-auto lg:translate-y-0 w-auto max-w-[90%] lg:w-72 bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 p-8 animate-in fade-in zoom-in duration-200 z-[70]">
                  <button onClick={() => setShowProfile(false)} className="absolute top-6 right-6 text-slate-300 hover:text-red-500 transition-colors"><X size={20} /></button>
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <div className="w-full h-full bg-slate-50 rounded-[1.5rem] flex items-center justify-center text-[#1a5d1a] font-black text-2xl overflow-hidden border-4 border-white shadow-md">
                        {(profile?.avatar_url || profileImage) ? <img src={profile?.avatar_url || profileImage} className="w-full h-full object-cover" alt="Avatar" /> : "M"}
                      </div>
                      <label className="absolute -bottom-1 -right-1 bg-[#003366] text-white p-2 rounded-xl cursor-pointer hover:bg-blue-800 shadow-lg border-2 border-white transition-transform active:scale-90">
                        <Camera size={14} />
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                      </label>
                    </div>
                    <h4 className="text-slate-800 font-black text-xs uppercase tracking-tight leading-tight">{profile?.full_name}</h4>
                    <div className="space-y-2 pt-4 border-t border-slate-50 text-left mt-4">
                      <div className="flex flex-col"><span className="text-[7px] text-slate-400 font-black uppercase">Reg No.</span><span className="text-[9px] text-slate-700 font-bold uppercase">{profile?.reg_number}</span></div>
                      <div className="flex justify-between">
                         <div className="flex flex-col"><span className="text-[7px] text-slate-400 font-black uppercase">Prog</span><span className="text-[9px] text-slate-700 font-bold">{profile?.program_type}</span></div>
                         <div className="flex flex-col text-right"><span className="text-[7px] text-slate-400 font-black uppercase">Level</span><span className="text-[9px] text-slate-700 font-bold">Yr {profile?.year_level}</span></div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        <div className="p-4 lg:p-8 max-w-7xl mx-auto space-y-6 flex-1 w-full pb-10">
          {activeTab === 'home' ? (
            <>
              {/* LIVE ANNOUNCEMENT & EVENT */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 lg:p-8 rounded-[1.5rem] lg:rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-[8px] font-black uppercase tracking-[0.2em] opacity-80">Live Update</span>
                    </div>
                    <h3 className="text-base lg:text-xl font-black mb-1 uppercase tracking-tighter leading-tight">{latestAnnouncement.title}</h3>
                    <p className="text-[10px] lg:text-xs text-blue-100 opacity-90 mb-4 line-clamp-2 italic">{latestAnnouncement.content}</p>
                    <button onClick={() => setActiveTab('updates')} className="w-fit flex items-center gap-2 bg-white/10 py-2 px-4 rounded-xl border border-white/10 text-[9px] font-black uppercase">Open Feed <ChevronRight size={14} /></button>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-[1.5rem] shadow-sm border border-slate-100 flex gap-4 items-center">
                  {nextEvent ? (
                    <>
                      <div className="w-12 h-12 bg-orange-100 rounded-xl flex flex-col items-center justify-center text-orange-600 shadow-inner">
                        <span className="text-[7px] font-black uppercase">{new Date(nextEvent.date).toLocaleString('default', { month: 'short' })}</span>
                        <span className="text-lg font-black leading-none">{new Date(nextEvent.date).getDate()}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 text-xs leading-tight truncate">{nextEvent.title}</h3>
                        <p className="text-[9px] text-slate-500 truncate italic">{nextEvent.location}</p>
                        <button onClick={() => setActiveTab('updates')} className="text-orange-600 font-black text-[9px] uppercase tracking-widest flex items-center gap-1">Details <ChevronRight size={12}/></button>
                      </div>
                    </>
                  ) : (
                    <div className="text-slate-300 italic text-[9px] font-black uppercase w-full text-center">No Events Synced</div>
                  )}
                </div>
              </div>

              {/* AUTO-SLIDING ADVERT CAROUSEL */}
              <AdvertCarousel adverts={adverts} />

              {/* GATEWAY ACCESS */}
              <section>
                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 ml-2">Gateway Access</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <QuickAction onClick={() => setIsLibraryPouchOpen(true)} icon={<BookOpen className="text-blue-600" />} label="Library" color="bg-blue-100" />
                  <QuickAction onClick={() => setActiveTab('updates')} icon={<Bell className="text-orange-600" />} label="Events" color="bg-orange-100" />
                  <QuickAction onClick={() => setActiveTab('membership')} icon={<Users className="text-green-600" />} label="Member" color="bg-green-100" />
                  <QuickAction onClick={() => setActiveTab('papers')} icon={<FileText className="text-red-600" />} label="Papers" color="bg-red-100" />
                </div>
              </section>

              {/* STATS & EVENTS */}
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 pb-8">
                <div className="xl:col-span-2 space-y-6">
                  <EventsFeed />
                </div>
                <div className="space-y-6">
                  <div className="bg-[#003366] p-5 rounded-[1.5rem] lg:rounded-[2rem] text-white shadow-xl border border-blue-900">
                    <h3 className="font-bold mb-3 flex items-center justify-between uppercase text-[9px] tracking-widest">Protocol Stats <span className="bg-white/20 px-2 py-0.5 rounded-lg">LIVE</span></h3>
                    <div className="relative h-2 bg-blue-900/50 rounded-full overflow-hidden mb-2">
                      <div style={{ width: `${expiryStats.percent}%` }} className="absolute h-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.5)] transition-all duration-1000"></div>
                    </div>
                    <p className="text-[9px] font-bold opacity-70 uppercase tracking-tight">{expiryStats.days} Days Remaining</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="animate-in fade-in duration-300 pb-12">
              <button onClick={() => setActiveTab('home')} className="mb-4 text-[9px] font-black text-blue-600 uppercase flex items-center gap-1">← Home</button>
              {activeTab === 'library' && <LibrarySection />}
              {activeTab === 'updates' && <EventsFeed />}
              {activeTab === 'papers' && <PastPapers />}
              {activeTab === 'membership' && <Membership profile={profile} />}
            </div>
          )}
        </div>

        {/* SOCIAL LINKS BAR */}
        <div className="w-full bg-[#002244] py-4 px-6 flex justify-center items-center gap-6 lg:gap-10 shadow-inner mt-auto">
          <SocialIcon icon={<Instagram size={20} className="text-white/70 hover:text-white" />} link="https://instagram.com/jkucma" />
          <SocialIcon icon={<Facebook size={20} className="text-white/70 hover:text-white" />} link="https://facebook.com/jkucma" />
          <SocialIcon icon={<Twitter size={20} className="text-white/70 hover:text-white" />} link="https://twitter.com/jkucma" />
          <SocialIcon icon={<Youtube size={20} className="text-white/70 hover:text-white" />} link="https://youtube.com/jkucma" />
          <SocialIcon icon={<Globe size={20} className="text-white/70 hover:text-white" />} link="https://jkucma.vercel.app" />
        </div>

        {/* PRODUCTION FOOTER */}
        <footer className="bg-white p-10 border-t border-slate-100 text-center mb-2 lg:mb-0">
          <div className="max-w-7xl mx-auto flex flex-col items-center gap-2">
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">© 2026 JKUCMA Association</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              Lead Architect: <span className="text-blue-600 font-black">Stephen Waweru Wangari</span>
            </p>
            <div className="mt-3 inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Secured by SSL</span>
            </div>
          </div>
        </footer>
      </main>

      {/* MOBILE BOTTOM NAVIGATION */}
      <nav className="lg:hidden fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 flex justify-around items-center py-4 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.06)] px-2">
        <MobileTabItem icon={<Home size={20} />} active={activeTab === 'home'} onClick={() => setActiveTab('home')} />
        <MobileTabItem icon={<BookOpen size={20} />} active={isLibraryPouchOpen} onClick={() => setIsLibraryPouchOpen(true)} />
        
        {profile?.role === 'Admin' && (
          <MobileTabItem icon={<ShieldCheck size={22} className="text-green-600" />} onClick={() => setIsAdminModalOpen(true)} />
        )}

        <MobileTabItem icon={<Bell size={20} />} active={activeTab === 'updates'} onClick={() => setActiveTab('updates')} />
        <MobileTabItem icon={<Users size={20} />} active={activeTab === 'membership'} onClick={() => setActiveTab('membership')} />
      </nav>

      {/* ADMIN UPLOAD MODAL */}
      {isAdminModalOpen && (
        <AdminUploadModal 
          onClose={() => setIsAdminModalOpen(false)} 
          onUploadSuccess={() => fetchHubData()} 
        />
      )}

      {/* SUPER ADMIN ADVERT MANAGER MODAL */}
      {isSuperAdmin && (
        <AdvertManagerModal
          isOpen={isAdvertModalOpen}
          onClose={() => setIsAdvertModalOpen(false)}
          userEmail={profile?.email}
          onRefresh={() => fetchHubData()}
        />
      )}

      {/* 📚 EXPANDED SLIDE-UP LIBRARY POUCH */}
      <LibraryPouch 
        isOpen={isLibraryPouchOpen} 
        onClose={() => setIsLibraryPouchOpen(false)} 
        resources={libraryResources} 
      />

    </div>
  );
};

const NavItem = ({ icon, label, active = false, onClick }) => (
  <div onClick={onClick} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${active ? 'bg-white/10 font-bold shadow-inner' : 'hover:bg-white/5 font-medium'}`}>
    {icon} <span className="text-sm">{label}</span>
  </div>
);

const MobileTabItem = ({ icon, active = false, onClick }) => (
  <button onClick={onClick} className={`transition-all duration-300 p-2.5 rounded-2xl ${active ? 'text-[#003366] bg-blue-50 scale-110 shadow-sm' : 'text-slate-400 active:scale-90'}`}>
    {icon}
  </button>
);

const QuickAction = ({ icon, label, color, onClick }) => (
  <div onClick={onClick} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex flex-col items-center gap-2 hover:shadow-lg transition-all cursor-pointer active:scale-95">
    <div className={`w-10 h-10 ${color} rounded-2xl flex items-center justify-center shadow-inner`}>{icon}</div>
    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
  </div>
);

const SocialIcon = ({ icon, link }) => (
  <a href={link} target="_blank" rel="noreferrer" className="transition-all active:scale-90">
    {icon}
  </a>
);

export default Dashboard;