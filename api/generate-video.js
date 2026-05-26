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

    // ✅ SWITCHED TO ABSOLUTE BASE SYSTEM VOICES (Rachel / Adam standard keys)
    let voiceId = 'pNInz6obpgDQGcFmaJgB'; 
    if (chosenVoice.toLowerCase().includes('rachel')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; 
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = 'sk_eee72e5d46c0bd3ffb67f79e1f9be5d6f8787149172e71b6'; 

    if (!shotstackKey || !groqApiKey) {
      return res.status(500).json({ error: 'Missing core system keys in settings.' });
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

    // PHASE 2: AUDIO GENERATION VIA ELEVENLABS
    // ✅ CHANGED MODEL TO THE BULLETPROOF MULTILINGUAL V2 MODEL
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_multilingual_v2',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!ttsResponse.ok) {
      throw new Error(`ElevenLabs TTS Failed with status: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = Buffer.from(audioBuffer).toString('base64');
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // PHASE 3: COMPILATION ENGINE VIA SHOTSTACK
    const renderResponse = await fetch('https://api.shotstack.io/v1/render', {
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
                    type: 'text',
                    text: cleanText,
                    style: 'vlog',
                    size: 'medium',
                    color: '#ffffff'
                  },
                  start: 0,
                  length: 12,
                  position: 'center'
                }
              ]
            },
            {
              clips: [
                {
                  asset: {
                    type: 'audio',
                    src: audioDataUrl
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
      renderId: renderData.response.id,
      id: renderData.response.id,
      response: { id: renderData.response.id }
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
