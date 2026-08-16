import React, { useState } from 'react';
import { X, Search, BookOpen, Download, FileText, Sparkles } from 'lucide-react';

const LibraryPouch = ({ isOpen, onClose, resources = [] }) => {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const safeResources = Array.isArray(resources) ? resources : [];
  const filtered = safeResources.filter(res => 
    (res.title || '').toLowerCase().includes(query.toLowerCase()) ||
    (res.category || '').toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 p-0 sm:p-4">
      {/* BACKDROP CLICK DISMISS */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* POUCH SHEET */}
      <div className="bg-white w-full max-w-3xl max-h-[92vh] h-[88vh] rounded-t-[2.5rem] sm:rounded-[2.5rem] p-6 lg:p-8 flex flex-col shadow-2xl animate-in slide-in-from-bottom duration-300 relative z-10 border border-slate-100">
        
        {/* TOP PULL HANDLE / DISMISS */}
        <div className="w-14 h-1.5 bg-slate-200 rounded-full mx-auto mb-5 cursor-pointer hover:bg-slate-300 transition-colors" onClick={onClose} />
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 bg-blue-100 text-blue-700 rounded-lg">
                <BookOpen size={16} />
              </span>
              <span className="text-xs font-black uppercase tracking-[0.2em] text-blue-600">Digital Vault</span>
            </div>
            <h2 className="text-xl lg:text-2xl font-black text-slate-800 uppercase tracking-tight">Clinical Library</h2>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-0.5">
              {safeResources.length} Medical Resources & Textbooks Available
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 bg-slate-100 rounded-2xl text-slate-500 hover:bg-slate-200 hover:text-slate-700 active:scale-95 transition-all shadow-sm"
          >
            <X size={20} />
          </button>
        </div>

        {/* SEARCH INPUT */}
        <div className="relative mb-5">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search clinical textbooks, surgery notes, anatomy..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-13 pr-5 py-4 bg-slate-50 rounded-2xl border border-slate-200/80 outline-none text-sm font-bold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* SCROLLABLE RESOURCE LIST */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filtered.map((item, idx) => (
            <div 
              key={item.id || idx} 
              className="p-4 lg:p-5 bg-slate-50 hover:bg-blue-50/60 rounded-[1.5rem] flex items-center justify-between border border-slate-100 hover:border-blue-200 transition-all group"
            >
              <div className="flex items-center gap-4 min-w-0 pr-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 shrink-0 group-hover:scale-105 transition-transform">
                  <FileText size={22} />
                </div>
                <div className="min-w-0">
                  <h4 className="text-sm lg:text-base font-black text-slate-800 uppercase leading-snug line-clamp-1">
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 px-2.5 py-0.5 rounded-md">
                      {item.category || 'Clinical Medicine'}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      {item.file_size || 'PDF'}
                    </span>
                  </div>
                </div>
              </div>

              {item.file_url && (
                <a 
                  href={item.file_url} 
                  target="_blank" 
                  rel="noreferrer" 
                  download 
                  className="px-4 py-2.5 bg-white group-hover:bg-blue-600 group-hover:text-white shadow-sm border border-slate-200/80 group-hover:border-transparent rounded-xl text-slate-600 flex items-center gap-2 font-black text-xs uppercase tracking-wider active:scale-95 transition-all shrink-0"
                >
                  <span className="hidden sm:inline">Get</span>
                  <Download size={16} />
                </a>
              )}
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="text-center py-16">
              <BookOpen size={36} className="mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-black text-slate-500 uppercase tracking-wider">No library materials found</p>
              <p className="text-xs text-slate-400 font-medium mt-1">Try refining your search keyword.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LibraryPouch;