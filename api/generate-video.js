// api/generate-video.js

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { idea, voice } = req.body;
  if (!idea) {
    return res.status(400).json({ error: 'Missing video concept prompt' });
  }

  // Default to Adam's viral voice ID if no specific choice is matched
  let voiceId = 'pNInz6obpgmA5QDw6wpX'; 
  if (voice && voice.toLowerCase().includes('rachel')) {
    voiceId = '21m00Tcm4TlvDq8ikWAM'; 
  }

  const shotstackKey = process.env.SHOTSTACK_API_KEY;
  const groqApiKey = process.env.OPENAI_API_KEY; 
  const elevenlabsKey = process.env.ELEVENLABS_API_KEY;

  if (!shotstackKey || !groqApiKey || !elevenlabsKey) {
    return res.status(500).json({ error: 'Missing API Keys in Vercel settings (Groq, Shotstack, or ElevenLabs).' });
  }

  try {
    // PHASE 1: FREE GROQ SCRIPT ENHANCEMENT
    const groqResponse = await fetch('https://api.groq.com/openai/v1/chat/completions',
