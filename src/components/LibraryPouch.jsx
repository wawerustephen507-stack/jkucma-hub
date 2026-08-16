
import React, { useState } from 'react';
import { X, Search, BookOpen, Download } from 'lucide-react';

const LibraryPouch = ({ isOpen, onClose, resources = [] }) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const safeResources = Array.isArray(resources) ? resources : [];
  const filtered = safeResources.filter(res => 
    (res.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (res.category || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="bg-white w-full max-w-md max-h-[82vh] h-[80vh] rounded-t-[3rem] p-6 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 relative z-10">
        <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-4 cursor-pointer" onClick={onClose} />
        
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">Clinical Library</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{safeResources.length} Resources Available</p>
          </div>
          <button onClick={onClose} className="p-2 bg-slate-100 rounded-full text-slate-500 hover:bg-slate-200">
            <X size={16} />
          </button>
        </div>

        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
          <input 
            type="text" 
            placeholder="Search textbooks, surgery..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border-none outline-none text-xs font-bold text-slate-700 shadow-inner placeholder:text-slate-300"
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {filtered.map((item, idx) => (
            <div key={item.id || idx} className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between border border-slate-100 hover:bg-blue-50/50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <BookOpen size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-800 uppercase leading-tight line-clamp-1">{item.title}</h4>
                  <p className="text-[9px] font-bold text-blue-500 uppercase mt-0.5">{item.category || 'Medicine'} • <span className="text-slate-400">{item.file_size || 'PDF'}</span></p>
                </div>
              </div>
              <a href={item.file_url} target="_blank" rel="noreferrer" download className="p-2.5 bg-white shadow-sm rounded-xl text-slate-400 hover:text-blue-600">
                <Download size={15} />
              </a>
            </div>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-xs text-slate-400 py-8 font-bold">No resources found.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPouch;