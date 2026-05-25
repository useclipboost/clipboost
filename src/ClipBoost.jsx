import { useState } from 'react';

export default function ClipBoost() {
  const [videoIdea, setVideoIdea] = useState('');
  const [rendering, setRendering] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [platform, setPlatform] = useState('tiktok'); // tiktok, youtube_shorts, reels
  const [voiceType, setVoiceType] = useState('adam'); // viral male, viral female
  const [renderStatus, setRenderStatus] = useState('');

  const handleCreateVideo = () => {
    if (!videoIdea.trim()) return alert('Please enter a video concept first!');
    
    setRendering(true);
    setVideoUrl(null);
    
    // Simulating the actual multi-step AI video rendering pipeline
    setRenderStatus('🤖 Writing viral script outline...');
    
    setTimeout(() => {
      setRenderStatus('🎙️ Generating ElevenLabs AI voiceover track...');
    }, 1500);

    setTimeout(() => {
      setRenderStatus('🎬 Sourcing background clips and burning auto-subtitles...');
    }, 3500);

    setTimeout(() => {
      setRenderStatus('⚡ Compiling final MP4 video layers...');
    }, 5500);

    setTimeout(() => {
      // Mock video file response (using a placeholder sample video)
      setVideoUrl('https://www.w3schools.com/html/mov_bbb.mp4');
      setRendering(false);
      setRenderStatus('');
    }, 7500);
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

        {/* Main Split-Screen Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Control Board Options */}
          <div className="lg:col-span-7 bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <span>🎬</span> AI Video Generation Engine
            </h2>

            {/* Input Box */}
            <div className="
