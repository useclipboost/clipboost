import React, { useState } from 'react';

export default function ClipBoost() {
  // Active sub-section state engine
  const [activeTab, setActiveTab] = useState('video');
  
  // Pipeline management data variables
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('storytelling');
  const [voice, setVoice] = useState('adam');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('System Idle');
  const [videoUrl, setVideoUrl] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault(); // Prevents layout freezing on submit click
    if (!prompt.trim()) {
      alert('Please enter a description concept first!');
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setStatusText('Synthesizing Pipeline...');

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPrompt: prompt,
          styleSelection: style,
          voiceSelection: voice
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Server rejected request layout.');
      }

      setStatusText('Rendering MP4...');
      pollShotstackStatus(data.id);
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
      setStatusText('System Idle');
    }
  };

  const pollShotstackStatus = (renderId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`https://api.shotstack.io/edit/v1/render/${renderId}`, {
          headers: { 'x-api-key': import.meta.env.VITE_SHOTSTACK_API_KEY || '' }
        });
        const data = await res.json();

        if (data.response && data.response.status === 'done') {
          clearInterval(interval);
          setVideoUrl(data.response.url);
          setLoading(false);
          setStatusText('Render Complete');
        } else if (data.response && data.response.status === 'failed') {
          clearInterval(interval);
          alert('Rendering failed.');
          setLoading(false);
          setStatusText('System Idle');
        }
      } catch (e) {
        clearInterval(interval);
      }
    }, 3000);
  };

  return (
    <div className="w-full min-h-screen bg-[#07070a] text-slate-100 flex flex-col z-10 relative selection:bg-indigo-500/30">
      
      {/* 🌍 GLOBAL NAVIGATION RAIL (Perfectly matches image layout positions) */}
      <header className="w-full max-w-7xl mx-auto px-6 py-6 flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center font-bold text-black text-lg">S</div>
          <span className="text-lg font-bold tracking-tight text-white">STUDIO.AI</span>
        </div>
        
        {/* Dynamic Nav Toggles */}
        <nav className="flex items-center gap-1 bg-[#12121f] p-1 rounded-full border border-white/5 shadow-inner">
          {['video', 'image', 'tools', 'assets'].map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 capitalize cursor-pointer z-20 ${
                activeTab === tab 
                  ? 'bg-white/10 text-white shadow-sm border border-white/5' 
                  : 'text-slate-400 hover:text-slate-200'
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

      {/* 🔮 CENTERED SUITE CONTROLLER */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 max-w-4xl w-full mx-auto relative z-20">
        
        {/* Title Presentation Headers */}
        <h1 className="text-4xl lg:text-5xl font-medium tracking-tight text-slate-300 text-center mb-8">
          {activeTab === 'video' ? 'What will you create?' : 'Create stunning images'}
        </h1>

        {/* The Workspace Frame */}
        <div className="w-full bg-[#0d0d16] rounded-2xl border border-white/5 p-5 shadow-2xl flex flex-col pointer-events-auto">
          
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="w-full h-40 bg-transparent text-slate-200 placeholder-slate-600 text-base outline-none resize-none font-medium leading-relaxed z-30"
            placeholder={
              activeTab === 'video' 
                ? "A serene sunset over the ocean with gentle waves crashing"
                : "An underwater palace with bioluminescent coral"
            }
          />

          {/* Bottom Settings Sub-Section Bar */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5 z-30">
            
            {/* Context Parameter Switches */}
            {activeTab === 'video' ? (
              <div className="flex gap-2">
                <select
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  className="bg-[#141424] text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-slate-300 outline-none cursor-pointer"
                >
                  <option value="storytelling">🎨 Style: Cartoon Story</option>
                  <option value="gameplay">🎮 Style: Gameplay Split</option>
                </select>
                <select
                  value={voice}
                  onChange={(e) => setVoice(e.target.value)}
                  className="bg-[#141424] text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-slate-300 outline-none cursor-pointer"
                >
                  <option value="adam">🎙️ Voice: Adam (Male)</option>
                  <option value="rachel">🎙️ Voice: Rachel (Female)</option>
                </select>
              </div>
            ) : (
              <div className="text-xs text-slate-500 font-medium">
                Running Fast SDXL Image Model Engine
              </div>
            )}

            {/* Action Trigger Buttons */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading}
              className="bg-[#e2e8f0] hover:bg-white text-black font-semibold text-sm px-6 py-2 rounded-full transition-all duration-150 disabled:bg-slate-800 disabled:text-slate-500 cursor-pointer shadow-md z-30"
            >
              {loading ? 'Processing...' : 'Generate'}
            </button>
          </div>
        </div>

        {/* 🎬 PREVIEW MONITOR DECK (Appears below workspace dynamically when compiling) */}
        {(loading || videoUrl) && (
          <div className="w-full max-w-xs mt-8 bg-[#0d0d16] rounded-2xl border border-white/5 p-4 flex flex-col items-center">
            <p className="text-xs font-bold text-slate-400 mb-3 tracking-wider uppercase">
              {statusText}
            </p>
            <div className="w-full aspect-[9/16] bg-black/60 rounded-xl overflow-hidden border border-white/5 flex items-center justify-center">
              {videoUrl ? (
                <video className="w-full h-full object-cover" src={videoUrl} controls autoPlay loop />
              ) : (
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-500 border-t-transparent"></div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
