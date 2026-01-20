
import React from 'react';

interface DashboardProps {
  onSelectStory: () => void;
  onSelectAffiliate: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectStory, onSelectAffiliate }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-16 py-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
      <div className="text-center space-y-6">
        <h2 className="text-6xl md:text-8xl font-bebas tracking-tighter text-black">
          ANOALABS <span className="colorful-text">COMMAND CENTER</span>
        </h2>
        <p className="text-black/60 font-black text-sm uppercase tracking-[0.5em] max-w-lg mx-auto leading-relaxed">
          STORYTELLING EDUKATIF SINEMATIK & FACT ANALYZER v4
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        <button 
          onClick={onSelectStory}
          className="group relative overflow-hidden bg-white p-10 md:p-12 rounded-[3.5rem] colorful-border hover:scale-[1.02] transition-all text-left flex items-center justify-between shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-black rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-shield-check text-4xl md:text-5xl"></i>
            </div>
            <div>
              <h3 className="font-bebas text-4xl md:text-6xl text-black tracking-widest leading-none mb-3 uppercase">TOOLS FAKTA MENARIK</h3>
              <p className="text-black/40 text-xs md:text-base font-black uppercase tracking-widest">Fact-Checked Educational Cinematic Storytelling v4</p>
            </div>
          </div>
          <i className="fa-solid fa-arrow-right-long text-black/10 group-hover:text-black group-hover:translate-x-4 transition-all text-5xl hidden md:block"></i>
        </button>

        <button 
          onClick={onSelectAffiliate}
          className="group relative overflow-hidden bg-white p-10 md:p-12 rounded-[3.5rem] colorful-border hover:scale-[1.02] transition-all text-left flex items-center justify-between shadow-2xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="w-20 h-20 md:w-28 md:h-28 bg-black rounded-[2rem] flex items-center justify-center text-white shadow-2xl group-hover:scale-110 transition-transform">
              <i className="fa-solid fa-cart-shopping text-4xl md:text-5xl"></i>
            </div>
            <div>
              <h3 className="font-bebas text-4xl md:text-6xl text-black tracking-widest leading-none mb-3 uppercase">TOOLS AFILIATE PRODUK</h3>
              <p className="text-black/40 text-xs md:text-base font-black uppercase tracking-widest">Auto-Optimize Product Marketing Content Engine</p>
            </div>
          </div>
          <i className="fa-solid fa-arrow-right-long text-black/10 group-hover:text-black group-hover:translate-x-4 transition-all text-5xl hidden md:block"></i>
        </button>
      </div>

      <div className="flex justify-center pt-10">
         <div className="px-8 py-4 bg-white border border-black/10 rounded-[2rem] flex items-center gap-6 shadow-xl border-b-4 border-b-black/10">
            <div className="flex -space-x-3">
               {[1,2,3,4,5].map(i => <div key={i} className="w-10 h-10 rounded-full bg-neutral-100 border-2 border-white shadow-sm flex items-center justify-center text-[10px] font-black text-black/20 uppercase">P{i}</div>)}
            </div>
            <span className="text-[10px] font-black text-black/40 uppercase tracking-[0.3em]">Join 12,000+ AI Storytellers Worldwide</span>
         </div>
      </div>
    </div>
  );
};
