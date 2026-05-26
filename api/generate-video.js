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

    let systemVoice = 'Matthew'; 
    if (chosenVoice.toLowerCase().includes('rachel') || chosenVoice.toLowerCase().includes('female')) {
      systemVoice = 'Joanna'; 
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 

    if (!shotstackKey || !groqApiKey) {
      return res.status(500).json({ 
        error: 'System missing SHOTSTACK_API_KEY or OPENAI_API_KEY in Vercel settings.' 
      });
    }

    // PHASE 1: DYNAMIC SCRIPT & MULTI-SCENE KEYWORD GENERATION VIA GROQ AI
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
            content: 'You are a viral short-video producer. Write a 12-second script broken into 3 punchy sentences (hookText, bodyText, payoffText). Also provide 3 distinct visual search terms
