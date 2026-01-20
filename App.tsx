
import React, { useState, useEffect } from 'react';
import { StoryForm } from './components/StoryForm';
import { StoryDisplay } from './components/StoryDisplay';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { AffiliateModule } from './components/AffiliateModule';
import { APP_CONFIG } from './constants';
import { StoryRequest, StoryResult } from './types';
import { generateStoryContent } from './services/geminiService';

const AnoaLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M20 80C20 80 25 30 50 20C75 30 80 80 80 80" stroke="currentColor" strokeWidth="8" strokeLinecap="round"/>
    <path d="M35 50C35 50 42 45 50 45C58 45 65 50 65 50" stroke="currentColor" strokeWidth="6" strokeLinecap="round"/>
    <circle cx="40" cy="35" r="3" fill="currentColor"/>
    <circle cx="60" cy="35" r="3" fill="currentColor"/>
  </svg>
);

const App: React.FC = () => {
  const [view, setView] = useState<'auth' | 'dashboard' | 'story' | 'affiliate'>('auth');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<StoryResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('anoalabs_current_user');
    if (savedUser) {
      setIsLoggedIn(true);
      setView('dashboard');
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('anoalabs_current_user');
    setIsLoggedIn(false);
    setView('auth');
    setResult(null);
  };

  const handleGenerateStory = async (data: StoryRequest) => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const generatedData = await generateStoryContent(data);
      setResult(generatedData);
      setTimeout(() => {
        document.getElementById('story-result')?.scrollIntoView({ behavior: 'smooth' });
      }, 300);
    } catch (err: any) {
      setError('Gagal memverifikasi fakta. Pastikan topik Anda memiliki referensi berita tepercaya (detik/cnn/kompas).');
    } finally {
      setLoading(false);
    }
  };

  const resetToDashboard = () => {
    setResult(null);
    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen pb-32 selection:bg-black selection:text-white bg-[#fcfcf9]">
      <header className="sticky top-0 z-[60] glass-effect border-b border-black/5 px-8 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={isLoggedIn ? resetToDashboard : undefined}>
            <div className="w-12 h-12 bg-white border border-black/10 rounded-2xl flex items-center justify-center text-black shadow-lg transition-all group-hover:scale-110 active:scale-95">
              <AnoaLogo className="w-10 h-10" />
            </div>
            <div>
              <h1 className="font-bebas text-3xl tracking-widest colorful-text leading-none uppercase">{APP_CONFIG.NAME}</h1>
              <p className="text-[10px] font-black colorful-text uppercase tracking-[0.3em]">{APP_CONFIG.VERSION}</p>
            </div>
          </div>
          {isLoggedIn && (
            <button onClick={handleLogout} className="px-6 py-2.5 bg-black border border-black/10 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest hover:bg-neutral-800 shadow-xl">LOGOUT</button>
          )}
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-8 pt-16">
        {view === 'auth' && <AuthForm onLoginSuccess={() => { setIsLoggedIn(true); setView('dashboard'); }} />}
        {view === 'dashboard' && <Dashboard onSelectStory={() => setView('story')} onSelectAffiliate={() => setView('affiliate')} />}
        {view === 'story' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
            <button onClick={resetToDashboard} className="bg-black text-white px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest mx-auto flex items-center gap-3">
              <i className="fa-solid fa-arrow-left"></i> BACK TO DASHBOARD
            </button>
            <div className="text-center space-y-2">
              <h2 className="text-5xl md:text-7xl font-bebas tracking-tighter text-black uppercase">FACT <span className="colorful-text">ANALYZER ENGINE</span></h2>
              <p className="text-black/60 max-w-xl mx-auto text-sm font-bold uppercase tracking-wider">Verified educational cinematic storytelling with 200 scene capacity.</p>
            </div>
            <div className="max-w-3xl mx-auto">
              <StoryForm onSubmit={handleGenerateStory} isLoading={loading} />
              {error && <div className="mt-8 p-6 bg-red-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-widest flex items-center gap-4 shadow-2xl">{error}</div>}
            </div>
            {result && <div id="story-result" className="pt-12"><StoryDisplay data={result} /></div>}
          </div>
        )}
        {view === 'affiliate' && <div className="space-y-12 animate-in fade-in duration-700"><button onClick={resetToDashboard} className="bg-black text-white px-8 py-3 rounded-[2rem] text-[10px] font-black uppercase tracking-widest mx-auto flex gap-3"><i className="fa-solid fa-arrow-left"></i> BACK TO DASHBOARD</button><AffiliateModule /></div>}
      </main>
      <footer className="mt-32 py-16 border-t border-black/5 text-center">
        <p className="text-black/30 text-[10px] uppercase tracking-[0.5em] font-black">© {new Date().getFullYear()} {APP_CONFIG.NAME} • FACT-ANALYZER ULTIMATE ENGINE</p>
      </footer>
    </div>
  );
};

export default App;
