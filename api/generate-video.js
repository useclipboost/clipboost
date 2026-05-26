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

    // 🎙️ Premium, Ultra-Realistic ElevenLabs Voice IDs
    let voiceId = 'pNInz6obpgDQGcFmaJgB'; // Adam (Deep Viral Male)
    if (chosenVoice.toLowerCase().includes('rachel') || chosenVoice.toLowerCase().includes('female')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel (Natural Expressive Female)
    }

    // Pulling securely from your Vercel Environment Variables
    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

    if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
      return res.status(500).json({ 
        error: 'Missing API keys (SHOTSTACK_API_KEY, OPENAI_API_KEY, or ELEVENLABS_API_KEY) in Vercel settings.' 
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

    // PHASE 2: HYPER-REALISTIC AUDIO GENERATION VIA ELEVENLABS
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { 
          stability: 0.40,        // Lowered slightly for more emotional inflection/realism
          similarity_boost: 0.85  // Higher clarity
        }
      })
    });

    if (!ttsResponse.ok) {
      const ttsErr = await ttsResponse.text();
      throw new Error(`ElevenLabs Premium TTS Failed: ${ttsErr || ttsResponse.status}`);
    }

    // Clean, web-compliant binary encoding that Shotstack won't reject
    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // PHASE 3: COMPILATION VIA SHOTSTACK PRODUCTION ENDPOINT
    const renderResponse = await fetch('https://api.shotstack.io/edit/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': shotstackKey
      },
      body: JSON.stringify({
        timeline: {
          background: '#1a1a2e',
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<p align="center">${cleanText}</p>`,
                    css: 'p { font-family: "Helvetica Neue", Arial; font-size: 28px; color: #ffffff; font-weight: bold; text-align: center; }',
                    width: 600,
                    height: 200
                  },
                  start: 0,
                  length: 12
                }
              ]
            },
            {
              clips: [
                {
                  asset: {
                    type: 'audio',
                    src: audioDataUrl // ✅ Sending the clean human voice data stream
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
