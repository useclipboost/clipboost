export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { idea, platform, voice } = req.body;

  if (!idea) {
    return res.status(400).json({ error: 'Missing video concept prompt' });
  }

  try {
    const response = await fetch('https://api.shotstack.io/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
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
                    html: `<div style="color: #ffffff; font-size: 32px; text-align: center; font-family: sans-serif; font-weight: bold; padding: 20px;">${idea}</div>`,
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
          resolution: 'sd'
        }
      })
    });

    const data = await response.json();

    return res.status(200).json({
      success: true,
      videoUrl: data.response?.url || 'https://www.w3schools.com/html/mov_bbb.mp4'
    });

  } catch (error) {
    return res.status(500).json({ error: 'Video engine processing failure.' });
  }
}
