import React, { useState } from 'react';

export default function ClipBoost() {
  const [videoConcept, setVideoConcept] = useState('');
  const [targetPlatform, setTargetPlatform] = useState('TikTok Short');
  const [narratorVoice, setNarratorVoice] = useState('Adam (Deep Viral Male)');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState(null);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!videoConcept.trim()) {
      setError('Please provide a video concept or topic prompt first.');
      return;
    }

    setLoading(true);
    setError(null);
    setVideoUrl(null);
    setStatusMessage('Submitting prompt layout to Shotstack...');

    try {
      // ✅ FIXED: Now safely bundling voice and target configurations into your fetch payload
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          idea: videoConcept,
          voice: narratorVoice,
          platform: targetPlatform
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The server rejected the initial asset submission.');
      }

      // Smart tracking catch-all matching logic
      const renderId = data.renderId || data.id || data.response?.id;
      if (!renderId) {
        throw new Error('Critical Error: Server did not return a valid tracking identifier (renderId).');
      }

      // Step 2: Kick off frontend client-safe browser polling loop
      let completedUrl = null;
      let attempts = 0;
      const maxAttempts = 100; // 100 loops * 3 seconds = 300 seconds maximum padding

      while (!completedUrl && attempts < maxAttempts) {
        setStatusMessage(`Rendering Pipeline Active... Cooking video frames (Check #${attempts + 1})`);
        
        // Pause execution for 3 seconds before checking status
        await new Promise((resolve) => setTimeout(resolve, 3000));
        attempts++;

        const statusCheck = await fetch(`/api/check-status?id=${renderId}`);
        if (!statusCheck.ok) continue;

        const statusData = await statusCheck.json();

        // Check if Shotstack has successfully written the completed asset flag
        if (statusData.status === 'done' || statusData.status === 'completed') {
          completedUrl = statusData.url; // Capture the verified .mp4 url
          break;
        } else if (statusData.status === 'failed') {
          throw new Error('Shotstack media engine reported an asset rendering configuration crash.');
        }
      }

      if (!completedUrl) {
        throw new Error('The cloud processing pipeline took too long to compile frames. Please try generating again.');
      }

      // Success! Set the direct video streaming url to state
      setVideoUrl(completedUrl);
      setStatusMessage('');

    } catch (err) {
      console.error('Pipeline Processing Failure:', err);
      setError(err.message || 'An unhandled exception occurred in the render sequence.');
    } finally {
      loading && setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif', backgroundColor: '#0b0c10', color: '#fff', minHeight: '100vh' }}>
      <header style={{ marginBottom: '40px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 'bold' }}>ClipBoost <span style={{ fontSize: '12px', background: '#222', padding: '4px 8px', borderRadius: '4px', color: '#aaa' }}>STUDIO v2</span></h1>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* Left Side: Custom Controls UI Dashboard */}
        <div style={{ backgroundColor: '#1f2833', padding: '30px', borderRadius: '12px' }}>
          <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>🎬 AI Video Generation Engine</h2>
          
          <label style={{ display: 'block', fontSize: '12px', color: '#c5a059', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Video Concept or Topic</label>
          <textarea 
            value={videoConcept}
            onChange={(e) => setVideoConcept(e.target.value)}
            placeholder="The strangest event in history that scientists still cannot explain to this day."
            style={{ width: '100%', height: '100px', backgroundColor: '#0b0c10', border: '1px solid #45f3ff', borderRadius: '6px', padding: '12px', color: '#fff', fontSize: '14px', resize: 'none', marginBottom: '20px', boxSizing: 'border-box' }}
          />

          <label style={{ display: 'block', fontSize: '12px', color: '#c5a059', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>Target Platform</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '20px' }}>
            {['TikTok Short', 'YT Shorts', 'IG Reels'].map((platform) => (
              <button key={platform} onClick={() => setTargetPlatform(platform)} style={{ padding: '12px', backgroundColor: targetPlatform === platform ? '#fff' : '#0b0c10', color: targetPlatform === platform ? '#000' : '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: '0.2s' }}>{platform}</button>
            ))}
          </div>

          <label style={{ display: 'block', fontSize: '12px', color: '#c5a059', fontWeight: 'bold', marginBottom: '8px', textTransform: 'uppercase' }}>AI Narrator Voice</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '30px' }}>
            {['Adam (Deep Viral Male)', 'Rachel (Energetic Female)'].map((voice) => (
              <button key={voice} onClick={() => setNarratorVoice(voice)} style={{ padding: '12px', backgroundColor: narratorVoice === voice ? '#222' : '#0b0c10', color: '#fff', border: narratorVoice === voice ? '1px solid #45
