import React, { useState } from 'react';

export default function ClipBoost() {
  const [activeTab, setActiveTab] = useState('video');
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('storytelling');
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
    setStatusText('Sending to Fal.ai Queue...');

    try {
      // Hits your working Vercel api file
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoPrompt: prompt,
          styleSelection: style
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Generation failed');
      }

      // Your working script returns data.id (the request_id from fal)
      setStatusText('Video Queued! ID: ' + data.id);
      pollStatus(data.id);
    } catch (err) {
      alert('Error: ' + err.message);
      setLoading(false);
      setStatusText('System Idle');
    }
  };

  const pollStatus = (requestId) => {
    const interval = setInterval(async () => {
      try {
        // Hits your status checker endpoint using the request_id
        const res = await fetch(`/api/check-status?id=${requestId}`);
        const data = await res.json();

        if (data.success && data.status === 'completed') {
          clearInterval(interval);
          setVideoUrl(data.videoUrl); // Displays your generated video
          setLoading(false);
          setStatusText('Render Complete!');
        } else if (data.success && data.status === 'failed') {
          clearInterval(interval);
          alert('Fal.ai generation failed.');
          setLoading(false);
          setStatusText('System Idle');
        }
      } catch (e) {
        // Keeps trying if there's a temporary network hiccup while waiting
      }
    }, 4000); // Polls every 4 seconds
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
        <h1 className="text
