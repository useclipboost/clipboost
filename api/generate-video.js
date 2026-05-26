export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { videoPrompt, styleSelection } = req.body;

    if (!videoPrompt || !videoPrompt.trim()) {
      return res.status(400).json({ success: false, error: 'A video prompt is required.' });
    }

    if (!process.env.FAL_KEY) {
      return res.status(500).json({ success: false, error: 'Missing FAL_KEY variable environment configuration.' });
    }

    // Connects straight to your real Fal.ai dashboard token pipeline!
    const falResponse = await fetch("https://queue.fal.run/fal-ai/hunyuan-video", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: styleSelection === 'storytelling' 
          ? `In an animated cartoon illustration art style, ${videoPrompt}`
          : `${videoPrompt}, high quality video game engine footage, 4k layout cinematic style`,
        video_size: "landscape_16_9",
        duration: "5"
      }),
    });

    const textResponse = await falResponse.text();
    let falData;
    
    try {
      falData = JSON.parse(textResponse);
    } catch (e) {
      return res.status(500).json({ success: false, error: 'Fal.ai infrastructure returned an unreadable response format.' });
    }

    if (!falResponse.ok) {
      return res.status(falResponse.status).json({ success: false, error: falData.detail || 'Fal.ai credentials rejected.' });
    }

    return res.status(200).json({ success: true, id: data.request_id || falData.request_id });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
