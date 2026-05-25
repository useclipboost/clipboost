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

  // Pure production router designed explicitly for sk_live keys
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
              /* TRACK 1: Text Overlay Layer */
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<div style="color: #ffffff; font-size: 42px; text-align: center; font-family: 'Helvetica Neue', Arial, sans-serif; font-weight: 900; text-shadow: 4px 4px 0px #000000; line-height: 1.4; letter-spacing: -1px;">${idea}</div>`,
                    css: "body { margin: 0; padding: 40px; display: flex; align-items: center; justify-content: center; height: 100vh; }",
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
              /* TRACK 2: Looping Background Video Layer */
              clips: [
                {
                  asset: {
                    type: 'video',
                    src: 'https://cdn.pixabay.com/video/2021/04/12/70884-537367808_large.mp4'
                  },
                  start: 0,
                  length: 5,
                  fit: 'cover'
                }
              ]
            }
          ]
        },
        output: {
          format: 'mp4',
          resolution: '9:16'
        }
      })
    });

    const renderData = await renderResponse.json();

    if (!renderResponse.ok) {
      throw new Error(`Shotstack API Error: ${renderData.message || renderResponse.statusText}`);
    }

    const renderId = renderData.response.id;

    // Polling System
    let videoUrl = null;
    let attempts = 0;
    const maxAttempts = 35; 

    while (!videoUrl && attempts < maxAttempts) {
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
        throw new Error('Shotstack engine failed to compile video assets.');
      }
    }

    if (!videoUrl) {
      throw new Error('The production rendering pipeline timed out. Please try again!');
    }

    return res.status(200).json({
      success: true,
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error('Pipeline Processing Crash:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
