// api/generate-video.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { idea } = req.body;
  if (!idea) {
    return res.status(400).json({ error: 'Missing video concept prompt' });
  }

  const apiKey = process.env.SHOTSTACK_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API Key missing from Vercel settings.' });
  }

  // Safely routes to the live production server since you have a live sk_live key
  const isTestKey = apiKey.startsWith('sk_test_');
  const baseUrl = isTestKey ? 'https://api.shotstack.io/stage' : 'https://api.shotstack.io/v1';

  // Sanitize user text input to prevent JSON data breakage
  const sanitizedText = idea
    .replace(/[\/\\]/g, '')
    .replace(/"/g, '\\"')
    .replace(/\n/g, ' ');

  try {
    const renderResponse = await fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey, 
      },
      body: JSON.stringify({
        timeline: {
          background: '#000000',
          tracks: [
            {
              /* TRACK 1: Main Text Typography Layer */
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<div style="color: #ffffff; font-size: 38px; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; text-shadow: 4px 4px 0px #000000; line-height: 1.4; letter-spacing: -1px; width: 640px; word-wrap: break-word;">${sanitizedText}</div>`,
                    css: "body { margin: 0; padding: 0; display: flex; align-items: center; justify-content: center; height: 1280px; width: 720px; }",
                    width: 720,
                    height: 1280
                  },
                  start: 0,
                  length: 5,
                  position: 'center'
                }
              ]
            },
            {
              /* TRACK 2: Looping Media Background Loop */
              clips:
