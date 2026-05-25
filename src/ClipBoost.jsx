import { useState } from 'react';

export default function ClipBoost() {
  const [videoIdea, setVideoIdea] = useState('');
  const [rendering, setRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [platform, setPlatform] = useState('tiktok');
  const [voiceType, setVoiceType] = useState('adam');
  const [renderStatus, setRenderStatus] = useState('');

  const handleCreateVideo = async () => {
    if (!videoIdea.trim()) return alert('Please enter a video concept first!');
    
    setRendering(true);
    setVideoUrl(null);
    setRenderStatus('🤖 Connecting to processing servers...');

    try {
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          idea: videoIdea,
          platform: platform,
          voice: voiceType
        }),
      });

      const data = await response.json();

      if (response.ok && data.videoUrl) {
        setVideoUrl(data.videoUrl);
      } else {
        alert(`Pipeline error: ${data.error || 'Failed to process clip rendering.'}`);
      }
    } catch (err) {
      console.error("Frontend fetch crash:", err);
      alert("Could not connect to the backend video path.");
    } finally {
      setRendering(false);
      setRenderStatus('');
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-4 py-8 font-sans antialiased selection:bg-zinc-700">
      <div className="max-w-5xl mx-auto">
        
        {/* Top Navbar */}
        <div className="flex justify-between items-center border-b border-zinc-800 pb-5 mb-12">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
              ClipBoost <span className="text-xs bg-zinc-800 text-zinc-400 px-2 py-0.5 rounded-md ml-1 font-mono">STUDIO v2</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-400 font-medium bg-zinc-900 border border-zinc-800 px-3 py-1.5 rounded-full">
              ⚡ 3 Credits Remaining
            </span>
            <button className="bg-white text-black font-bold text-xs px-4 py-1.5 rounded-full hover:bg-zinc-200 transition">
              Upgrade to Pro
            </button>
          </div>
        </div>

        {/* Layout Split Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Panel */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>🎬</span> AI Video Generation Engine
            </h2>

            <div className="mb-6">
              <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Video Concept or Topic</label>
              <textarea
                value={videoIdea}
                onChange={(e) => setVideoIdea(e.target.value)}
                placeholder="Ex: Why saving money in a traditional bank account is actually losing you money every single year..."
                rows="3"
                className="w-full bg-black border border-zinc-800 rounded-2xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 text-sm transition-all resize-none"
              />
            </div>

            <div className="mb-6">
              <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">Target Platform</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'tiktok', label: 'TikTok Short' },
                  { id: 'youtube_shorts', label: 'YT Shorts' },
                  { id: 'reels', label: 'IG Reels' }
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlatform(p.id)}
                    className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all ${
                      platform === p.id 
                        ? 'bg-white text-black border-white' 
                        : 'bg-black text-zinc-400 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-zinc-500 text-xs font-bold uppercase tracking-wider mb-2">AI Narrator Voice</label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'adam', label: '🗣️ Adam (Deep Viral Male)' },
                  { id: 'rachel', label: '👩‍💼 Rachel (Energetic Female)' }
                ].map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setVoiceType(v.id)}
                    className={`py-3 px-3 rounded-xl text-xs font-medium text-left border transition-all ${
                      voiceType === v.id 
                        ? 'bg-zinc-800 text-white border-zinc-600 shadow-inner' 
                        : 'bg-black text-zinc-500 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateVideo}
              disabled={rendering}
              className="w-full bg-gradient-to-r from-neutral-100 to-zinc-300 text-black font-extrabold text-base py-4 rounded-2xl active:scale-[0.99] transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg"
            >
              {rendering ? 'Generating Assets...' : '✨ Generate Short Video (1 Credit)'}
            </button>
          </div>

          {/* Right Video Monitor View Panel */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center min-h-[460px] relative overflow-hidden">
              
              {!rendering && !videoUrl && (
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800/60 mx-auto mb-4 text-2xl text-zinc-600">
                    📺
                  </div>
                  <h4 className="text-white font-bold text-sm mb-1">Production Monitor View</h4>
                  <p className="text-zinc-500 text-xs max-w-[240px] mx-auto">
                    Fill out your generation specs on the left dashboard pane to render your video file timeline.
                  </p>
                </div>
              )}

              {rendering && (
                <div className="text-center px-4 w-full">
                  <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-700 border-t-white mx-auto mb-6"></div>
                  <p className="text-zinc-200 font-semibold text-sm mb-2">Rendering Pipeline Active</p>
                  <p className="text-zinc-500 text-xs font-mono bg-black/40 border border-zinc-800 rounded-xl py-2.5 px-3 max-w-[280px] mx-auto animate-pulse">
                    {renderStatus}
                  </p>
                </div>
              )}

              {!rendering && videoUrl && (
                <div className="w-full flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="aspect-[9/16] w-[220px] bg-black rounded-2xl border border-zinc-800 overflow-hidden shadow-2xl relative mb-4">
                    <video 
                      src={videoUrl} 
                      className="w-full h-full object-cover" 
                      controls
                      autoPlay
                      loop
                    />
                  </div>
                  <a 
                    href={videoUrl} 
                    download="clipboost_render.mp4"
                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm px-6 py-2.5 rounded-xl transition shadow-lg flex items-center gap-2"
                  >
                    📥 Download Rendered MP4
                  </a>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
