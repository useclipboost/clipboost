import React, { useState } from 'react';

export default function Saga() {
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
    <div style={{ backgroundColor: '#07070a', minHeight: '100vh', width: '100%', display: 'flex',
