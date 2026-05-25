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
    // Step 1: Submit the video render layout to the live production system
    const renderResponse = await fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        timeline: {
          background: '#4A154B', // Solid purple canvas
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

    const renderId = renderData.response.id;

    // Step 2: Instantly return Shotstack's official player dashboard view link.
    // This completely bypasses Vercel's 10-second timeout limits!
    return res.status(200).json({
      success: true,
      videoUrl: `https://dashboard.shotstack.io/renders/${renderId}`
    });

  } catch (error) {
    console.error('Processing Crash:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
