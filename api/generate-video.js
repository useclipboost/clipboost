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
    return res.status(500).json({ error: 'API Key missing from Vercel environment settings.' });
  }

  const isTestKey = apiKey.startsWith('sk_test_');
  const baseUrl = isTestKey ? 'https://api.shotstack.io/stage' : 'https://api.shotstack.io/v1';

  try {
    // 1. Submit the rendering payload
    const renderResponse = await fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey, 
      },
      body: JSON.stringify({
        timeline: {
          background: '#0a0a0c',
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<div style="color: #ffffff; font-size: 28px; text-align: center; font-family: sans-serif; font-weight: 900; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 40px; background: #111111;">${idea}</div>`,
                    css: "body { margin: 0; }"
                  },
                  start: 0,
                  length: 4
                }
              ]
            }
          ]
        },
        output: {
          format: 'mp4',
          resolution: 'preview' // Using 'preview' resolution renders up to 4x faster on Shotstack!
        }
      })
    });

    const renderData = await renderResponse.json();

    if (!renderResponse.ok) {
      throw new Error(`Shotstack API Error: ${renderData.message || renderResponse.statusText}`);
    }

    const renderId = renderData.response.id;

    // 2. Expanded Polling Loop (increased from 15 to 35 attempts for deep safety)
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 35; 

    while (!videoUrl && attempts < maxAttempts) {
      // Wait 2.5 seconds between checks to let the cloud cluster work smoothly
      await new Promise((resolve) => setTimeout(resolve, 2500));
      attempts++;

      const statusResponse = await fetch(`${baseUrl}/render/${renderId}`, {
        method: 'GET',
        headers: { 'x-api-key': apiKey }
      });

      const statusData = await statusResponse.json();
      const currentStatus = statusData.response?.status;

      if (currentStatus === 'done') {
        videoUrl = statusData.response.url;
        break;
      } else if (currentStatus === 'failed') {
        throw new Error('Shotstack failed to compile video tracks.');
      }
    }

    if (!videoUrl) {
      throw new Error('The cloud cluster is still building your track. Please wait a moment and try pressing generate again!');
    }

    return res.status(200).json({
      success: true,
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error('Pipeline Error:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
