export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Missing tracking ID.' });
  }

  try {
    const response = await fetch(`https://queue.fal.run/fal-ai/hunyuan-video/requests/${id}`, {
      headers: {
        'Authorization': `Key ${process.env.FAL_KEY}`
      }
    });

    const data = await response.json();
    let formattedResponse = { response: { status: 'processing', url: null } };

    if (data.status === 'COMPLETED') {
      formattedResponse.response.status = 'done';
      formattedResponse.response.url = data.video?.url || (data.outputs && data.outputs[0]?.file?.url) || data.logs;
    } else if (data.status === 'FAILED') {
      formattedResponse.response.status = 'failed';
    }

    return res.status(200).json(formattedResponse);

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
