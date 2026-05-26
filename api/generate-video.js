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

    // PHASE 1: VIRAL HOOK & THREE-ACT SCRIPTWRITING VIA GROQ AI
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
            content: 'You are a viral TikTok & Reels editor. Write a short 12-second narrative script broken into 3 punchy sentences: 1. A crazy hook (seconds 0-4), 2. An escalating detail (seconds 4-8), 3. A dramatic retention payoff (seconds 8-12). Return a JSON object with exactly these keys: "hookText", "bodyText", "payoffText". Keep each sentence under 8 words.'
          },
          {
            role: 'user',
            content: `Topic: ${idea}`
          }
        ]
      })
    });

    if (!groqResponse.ok) {
      throw new Error('Groq failed to generate your retention hook script.');
    }

    const groqData = await groqResponse.json();
    const aiContent = JSON.parse(groqData.choices[0].message.content);
    
    const hook = aiContent.hookText.replace(/"/g, "'").trim();
    const middle = aiContent.bodyText.replace(/"/g, "'").trim();
    const payoff = aiContent.payoffText.replace(/"/g, "'").trim();
    const fullCombinedText = `${hook} ${middle} ${payoff}`;

    // PHASE 2: SELECTION OF CINEMATIC SCENE ASSETS (Using curated high-retention clips)
    // Scene 1 Hook: Mysterious deep space/atmosphere
    const videoScene1 = 'https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/videos/earth.mp4';
    // Scene 2 Body: Abstract grid/technology overlay matrix
    const videoScene2 = 'https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/videos/grid.mp4';
    // Scene 3 Payoff: Cinematic ocean deep pull-back
    const videoScene3 = 'https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/videos/ocean.mp4';

    // PHASE 3: COMPILATION VIA THE MULTI-TRACK RETENTION PIPELINE
    const renderResponse = await fetch('https://api.shotstack.io/edit/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': shotstackKey
      },
      body: JSON.stringify({
        timeline: {
          background: '#000000',
          tracks: [
            {
              // TRACK 1: DYNAMIC SUBTITLE CAPTIONS TIMED TO EACH SCENE
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<p align="center">${hook}</p>`,
                    css: 'p { font-family: "Impact", Arial; font-size: 32px; color: #ffeb3b; text-transform: uppercase; text-align: center; text-shadow: 3px 3px 0px #000000; }',
                    width: 550,
                    height: 150
                  },
                  start: 0,
                  length: 4,
                  position: 'center'
                },
                {
                  asset: {
                    type: 'html',
                    html: `<p align="center">${middle}</p>`,
                    css: 'p { font-family: "Impact", Arial; font-size: 32px; color: #ffffff; text-transform: uppercase; text-align: center; text-shadow: 3px 3px 0px #000000; }',
                    width: 550,
                    height: 150
                  },
                  start: 4,
                  length: 4,
                  position: 'center'
                },
                {
                  asset: {
                    type: 'html',
                    html: `<p align="center">${payoff}</p>`,
                    css: 'p { font-family: "Impact", Arial; font-size: 34px; color: #00e676; text-transform: uppercase; text-align: center; text-shadow: 3px 3px 0px #000000; }',
                    width: 550,
                    height: 150
                  },
                  start: 8,
                  length: 4,
                  position: 'center'
                }
              ]
            },
            {
              // TRACK 2: RAPID VISUAL SCENE CUTS (B-Roll switching every 4 seconds)
              clips: [
                {
                  asset: { type: 'video', src: videoScene1 },
                  start: 0,
                  length: 4
                },
                {
                  asset: { type: 'video', src: videoScene2 },
                  start: 4,
                  length: 4
                },
                {
                  asset: { type: 'video', src: videoScene3 },
                  start: 8,
                  length: 4
                }
              ]
            },
            {
              // TRACK 3: CONTINUOUS VOICE OVER
              clips: [
                {
                  asset: {
                    type: 'text-to-speech',
                    text: fullCombinedText,
                    voice: systemVoice
                  },
                  start: 0,
                  length: 12
                }
              ]
            }
          ]
        },
        output: {
          format: 'mp4',
          resolution: 'sd'
        }
      })
    });

    const renderData = await renderResponse.json();
    if (!renderResponse.ok) {
      throw new Error(`Shotstack API Error: ${renderData.message || renderResponse.statusText}`);
    }

    return res.status(200).json({
      success: true,
      id: renderData.response.id
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
