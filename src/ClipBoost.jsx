import React, { useState } from 'react';

export default function ClipBoost() {
  const [activeTab, setActiveTab] = useState('video');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('storytelling');
  const [voice, setVoice] = useState('adam');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('System Idle');
  const [videoUrl, setVideoUrl] = useState(null);

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Please enter a description first!');
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setStatusText('Processing Pipeline (Saga.AI Sandbox Mode)...');

    // Simulated response for Netlify preview layout
    setTimeout(() => {
      setStatusText('Render Complete');
      setLoading(false);
      // Fallback placeholder video to test interface behavior
      setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
    }, 3000);
  };

  return (
    <div style={{ backgroundColor: '#07070a', minHeight: '100vh', width: '100%', display: 'flex', flexDirection: 'column' }}>
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center font-bold text-black text-lg">
            S
          </div>
          <span className="text-lg font-bold tracking-tight text-white uppercase">Saga.AI</span>
        </div>
        <nav className="flex items-center gap-1 bg-[#12121f] p-1 rounded-full border border-white/5">
          {['video', 'image', 'tools', 'assets'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all capitalize cursor-pointer ${
                activeTab === tab ? 'bg-white/10 text-white border border-white/5' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <div className="text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-4 py-2 rounded-full font-bold">
            ⚡ 750 Credits
          </div>
          <div className="h-9 w-9 rounded-full bg-slate-800 border border-white/10"></div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 max-w-3xl w-full mx-auto">
        <h1 className="text-3xl lg:text-4xl font-medium tracking-tight text-slate-200 text-center mb-8">
          {activeTab === 'video' ? 'What will you create with Saga.AI?' : 'Create stunning images'}
        </h1>
        <div className="w-full bg-[#0d0d16] rounded-2xl border border-white/5 p-6 shadow-2xl flex flex-col">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="w-full h-36 bg-transparent text-slate-200 placeholder-slate-600 text-base outline-none resize-none font-medium leading-relaxed"
            placeholder={activeTab === 'video' ? "Describe the video concept you want Saga.AI to generate..." : "Describe the stunning layout image you want to create..."}
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            {activeTab === 'video' ? (
              <div className="flex gap-2">
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="bg-[#141424] text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-slate-300 outline-none">
                  <option value="storytelling">🎨 AI Storytelling Cartoon</option>
                  <option value="gameplay">🎮 Viral Gameplay Split</option>
                </select>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium">Fast Generation Active</div>
            )}
            <button type="button" onClick={handleGenerate} disabled={loading} className="bg-[#e2e8f0] hover:bg-white text-black font-bold text-sm px-6 py-2 rounded-full transition-all disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer">
              {loading ? 'Processing...' : 'Generate'}
            </button>
          </div>
        </div>

        {(loading || videoUrl) && (
          <div className="w-full max-w-xs mt-8 bg-[#0d0d16] rounded-2xl border border-white/5 p-4 flex flex-col items-center shadow-2xl">
            <p className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase">{statusText}</p>
            <div className="w-full aspect-[9/16] bg-black/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
              {videoUrl ? <video className="w-full h-full object-cover" src={videoUrl} controls autoPlay loop /> : <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
