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
    });

    if (!groqResponse.ok) {
      const errText = await groqResponse.text();
      throw new Error(`Groq AI Error: ${errText || groqResponse.statusText}`);
    }

    const groqData = await groqResponse.json();
    const aiContent = JSON.parse(groqData.choices[0].message.content);
    const cleanText = aiContent.scriptText.replace(/"/g, "'").replace(/\n/g, ' ').trim();

    // PHASE 2: COMPILATION VIA NATIVE SHOTSTACK V1 PRODUCTION ENGINE (WITH VIDEO BACKGROUND)
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
              // Track 1: Subtitle Overlay
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<p align="center">${cleanText}</p>`,
                    css: 'p { font-family: "Helvetica Neue", Arial; font-size: 28px; color: #ffffff; font-weight: bold; text-align: center; text-shadow: 2px 2px 4px rgba(0,0,0,0.8); }',
                    width: 600,
                    height: 200
                  },
                  start: 0,
                  length: 12,
                  position: 'center'
                }
              ]
            },
            {
              // Track 2: Moving Cinematic Space Background Video Asset
              clips: [
                {
                  asset: {
                    type: 'video',
                    src: 'https://s3-ap-southeast-2.amazonaws.com/shotstack-assets/videos/earth.mp4'
                  },
                  start: 0,
                  length: 12
                }
              ]
            },
            {
              // Track 3: Native Text-to-Speech Audio
              clips: [
                {
                  asset: {
                    type: 'text-to-speech',
                    text: cleanText,
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
