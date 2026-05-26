// Native Node.js compliant handler (No Edge runtime conflicts)
export default async function handler(req, res) {
  // Set clean, explicit CORS headers natively
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

    // ElevenLabs system voice IDs
    let voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam
    if (chosenVoice.toLowerCase().includes('rachel')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = 
      process.env.ELEVENLABS_API_KEY || 
      process.env.ELEVEN_LABS_KEY || 
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
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: 'You are an expert viral content scriptwriter. Create a concise, engaging 12-second narrative statement. Return a JSON object with exactly this key: "scriptText" (keep under 30 words total).'
          },
          {
            role: 'user',
            content: `Topic: ${idea}`
          }
        ]
      })
