import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles } from 'lucide-react';

const AdvertCarousel = ({ adverts = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const safeAdverts = Array.isArray(adverts) ? adverts : [];

  useEffect(() => {
    if (safeAdverts.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % safeAdverts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [safeAdverts.length, isPaused]);

  if (safeAdverts.length === 0) return null;

  // Preset fallback gradients to avoid Tailwind runtime purging issues
  const defaultGradients = [
    'linear-gradient(135deg, #064e3b 0%, #1a5d1a 100%)',
    'linear-gradient(135deg, #002244 0%, #003366 100%)',
    'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
  ];

  return (
    <div 
      className="my-6 relative w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* MAIN CAROUSEL VIEWPORT */}
      <div className="overflow-hidden rounded-[2rem] lg:rounded-[2.5rem] shadow-2xl border border-white/20">
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {safeAdverts.map((ad, idx) => (
            <div 
              key={ad.id || idx} 
              className="w-full shrink-0 min-w-full min-h-[170px] lg:min-h-[200px] rounded-[2rem] lg:rounded-[2.5rem] relative flex items-center justify-between p-6 lg:p-10 text-white"
              style={{
                background: !ad.image_url ? (defaultGradients[idx % defaultGradients.length]) : '#0f172a'
              }}
            >
              {ad.image_url ? (
                /* FULL IMAGE BANNER */
                <a 
                  href={ad.action_url || "#"} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full h-full block"
                >
                  <img 
                    src={ad.image_url} 
                    alt={ad.title || "Advertisement"} 
                    className="w-full h-[180px] lg:h-[220px] object-cover rounded-[2rem]" 
                  />
                </a>
              ) : (
                /* BOLD PROMINENT CARD */
                <>
                  <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute left-1/3 top-0 w-36 h-36 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 max-w-[78%] lg:max-w-[70%] space-y-2">
                    <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-white shadow-sm border border-white/20">
                      <Sparkles size={12} className="text-yellow-300 animate-pulse" />
                      <span className="text-[10px] lg:text-xs font-black uppercase tracking-[0.25em]">
                        {ad.tag || 'FEATURED SPONSOR'}
                      </span>
                    </div>

                    <h3 className="text-lg lg:text-2xl font-black uppercase tracking-tight leading-tight text-white drop-shadow-sm">
                      {ad.title}
                    </h3>

                    <p className="text-xs lg:text-sm font-medium text-white/90 leading-relaxed max-w-2xl">
                      {ad.subtitle}
                    </p>
                  </div>

                  {ad.action_url && (
                    <a 
                      href={ad.action_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative z-10 shrink-0 px-5 py-3 lg:px-6 lg:py-3.5 bg-white text-slate-900 rounded-2xl shadow-xl hover:bg-slate-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-wider"
                    >
                      <span>Explore</span>
                      <ExternalLink size={16} className="text-[#1a5d1a]" />
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION DOTS */}
      {safeAdverts.length > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          {safeAdverts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-2 rounded-full transition-all duration-300 ${
                current === idx 
                  ? 'w-8 bg-[#003366]' 
                  : 'w-2 bg-slate-300 hover:bg-slate-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertCarousel;