import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Plus, Trash2, Edit3, CheckCircle, Sparkles } from 'lucide-react';

export const AdvertManagerModal = ({ isOpen, onClose, userEmail, onRefresh }) => {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAd, setEditingAd] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: 'SPONSORED',
    action_url: '',
    image_url: '',
    is_active: true
  });

  // Restricted Access Guard
  const isSuperAdmin = userEmail === 'wawerustephen507@gmail.com';

  useEffect(() => {
    if (isOpen && isSuperAdmin) {
      fetchAdminAdverts();
    }
  }, [isOpen]);

  const fetchAdminAdverts = async () => {
    const { data, error } = await supabase
      .from('adverts')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) setAdverts(data);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAd) {
        // Update existing advert
        const { error } = await supabase
          .from('adverts')
          .update(formData)
          .eq('id', editingAd.id);

        if (error) throw error;
      } else {
        // Insert new advert
        const { error } = await supabase
          .from('adverts')
          .insert([formData]);

        if (error) throw error;
      }

      setFormData({
        title: '',
        subtitle: '',
        tag: 'SPONSORED',
        action_url: '',
        image_url: '',
        is_active: true
      });
      setEditingAd(null);
      await fetchAdminAdverts();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Operation failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to remove this advert?")) return;
    const { error } = await supabase.from('adverts').delete().eq('id', id);
    if (!error) {
      fetchAdminAdverts();
      if (onRefresh) onRefresh();
    }
  };

  const toggleStatus = async (ad) => {
    const { error } = await supabase
      .from('adverts')
      .update({ is_active: !ad.is_active })
      .eq('id', ad.id);

    if (!error) {
      fetchAdminAdverts();
      if (onRefresh) onRefresh();
    }
  };

  if (!isOpen || !isSuperAdmin) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-2xl rounded-[2rem] p-6 lg:p-8 shadow-2xl max-h-[90vh] overflow-y-auto relative border border-slate-100">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <Sparkles size={18} />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Sponsor & Advert Hub</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Super-Admin Privilege Only</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <X size={18} />
          </button>
        </div>

        {/* FORM SECTION */}
        <form onSubmit={handleSave} className="space-y-4 bg-slate-50 p-5 rounded-2xl mb-6 border border-slate-200/60">
          <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
            {editingAd ? "Edit Advert" : "Create New Advert"}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input 
              type="text" 
              placeholder="Title (e.g. Clinical Scrubs Offer)" 
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="p-3 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input 
              type="text" 
              placeholder="Tag (e.g. SPONSORED, OFFER, FEATURED)" 
              value={formData.tag}
              onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
              className="p-3 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <textarea 
            placeholder="Subtitle / Details..." 
            rows={2}
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            className="w-full p-3 bg-white rounded-xl text-xs font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input 
              type="url" 
              placeholder="Action Link (e.g. https://wa.me/...)" 
              value={formData.action_url}
              onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
              className="p-3 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <input 
              type="url" 
              placeholder="Image Banner URL (Optional)" 
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              className="p-3 bg-white rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            {editingAd && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingAd(null);
                  setFormData({ title: '', subtitle: '', tag: 'SPONSORED', action_url: '', image_url: '', is_active: true });
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel Edit
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="ml-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-95"
            >
              {loading ? "Saving..." : (editingAd ? "Update Advert" : "Publish Advert")}
            </button>
          </div>
        </form>

        {/* ACTIVE ADVERTS LIST */}
        <div className="space-y-3">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-1">Manage Current Adverts</h3>
          {adverts.map((ad) => (
            <div key={ad.id} className="p-4 bg-white rounded-2xl border border-slate-100 flex items-center justify-between shadow-sm">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${ad.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                    {ad.is_active ? "Active" : "Disabled"}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400">{ad.tag}</span>
                </div>
                <h4 className="text-xs font-black text-slate-800 uppercase mt-1">{ad.title}</h4>
              </div>

              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(ad)}
                  className="p-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-[10px] font-bold"
                >
                  {ad.is_active ? "Pause" : "Enable"}
                </button>

                <button 
                  onClick={() => {
                    setEditingAd(ad);
                    setFormData({
                      title: ad.title || '',
                      subtitle: ad.subtitle || '',
                      tag: ad.tag || 'SPONSORED',
                      action_url: ad.action_url || '',
                      image_url: ad.image_url || '',
                      is_active: ad.is_active
                    });
                  }}
                  className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                >
                  <Edit3 size={15} />
                </button>

                <button 
                  onClick={() => handleDelete(ad.id)}
                  className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default AdvertManagerModal;