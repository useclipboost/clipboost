// api/generate-video.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { idea, platform, voice } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Missing video concept prompt' });
  }

  try {
    // 1. Send the data to the Video Automation Engine
    // (Using Shotstack as our production example)
    const response = await fetch('https://api.shotstack.io/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Vercel reads your private API key securely from your environment settings
        'x-api-key': process.env.SHOTSTACK_API_KEY, 
      },
      body: JSON.stringify({
        timeline: {
          background: '#000000',
          tracks: [
            {
              clips: [
                {
                  asset: {
                    type: 'html',
                    html: `<p style="color: #ffffff; font-size: 40px; text-align: center; font-family: sans-serif; font-weight: bold;">${idea}</p>`,
                    css: 'p { animation: pulse 1s infinite; }'
                  },
                  start: 0,
                  length: 5
                }
              ]
            }
          ]
        },
        output: {
          format: 'mp4',
          resolution: 'sd' // High-res options available on paid plans
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to communicate with rendering engine.');
    }

    // 2. Return the unique, generated AI video link to your user interface!
    return res.status(200).json({
      success: true,
      message: 'AI video generation complete!',
      videoUrl: data.response.url // This passes the unique rendered MP4 link back
    });

  } catch (error) {
    console.error('Pipeline Error:', error);
    return res.status(500).json({ error: 'Video engine processing failure. Check API credits.' });
  }
}
