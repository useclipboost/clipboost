import React, { useState } from 'react';

export default function ClipBoost() {
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
      alert('Error:
