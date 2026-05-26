export default async function handler(req, res) {
  // 1. Handle CORS Preflight flags natively
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const body = req.body || {};
    
    const idea = body.idea || body.videoPrompt || '';
    const chosenVoice = body.voice || body.voiceSelection || 'adam';

    if (!idea) {
      return res.status(400).json({ error: 'Missing video concept prompt' });
    }

    // Officially verified ElevenLabs pre-made system voice IDs
    let voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default: Adam Voice (Deep Male)
    if (chosenVoice.toLowerCase().includes('rachel')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel Voice (Energetic Female)
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    
    // SMART FALLBACK: Tries Vercel variables, then hardcoded fallback string
    const elevenlabsKey = 
      process.env.ELEVENLABS_API_KEY || 
      process.env.ELEVEN_LABS_KEY || 
      process.env.elevenlabs_api_key ||
      'sk_eee72e5d46c0bd3ffb67f79e1f9be5d6f8787149172e71b6'; 

    if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
      return res.status(500).json({ error: 'Missing API System Keys in settings.' });
    }

    // PHASE 1: SCRIPT GENERATION VIA GROQ AI
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        response_format: { type: "
