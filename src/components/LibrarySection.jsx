import React, { useEffect, useState } from 'react';
import { supabase } from "../lib/supabaseClient";
import { BookOpen, Download, Loader2, Search } from 'lucide-react';

const LibrarySection = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(''); // 🔍 NEW SEARCH STATE

  useEffect(() => {
    fetchBooks();
  }, []);

  async function fetchBooks() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('clinical_library')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBooks(data || []);
    } catch (error) {
      console.error('Error fetching books:', error.message);
    } finally {
      setLoading(false);
    }
  }

  // 🔍 FILTER LOGIC
  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col items-center justify-center min-h-[250px] animate-pulse">
        <Loader2 className="animate-spin text-blue-600 mb-2" size={28} />
        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Clinical Cloud...</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div className="flex items-center gap-3 text-[#003366]">
          <div className="p-2 bg-blue-50 rounded-xl">
            <BookOpen size={20} className="text-[#003366]" />
          </div>
          <div>
            <h2 className="font-black text-sm uppercase tracking-tight leading-none">Clinical Library</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{books.length} Resources Available</p>
          </div>
        </div>

        {/* 🔍 SEARCH BAR */}
        <div className="relative group flex-1 max-w-xs">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-600 transition-colors" size={14} />
          <input 
            type="text"
            placeholder="Search textbooks, surgery..."
            className="w-full pl-10 pr-4 py-3 bg-slate-50 rounded-2xl border-none text-[11px] font-bold focus:ring-2 ring-blue-500/20 transition-all outline-none"
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredBooks.length > 0 ? (
          filteredBooks.map((book) => (
            <div key={book.id} className="group bg-slate-50 p-5 rounded-[2rem] flex justify-between items-center hover:bg-white hover:shadow-xl hover:shadow-blue-900/5 transition-all border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm text-blue-600 group-hover:scale-110 transition-transform">
                  <BookOpen size={18} />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-xs uppercase tracking-tight">{book.title}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-blue-600/60 uppercase">{book.category || 'Medicine'}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{book.size || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <a 
                href={book.file_url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white p-3 rounded-xl text-slate-300 hover:text-blue-600 hover:shadow-md transition-all"
              >
                <Download size={18} />
              </a>
            </div>
          ))
        ) : (
          <div className="col-span-2 py-12 text-center">
            <p className="text-[10px] font-black text-slate-300 uppercase italic tracking-widest">
              {searchTerm ? "No matches found for your search" : "The digital library is currently empty"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LibrarySection;