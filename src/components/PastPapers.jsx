import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FileText, Download, Search, Loader2 } from 'lucide-react';

const PastPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterYear, setFilterYear] = useState('All');
  const [searchTerm, setSearchTerm] = useState(''); // 🔍 SEARCH STATE

  useEffect(() => {
    fetchPapers();
  }, []);

  async function fetchPapers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('past_papers')
        .select('*')
        .order('year_level', { ascending: true });
      
      if (error) throw error;
      setPapers(data || []);
    } catch (err) {
      console.error('Error:', err.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔍 COMBINED FILTER LOGIC (Year + Search)
  const filteredPapers = papers.filter((p) => {
    const matchesYear = filterYear === 'All' || p.year_level.toString() === filterYear;
    const matchesSearch = 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.unit_code?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesYear && matchesSearch;
  });

  if (loading) {
    return (
      <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
        <Loader2 className="animate-spin text-red-600 mb-2" size={28} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Exam Docs...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-500">
      <div className="flex flex-col space-y-6 mb-8">
        {/* HEADER & FILTERS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="font-black text-xl text-[#003366] uppercase tracking-tighter leading-none">Exam Repository</h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">Past Papers & CATs</p>
          </div>

          <div className="flex gap-1.5 bg-slate-50 p-1.5 rounded-2xl overflow-x-auto">
            {['All', '1', '2', '3', '4'].map((yr) => (
              <button
                key={yr}
                onClick={() => setFilterYear(yr)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black transition-all whitespace-nowrap ${
                  filterYear === yr ? 'bg-[#003366] text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {yr === 'All' ? 'ALL YEARS' : `YEAR ${yr}`}
              </button>
            ))}
          </div>
        </div>

        {/* 🔍 SEARCH INPUT */}
        <div className="relative group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-red-500 transition-colors" size={16} />
          <input 
            type="text"
            placeholder="Search by Unit Code (e.g., SML) or Paper Title..."
            className="w-full pl-12 pr-4 py-4 bg-slate-50 rounded-2xl border-none text-[11px] font-bold focus:ring-2 ring-red-500/10 transition-all outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* PAPERS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredPapers.length > 0 ? (
          filteredPapers.map((paper) => (
            <div key={paper.id} className="group bg-slate-50 hover:bg-white p-5 rounded-[2rem] flex justify-between items-center transition-all border border-transparent hover:border-slate-100 hover:shadow-xl hover:shadow-red-900/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform">
                  <FileText size={20} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-xs uppercase tracking-tight leading-tight">{paper.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{paper.unit_code}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[9px] font-black text-red-500 uppercase tracking-tighter">Year {paper.year_level}</span>
                  </div>
                </div>
              </div>
              <a 
                href={paper.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-3 bg-white text-slate-300 hover:text-red-600 rounded-xl shadow-sm transition-all"
              >
                <Download size={18} />
              </a>
            </div>
          ))
        ) : (
          <div className="col-span-full py-16 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">
              {searchTerm ? "No papers match your search criteria" : "No exam resources found for this year level"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PastPapers;