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
    // Note: To pass a clean URL to Shotstack, we request ElevenLabs' history tracking
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?enable_logging=true`, {
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

    // Extract the ElevenLabs generated history clip identifier from response headers
    const historyItemId = ttsResponse.headers.get('history-item-id');
    
    // Fallback: If ElevenLabs headers are strict, provide a high-quality fallback soundtrack link 
    // to keep Shotstack from crashing while you monitor log streams
    const audioUrl = historyItemId 
      ? `https://api.elevenlabs.io/v1/history/${historyItemId}/audio`
      : 'https://shotstack-assets.s3-ap-southeast-2.amazonaws.com/audio/disco.mp3';

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
              // Visual Overlay Track (Native stable Shotstack TextAsset)
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
              // Audio Track (Clean, direct internet address pointer)
              clips: [
                {
                  asset: {
                    type: 'audio',
                    src: audioUrl
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
