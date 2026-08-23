import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { X, Sparkles, Image, Palette, Link, UploadCloud, Trash2, Edit3, Eye } from 'lucide-react';

const AdvertManagerModal = ({ isOpen, onClose, userEmail, onRefresh }) => {
  const [adverts, setAdverts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const presetThemes = [
    { name: 'Scrub Emerald', gradient: 'linear-gradient(135deg, #064e3b 0%, #1a5d1a 100%)', badge: 'bg-emerald-400/20 text-emerald-300' },
    { name: 'Uber Black', gradient: 'linear-gradient(135deg, #000000 0%, #1c1917 100%)', badge: 'bg-white/20 text-white' },
    { name: 'Royal Medical', gradient: 'linear-gradient(135deg, #002244 0%, #003366 100%)', badge: 'bg-blue-400/20 text-blue-200' },
    { name: 'Sunrise Amber', gradient: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)', badge: 'bg-amber-300/20 text-amber-200' },
    { name: 'Modern Violet', gradient: 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)', badge: 'bg-purple-300/20 text-purple-200' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    tag: 'SPONSORED',
    action_url: '',
    image_url: '',
    bg_gradient: presetThemes[0].gradient,
    is_active: true
  });

  const isSuperAdmin = userEmail?.toLowerCase() === 'wawerustephen507@gmail.com';

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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `ad-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('adverts')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('adverts')
        .getPublicUrl(fileName);

      setFormData(prev => ({ ...prev, image_url: publicUrl }));
    } catch (err) {
      alert("Image Upload Failed: " + err.message);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingAd) {
        const { error } = await supabase
          .from('adverts')
          .update(formData)
          .eq('id', editingAd.id);

        if (error) throw error;
      } else {
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
        bg_gradient: presetThemes[0].gradient,
        is_active: true
      });
      setEditingAd(null);
      await fetchAdminAdverts();
      if (onRefresh) onRefresh();
    } catch (err) {
      alert("Error saving advert: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this advert?")) return;
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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-0 sm:p-4">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-t-[2.5rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col h-[94vh] sm:h-auto sm:max-h-[90vh] overflow-hidden z-10 animate-in slide-in-from-bottom duration-300">
        
        {/* HEADER */}
        <div className="p-6 pb-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="p-2.5 bg-yellow-100 text-yellow-800 rounded-2xl">
              <Sparkles size={20} />
            </span>
            <div>
              <h2 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight">Sponsor & Advert Studio</h2>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Brand Visuals & Banner Campaigns</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl active:scale-90 transition-all">
            <X size={18} />
          </button>
        </div>

        {/* FORM CONTENT */}
        <form onSubmit={handleSave} className="p-6 space-y-4 overflow-y-auto flex-1 bg-white">
          
          {/* LIVE BANNER PREVIEW CARD */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1 mb-2">
              <Eye size={12} /> Live Preview
            </label>
            
            <div 
              className="w-full h-[125px] sm:h-[145px] rounded-[1.5rem] sm:rounded-[2rem] relative flex items-center justify-between px-5 py-4 text-white shadow-lg overflow-hidden transition-all"
              style={{
                background: formData.image_url ? '#0f172a' : formData.bg_gradient
              }}
            >
              {formData.image_url ? (
                <img src={formData.image_url} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-[1.5rem] sm:rounded-[2rem]" />
              ) : (
                <>
                  <div className="relative z-10 max-w-[75%] space-y-1">
                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2.5 py-0.5 rounded-full text-white text-[8px] font-black uppercase tracking-wider">
                      <Sparkles size={10} className="text-yellow-300 animate-pulse" />
                      <span>{formData.tag || 'SPONSORED'}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-tight line-clamp-1">
                      {formData.title || 'Brand Title Headline'}
                    </h3>
                    <p className="text-[9px] sm:text-[10px] font-medium text-white/90 line-clamp-2">
                      {formData.subtitle || 'Add promotional copy or description here...'}
                    </p>
                  </div>

                  <div className="relative z-10 shrink-0 px-3.5 py-2 bg-white text-slate-900 rounded-xl font-black text-[9px] uppercase tracking-wider shadow-md">
                    Open
                  </div>
                </>
              )}
            </div>
          </div>

          {/* CHOOSE BANNER TYPE: IMAGE OR GRADIENT THEME */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            
            {/* DIRECT IMAGE BANNER UPLOAD */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Image size={14} className="text-blue-600" /> Full Image Banner
              </label>
              
              <label className="flex items-center justify-center gap-2 p-3 bg-white border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-100 transition-all">
                <UploadCloud size={16} className="text-slate-500" />
                <span className="text-[10px] font-bold text-slate-600 uppercase">
                  {uploadingImage ? 'Uploading...' : (formData.image_url ? 'Replace Banner Image' : 'Upload Image File')}
                </span>
                <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
              </label>

              {formData.image_url && (
                <button 
                  type="button" 
                  onClick={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  className="text-[9px] font-bold text-red-500 hover:underline uppercase block text-center w-full"
                >
                  Remove Image (Use Gradient Theme)
                </button>
              )}
            </div>

            {/* COLOR THEME SELECTOR */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="text-[10px] font-black text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                <Palette size={14} className="text-emerald-600" /> Custom Color Theme
              </label>
              <div className="flex gap-2 flex-wrap">
                {presetThemes.map((theme) => (
                  <button
                    key={theme.name}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, bg_gradient: theme.gradient, image_url: '' }))}
                    className={`w-7 h-7 rounded-full shadow-sm border-2 transition-all ${
                      formData.bg_gradient === theme.gradient && !formData.image_url ? 'border-blue-600 scale-110' : 'border-white'
                    }`}
                    style={{ background: theme.gradient }}
                    title={theme.name}
                  />
                ))}
              </div>
            </div>

          </div>

          {/* INPUT FIELDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Headline</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Uber Medic Student Discount" 
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            <div>
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Badge / Tag</label>
              <input 
                type="text" 
                placeholder="e.g. 20% OFF, SPONSORED, PARTNER" 
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Subtitle / Pitch Details</label>
            <textarea 
              rows={2} 
              placeholder="e.g. Safe, affordable campus rides. Use promo code JKUCMA26."
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              className="w-full p-3 bg-slate-50 rounded-xl text-xs font-medium border border-slate-200 outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div>
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Target Action Link (URL / WhatsApp)</label>
            <input 
              type="url" 
              required
              placeholder="https://uber.com or https://wa.me/254..." 
              value={formData.action_url}
              onChange={(e) => setFormData({ ...formData, action_url: e.target.value })}
              className="w-full p-3 bg-slate-50 rounded-xl text-xs font-bold border border-slate-200 outline-none focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex justify-between items-center pt-2">
            {editingAd && (
              <button 
                type="button" 
                onClick={() => {
                  setEditingAd(null);
                  setFormData({ title: '', subtitle: '', tag: 'SPONSORED', action_url: '', image_url: '', bg_gradient: presetThemes[0].gradient, is_active: true });
                }}
                className="text-xs font-bold text-slate-500 hover:text-slate-700"
              >
                Cancel Edit
              </button>
            )}
            <button 
              type="submit" 
              disabled={loading || uploadingImage}
              className="ml-auto px-6 py-3 bg-[#003366] hover:bg-blue-900 text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl transition-all active:scale-95"
            >
              {loading ? "Publishing..." : (editingAd ? "Update Campaign" : "Launch Advert")}
            </button>
          </div>

          {/* CURRENT LIVE CAMPAIGNS */}
          <div className="space-y-2 pt-4 border-t border-slate-100">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Database Campaigns</h4>
            
            {adverts.map((ad) => (
              <div key={ad.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${ad.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                      {ad.is_active ? "Live" : "Paused"}
                    </span>
                    <span className="text-[9px] font-bold text-slate-500">{ad.tag}</span>
                  </div>
                  <h5 className="text-xs font-black text-slate-800 uppercase mt-0.5">{ad.title}</h5>
                </div>

                <div className="flex items-center gap-1.5">
                  <button 
                    type="button"
                    onClick={() => toggleStatus(ad)}
                    className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-xl text-[10px] font-bold text-slate-600 hover:bg-slate-100"
                  >
                    {ad.is_active ? "Pause" : "Resume"}
                  </button>

                  <button 
                    type="button"
                    onClick={() => {
                      setEditingAd(ad);
                      setFormData({
                        title: ad.title || '',
                        subtitle: ad.subtitle || '',
                        tag: ad.tag || 'SPONSORED',
                        action_url: ad.action_url || '',
                        image_url: ad.image_url || '',
                        bg_gradient: ad.bg_gradient || presetThemes[0].gradient,
                        is_active: ad.is_active
                      });
                    }}
                    className="p-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100"
                  >
                    <Edit3 size={14} />
                  </button>

                  <button 
                    type="button"
                    onClick={() => handleDelete(ad.id)}
                    className="p-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </form>

      </div>
    </div>
  );
};

export default AdvertManagerModal;