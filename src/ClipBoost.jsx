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
        const res = await fetch(`/api/check-status?id=${requestId}`);
        const data = await res.json();

        if (data.success && data.status === 'completed') {
          clearInterval(interval);
          setVideoUrl(data.videoUrl);
          setLoading(false);
          setStatusText('Render Complete!');
        } else if (data.success && data.status === 'failed') {
          clearInterval(interval);
          alert('Fal.ai generation
