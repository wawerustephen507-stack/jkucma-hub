import React, { useState } from 'react';
import { BookOpen, X, Download, Search, FileText, CheckCircle2, ChevronDown } from 'lucide-react';

const LibraryPouch = ({ isOpen, onClose, resources = [] }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  if (!isOpen) return null;

  const categories = ['ALL', 'CLINICAL MEDICINE', 'ANATOMY', 'PHARMACOLOGY', 'PATHOLOGY', 'SURGERY'];

  const filteredResources = resources.filter((item) => {
    const matchesSearch = item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.file_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'ALL' || 
                            item.category?.toUpperCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      
      {/* BACKGROUND TAP TO CLOSE */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* FULL-HEIGHT EXPANDED POUCH SHEET */}
      <div 
        className="relative w-full max-w-4xl bg-white rounded-t-[2.5rem] lg:rounded-t-[3rem] shadow-[0_-15px_40px_rgba(0,0,0,0.25)] flex flex-col h-[92vh] sm:h-[88vh] lg:h-[82vh] overflow-hidden z-10 animate-in slide-in-from-bottom duration-300"
      >
        
        {/* DRAG HANDLE & CLOSE ROW */}
        <div className="pt-3 pb-2 px-6 flex flex-col items-center border-b border-slate-100 bg-slate-50/50">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full mb-3" />
          
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-blue-100 text-blue-700 rounded-2xl">
                <BookOpen size={20} />
              </span>
              <div>
                <div className="text-[9px] font-black tracking-[0.2em] text-blue-600 uppercase">Digital Vault</div>
                <h2 className="text-base sm:text-xl font-black text-slate-900 uppercase tracking-tight leading-none">
                  Clinical Library
                </h2>
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-2xl transition-all active:scale-90"
            >
              <X size={18} />
            </button>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider self-start mt-2">
            {filteredResources.length} Medical Resources & Textbooks Available
          </p>
        </div>

        {/* SEARCH & FILTER CONTROLS */}
        <div className="p-4 sm:p-6 bg-white border-b border-slate-100 space-y-3">
          <div className="relative">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search clinical textbooks, surgery notes, anatomy PDFs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 rounded-2xl text-xs font-bold text-slate-800 placeholder-slate-400 border border-slate-200 outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          {/* QUICK CATEGORY CHIPS */}
          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar text-[10px] font-black uppercase">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                  selectedCategory === cat 
                    ? 'bg-[#003366] text-white shadow-md' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* SCROLLABLE DOCUMENT REPOSITORY LIST */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 bg-slate-50/50">
          {filteredResources.length > 0 ? (
            filteredResources.map((item, idx) => (
              <div 
                key={item.id || idx}
                className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-blue-600 rounded-xl text-white flex items-center justify-center shrink-0 shadow-md">
                    <FileText size={20} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight truncate leading-tight">
                      {item.title || item.file_name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[8px] font-black uppercase tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md">
                        {item.category || 'CLINICAL MEDICINE'}
                      </span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase">
                        {item.file_type || 'PDF'}
                      </span>
                    </div>
                  </div>
                </div>

                <a 
                  href={item.file_url || item.download_url || '#'}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="p-2.5 bg-slate-100 hover:bg-[#1a5d1a] text-slate-700 hover:text-white rounded-xl transition-all shrink-0 active:scale-90 shadow-sm"
                  title="Download / Open File"
                >
                  <Download size={16} />
                </a>
              </div>
            ))
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <FileText size={36} className="mb-2 opacity-40" />
              <p className="text-xs font-black uppercase">No Matching Documents Found</p>
              <p className="text-[10px] font-bold text-slate-400 mt-1">Try another search term or filter category.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default LibraryPouch;