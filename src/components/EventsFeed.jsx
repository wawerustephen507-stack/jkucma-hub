import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Bell, Calendar, MapPin, ExternalLink, Megaphone } from 'lucide-react';

const EventsFeed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeed = async () => {
      // 🏥 Fetch both tables simultaneously
      const [eventsRes, annRes] = await Promise.all([
        supabase.from('events').select('*'),
        supabase.from('announcements').select('*')
      ]);

      // Merge and add "type" property for distinct styling
      const combined = [
        ...(eventsRes.data || []).map(e => ({ ...e, type: 'event' })),
        ...(annRes.data || []).map(a => ({ ...a, type: 'announcement' }))
      ];

      // Sort by date (Created_at for announcements, Event Date for events)
      combined.sort((a, b) => {
        const dateA = new Date(a.created_at || a.date);
        const dateB = new Date(b.created_at || b.date);
        return dateB - dateA; // Newest first
      });

      setItems(combined.slice(0, 6)); // Show latest 6 items
      setLoading(false);
    };

    fetchFeed();
  }, []);

  if (loading) return (
    <div className="bg-white p-12 rounded-[2.5rem] border border-slate-100 text-center">
      <div className="w-8 h-8 border-4 border-slate-200 border-t-[#003366] rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Syncing Hub Feed...</p>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 animate-in fade-in duration-700">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-[#003366]">
          <div className="p-2 bg-blue-50 rounded-xl">
            <Bell size={18} className="text-[#003366]" />
          </div>
          <div>
            <h2 className="font-black text-xs uppercase tracking-tight">Hub Updates</h2>
            <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">JKUCMA Live Feed</p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        {items.length > 0 ? (
          items.map((item, idx) => {
            const isEvent = item.type === 'event';
            const displayDate = new Date(item.date || item.created_at);

            return (
              <div key={idx} className="group relative pl-8 border-l-2 border-slate-100 hover:border-[#1a5d1a] transition-all duration-300">
                {/* Timeline Node Icon */}
                <div className={`absolute -left-[13px] top-0 w-6 h-6 rounded-lg flex items-center justify-center shadow-sm border-2 border-white transition-transform group-hover:scale-110 ${
                  isEvent ? 'bg-orange-500 text-white' : 'bg-[#003366] text-white'
                }`}>
                  {isEvent ? <Calendar size={12} /> : <Megaphone size={12} />}
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-4">
                    <h3 className="font-black text-slate-800 text-sm uppercase tracking-tight leading-tight group-hover:text-[#1a5d1a] transition-colors">
                      {item.title}
                    </h3>
                    <span className="shrink-0 text-[9px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg uppercase">
                      {displayDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>

                  {/* Announcement Content or Event Location */}
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    {isEvent ? (
                      <span className="flex items-center gap-1 uppercase text-[10px] tracking-tight">
                        <MapPin size={12} className="text-orange-500" /> {item.location || 'Venue TBD'}
                      </span>
                    ) : (
                      item.content
                    )}
                  </p>

                  {/* Dynamic Action Button */}
                  {item.file_url && (
                    <a 
                      href={item.file_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={`mt-2 inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-widest w-fit px-4 py-2 rounded-xl transition-all ${
                        isEvent 
                        ? 'bg-orange-50 text-orange-600 hover:bg-orange-100' 
                        : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                      }`}
                    >
                      {isEvent ? 'Register Now' : 'View Document'} <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-10">
            <p className="text-[10px] font-bold text-slate-300 uppercase italic tracking-widest">The feed is currently quiet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventsFeed;