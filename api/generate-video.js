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

  // AUTOMATIC SERVER SWITCH: Uses staging for test keys, v1 for live keys
  const isTestKey = apiKey.startsWith('sk_test_');
  const baseUrl = isTestKey ? 'https://api.shotstack.io/stage' : 'https://api.shotstack.io/v1';

  try {
    // 1. Send timeline blueprint to Shotstack
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
                    html: `<div style="color: #ffffff; font-size: 24px; text-align: center; font-family: sans-serif; font-weight: 900; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 30px; background: #111111;">${idea}</div>`,
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
          resolution: 'sd' 
        }
      })
    });

    const renderData = await renderResponse.json();

    if (!renderResponse.ok) {
      // If Shotstack rejects the request (e.g. out of credits), pass the real reason to the screen
      throw new Error(`Shotstack API Error: ${renderData.message || renderResponse.statusText}`);
    }

    const renderId = renderData.response.id;

    // 2. Polling Loop to wait for video compiling
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 15; 

    while (!videoUrl && attempts < maxAttempts) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
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
      throw new Error('Cloud rendering timed out. Try generating again.');
    }

    return res.status(200).json({
      success: true,
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error('Pipeline Error:', error.message);
    // REMOVED THE RABBIT FALLBACK: Now it sends the actual error text to your frontend
    return res.status(500).json({ error: error.message });
  }
}
