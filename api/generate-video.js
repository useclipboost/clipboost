export default async function handler(req, res) {
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

    // 🎙️ Premium ElevenLabs Voice Setup
    let voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam
    if (chosenVoice.toLowerCase().includes('rachel') || chosenVoice.toLowerCase().includes('female')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

    if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
      return res.status(500).json({ 
        error: 'System missing environmental variable keys in Vercel settings.' 
      });
    }

    // PHASE 1: SMART SCRIPT & VISUAL KEYWORD GENERATION VIA GROQ AI
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
            content: 'You are an AI video producer. Create a concise, engaging 12-second narration. Also provide one single background search keyword (e.g., "space", "mystery", "ocean") that matches the mood. Return a JSON object with exactly these two keys: "scriptText" and "visualKeyword". Keep script under 25 words.'
          },
          {
            role: 'user',
            content: `Topic: ${idea}`
          }
        ]
      })
    });

    if (!groqResponse.ok) {
      throw new Error('Groq AI failed to generate script assets.');
    }

    const groqData = await groqResponse.json();
    const aiContent = JSON.parse(groqData.choices[0].message.content);
    const cleanText = aiContent.scriptText.replace(/"/g, "'").replace(/\n/g, ' ').trim();
    const searchKeyword = aiContent.visualKeyword || 'cinematic';

    // PHASE 2: REALISTIC AUDIO GENERATION VIA ELEVENLABS
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key
