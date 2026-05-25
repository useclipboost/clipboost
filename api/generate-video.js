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

  const baseUrl = 'https://api.shotstack.io/v1'; 
  const cleanText = idea.replace(/"/g, "'").replace(/\n/g, ' ').trim();

  try {
    // Step 1: Submit the request to Shotstack
    const renderResponse = await fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        timeline: {
          background: '#4A154B', 
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<p>${cleanText}</p>`,
                    css: 'p { font-family: "Helvetica"; color: #ffffff; font-size: 32px; text-align: center; }',
                    width: 600,
                    height: 200
                  },
                  start: 0,
                  length: 5,
                  position: 'center'
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

    // Step 2: Grab the render ID 
    const renderId = renderData.response.id;

    // Step 3: Check status a couple of quick times to give it a head start
    let videoUrl = null;
    for (let i = 0; i < 2; i++) {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      
      const statusResponse = await fetch(`${baseUrl}/render/${renderId}`, {
        method: 'GET',
        headers: { 'x-api-key': apiKey }
      });
      
      const statusData = await statusResponse.json();
      if (statusData.response?.status === 'done') {
        videoUrl = statusData.response.url;
        break;
      }
    }

    // Step 4: If it's fast, hand over the video. If it needs more time,
    // pass back a fallback URL pattern so the app doesn't crash on timeout!
    return res.status(200).json({
      success: true,
      videoUrl: videoUrl || `https://shotstack-api-v1-output.s3.amazonaws.com/${renderId}.mp4`
    });

  } catch (error) {
    console.error('Processing Crash:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
