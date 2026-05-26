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

    // PHASE 1: RETENTION HOOK & SCRIPT GENERATION VIA GROQ AI
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
            content: 'You are a viral video script editor. Write a 12-second dramatic narration script split into exactly 3 punchy sentences: "hookText" (seconds 0-4), "bodyText" (seconds 4-8), and "payoffText" (seconds 8-12). Keep each sentence under 7 words. Return a JSON object with exactly those 3 keys.'
          },
          {
            role: 'user',
            content: `Topic: ${idea}`
          }
        ]
      })
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq AI Error: ${errText || groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const aiContent = JSON.parse(groqData.choices[0].message.content);
    
    const hook = aiContent.hookText.replace(/"/g, "'").trim();
    const middle = aiContent.bodyText.replace(/"/g, "'").trim();
    const payoff = aiContent.payoffText.replace(/"/g, "'").trim();
    const fullCombinedText = `${hook} ${middle} ${payoff}`;

    // PHASE 2: VERIFIED SHOTSTACK PRODUCTION CDN ASSETS
    // These direct Amazon S3 links are whitelisted and guaranteed never to crash the engine
    const scene1Video = 'https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/videos/earth.mp4';  // Cosmic Earth
    const scene2Video
