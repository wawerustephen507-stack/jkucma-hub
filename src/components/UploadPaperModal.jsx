import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Plus, X, UploadCloud } from 'lucide-react';

const UploadPaperModal = ({ onUploadSuccess }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '', unit_code: '', year_level: '1', exam_type: 'CAT', file_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { error } = await supabase.from('past_papers').insert([formData]);
    if (!error) {
      setIsOpen(false);
      onUploadSuccess();
      alert("Paper Uploaded Successfully! 🩺");
    }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="fixed bottom-24 right-8 bg-[#003366] text-white p-4 rounded-full shadow-2xl flex items-center gap-2 hover:scale-105 transition-all z-50">
      <Plus size={24} /> <span className="font-bold text-xs uppercase pr-2">Add Paper</span>
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 z-[100]">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 relative animate-in zoom-in duration-200">
        <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-300"><X /></button>
        
        <h3 className="font-black text-[#003366] text-xl uppercase tracking-tighter mb-6">Contribute Resource</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            placeholder="Paper Title (e.g. Anatomy CAT 1)" 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold"
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              placeholder="Unit Code" 
              className="p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold"
              onChange={(e) => setFormData({...formData, unit_code: e.target.value})}
            />
            <select 
              className="p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold text-slate-500"
              onChange={(e) => setFormData({...formData, year_level: parseInt(e.target.value)})}
            >
              <option value="1">Year 1</option>
              <option value="2">Year 2</option>
              <option value="3">Year 3</option>
              <option value="4">Year 4</option>
            </select>
          </div>
          <input 
            placeholder="Paste Google Drive Direct Link" 
            className="w-full p-4 bg-slate-50 rounded-2xl border-none text-sm font-bold"
            onChange={(e) => setFormData({...formData, file_url: e.target.value})}
            required
          />
          <button type="submit" className="w-full py-4 bg-[#1a5d1a] text-white rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-green-900/20">
            Push to Cloud
          </button>
        </form>
      </div>
    </div>
  );
};

export default UploadPaperModal;