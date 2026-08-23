import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  Key, X, FileText, BookOpen, Calendar, MessageSquare, 
  UploadCloud, CheckCircle2, AlertCircle, Sparkles 
} from 'lucide-react';

const AdminUploadModal = ({ onClose, onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState('papers');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Form states
  const [title, setTitle] = useState('');
  const [unitCode, setUnitCode] = useState('');
  const [yearLevel, setYearLevel] = useState('1');
  const [directUrl, setDirectUrl] = useState('');
  const [category, setCategory] = useState('CLINICAL MEDICINE');
  const [eventDate, setEventDate] = useState('');
  const [location, setLocation] = useState('');
  const [content, setContent] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      if (activeTab === 'papers') {
        const { error } = await supabase.from('past_papers').insert([{
          title,
          unit_code: unitCode,
          year_level: parseInt(yearLevel),
          file_url: directUrl,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      } else if (activeTab === 'library') {
        const { error } = await supabase.from('clinical_library').insert([{
          title,
          category,
          file_url: directUrl,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      } else if (activeTab === 'events') {
        const { error } = await supabase.from('events').insert([{
          title,
          date: eventDate,
          location,
          details: content,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      } else if (activeTab === 'feed') {
        const { error } = await supabase.from('announcements').insert([{
          title,
          content,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      } else if (activeTab === 'adverts') {
        const { error } = await supabase.from('adverts').insert([{
          title,
          subtitle: content,
          tag: category || 'SPONSORED',
          action_url: directUrl,
          is_active: true,
          created_at: new Date().toISOString()
        }]);
        if (error) throw error;
      }

      setMessage({ text: 'Successfully published to JKUCMA Hub!', type: 'success' });
      setTimeout(() => {
        if (onUploadSuccess) onUploadSuccess();
        onClose();
      }, 1200);
    } catch (err) {
      setMessage({ text: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const navOptions = [
    { id: 'papers', label: 'PAPERS', icon: <FileText size={18} /> },
    { id: 'library', label: 'LIBRARY', icon: <BookOpen size={18} /> },
    { id: 'events', label: 'EVENTS', icon: <Calendar size={18} /> },
    { id: 'feed', label: 'FEED', icon: <MessageSquare size={18} /> },
    { id: 'adverts', label: 'ADVERTS', icon: <Sparkles size={18} className="text-yellow-400" /> }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      
      {/* BACKGROUND TAP CLOSE */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* FULL-HEIGHT RESPONSIVE CONTAINER */}
      <div className="relative w-full max-w-xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[92vh] sm:h-auto sm:max-h-[90vh] overflow-hidden z-10 animate-in slide-in-from-bottom duration-300">
        
        {/* HEADER BAR */}
        <div className="p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-emerald-100 text-emerald-800 rounded-2xl">
              <Key size={20} />
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight">Admin Vault</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Manage Association Ecosystem</p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl active:scale-90 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* TAB SWITCHER */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {navOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => { setActiveTab(opt.id); setMessage({ text: '', type: '' }); }}
              className={`flex-1 min-w-[70px] py-2.5 px-3 rounded-2xl flex flex-col items-center gap-1 text-[9px] font-black uppercase tracking-wider transition-all ${
                activeTab === opt.id 
                  ? 'bg-[#003366] text-white shadow-md' 
                  : 'bg-white text-slate-500 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* SCROLLABLE FORM BODY */}
        <form onSubmit={handleUpload} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
          {message.text && (
            <div className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{message.text}</span>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Protocol Title / Subject</label>
            <input 
              type="text" 
              required
              placeholder={activeTab === 'adverts' ? 'e.g. Clinical Scrubs Special Offer' : 'e.g. End of Stage Surgery Exam'} 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          {activeTab === 'papers' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Unit Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. HCM 2204" 
                  value={unitCode}
                  onChange={(e) => setUnitCode(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Year Level</label>
                <select 
                  value={yearLevel}
                  onChange={(e) => setYearLevel(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'library' && (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Department Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
              >
                <option value="CLINICAL MEDICINE">Clinical Medicine</option>
                <option value="ANATOMY">Anatomy</option>
                <option value="PHARMACOLOGY">Pharmacology</option>
                <option value="PATHOLOGY">Pathology</option>
                <option value="SURGERY">Surgery</option>
              </select>
            </div>
          )}

          {activeTab === 'adverts' && (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Advert Tag / Badge</label>
              <input 
                type="text" 
                placeholder="e.g. SPONSORED, SPECIAL OFFER, NOTICE" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}

          {(activeTab === 'papers' || activeTab === 'library' || activeTab === 'adverts') && (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                {activeTab === 'adverts' ? 'Action / Booking URL' : 'Direct URL (Drive / PDF Link)'}
              </label>
              <input 
                type="url" 
                required
                placeholder="https://..." 
                value={directUrl}
                onChange={(e) => setDirectUrl(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}

          {activeTab === 'events' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Event Date</label>
                  <input 
                    type="date" 
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Location</label>
                  <input 
                    type="text" 
                    placeholder="COHES / Online" 
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">Event Brief</label>
                <textarea 
                  rows={3} 
                  placeholder="Key agenda and venue schedule..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </>
          )}

          {(activeTab === 'feed' || activeTab === 'adverts') && (
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1.5">
                {activeTab === 'adverts' ? 'Advert Subtitle / Description' : 'Broadcast Content'}
              </label>
              <textarea 
                rows={4} 
                required
                placeholder={activeTab === 'adverts' ? 'Describe the offer or contact instructions...' : 'Official message to all active association members...'}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:ring-2 focus:ring-emerald-600"
              />
            </div>
          )}

          <div className="pt-3">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-[#1a5d1a] hover:bg-emerald-800 active:scale-95 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl transition-all"
            >
              {loading ? "Transmitting..." : "Post to JKUCMA Hub"}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AdminUploadModal;