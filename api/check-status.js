export default async function handler(req, res) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'Render ID query parameter is required' });
  }

  try {
    const response = await fetch(`https://api.shotstack.io/edit/v1/render/${id}`, {
      headers: {
        'x-api-key': process.env.SHOTSTACK_API_KEY || ''
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Unable to fetch render status properties.');
    }

    // Safely return status object back down to the interface component
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}
