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

  const isTestKey = apiKey.startsWith('sk_test_');
  const baseUrl = isTestKey ? 'https://api.shotstack.io/stage' : 'https://api.shotstack.io/v1';

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
              /* TRACK 1: Centered, readable caption layer with drop shadow */
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<div style="color: #ffffff; font-size: 46px; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; width: 1080px; height: 1920px; display: flex; align-items: center; justify-content: center; padding: 120px; box-sizing: border-box; text-shadow: 5px 5px 0px #000000; line-height: 1.4; letter-spacing: -1px;">${idea}</div>`,
                    css: "body { margin: 0; padding: 0; }"
                  },
                  start: 0,
                  length: 6,
                  position: 'center'
                }
              ]
            },
            {
              /* TRACK 2: Premium background motion graphic loop */
              clips: [
                {
                  asset: {
                    type: 'video',
                    src: 'https://cdn.pixabay.com/video/2021/04/12/70884-537367808_large.mp4'
                  },
                  start: 0,
                  length: 6,
                  fit: 'cover'
                }
              ]
            }
          ]
        },
        output: {
          format: 'mp4',
          resolution: '9:16' // Perfect vertical format for TikTok/Shorts
        }
      })
    });

    const renderData = await renderResponse.json();

    if (!renderResponse.ok) {
      throw new Error(`Shotstack API Error: ${renderData.message || renderResponse.statusText}`);
    }

    const renderId = renderData.response.id;

    // Polling Loop
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 35; 

    while (!
