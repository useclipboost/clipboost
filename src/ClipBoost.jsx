import React, { useState, useEffect } from 'react';

export default function ClipBoost() {
  // Navigation tabs tracking
  const [activeTab, setActiveTab] = useState('video');
  
  // App parameters and rendering pipelines states
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('storytelling');
  const [voice, setVoice] = useState('adam');
  const [loading, setLoading] = useState(false);
  const [statusText, setStatusText] = useState('System Idle');
  const [videoUrl, setVideoUrl] = useState(null);

  // Status Indicator Dot CSS styles mappings
  const getDotClass = () => {
    if (loading) {
      return statusText.includes('Rendering') 
        ? "h-2 w-2 rounded-full bg-indigo-400 animate-pulse" 
        : "h-2 w-2 rounded-full bg-amber-400 animate-pulse";
    }
    return videoUrl ? "h-2 w-2 rounded-full bg-emerald-400" : "h-2 w-2 rounded-full bg-slate-600";
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('Please provide a storyline concept or scene description first!');
      return;
    }

    setLoading(true);
    setVideoUrl(null);
    setStatusText('Synthesizing Script & Audio...');

    try {
      // Calls your Vercel API endpoint directly
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
        throw new Error(data.error || 'The generation pipeline rejected this project schema.');
      }

      setStatusText('Rendering MP4 Stream...');
      pollShotstackStatus(data.id);

    } catch (err) {
      alert('Pipeline Interruption: ' + err.message);
      resetPipeline();
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
          alert('Video compilation matrix failed on layout stitching.');
          resetPipeline();
        }
      } catch (e) {
        clearInterval(interval);
        resetPipeline();
      }
    }, 3000);
  };

  const resetPipeline = () => {
    setLoading(false);
    setStatusText('System Idle');
    setVideoUrl(null);
  };

  return (
    <div class="min-h-screen flex flex-col">
      
      <header class="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between border-b border-white/5">
        <div class="flex items-center gap-3">
          <div class="h-9 w-9 bg-gradient-to-tr from-indigo-500 to-emerald-400 rounded-xl flex items-center justify-center font-bold text-black text-lg shadow-lg">S</div>
          <span class="text-lg font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">STUD
