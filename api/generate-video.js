export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  try {
    const { videoPrompt, styleSelection } = req.body;

    if (!videoPrompt || !videoPrompt.trim()) {
      return res.status(400).json({ success: false, error: 'A video description prompt is required.' });
    }

    console.log(`Sending prompt to Fal.ai using style: ${styleSelection}`);

    // 🌟 REAL AUTOMATION FLOW: Call Fal.ai directly using your environment key
    const falResponse = await fetch("https://queue.fal.run/fal-ai/hunyuan-video", {
      method: "POST",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`, // Uses your hidden token safely
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: styleSelection === 'storytelling' 
          ? `In an animated cartoon illustration style, ${videoPrompt}`
          : `${videoPrompt}, high quality gameplay video style`,
        video_size: "landscape_16_9",
        duration: "5"
      }),
    });

    const falData = await falResponse.json();

    if (!falResponse.ok) {
      throw new Error(falData.detail || 'Fal.ai queue request rejected.');
    }

    // Pass the real tracking request down to your polling mechanism
    return res.status(200).json({
      success: true,
