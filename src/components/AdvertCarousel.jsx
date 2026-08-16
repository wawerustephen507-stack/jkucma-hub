import React, { useState, useEffect } from 'react';
import { ExternalLink, Sparkles, ZoomIn, ZoomOut } from 'lucide-react';

const AdvertCarousel = ({ adverts = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);

  const safeAdverts = Array.isArray(adverts) ? adverts : [];

  useEffect(() => {
    if (safeAdverts.length <= 1 || isPaused || isZoomed) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % safeAdverts.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [safeAdverts.length, isPaused, isZoomed]);

  if (safeAdverts.length === 0) return null;

  const defaultGradients = [
    'linear-gradient(135deg, #064e3b 0%, #1a5d1a 100%)',
    'linear-gradient(135deg, #002244 0%, #003366 100%)',
    'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
  ];

  return (
    <div 
      className="my-3 sm:my-4 relative w-full select-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* ZOOMABLE CONTAINER */}
      <div 
        className={`overflow-hidden rounded-[1.5rem] sm:rounded-[2rem] shadow-lg border border-slate-100/50 transition-transform duration-300 ${
          isZoomed ? 'scale-[1.03] shadow-2xl z-20' : 'scale-100'
        }`}
      >
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {safeAdverts.map((ad, idx) => (
            <div 
              key={ad.id || idx} 
              className="w-full shrink-0 min-w-full h-[125px] sm:h-[155px] lg:h-[175px] rounded-[1.5rem] sm:rounded-[2rem] relative flex items-center justify-between px-4 py-3 sm:px-6 sm:py-5 lg:px-8 text-white box-border"
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
                    className="w-full h-full object-cover rounded-[1.5rem] sm:rounded-[2rem]" 
                  />
                </a>
              ) : (
                /* COMPACT PROPORTIONATE CARD */
                <>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 max-w-[75%] sm:max-w-[70%] space-y-1">
                    <div className="inline-flex items-center gap-1 bg-white/20 backdrop-blur-md px-2 sm:px-2.5 py-0.5 rounded-full text-white shadow-sm border border-white/20">
                      <Sparkles size={10} className="text-yellow-300 animate-pulse" />
                      <span className="text-[7px] sm:text-[9px] font-black uppercase tracking-[0.2em]">
                        {ad.tag || 'SPONSORED'}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-base lg:text-lg font-black uppercase tracking-tight leading-tight text-white line-clamp-1">
                      {ad.title}
                    </h3>

                    <p className="text-[9px] sm:text-xs font-medium text-white/90 leading-snug line-clamp-2">
                      {ad.subtitle}
                    </p>
                  </div>

                  {/* ACTION CONTROLS */}
                  <div className="relative z-10 flex items-center gap-1.5 shrink-0 ml-2">
                    <button
                      type="button"
                      onClick={() => setIsZoomed(!isZoomed)}
                      className="p-2 sm:p-2.5 bg-white/15 hover:bg-white/25 active:scale-90 text-white rounded-xl backdrop-blur-sm transition-all"
                      title={isZoomed ? "Zoom Out" : "Zoom In"}
                    >
                      {isZoomed ? <ZoomOut size={14} /> : <ZoomIn size={14} />}
                    </button>

                    {ad.action_url && (
                      <a 
                        href={ad.action_url}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 sm:px-4 sm:py-2.5 bg-white text-slate-900 rounded-xl shadow-md active:scale-90 hover:bg-slate-50 transition-all flex items-center gap-1 font-black text-[9px] sm:text-xs uppercase tracking-wider"
                      >
                        <span>Open</span>
                        <ExternalLink size={12} className="text-[#1a5d1a]" />
                      </a>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* PAGINATION DOTS */}
      {safeAdverts.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-2">
          {safeAdverts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === idx 
                  ? 'w-6 bg-[#003366]' 
                  : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertCarousel;