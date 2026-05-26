export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Handle CORS Preflight flags for your frontend
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }

  try {
    const body = await req.json();
    
    // Fallbacks to check whatever variable formatting the frontend passes over
    const idea = body.idea || body.videoPrompt || '';
    const chosenVoice = body.voice || body.voiceSelection || 'adam';

    if (!idea) {
      return new Response(JSON.stringify({ error: 'Missing video concept prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // Officially verified ElevenLabs pre-made system IDs
    let voiceId = 'pNInz6obpgDQGcFmaJgB'; // Default: Adam Voice (Deep Male)
    if (chosenVoice.toLowerCase().includes('rachel')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel Voice (Energetic Female)
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

    if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
      return new Response(JSON.stringify({ error: 'Missing API Keys in Vercel settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
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
            content: `You are an expert viral content scriptwriter. Create a concise, engaging 12-second narrative statement. Return a JSON object with exactly this key: "scriptText" (keep under 30 words total).`
          },
          {
            role: 'user',
            content: `Topic: ${idea}`
          }
        ]
      })
    });

    const groqData = await groqResponse.json();
    if (!groqResponse.ok) {
      throw new Error(`Groq AI Error: ${groqData.error?.message || groqResponse.statusText}`);
    }

    const aiContent = JSON.parse(groqData.choices[0].message.content);
    const cleanText = aiContent.scriptText.replace(/"/g, "'").replace(/\n/g, ' ').trim();

    // PHASE 2: AUDIO GENERATION VIA ELEVENLABS
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'xi-api-key': elevenlabsKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        text: cleanText,
        model_id: 'eleven_monolingual_v1',
        voice_settings: { stability: 0.5, similarity_boost: 0.75 }
      })
    });

    if (!ttsResponse.ok) {
      throw new Error(`ElevenLabs TTS Failed with status: ${ttsResponse.status}`);
    }

    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
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
              // Visual Layer: Bulletproof HTML text renderer
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<p>${cleanText}</p>`,
                    css: 'p { font-family: "Helvetica", Arial, sans-serif; color: #ffffff; font-size: 24px; text-align: center; font-weight: bold; padding: 20px; line-height: 1.4; }',
                    width: 600,
                    height: 400
                  },
                  start: 0,
                  length: 15,
                  position: 'center'
                }
              ]
            },
            {
              // Audio Layer: Inline streaming track clip
              clips: [
                {
                  asset: {
                    type: 'audio',
                    src: audioDataUrl
                  },
                  start: 0,
                  length: 15
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

    const trackedId = renderData.response.id;

    return new Response(JSON.stringify({
      success: true,
      renderId: trackedId,
      id: trackedId,
      response: { id: trackedId }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
    });
  }
}
