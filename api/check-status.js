export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'Missing render ID parameter.' });
  }

  try {
    // ✅ SECURE HOOK: Pulls your Shotstack production key safely from Vercel
    const shotstackKey = process.env.SHOTSTACK_API_KEY; 
    
    const response = await fetch(`https://api.shotstack.io/edit/v1/render/${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': shotstackKey
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch status from Shotstack.');
    }

    return res.status(200).json({
      status: data.response.status,
      url: data.response.url,
      error: data.response.error
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
