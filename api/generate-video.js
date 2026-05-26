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
    // 🎭 Capture user choice: 'gameplay' or 'storytelling'
    const videoStyle = body.styleSelection || 'gameplay'; 

    if (!idea) {
      return res.status(400).json({ error: 'Missing video concept prompt' });
    }

    let voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam (Deep Viral Narration)
    if (chosenVoice.toLowerCase().includes('rachel') || chosenVoice.toLowerCase().includes('female')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

    if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
      return res.status(500).json({ 
        error: 'Missing required API keys in environment configurations.' 
      });
    }

    // STEP 1: GENERATE PUNCHY MULTI-SEGMENT SCRIPT VIA GROQ AI
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        response_format: { type: "json_object" },
        messages:
