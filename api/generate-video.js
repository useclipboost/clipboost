// api/generate-video.js

// This line forces Vercel to use the Edge Runtime, bypassing the 10-second timeout limit!
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // Handle CORS Preflight
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
    const { idea, voice } = await req.json();
    if (!idea) {
      return new Response(JSON.stringify({ error: 'Missing video concept prompt' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    let voiceId = 'pNInz6obpgmA5QDw6wpX'; // Adam
    if (voice && voice.toLowerCase().includes('rachel')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel
    }

    // Accessing environment variables in Edge runtime
    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

    if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
      return new Response(JSON.stringify({ error: 'Missing API Keys in Vercel settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    // PHASE 1: FREE GROQ SCRIPT ENHANCEMENT
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${groqApiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        response_format: { type: "json_object" },
        messages: [
          {
            role: 'system',
            content: `You are an expert viral content scriptwriter. 
            Take the user's topic and create a concise, highly engaging 12-second narrative statement.
            You must return a JSON object with exactly this key:
            "scriptText": A single short string of the narration script (keep it under 35 words total).`
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
    const enhancedScript = aiContent.scriptText;
    const cleanText = enhancedScript.replace(/"/g, "'").replace(/\n/g, ' ').trim();

    // PHASE 2: ELEVENLABS AUDIO GENERATION
    const ttsResponse = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}/stream`, {
      method: 'POST',
      headers: {
        'accept': '*/*',
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

    // Convert binary stream to base64 using Edge-compatible tools
    const audioBuffer = await ttsResponse.arrayBuffer();
    const base64Audio = btoa(String.fromCharCode(...new Uint8Array(audioBuffer)));
    const audioDataUrl = `data:audio/mp3;base64,${base64Audio}`;

    // PHASE 3: SHOTSTACK COMPILATION WITH AUDIO
    const renderResponse = await fetch('https://api.shotstack.io/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': shotstackKey
      },
      body: JSON.stringify({
        timeline: {
          background: '#1a1a2e',
          soundtrack: {
            src: audioDataUrl,
            effect: 'fadeInOut'
          },
          tracks:
