import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Book, FileText, Calendar, Megaphone, Loader2, KeyRound, Link as LinkIcon, Trash2 } from 'lucide-react';

const AdminUploadModal = ({ onClose, onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('paper'); 
  const [formData, setFormData] = useState({});
  const [existingItems, setExistingItems] = useState([]);

  // 🏥 Table mapping for all 5 categories
  const tableMap = {
    paper: 'past_papers',
    library: 'clinical_library', 
    event: 'events',
    announcement: 'announcements',
    link: 'official_links' 
  };
  // 📥 Fetch items for the current mode so we can delete them
  const fetchItems = async () => {
    const { data } = await supabase
      .from(tableMap[mode])
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setExistingItems(data);
  };

  useEffect(() => { fetchItems(); }, [mode]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from(tableMap[mode]).insert([{ ...formData, admin_id: user?.id }]);
      if (error) throw error;
      setFormData({});
      fetchItems();
      if (onUploadSuccess) onUploadSuccess();
      alert(`JKUCMA PROTOCOL: ${mode.toUpperCase()} Posted!`);
    } catch (err) { alert("Sync Error: " + err.message); }
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently delete this item from the Hub?")) return;
    const { error } = await supabase.from(tableMap[mode]).delete().eq('id', id);
    if (!error) {
      fetchItems();
      if (onUploadSuccess) onUploadSuccess();
    }
  };

  return (
    <div className="fixed inset-0 bg-[#003366]/80 backdrop-blur-md flex items-center justify-center p-6 z-[100] animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-lg rounded-[3rem] p-8 relative animate-in zoom-in-95 duration-200 shadow-3xl max-h-[90vh] overflow-y-auto custom-scrollbar">
        
        <button onClick={onClose} className="absolute top-8 right-8 text-slate-300 hover:text-red-500 transition-colors"><X size={24}/></button>
        
        <div className="flex items-center gap-3 mb-2">
          <KeyRound size={20} className="text-[#1a5d1a]" />
          <h3 className="font-black text-[#003366] text-2xl uppercase tracking-tighter">Admin Vault</h3>
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Manage Association Ecosystem</p>
        
        {/* 🏥 5-CATEGORY SELECTOR */}
        <div className="flex flex-wrap gap-2 mb-8 bg-slate-50 p-1.5 rounded-2xl shadow-inner">
          {[
            { id: 'paper', icon: <FileText size={14}/>, label: 'Papers' },
            { id: 'library', icon: <Book size={14}/>, label: 'Library' },
            { id: 'event', icon: <Calendar size={14}/>, label: 'Events' },
            { id: 'announcement', icon: <Megaphone size={14}/>, label: 'Feed' },
            { id: 'link', icon: <LinkIcon size={14}/>, label: 'Links' }
          ].map((m) => (
            <button key={m.id} type="button" onClick={() => { setMode(m.id); setFormData({}); }}
              className={`flex-1 min-w-[80px] flex flex-col items-center py-2.5 rounded-xl transition-all ${mode === m.id ? 'bg-[#003366] text-white shadow-lg' : 'text-slate-400 hover:bg-white'}`}
            >
              {m.icon}
              <span className="text-[8px] font-black uppercase mt-1">{m.label}</span>
            </button>
          ))}
        </div>

        {/* 🏥 UPLOAD FORM */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-10 pb-10 border-b border-slate-100">
          <input 
            placeholder="Protocol Title / Subject" 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold focus:ring-2 ring-blue-500/10 outline-none"
            value={formData.title || ''}
            onChange={(e) => setFormData({...formData, title: e.target.value})} required
          />

          <div className="grid grid-cols-2 gap-4">
            {mode === 'paper' && (
              <>
                <input placeholder="Unit Code" className="p-4 bg-slate-50 rounded-2xl text-sm font-bold" onChange={(e) => setFormData({...formData, unit_code: e.target.value.toUpperCase()})}/>
                <select className="p-4 bg-slate-50 rounded-2xl text-sm font-bold" onChange={(e) => setFormData({...formData, year_level: parseInt(e.target.value)})}>
                  <option>Year Level</option>{[1,2,3,4,5].map(y => <option key={y} value={y}>Yr {y}</option>)}
                </select>
              </>
            )}
            {mode === 'event' && (
              <>
                <input type="date" className="p-4 bg-slate-50 rounded-2xl text-sm font-bold" onChange={(e) => setFormData({...formData, date: e.target.value})}/>
                <input placeholder="Venue" className="p-4 bg-slate-50 rounded-2xl text-sm font-bold" onChange={(e) => setFormData({...formData, location: e.target.value})}/>
              </>
            )}
          </div>

          {mode !== 'announcement' ? (
            <input 
              placeholder="Direct URL (Drive / Survey Link)" 
              className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold"
              value={formData.file_url || ''}
              onChange={(e) => setFormData({...formData, file_url: e.target.value})} required
            />
          ) : (
            <textarea placeholder="Announcement content..." className="w-full p-4 bg-slate-50 rounded-2xl text-sm font-bold min-h-[100px]" onChange={(e) => setFormData({...formData, content: e.target.value})} required />
          )}

          <button type="submit" disabled={loading} className="w-full py-5 bg-[#1a5d1a] text-white rounded-3xl font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-3">
            {loading ? <Loader2 className="animate-spin" /> : "POST TO JKUCMA HUB"}
          </button>
        </form>

        {/* 🏥 DELETE/MANAGE SECTION */}
        <div>
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Existing {mode}s</h4>
          <div className="space-y-2">
            {existingItems.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl group hover:bg-red-50 transition-all">
                <div className="flex flex-col">
                  <span className="text-xs font-black text-[#003366] uppercase tracking-tighter">{item.title}</span>
                  <span className="text-[9px] text-slate-400 font-bold">{new Date(item.created_at).toLocaleDateString()}</span>
                </div>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            {existingItems.length === 0 && <p className="text-[10px] text-slate-300 italic">No items found in this protocol.</p>}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminUploadModal;