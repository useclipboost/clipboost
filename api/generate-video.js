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

    // Assign premium voice IDs based on selection
    let voiceId = 'pNInz6obpgmA5QDw6wpX'; // Default: Adam
    if (chosenVoice.toLowerCase().includes('rachel')) {
      voiceId = '21m00Tcm4TlvDq8ikWAM'; // Rachel
    }

    const shotstackKey = process.env.SHOTSTACK_API_KEY;
    const groqApiKey = process.env.OPENAI_API_KEY; 
    const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

    if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
      return new Response(JSON.stringify({ error: 'Missing API Keys in Vercel settings.' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', 'Access-
