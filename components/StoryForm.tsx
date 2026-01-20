
import React, { useState } from 'react';
import { VisualStyle, Language, StoryRequest } from '../types';
import { VISUAL_STYLES, LANGUAGES } from '../constants';

interface StoryFormProps {
  onSubmit: (data: StoryRequest) => void;
  isLoading: boolean;
}

export const StoryForm: React.FC<StoryFormProps> = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<StoryRequest>({
    title: '',
    numScenes: 5,
    visualStyle: VisualStyle.SoftClayPixar3D,
    language: Language.Indonesian
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title.trim()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="glass-effect p-8 rounded-[2.5rem] space-y-6 colorful-border shadow-2xl">
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1 flex items-center gap-2">
          <i className="fa-solid fa-magnifying-glass-chart text-blue-600"></i> TOPIK FAKTA / BERITA
        </label>
        <input
          type="text"
          placeholder="Contoh: Mengapa Langit Berwarna Biru?"
          className="w-full bg-neutral-900 border border-black/5 rounded-xl px-4 py-4 focus:outline-none focus:border-black/10 transition-all text-white placeholder:text-white/20 shadow-inner font-medium"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">JUMLAH SCENE (MAX 200)</label>
          <input
            type="number"
            min="1"
            max="200"
            className="w-full bg-neutral-900 border border-black/5 rounded-xl px-4 py-4 focus:outline-none focus:border-black/10 transition-all text-white shadow-inner font-medium"
            value={formData.numScenes}
            onChange={(e) => setFormData({ ...formData, numScenes: Math.min(200, Math.max(1, parseInt(e.target.value) || 1)) })}
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">BAHASA NARASI</label>
          <select
            className="w-full bg-neutral-900 border border-black/5 rounded-xl px-4 py-4 focus:outline-none focus:border-black/10 transition-all text-white appearance-none shadow-inner font-medium"
            value={formData.language}
            onChange={(e) => setFormData({ ...formData, language: e.target.value as Language })}
          >
            {LANGUAGES.map(lang => (
              <option key={lang} value={lang} className="bg-neutral-900 text-white">{lang}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-black ml-1">GAYA VISUAL SINEMATIK</label>
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2">
          {VISUAL_STYLES.map(style => (
            <button
              key={style}
              type="button"
              onClick={() => setFormData({ ...formData, visualStyle: style })}
              className={`text-center px-2 py-3 rounded-xl border text-[9px] font-black transition-all shadow-sm flex flex-col items-center justify-center gap-1 ${
                formData.visualStyle === style 
                ? 'bg-black border-black/20 text-white scale-105 z-10' 
                : 'bg-white border-black/5 text-black/30 hover:border-black/10 hover:text-black/60'
              }`}
            >
              {style.split('(')[0]}
            </button>
          ))}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || !formData.title}
        className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.3em] transition-all transform active:scale-95 border border-black/10 flex items-center justify-center gap-3 ${
          isLoading ? 'bg-neutral-800 cursor-not-allowed text-white/40' : 'bg-black text-white hover:bg-neutral-900 shadow-2xl'
        }`}
      >
        {isLoading ? (
          <>
            <i className="fa-solid fa-shield-halved animate-pulse"></i> ANALYZING TRUTH...
          </>
        ) : (
          <>
            <i className="fa-solid fa-bolt-lightning"></i> GENERATE STORY v4
          </>
        )}
      </button>
    </form>
  );
};
