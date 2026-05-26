import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';

function App() {
  const [activeTab, setActiveTab] = useState('video');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('storytelling');
  const [voice, setVoice] = useState('adam');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('System Idle');
  const [videoUrl, setVideoUrl] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) {
      alert('Please enter a description first!');
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setStatusText('Processing Pipeline...');

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
        throw new Error(data.error || 'Pipeline error');
      }

      setStatusText('Rendering Video...');
      pollStatus(data.id);
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
      setStatusText('System Idle');
    }
  };

  const pollStatus = (renderId) => {
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/check-status?id=${renderId}`);
        const data = await res.json();

        if (data.response && data.response.status === 'done') {
          clearInterval(interval);
          setVideoUrl(data.response.url);
          setLoading(false);
          setStatusText('Render Complete');
        } else if (data.response && data.response.status === 'failed') {
          clearInterval(interval);
          alert('Render failed.');
          setLoading(false);
          setStatusText('System Idle');
        }
      } catch (e) {
        clearInterval(interval);
      }
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
          {activeTab === 'video' ? 'What will you create?' : 'Create stunning images'}
        </h1>
        <div className="w-full bg-[#0d0d16] rounded-2xl border border-white/5 p-6 shadow-2xl flex flex-col">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            disabled={loading}
            className="w-full h-36 bg-transparent text-slate-200 placeholder-slate-600 text-base outline-none resize-none font-medium leading-relaxed"
            placeholder={activeTab === 'video' ? "Describe the video concept you want to generate..." : "Describe the stunning layout image you want to create..."}
          />
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
            {activeTab === 'video' ? (
              <div className="flex gap-2">
                <select value={style} onChange={(e) => setStyle(e.target.value)} className="bg-[#141424] text-xs font-semibold px-3 py-2 rounded-xl border border-white/10 text-slate-300 outline-none">
                  <option value="storytelling">🎨 AI Storytelling Cartoon</option>
                  <option
