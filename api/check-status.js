export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing request ID parameter.' });
  }

  if (!process.env.FAL_KEY) {
    return res.status(500).json({ success: false, error: 'Missing FAL_KEY configuration on Vercel.' });
  }

  try {
    // Check the queue status on Fal.ai using the request ID
    const response = await fetch(`https://queue.fal.run/fal-ai/hunyuan-video/requests/${id}`, {
      method: "GET",
      headers: {
        "Authorization": `Key ${process.env.FAL_KEY}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ success: false, error: data.detail || 'Failed to fetch status from Fal.ai.' });
    }

    // Map Fal.ai status fields to match what your Saga.AI frontend expects
    if (data.status === 'COMPLETED') {
      return res.status(200).json({
        success: true,
        status: 'completed',
        videoUrl: data.logs && data.video?.url ? data.video.url : data.output?.video?.url || null
      });
    } else if (data.status === 'FAILED') {
      return res.status(200).json({ success: true, status: 'failed' });
    } else {
      // Handles 'IN_QUEUE' or 'IN_PROGRESS' states
      return res.status(200).json({ success: true, status: 'processing' });
    }

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
