import React, { useState, useEffect } from 'react';
import { ExternalLink } from 'lucide-react';

const AdvertCarousel = ({ adverts = [] }) => {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!adverts || adverts.length <= 1 || isPaused) return;
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % adverts.length);
    }, 4500);

    return () => clearInterval(timer);
  }, [adverts, isPaused]);

  if (!adverts || adverts.length === 0) return null;

  return (
    <div 
      className="mx-5 my-4 relative"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      <div className="overflow-hidden rounded-[2.2rem] shadow-xl">
        <div 
          className="flex transition-transform duration-700 ease-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {adverts.map((ad, idx) => (
            <div 
              key={ad.id || idx} 
              className={`w-full shrink-0 min-h-[140px] rounded-[2.2rem] overflow-hidden relative flex items-center ${
                !ad.image_url ? `p-6 bg-gradient-to-r ${ad.bg_gradient || 'from-emerald-900 to-[#1a5d1a]'} text-white` : ''
              }`}
            >
              {ad.image_url ? (
                <a 
                  href={ad.action_url || "#"} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="w-full h-full block"
                >
                  <img 
                    src={ad.image_url} 
                    alt={ad.title || "Advertisement"} 
                    className="w-full h-[140px] object-cover rounded-[2.2rem]" 
                  />
                </a>
              ) : (
                <>
                  <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />

                  <div className="relative z-10 max-w-[75%]">
                    <span className="text-[8px] font-black uppercase tracking-[0.25em] bg-white/20 px-2.5 py-1 rounded-full text-white/90">
                      {ad.tag || 'SPONSORED'}
                    </span>
                    <h3 className="text-sm font-black uppercase tracking-tight mt-2 leading-tight">
                      {ad.title}
                    </h3>
                    <p className="text-[10px] font-medium text-white/80 mt-1 leading-snug line-clamp-2">
                      {ad.subtitle}
                    </p>
                  </div>

                  {ad.action_url && (
                    <a 
                      href={ad.action_url}
                      target="_blank"
                      rel="noreferrer"
                      className="relative z-10 p-3 bg-white text-slate-900 rounded-2xl shadow-lg active:scale-90 transition-transform ml-auto"
                    >
                      <ExternalLink size={16} />
                    </a>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {adverts.length > 1 && (
        <div className="flex justify-center items-center gap-1.5 mt-2.5">
          {adverts.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                current === idx ? 'w-5 bg-[#003366]' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvertCarousel;