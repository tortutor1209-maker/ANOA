
import React, { useState } from 'react';
import { StoryResult, StructuredPrompt } from '../types';
import { GoogleGenAI, Modality } from "@google/genai";
import { generateImage } from '../services/geminiService';

interface StoryDisplayProps {
  data: StoryResult;
}

const AnoaLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 80C20 80 25 30 50 20C75 30 80 80 80 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    <path d="M35 50C35 50 42 45 50 45C58 45 65 50 65 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="40" cy="35" r="3" fill="currentColor"/>
    <circle cx="60" cy="35" r="3" fill="currentColor"/>
  </svg>
);

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

function pcmToWav(pcmData: Uint8Array, sampleRate: number) {
  const buffer = new ArrayBuffer(44 + pcmData.length);
  const view = new DataView(buffer);
  view.setUint32(0, 0x52494646, false);
  view.setUint32(4, 36 + pcmData.length, true);
  view.setUint32(8, 0x57415645, false);
  view.setUint32(12, 0x666d7420, false);
  view.setUint16(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true); view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  view.setUint32(36, 0x64617461, false); view.setUint32(40, pcmData.length, true);
  const pcmArray = new Uint8Array(pcmData.buffer);
  for (let i = 0; i < pcmArray.length; i++) view.setUint8(44 + i, pcmArray[i]);
  return new Blob([buffer], { type: 'audio/wav' });
}

export const StoryDisplay: React.FC<StoryDisplayProps> = ({ data }) => {
  const [copied, setCopied] = useState<string | null>(null);
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [sceneAudioUrls, setSceneAudioUrls] = useState<Record<number, string>>({});
  const [isGeneratingAsset, setIsGeneratingAsset] = useState<string | null>(null);
  const [visualizedAssets, setVisualizedAssets] = useState<Record<string, { url: string, ratio: string }>>({});

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleVisualize = async (prompt: string, id: string, ratio: "1:1" | "9:16" | "16:9") => {
    setIsGeneratingAsset(id);
    try {
      const url = await generateImage(prompt, ratio);
      setVisualizedAssets(prev => ({ ...prev, [id]: { url, ratio } }));
    } catch (err) {
      alert("Gagal memvisualisasikan aset.");
    } finally {
      setIsGeneratingAsset(null);
    }
  };

  const downloadAsset = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePlayVoice = async (text: string, sceneNum: number) => {
    if (playingScene !== null) return;
    if (sceneAudioUrls[sceneNum]) {
      const audio = new Audio(sceneAudioUrls[sceneNum]);
      setPlayingScene(sceneNum);
      audio.onended = () => setPlayingScene(null);
      audio.play();
      return;
    }
    setPlayingScene(sceneNum);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        const url = URL.createObjectURL(pcmToWav(decodeBase64(base64Audio), 24000));
        setSceneAudioUrls(prev => ({ ...prev, [sceneNum]: url }));
        const audio = new Audio(url);
        audio.onended = () => setPlayingScene(null);
        audio.play();
      } else {
        setPlayingScene(null);
      }
    } catch (err) {
      setPlayingScene(null);
    }
  };

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="glass-effect p-10 rounded-[2.5rem] colorful-border shadow-2xl bg-white/90">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center text-white shadow-xl flex-shrink-0">
             <AnoaLogo className="w-16 h-16" />
          </div>
          <div className="text-center md:text-left">
            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em] mb-2 block">Analisis Fakta ANOALABS Berhasil</span>
            <h2 className="text-5xl font-bebas tracking-wide text-black leading-tight uppercase">{data.title}</h2>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-4">
              <span className="px-4 py-1.5 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest">{data.numScenes} Scenes Verified</span>
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-200">{data.visualStyle} Style</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-10">
        {data.scenes.map((scene, idx) => {
          const isVerification = scene.tone === "SOURCE_VERIFICATION";
          const assetId = `scene-${idx}`;
          const visualized = visualizedAssets[assetId];
          const isGenerating = isGeneratingAsset === assetId;

          return (
            <div key={idx} className={`glass-effect overflow-hidden rounded-[2.5rem] colorful-border group transition-all shadow-xl bg-white/60 ${isVerification ? 'ring-2 ring-blue-500/20' : ''}`}>
              <div className={`px-10 py-6 border-b border-black/5 flex items-center justify-between ${isVerification ? 'bg-blue-50' : 'bg-neutral-50'}`}>
                <div className="flex items-center gap-6">
                   <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bebas text-3xl shadow-lg ${isVerification ? 'bg-blue-600' : 'bg-black'}`}>
                     {isVerification ? <i className="fa-solid fa-shield-check text-xl"></i> : scene.number}
                   </div>
                   <div>
                      <span className="font-bebas text-3xl tracking-widest text-black block leading-none uppercase">
                        {isVerification ? "SOURCE VERIFICATION" : `SEQUENCE ${scene.number}`}
                      </span>
                      <span className="text-[10px] text-black/40 font-black uppercase tracking-widest">{scene.tone}</span>
                   </div>
                </div>
                <button 
                  onClick={() => handlePlayVoice(scene.narration, scene.number)}
                  disabled={playingScene !== null}
                  className={`px-6 py-3 rounded-2xl font-black text-[10px] tracking-widest transition-all shadow-md active:scale-95 ${playingScene === scene.number ? 'bg-neutral-200 animate-pulse text-black' : 'bg-black text-white hover:bg-neutral-800'}`}
                >
                  {playingScene === scene.number ? 'PLAYING...' : 'PLAY VOICEOVER'}
                </button>
              </div>
              
              <div className="p-10 space-y-8">
                <div className="relative">
                  <div className={`absolute -left-6 top-0 bottom-0 w-1.5 rounded-full ${isVerification ? 'bg-blue-600' : 'bg-black/10'}`}></div>
                  <p className={`text-2xl font-bold leading-relaxed italic p-8 rounded-3xl border ${isVerification ? 'bg-blue-500/5 text-blue-900 border-blue-500/10' : 'bg-black/5 text-black border-black/5'}`}>
                    "{scene.narration}"
                  </p>
                </div>

                {!isVerification && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white/40 p-6 rounded-3xl border border-black/5 space-y-4">
                       <div className="flex items-center justify-between">
                         <span className="text-[10px] font-black uppercase tracking-widest text-black/40">Visual Prompt v4</span>
                         <button onClick={() => copyToClipboard(scene.structuredPrompt1.subject, `p-${idx}`)} className="text-[9px] font-black hover:text-blue-600 transition-colors">COPY PROMPT</button>
                       </div>
                       <div className="grid grid-cols-2 gap-3">
                         {Object.entries(scene.structuredPrompt1).map(([k, v]) => (
                           <div key={k} className="bg-white p-3 rounded-xl border border-black/5">
                             <span className="text-[8px] font-black text-black/30 uppercase block mb-1">{k.replace('_', ' ')}</span>
                             <p className="text-[10px] font-bold text-black leading-tight line-clamp-2">{v}</p>
                           </div>
                         ))}
                       </div>
                    </div>
                    <div className={`relative ${visualized?.ratio === '9:16' ? 'aspect-[9/16] max-h-[500px]' : 'aspect-video'} bg-neutral-100 rounded-3xl border-2 border-dashed border-black/10 flex flex-col items-center justify-center group overflow-hidden shadow-inner mx-auto w-full`}>
                       {visualized ? (
                         <>
                           <img src={visualized.url} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                           <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 z-30">
                              <div className="flex flex-col gap-2">
                                <button 
                                  onClick={() => handleVisualize(scene.structuredPrompt1.subject, assetId, "16:9")}
                                  disabled={isGenerating}
                                  className="px-4 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
                                >
                                  <i className="fa-solid fa-arrows-rotate"></i> Refresh 16:9
                                </button>
                                <button 
                                  onClick={() => handleVisualize(scene.structuredPrompt1.subject, assetId, "9:16")}
                                  disabled={isGenerating}
                                  className="px-4 py-2 bg-white text-black rounded-xl text-[9px] font-black uppercase shadow-xl hover:scale-110 active:scale-95 transition-all flex items-center gap-2"
                                >
                                  <i className="fa-solid fa-arrows-rotate"></i> Refresh 9:16
                                </button>
                              </div>
                              <button 
                                onClick={() => downloadAsset(visualized.url, `AnoaLabs_Scene_${scene.number}`)}
                                className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition-all"
                                title="Download Image"
                              >
                                <i className="fa-solid fa-download text-xl"></i>
                              </button>
                           </div>
                         </>
                       ) : (
                         <div className="text-center space-y-4">
                           <i className="fa-solid fa-wand-magic-sparkles text-4xl text-black/10 group-hover:text-black/30 transition-all"></i>
                           <div className="flex gap-3">
                             <button 
                               onClick={() => handleVisualize(scene.structuredPrompt1.subject, assetId, "16:9")}
                               disabled={isGenerating}
                               className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                             >
                               VISUALIZE 16:9
                             </button>
                             <button 
                               onClick={() => handleVisualize(scene.structuredPrompt1.subject, assetId, "9:16")}
                               disabled={isGenerating}
                               className="px-6 py-3 bg-white border border-black text-black rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-105 active:scale-95 transition-all"
                             >
                               VISUALIZE 9:16
                             </button>
                           </div>
                         </div>
                       )}
                       {isGenerating && (
                         <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-40">
                           <i className="fa-solid fa-spinner animate-spin text-3xl mb-3"></i>
                           <span className="text-[11px] font-black uppercase tracking-[0.2em]">ANOALABS Generating...</span>
                         </div>
                       )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="space-y-8 pt-10 border-t border-black/10">
        <h3 className="font-bebas text-5xl text-black uppercase flex items-center gap-6">
          <AnoaLogo className="w-12 h-12" /> ANOALABS PRODUCTION ASSETS
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="glass-effect p-10 rounded-[3rem] colorful-border bg-white/80 space-y-6 flex flex-col">
             <div className="flex items-center justify-between mb-2">
               <span className="text-black font-black text-xs uppercase tracking-widest flex items-center gap-3">
                 <i className="fa-brands fa-tiktok text-2xl"></i> TIKTOK COVER (9:16)
               </span>
               <div className="flex gap-2">
                 <button onClick={() => handleVisualize(data.tiktokCover, 'tk-cov', '9:16')} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95">
                   <i className={`fa-solid ${isGeneratingAsset === 'tk-cov' ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'}`}></i>
                 </button>
                 <button onClick={() => copyToClipboard(data.tiktokCover, 'tk-txt')} className="w-10 h-10 bg-white border border-black/10 text-black rounded-xl flex items-center justify-center shadow-md">
                   <i className={`fa-solid ${copied === 'tk-txt' ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                 </button>
               </div>
             </div>
             <p className="text-xs font-bold italic bg-white p-6 rounded-2xl border border-black/5 leading-relaxed text-black/70">"{data.tiktokCover}"</p>
             <div className="mt-auto pt-6 flex justify-center relative group">
               <div className="aspect-[9/16] w-full max-w-[200px] bg-neutral-100 rounded-3xl border-2 border-dashed border-black/10 flex items-center justify-center overflow-hidden">
                 {visualizedAssets['tk-cov'] ? (
                   <>
                    <img src={visualizedAssets['tk-cov'].url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => downloadAsset(visualizedAssets['tk-cov'].url, 'AnoaLabs_TikTok_Cover')}
                          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"
                        >
                          <i className="fa-solid fa-download"></i>
                        </button>
                    </div>
                   </>
                 ) : (
                   <i className="fa-solid fa-mobile-screen-button text-4xl text-black/10"></i>
                 )}
               </div>
             </div>
          </div>

          <div className="glass-effect p-10 rounded-[3rem] colorful-border bg-white/80 space-y-6 flex flex-col">
             <div className="flex items-center justify-between mb-2">
               <span className="text-black font-black text-xs uppercase tracking-widest flex items-center gap-3">
                 <i className="fa-brands fa-youtube text-2xl"></i> YOUTUBE THUMB (16:9)
               </span>
               <div className="flex gap-2">
                 <button onClick={() => handleVisualize(data.youtubeCover, 'yt-cov', '16:9')} className="w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95">
                   <i className={`fa-solid ${isGeneratingAsset === 'yt-cov' ? 'fa-spinner animate-spin' : 'fa-wand-magic-sparkles'}`}></i>
                 </button>
                 <button onClick={() => copyToClipboard(data.youtubeCover, 'yt-txt')} className="w-10 h-10 bg-white border border-black/10 text-black rounded-xl flex items-center justify-center shadow-md">
                   <i className={`fa-solid ${copied === 'yt-txt' ? 'fa-check text-green-500' : 'fa-copy'}`}></i>
                 </button>
               </div>
             </div>
             <p className="text-xs font-bold italic bg-white p-6 rounded-2xl border border-black/5 leading-relaxed text-black/70">"{data.youtubeCover}"</p>
             <div className="mt-auto pt-6 flex justify-center relative group">
               <div className="aspect-video w-full bg-neutral-100 rounded-3xl border-2 border-dashed border-black/10 flex items-center justify-center overflow-hidden">
                 {visualizedAssets['yt-cov'] ? (
                   <>
                    <img src={visualizedAssets['yt-cov'].url} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button 
                          onClick={() => downloadAsset(visualizedAssets['yt-cov'].url, 'AnoaLabs_YouTube_Thumb')}
                          className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black shadow-xl"
                        >
                          <i className="fa-solid fa-download"></i>
                        </button>
                    </div>
                   </>
                 ) : (
                   <i className="fa-solid fa-desktop text-4xl text-black/10"></i>
                 )}
               </div>
             </div>
          </div>
        </div>

        <div className="glass-effect p-10 rounded-[3rem] border border-black/10 bg-white/80 flex flex-col md:flex-row items-center gap-8 shadow-xl">
           <div className="flex-1 space-y-4">
              <span className="block text-[10px] font-black text-black/30 uppercase tracking-[0.5em]">Viral Optimization</span>
              <div className="flex flex-wrap gap-3">
                {data.hashtags.map(tag => (
                  <span key={tag} className="px-5 py-2.5 bg-white border border-black/10 rounded-2xl text-xs text-black font-black uppercase hover:bg-black hover:text-white transition-all cursor-pointer shadow-sm">
                    {tag}
                  </span>
                ))}
              </div>
           </div>
           <button onClick={() => copyToClipboard(data.hashtags.join(' '), 'all-tag')} className="px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
             {copied === 'all-tag' ? 'COPIED TAGS' : 'COPY ALL TAGS'}
           </button>
        </div>
      </div>
    </div>
  );
};
