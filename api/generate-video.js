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
    // Fire off the render request to the live production server
    const renderResponse = await fetch(`${baseUrl}/render`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey
      },
      body: JSON.stringify({
        timeline: {
          background: '#4A154B', // Solid purple canvas background
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

    // Hand back the unique render task tracker ID to the frontend browser instantly
    return res.status(200).json({
      success: true,
      renderId: renderData.response.id
    });

  } catch (error) {
    console.error('Processing Crash:', error.message);
    return res.status(500).json({ error: error.message });
  }
}
