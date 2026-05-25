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

  // FORCE Sandbox endpoint for your sandbox key ('OuVmBD...')
  // Change this to 'https://api.shotstack.io/v1' only if you switch back to your production key ('KF5LPA...')
  const baseUrl = 'https://api.shotstack.io/stage'; 
  
  const cleanText = idea.replace(/"/g, "'").replace(/\n/g, ' ').trim();

  try {
    const renderResponse = await fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey, 
      },
      body: JSON.stringify({
        timeline: {
          background: '#111111',
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: 'title',
                    text: cleanText,
                    style: 'minimal',
                    size: 'small',
                    color: '#ffffff'
                  },
                  start: 0,
                  length: 5,
                  position: 'center'
                }
              ]
            },
            {
              clips: [
                {
                  asset: {
                    type: 'image',
                    src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=720&auto=format&fit=crop'
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

    // API Polling Loop
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
        throw new Error('Shotstack engine failed to process video tracks.');
      }
    }

    if (!videoUrl) {
      throw new Error('The video rendering pipeline timed out.');
    }

    return res.status(200).json({
      success: true,
      videoUrl: videoUrl
    });

  } catch (error) {
    console.error('Processing Crash:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
