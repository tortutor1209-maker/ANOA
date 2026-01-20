
import React, { useState, useRef } from 'react';
import { generateAffiliateContent, generateImage } from '../services/geminiService';

export const AffiliateModule: React.FC = () => {
  const [step, setStep] = useState(1);
  const [productName, setProductName] = useState('');
  const [promptStyle, setPromptStyle] = useState('problem/solution');
  const [numScenes, setNumScenes] = useState(2);
  const [customInstructions, setCustomInstructions] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [data, setData] = useState<any>(null);
  const [images, setImages] = useState<Record<string, string>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const productInputRef = useRef<HTMLInputElement>(null);
  const modelInputRef = useRef<HTMLInputElement>(null);
  const [productPreview, setProductPreview] = useState<string | null>(null);
  const [modelPreview, setModelPreview] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'product' | 'model') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'product') setProductPreview(result);
        else setModelPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStart = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setLoadingStatus('⚡ ANALYZING BRAND IDENTITY...');
    
    try {
      const result = await generateAffiliateContent(
        productName, 
        customInstructions, 
        productPreview || undefined, 
        modelPreview || undefined,
        promptStyle,
        numScenes
      );
      setData(result);
      setStep(2);

      if (result.assets && result.assets.length > 0) {
        for (let i = 0; i < result.assets.length; i++) {
          const asset = result.assets[i];
          setLoadingStatus(`🔒 GENERATING SCENE ${i + 1}/${result.assets.length}...`);
          try {
            const url = await generateImage(asset.imagePrompt, "9:16", productPreview || undefined);
            setImages(prev => ({ ...prev, [asset.label]: url }));
          } catch (err) {
            console.error(`Failed generating image ${i}`, err);
          }
        }
      }
    } catch (err) {
      alert("Gagal memproses data. Silahkan periksa koneksi atau file anda.");
    } finally {
      setLoading(false);
      setLoadingStatus('');
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const downloadAsset = (url: string, label: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `ANOALABS_UGC_${productName.replace(/\s+/g, '_')}_${label.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-700">
      <div className="text-center space-y-2">
        <h2 className="text-5xl font-bebas tracking-widest text-black uppercase">
          ANOALABS <span className="colorful-text">UGC TOOL</span>
        </h2>
        <p className="text-black/50 text-[10px] font-black uppercase tracking-[0.4em]">
          ⚡ AFILIASI • VEO 3 / FLOW OPTIMIZED • DUAL IDENTITY LOCK
        </p>
      </div>

      {step === 1 ? (
        <form onSubmit={handleStart} className="space-y-10">
          <div className="glass-effect p-8 rounded-[2.5rem] colorful-border bg-white shadow-xl space-y-8">
            <h3 className="font-bebas text-2xl tracking-widest text-black border-b border-black/5 pb-2 uppercase">1. Unggah & Pengaturan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/60 block ml-2">Gambar Produk</label>
                <div onClick={() => productInputRef.current?.click()} className="group cursor-pointer border-2 border-dashed border-black/10 rounded-2xl aspect-video flex flex-col items-center justify-center bg-black/[0.01] hover:bg-black/[0.03] transition-all relative overflow-hidden">
                  <input type="file" ref={productInputRef} hidden onChange={(e) => handleFileUpload(e, 'product')} accept="image/*" />
                  {productPreview ? <img src={productPreview} className="w-full h-full object-cover animate-in zoom-in" /> : <div className="text-center"><i className="fa-solid fa-box-open text-2xl text-black/20 mb-2"></i><p className="text-[9px] font-black text-black/40 uppercase">Unggah Produk</p></div>}
                </div>
              </div>
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-black/60 block ml-2">Gambar Model (Optional)</label>
                <div onClick={() => modelInputRef.current?.click()} className="group cursor-pointer border-2 border-dashed border-black/10 rounded-2xl aspect-video flex flex-col items-center justify-center bg-black/[0.01] hover:bg-black/[0.03] transition-all relative overflow-hidden">
                  <input type="file" ref={modelInputRef} hidden onChange={(e) => handleFileUpload(e, 'model')} accept="image/*" />
                  {modelPreview ? <img src={modelPreview} className="w-full h-full object-cover animate-in zoom-in" /> : <div className="text-center"><i className="fa-solid fa-user-circle text-2xl text-black/20 mb-2"></i><p className="text-[9px] font-black text-black/40 uppercase">Unggah Model</p></div>}
                </div>
              </div>
            </div>
          </div>
          <div className="glass-effect p-8 rounded-[2.5rem] colorful-border bg-white shadow-xl space-y-8">
            <h3 className="font-bebas text-2xl tracking-widest text-black border-b border-black/5 pb-2 uppercase">2. Konfigurasi Prompt</h3>
            <div className="space-y-6">
              <input type="text" placeholder="Nama Produk" className="w-full bg-neutral-900 border border-black/5 rounded-2xl px-6 py-4 text-white placeholder:text-white/20 focus:outline-none" value={productName} onChange={(e) => setProductName(e.target.value)} required />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <select value={promptStyle} onChange={(e) => setPromptStyle(e.target.value)} className="w-full bg-neutral-900 border border-black/5 rounded-2xl px-6 py-4 text-white focus:outline-none">
                  <option value="problem/solution">problem/solution</option>
                  <option value="Fashion / Lifestyle">Fashion / Lifestyle</option>
                  <option value="Vlog Ulasan Natural">Vlog Ulasan Natural</option>
                  <option value="Unboxing Produk">Unboxing Produk</option>
                </select>
                <select value={numScenes} onChange={(e) => setNumScenes(parseInt(e.target.value))} className="w-full bg-neutral-900 border border-black/5 rounded-2xl px-6 py-4 text-white focus:outline-none">
                  <option value={2}>2 Adegan</option>
                  <option value={4}>4 Adegan</option>
                </select>
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading || !productName || !productPreview} className="w-full py-6 bg-black text-white rounded-3xl font-black text-sm uppercase tracking-[0.4em] shadow-2xl transition-all active:scale-95 flex items-center justify-center gap-3">
            {loading ? <i className="fa-solid fa-spinner animate-spin"></i> : <i className="fa-solid fa-wand-magic-sparkles"></i>}
            {loading ? 'GENERATING...' : 'HASILKAN GAMBAR PRODUK SAYA'}
          </button>
        </form>
      ) : (
        <div className="space-y-12 pb-20 animate-in fade-in duration-1000">
           {/* Step 2 Content matches structure provided in your previous files but with rebrand */}
           <div className="glass-effect p-8 rounded-[2.5rem] bg-white border border-black/5 space-y-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="font-bebas text-3xl text-black uppercase tracking-widest">📋 {promptStyle} Strategy</h3>
              <span className="px-4 py-1 bg-black text-white rounded-full text-[10px] font-black uppercase">{numScenes} Scenes</span>
            </div>
            <p className="text-sm font-semibold italic leading-relaxed text-black/70 bg-black/5 p-6 rounded-2xl border border-black/5">
              {data.summary}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
             {data.assets.map((asset: any, idx: number) => (
                <div key={idx} className="space-y-6 animate-in zoom-in" style={{ animationDelay: `${idx * 150}ms` }}>
                  <div className="aspect-[9/16] bg-neutral-100 rounded-[3rem] overflow-hidden border-4 border-black/5 shadow-2xl relative group max-w-[350px] mx-auto">
                    {images[asset.label] ? <img src={images[asset.label]} className="w-full h-full object-cover transition-transform group-hover:scale-105" /> : <div className="w-full h-full flex items-center justify-center opacity-20"><i className="fa-solid fa-fingerprint animate-pulse text-4xl text-black"></i></div>}
                    {images[asset.label] && (
                      <div className="absolute top-6 right-6 flex flex-col gap-3 scale-0 group-hover:scale-100 transition-transform">
                         <button onClick={() => downloadAsset(images[asset.label], asset.label)} className="w-12 h-12 bg-white/95 rounded-2xl text-black flex items-center justify-center shadow-lg hover:bg-black hover:text-white transition-all"><i className="fa-solid fa-download"></i></button>
                      </div>
                    )}
                  </div>
                  <div className="glass-effect p-6 rounded-[2rem] bg-white border border-black/10 space-y-4 shadow-lg max-w-[350px] mx-auto">
                     <button onClick={() => copyToClipboard(asset.videoPrompt, `v-${idx}`)} className="w-full py-2 bg-black text-white rounded-full text-[10px] font-black uppercase">{copied === `v-${idx}` ? 'COPIED' : 'SALIN VIDEO PROMPT'}</button>
                     <p className="text-[10px] font-bold text-black/60 italic">{asset.videoPrompt}</p>
                  </div>
                </div>
             ))}
          </div>
          <button onClick={() => { setStep(1); setData(null); setImages({}); }} className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase mx-auto flex gap-2">Buat Ulang</button>
        </div>
      )}
    </div>
  );
};
