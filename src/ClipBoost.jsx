// src/ClipBoost.jsx
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
      // Step 1: Submit the prompt layout request to your serverless backend
      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: videoConcept })
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
      const maxAttempts = 40; // 40 loops * 3 seconds = 120 seconds maximum padding

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
      setLoading(false);
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
              <button key={voice} onClick={() => setNarratorVoice(voice)} style={{ padding: '12px', backgroundColor: narratorVoice === voice ? '#222' : '#0b0c10', color: '#fff', border: narratorVoice === voice ? '1px solid #45f3ff' : 'none', borderRadius: '6px', fontSize: '13px', cursor: 'pointer' }}>{voice}</button>
            ))}
          </div>

          <button 
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: '100%', padding: '16px', backgroundColor: loading ? '#444' : '#fff', color: '#000', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', transition: '0.2s' }}
          >
            {loading ? 'Processing Assets...' : '✨ Generate Short Video (1 Credit)'}
          </button>

          {error && (
            <div style={{ marginTop: '20px', padding: '12px', backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4d4d', borderRadius: '6px', color: '#ff4d4d', fontSize: '14px' }}>
              Pipeline error: {error}
            </div>
          )}
        </div>

        {/* Right Side: Media Output Canvas Live Preview Container */}
        <div style={{ backgroundColor: '#1f2833', padding: '30px', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
          {loading ? (
            <div style={{ textAlign: 'center' }}>
              <div style={{ border: '4px solid rgba(255,255,255,0.1)', width: '48px', height: '48px', borderRadius: '50%', borderLeftColor: '#45f3ff', animation: 'spin 1s linear infinite', margin: '0 auto 20px auto' }} />
              <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px' }}>Rendering Pipeline Active</h3>
              <p style={{ margin: 0, color: '#aaa', fontSize: '14px' }}>{statusMessage}</p>
            </div>
          ) : videoUrl ? (
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
              <video 
                src={videoUrl} 
                controls 
                style={{ width: '100%', maxHeight: '420px', borderRadius: '8px', backgroundColor: '#000', boxShadow: '0 8px 24px rgba(0,0,0,0.5)' }}
              />
              <a 
                href={videoUrl} 
                download="clipboost-generation.mp4" 
                target="_blank"
                rel="noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '12px 24px', backgroundColor: '#2ecc71', color: '#fff', textDecoration: 'none', borderRadius: '6px', fontWeight: 'bold', fontSize: '14px', transition: '0.2s' }}
              >
                📥 Download Rendered MP4
              </a>
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#666' }}>
              <p style={{ margin: 0, fontSize: '15px' }}>Your rendered video preview will appear here inside a live streaming canvas container.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
